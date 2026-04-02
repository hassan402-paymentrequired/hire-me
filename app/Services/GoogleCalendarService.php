<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\GoogleCalendarAccount;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleCalendarService
{
    public function syncAppointment(Appointment $appointment): void
    {
        $appointment->loadMissing([
            'client.googleCalendarAccount',
            'provider.businessProfile',
            'services',
            'service',
            'teamMember.user',
        ]);

        $client = $appointment->client;
        $account = $client?->googleCalendarAccount;

        if (! $client || ! $account || ! $account->sync_enabled) {
            return;
        }

        if ($appointment->status === 'cancelled') {
            $this->deleteAppointmentEvent($appointment);

            return;
        }

        $token = $this->getValidAccessToken($account);
        $payload = $this->buildEventPayload($appointment);
        $calendarId = urlencode($account->google_calendar_id ?: 'primary');

        $response = $appointment->google_calendar_event_id
            ? Http::withToken($token)
                ->acceptJson()
                ->patch(
                    "https://www.googleapis.com/calendar/v3/calendars/{$calendarId}/events/{$appointment->google_calendar_event_id}",
                    $payload,
                )
            : Http::withToken($token)
                ->acceptJson()
                ->post(
                    "https://www.googleapis.com/calendar/v3/calendars/{$calendarId}/events",
                    $payload,
                );

        if (! $response->successful()) {
            $this->recordError($account, 'Google Calendar sync failed: '.$response->body());

            throw new \RuntimeException('Google Calendar sync failed.');
        }

        $eventId = $response->json('id');

        $appointment->forceFill([
            'google_calendar_event_id' => $eventId ?: $appointment->google_calendar_event_id,
            'google_calendar_synced_at' => now(),
        ])->saveQuietly();

        $account->forceFill([
            'last_synced_at' => now(),
            'last_error' => null,
        ])->saveQuietly();
    }

    public function deleteAppointmentEvent(Appointment $appointment): void
    {
        $appointment->loadMissing('client.googleCalendarAccount');

        $account = $appointment->client?->googleCalendarAccount;

        if (! $account || ! $account->sync_enabled || ! $appointment->google_calendar_event_id) {
            return;
        }

        $token = $this->getValidAccessToken($account);
        $calendarId = urlencode($account->google_calendar_id ?: 'primary');

        $response = Http::withToken($token)
            ->acceptJson()
            ->delete(
                "https://www.googleapis.com/calendar/v3/calendars/{$calendarId}/events/{$appointment->google_calendar_event_id}",
            );

        if (! $response->successful() && $response->status() !== 404) {
            $this->recordError($account, 'Google Calendar delete failed: '.$response->body());

            throw new \RuntimeException('Google Calendar delete failed.');
        }

        $appointment->forceFill([
            'google_calendar_event_id' => null,
            'google_calendar_synced_at' => now(),
        ])->saveQuietly();

        $account->forceFill([
            'last_synced_at' => now(),
            'last_error' => null,
        ])->saveQuietly();
    }

    public function disconnect(User $user): void
    {
        $account = $user->googleCalendarAccount;

        if (! $account) {
            return;
        }

        try {
            if ($account->access_token) {
                Http::asForm()->post('https://oauth2.googleapis.com/revoke', [
                    'token' => $account->access_token,
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Google Calendar token revoke failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        $account->delete();
    }

    protected function getValidAccessToken(GoogleCalendarAccount $account): string
    {
        if ($account->access_token && $account->token_expires_at?->gt(now()->addMinute())) {
            return $account->access_token;
        }

        if (! $account->refresh_token) {
            throw new \RuntimeException('Google Calendar refresh token is missing.');
        }

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'refresh_token' => $account->refresh_token,
            'grant_type' => 'refresh_token',
        ]);

        if (! $response->successful()) {
            $this->recordError($account, 'Google token refresh failed: '.$response->body());

            throw new \RuntimeException('Google Calendar token refresh failed.');
        }

        $account->forceFill([
            'access_token' => $response->json('access_token'),
            'token_expires_at' => now()->addSeconds((int) $response->json('expires_in', 3600)),
            'last_error' => null,
        ])->saveQuietly();

        return $account->access_token;
    }

    protected function buildEventPayload(Appointment $appointment): array
    {
        $services = $appointment->services->isNotEmpty()
            ? $appointment->services
            : collect([$appointment->service])->filter();

        $primaryService = $services->first()?->name ?? 'Appointment';
        $serviceList = $services->pluck('name')->filter()->implode(', ');
        $providerName = $appointment->provider?->businessProfile?->business_name
            ?: $appointment->provider?->name
            ?: 'Service Provider';
        $providerAddress = $appointment->provider?->businessProfile?->address;
        $teamMemberName = $appointment->teamMember?->user?->name;

        $descriptionLines = array_filter([
            "Booked via ".config('app.name'),
            "Provider: {$providerName}",
            $serviceList ? "Services: {$serviceList}" : null,
            $teamMemberName ? "Team member: {$teamMemberName}" : null,
            $appointment->notes ? "Notes: {$appointment->notes}" : null,
            "Booking ID: {$appointment->id}",
        ]);

        return [
            'summary' => "{$providerName} - {$primaryService}",
            'description' => implode("\n", $descriptionLines),
            'location' => $providerAddress,
            'start' => [
                'dateTime' => $appointment->start_time->toIso8601String(),
                'timeZone' => config('app.timezone', 'Africa/Lagos'),
            ],
            'end' => [
                'dateTime' => $appointment->end_time->toIso8601String(),
                'timeZone' => config('app.timezone', 'Africa/Lagos'),
            ],
        ];
    }

    protected function recordError(GoogleCalendarAccount $account, string $message): void
    {
        $account->forceFill(['last_error' => $message])->saveQuietly();

        Log::warning('Google Calendar integration issue', [
            'user_id' => $account->user_id,
            'message' => $message,
        ]);
    }
}
