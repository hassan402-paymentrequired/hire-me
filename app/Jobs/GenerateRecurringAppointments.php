<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenerateRecurringAppointments implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     * 
     * This job finds parent recurring appointments and creates the next appointment
     * in the series if needed.
     */
    public function handle(): void
    {
        // Find all parent recurring appointments that are confirmed or completed
        // and haven't reached their end date or count limit
        $parentAppointments = Appointment::whereNotNull('recurrence_pattern')
            ->whereNull('recurrence_parent_id')
            ->whereIn('status', ['confirmed', 'completed'])
            ->where(function ($query) {
                // Either no end date, or end date hasn't passed
                $query->whereNull('recurrence_end_date')
                    ->orWhere('recurrence_end_date', '>=', now());
            })
            ->with(['services', 'recurrenceChildren'])
            ->get();

        foreach ($parentAppointments as $parent) {
            try {
                $this->createNextAppointment($parent);
            } catch (\Exception $e) {
                Log::error('Failed to create recurring appointment', [
                    'parent_appointment_id' => $parent->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }
    }

    /**
     * Create the next appointment in the recurrence series
     */
    protected function createNextAppointment(Appointment $parent): void
    {
        // Get the last appointment in the series (or use parent if no children yet)
        $lastAppointment = $parent->recurrenceChildren()
            ->orderBy('start_time', 'desc')
            ->first() ?? $parent;

        // Calculate next appointment date
        $nextDate = $parent->getNextRecurrenceDate($lastAppointment->start_time);

        if (!$nextDate) {
            return;
        }

        // Check if we've reached the end date
        if ($parent->recurrence_end_date && $nextDate->gt($parent->recurrence_end_date)) {
            return;
        }

        // Check if we've reached the count limit
        $existingCount = $parent->recurrenceChildren()->count() + 1; // +1 for parent
        if ($parent->recurrence_count && $existingCount >= $parent->recurrence_count) {
            return;
        }

        // Check if next appointment already exists (prevent duplicates)
        $existing = Appointment::where('recurrence_parent_id', $parent->id)
            ->whereDate('start_time', $nextDate->format('Y-m-d'))
            ->whereTime('start_time', $nextDate->format('H:i:s'))
            ->first();

        if ($existing) {
            return; // Already exists
        }

        // Calculate end time based on service duration
        $services = $parent->services;
        $totalDuration = $services->sum('duration_minutes');
        $maxBuffer = $services->max('buffer_time_minutes') ?? 0;
        $endTime = $nextDate->copy()->addMinutes($totalDuration);

        // Get the client wallet
        $clientWallet = Wallet::firstOrCreate(['user_id' => $parent->client_id]);

        // Calculate price with discount
        $originalPrice = $parent->original_price ?? $parent->price;
        $discountPercent = $parent->discount_percent ?? 0;
        $discountedPrice = $originalPrice * (1 - ($discountPercent / 100));

        // Check if client has sufficient balance
        if (!$clientWallet->hasSufficientBalance($discountedPrice)) {
            Log::warning('Insufficient balance for recurring appointment', [
                'parent_appointment_id' => $parent->id,
                'client_id' => $parent->client_id,
                'required_amount' => $discountedPrice,
                'available_balance' => $clientWallet->balance,
            ]);
            return;
        }

        DB::beginTransaction();
        try {
            // Create the new appointment
            $appointment = Appointment::create([
                'provider_id' => $parent->provider_id,
                'client_id' => $parent->client_id,
                'service_id' => $parent->service_id,
                'start_time' => $nextDate,
                'end_time' => $endTime,
                'buffer_time_minutes' => $maxBuffer,
                'status' => 'pending', // New appointments start as pending
                'price' => $discountedPrice,
                'original_price' => $originalPrice,
                'discount_percent' => $discountPercent,
                'notes' => $parent->notes,
                'client_name' => $parent->client_name,
                'client_email' => $parent->client_email,
                'recurrence_pattern' => null, // Children don't have pattern
                'recurrence_parent_id' => $parent->id,
                'recurrence_end_date' => $parent->recurrence_end_date,
                'recurrence_count' => $parent->recurrence_count,
            ]);

            // Attach services
            $serviceIds = $services->pluck('id')->toArray();
            $appointment->services()->attach($serviceIds);

            // Create escrow hold
            $escrowTransaction = $clientWallet->holdEscrow($discountedPrice, $appointment, "Escrow hold for recurring appointment");
            $appointment->update([
                'escrow_amount' => $discountedPrice,
                'escrow_status' => 'held',
                'escrow_transaction_id' => $escrowTransaction->id,
            ]);

            DB::commit();

            Log::info('Recurring appointment created', [
                'parent_appointment_id' => $parent->id,
                'new_appointment_id' => $appointment->id,
                'next_date' => $nextDate->toDateString(),
                'price' => $discountedPrice,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
