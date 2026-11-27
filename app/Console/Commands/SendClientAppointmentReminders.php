<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Notifications\AppointmentReminderNotification;
use Illuminate\Console\Command;

class SendClientAppointmentReminders extends Command
{
    protected $signature = 'app:send-client-appointment-reminders';

    protected $description = 'Remind clients about their visit the day before and 2 hours before.';

    private const DAY_BEFORE_HOURS = 24;

    private const SHORT_NOTICE_HOURS = 2;

    public function handle(): int
    {
        $sent = 0;

        Appointment::query()
            ->with('client')
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereNull('client_day_before_reminder_sent_at')
            ->whereBetween('start_time', [now()->addHours(self::SHORT_NOTICE_HOURS), now()->addHours(self::DAY_BEFORE_HOURS)])
            ->get()
            ->each(function (Appointment $appointment) use (&$sent): void {
                if ($appointment->created_at && $appointment->created_at->gt($appointment->start_time->copy()->subHours(self::DAY_BEFORE_HOURS))) {
                    return;
                }

                $appointment->client?->notify(new AppointmentReminderNotification($appointment, isDayBefore: true));
                $appointment->update(['client_day_before_reminder_sent_at' => now()]);
                $sent++;
            });

        Appointment::query()
            ->with('client')
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereNull('client_two_hour_reminder_sent_at')
            ->whereBetween('start_time', [now(), now()->addHours(self::SHORT_NOTICE_HOURS)])
            ->get()
            ->each(function (Appointment $appointment) use (&$sent): void {
                $appointment->client?->notify(new AppointmentReminderNotification($appointment, isDayBefore: false));
                $appointment->update(['client_two_hour_reminder_sent_at' => now()]);
                $sent++;
            });

        $this->info("Sent {$sent} reminder(s).");

        return self::SUCCESS;
    }
}
