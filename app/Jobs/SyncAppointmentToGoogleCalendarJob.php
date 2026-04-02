<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Services\GoogleCalendarService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SyncAppointmentToGoogleCalendarJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $appointmentId)
    {
    }

    public function handle(GoogleCalendarService $googleCalendarService): void
    {
        $appointment = Appointment::with([
            'client.googleCalendarAccount',
            'provider.businessProfile',
            'services',
            'service',
            'teamMember.user',
        ])->find($this->appointmentId);

        if (! $appointment) {
            return;
        }

        try {
            $googleCalendarService->syncAppointment($appointment);
        } catch (\Throwable $e) {
            Log::warning('Failed to sync appointment to Google Calendar', [
                'appointment_id' => $this->appointmentId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
