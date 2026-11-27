<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Service;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class BookingConfirmationController extends Controller
{
    public function show(string $id): InertiaResponse
    {
        $appointment = $this->clientAppointment($id);
        $businessName = $appointment->provider->businessProfile?->business_name ?? $appointment->provider->name;

        return Inertia::render('marketplace/booking-done', [
            'booking' => [
                'id' => $appointment->id,
                'reference' => $appointment->reference,
                'status' => $appointment->status,
                'startTime' => $appointment->start_time->toIso8601String(),
                'endTime' => $appointment->end_time?->toIso8601String(),
                'businessName' => $businessName,
                'providerSlug' => $appointment->provider->businessProfile?->slug,
                'services' => $appointment->services->map(fn (Service $service): array => [
                    'name' => $service->name,
                    'proName' => $appointment->teamMember?->user?->name
                        ?? $this->teamMemberName($appointment, $service->pivot?->team_member_id),
                ])->values(),
                'atClientLocation' => in_array($appointment->service_address_source, ['client_address', 'business_address'], true),
                'paymentMethod' => $appointment->payment_method,
                'amountHeld' => (float) ($appointment->escrow_amount ?? 0),
                'total' => (float) $appointment->price,
                'isRecurring' => $appointment->isRecurring(),
            ],
        ]);
    }

    /**
     * iCalendar file so the client can add the visit to any calendar app.
     */
    public function calendar(string $id): Response
    {
        $appointment = $this->clientAppointment($id);
        $businessName = $appointment->provider->businessProfile?->business_name ?? $appointment->provider->name;
        $location = $appointment->service_address ?? $appointment->provider->businessProfile?->address ?? '';
        $format = fn ($time) => $time->copy()->utc()->format('Ymd\THis\Z');
        $escape = fn (string $value) => addcslashes($value, ",;\\\n");

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Proxideck//Booking//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:'.$appointment->id.'@'.parse_url(config('app.url'), PHP_URL_HOST),
            'DTSTAMP:'.$format(now()),
            'DTSTART:'.$format($appointment->start_time),
            'DTEND:'.$format($appointment->end_time ?? $appointment->start_time->copy()->addHour()),
            'SUMMARY:'.$escape($appointment->services->pluck('name')->join(' + ').' at '.$businessName),
            'DESCRIPTION:'.$escape('Booking ref '.($appointment->reference ?? $appointment->id).'. '.route('client.bookings.show', $appointment->id)),
            'LOCATION:'.$escape($location),
            'END:VEVENT',
            'END:VCALENDAR',
        ];

        return response(implode("\r\n", $lines)."\r\n", 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.($appointment->reference ?? 'booking').'.ics"',
        ]);
    }

    private function clientAppointment(string $id): Appointment
    {
        return Appointment::query()
            ->where('client_id', auth()->id())
            ->with(['provider.businessProfile', 'services', 'teamMember.user'])
            ->findOrFail($id);
    }

    private function teamMemberName(Appointment $appointment, ?string $teamMemberId): ?string
    {
        if (! $teamMemberId) {
            return null;
        }

        return $appointment->provider->teamMembers()->with('user:id,name')->find($teamMemberId)?->user?->name;
    }
}
