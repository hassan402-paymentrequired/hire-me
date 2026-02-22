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

        Appointment::whereIn('status', ['confirmed', 'pending', 'pending_completion'])
            ->whereNull('payment_released_at')
            ->whereNull('provider_credited_at')
            ->where(function ($query) {

                // both approved
                $query->where(function ($q) {
                    $q->whereNotNull('client_approved_at')
                        ->whereNotNull('provider_approved_at');
                })

                // OR first approval older than 24 hours
                    ->orWhere(function ($q) {

                        $q->whereNotNull(DB::raw('COALESCE(client_approved_at, provider_approved_at)'))
                            ->where(
                                DB::raw('COALESCE(client_approved_at, provider_approved_at)'),
                                '<=',
                                now()->subDay()
                            );

                    });

            })
            ->chunk(1000, function ($appointments) {
                $appointments->each(function ($appointment) {
                    $clientWallet = Wallet::firstOrCreate(['user_id' => $appointment->client_id]);
                    $clientWallet->releaseHeldPayment($appointment->escrow_amount, $appointment, 'Payment released after dual approval');
                    $appointment->update([
                        'escrow_status' => 'released',
                        'payment_released_at' => now(),
                    ]);
                });
            });

    }
}
