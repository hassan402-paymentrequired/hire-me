<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\BookingWaitlistEntry;
use App\Models\User;
use App\Notifications\WaitlistSlotOpenedNotification;
use Carbon\Carbon;

class BookingWaitlistService
{
    /**
     * @param  array<int, string>  $serviceIds
     */
    public function join(User $client, User $provider, Carbon $date, array $serviceIds): BookingWaitlistEntry
    {
        return BookingWaitlistEntry::updateOrCreate(
            [
                'client_id' => $client->id,
                'provider_id' => $provider->id,
                'date' => $date->toDateString(),
            ],
            [
                'service_ids' => array_values($serviceIds),
                'notified_at' => null,
            ],
        );
    }

    /**
     * Tell everyone waiting on this provider and day that a slot just opened.
     */
    public function notifySlotOpened(Appointment $appointment): void
    {
        if (! $appointment->start_time || $appointment->start_time->isPast()) {
            return;
        }

        BookingWaitlistEntry::query()
            ->where('provider_id', $appointment->provider_id)
            ->whereDate('date', $appointment->start_time->toDateString())
            ->whereNull('notified_at')
            ->where('client_id', '!=', $appointment->client_id)
            ->with(['client', 'provider.businessProfile'])
            ->get()
            ->each(function (BookingWaitlistEntry $entry): void {
                if (! $entry->client) {
                    return;
                }

                $entry->client->notify(new WaitlistSlotOpenedNotification($entry));
                $entry->update(['notified_at' => now()]);
            });
    }

    /**
     * Upcoming days the client is already waiting on for this provider.
     *
     * @return array<int, string>
     */
    public function waitingDates(User $client, string $providerId): array
    {
        return BookingWaitlistEntry::query()
            ->where('client_id', $client->id)
            ->where('provider_id', $providerId)
            ->whereNull('notified_at')
            ->whereDate('date', '>=', today())
            ->orderBy('date')
            ->pluck('date')
            ->map(fn (Carbon $date) => $date->toDateString())
            ->all();
    }
}
