<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Models\Wallet;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class CreditCompletedAppointmentDeplay implements ShouldQueue
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
     */
    public function handle(): void
    {
        // Automatically release funds for appointments whose end time is at least
        // 15 minutes in the past and whose escrow is still held.
        Appointment::whereIn('status', ['confirmed', 'pending_completion'])
            ->whereNull('payment_released_at')
            // ->whereNull('provider_credited_at') // we don't have the coloumn
            ->where('escrow_status', 'held')
            ->where('end_time', '<=', now()->subMinutes(15))
            ->chunk(1000, function ($appointments) {
                $appointments->each(function ($appointment) {
                    // Extra safety guard
                    if ($appointment->escrow_status !== 'held' || $appointment->escrow_amount <= 0) {
                        return;
                    }

                    $clientWallet = Wallet::firstOrCreate(['user_id' => $appointment->client_id]);
                    $clientWallet->releaseHeldPayment(
                        $appointment->escrow_amount,
                        $appointment,
                        'Automatic payment release 15 minutes after appointment end time'
                    );

                    $appointment->update([
                        'status' => 'completed',
                        'escrow_status' => 'released',
                        'payment_released_at' => now(),
                    ]);
                });
            });
    }
}
