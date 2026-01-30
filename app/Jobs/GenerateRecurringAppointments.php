<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\Wallet;
use App\Notifications\RecurringAppointmentInsufficientBalanceNotification;
use App\Notifications\RecurringAppointmentRescheduledNotification;
use App\Notifications\RecurringAppointmentSlotTakenNotification;
use App\Services\SlotAvailabilityService;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenerateRecurringAppointments implements ShouldQueue
{
    use Queueable;

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
        $parentAppointments = Appointment::whereNotNull('recurrence_pattern')
            ->whereNull('recurrence_parent_id')
            ->whereNull('recurrence_stopped_at')
            ->whereIn('status', ['confirmed', 'completed'])
            ->where(function ($query) {
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
        // Get the last non-cancelled appointment in the series (or use parent if no children yet)
        $lastAppointment = $parent->recurrenceChildren()
            ->where('status', '!=', 'cancelled')
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
            return;
        }

        // Calculate end time based on service duration
        $services = $parent->services;
        $totalDuration = $services->sum('duration_minutes');
        $maxBuffer = $services->max('buffer_time_minutes') ?? 0;
        $endTime = $nextDate->copy()->addMinutes($totalDuration);

        // Check if slot is already booked by another client (time conflict)
        $existingAppointments = Appointment::where('provider_id', $parent->provider_id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereDate('start_time', $nextDate->format('Y-m-d'))
            ->get();

        $slotEndWithBuffer = $endTime->copy()->addMinutes($maxBuffer);
        $slotOverlaps = $existingAppointments->contains(function ($apt) use ($nextDate, $slotEndWithBuffer, $maxBuffer) {
            $aptEndWithBuffer = $apt->end_time->copy()->addMinutes($apt->buffer_time_minutes ?? 0);
            return $nextDate->lt($aptEndWithBuffer) && $slotEndWithBuffer->gt($apt->start_time);
        });

        $originalProposedTime = $nextDate->copy();
        $usedAlternativeSlot = false;

        if ($slotOverlaps) {
            $slotService = app(SlotAvailabilityService::class);
            $alternativeSlot = $slotService->findFirstAvailableSlot(
                $parent->provider_id,
                $services,
                $nextDate
            );

            if (!$alternativeSlot) {
                Log::warning('Recurring appointment: no alternative slot found', [
                    'parent_appointment_id' => $parent->id,
                    'provider_id' => $parent->provider_id,
                    'proposed_start' => $originalProposedTime->toIso8601String(),
                ]);
                $parent->client->notify(new RecurringAppointmentSlotTakenNotification($parent, $originalProposedTime));
                return;
            }

            $nextDate = $alternativeSlot;
            $endTime = $nextDate->copy()->addMinutes($totalDuration);
            $usedAlternativeSlot = true;
        }

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
            $parent->client->notify(new RecurringAppointmentInsufficientBalanceNotification(
                $parent,
                $discountedPrice,
                (float) $clientWallet->available_balance
            ));
            return;
        }

        $provider = $parent->provider;
        $settings = $provider?->businessProfile?->settings ?? [];
        $autoConfirm = $settings['autoConfirm'] ?? $settings['auto_confirm'] ?? false;

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
                'status' => $autoConfirm ? 'confirmed' : 'pending',
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
                'provider_approved' => $autoConfirm,
                'provider_approved_at' => $autoConfirm ? now() : null,
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

            if ($usedAlternativeSlot) {
                $appointment->client->notify(new RecurringAppointmentRescheduledNotification(
                    $appointment->fresh(),
                    $originalProposedTime
                ));
            }

            Log::info('Recurring appointment created', [
                'parent_appointment_id' => $parent->id,
                'new_appointment_id' => $appointment->id,
                'next_date' => $nextDate->toDateString(),
                'price' => $discountedPrice,
                'used_alternative_slot' => $usedAlternativeSlot,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
