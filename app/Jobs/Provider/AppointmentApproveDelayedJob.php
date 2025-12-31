<?php

namespace App\Jobs\Provider;

use App\Enum\AppointmentStatusEnum;
use App\Models\Appointment;
use App\Notifications\AppointmentApproveDelayedNotification;
use App\Notifications\AppointmentUrgentApprovalNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class AppointmentApproveDelayedJob implements ShouldQueue
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
        Appointment::query()
            ->with('provider')
            ->where('status', AppointmentStatusEnum::PENDING->value)
            ->where('start_time', '>', now()) // Only future appointments
            ->where(function ($query) {
                // URGENT: Appointments starting within 3 hours (regardless of when created)
                $query->where(function ($q) {
                    $q->where('start_time', '<=', now()->addHours(3))
                        ->where(function ($sq) {
                            // First reminder or last reminder was sent >30 mins ago
                            $sq->whereNull('last_reminder_sent_at')
                                ->orWhere('last_reminder_sent_at', '<', now()->subMinutes(30));
                        });
                })
                    // REGULAR: Appointments created >24 hours ago (and starting >3 hours from now)
                    ->orWhere(function ($q) {
                        $q->where('created_at', '<=', now()->subDay())
                            ->where('start_time', '>', now()->addHours(3)) // Not urgent yet
                            ->where(function ($sq) {
                                // Remind every 24 hours until confirmed
                                $sq->whereNull('last_reminder_sent_at')
                                    ->orWhere('last_reminder_sent_at', '<', now()->subDay());
                            });
                    });
            })
            ->chunk(1000, function ($appointments) {
                $appointments->each(function (Appointment $appointment) {
                    try {
                        $isUrgent = $appointment->start_time <= now()->addHours(3);

                        $hoursSinceCreated = $appointment->created_at->diffInHours(now());

                        if (!$isUrgent && $hoursSinceCreated < 24) {
                            return;
                        }

                        // Send appropriate notification
                        if ($isUrgent) {
                            $appointment->provider->notify(
                                new AppointmentUrgentApprovalNotification($appointment)
                            );
                        } else {
                            $appointment->provider->notify(
                                new AppointmentApproveDelayedNotification($appointment)
                            );
                        }

                        // Update tracking
                        $appointment->update([
                            'first_reminder_sent_at' => $appointment->first_reminder_sent_at ?? now(),
                            'last_reminder_sent_at' => now(),
                            'reminder_count' => $appointment->reminder_count + 1,
                        ]);

                        Log::info('Appointment reminder sent', [
                            'appointment_id' => $appointment->id,
                            'type' => $isUrgent ? 'urgent' : 'regular',
                            'reminder_count' => $appointment->reminder_count + 1,
                            'created_hours_ago' => $hoursSinceCreated,
                            'starts_in_hours' => now()->diffInHours($appointment->start_time),
                        ]);

                    } catch (\Exception $e) {
                        Log::error('Failed to send appointment reminder', [
                            'appointment_id' => $appointment->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
                });
            });
    }
}
