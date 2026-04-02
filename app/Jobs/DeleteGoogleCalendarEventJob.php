<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Services\GoogleCalendarService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DeleteGoogleCalendarEventJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $appointmentId)
    {
    }

    public function handle(GoogleCalendarService $googleCalendarService): void
    {
        $appointment = Appointment::with(['client.googleCalendarAccount'])->find($this->appointmentId);

        if (! $appointment) {
            return;
        }

        try {
            $googleCalendarService->deleteAppointmentEvent($appointment);
        } catch (\Throwable $e) {
            Log::warning('Failed to delete Google Calendar event', [
                'appointment_id' => $this->appointmentId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
