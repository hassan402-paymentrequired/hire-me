<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\WorkHour;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SlotAvailabilityService
{
    /**
     * Find the first available slot for the provider starting from the given date.
     * Returns a Carbon instance for the slot start, or null if none found within advance booking window.
     */
    public function findFirstAvailableSlot(
        string $providerId,
        Collection $services,
        Carbon $startFromDate,
        ?string $excludeAppointmentId = null,
        int $maxDaysToSearch = 30
    ): ?Carbon {
        $provider = \App\Models\User::with('businessProfile')->find($providerId);
        if (!$provider || !$provider->businessProfile) {
            return null;
        }

        $totalDuration = $services->sum('duration_minutes');
        $maxBuffer = $services->max('buffer_time_minutes') ?? 0;

        $settings = $provider->businessProfile->settings ?? [];
        $advanceBooking = (int) ($settings['advanceBooking'] ?? 30);
        $minNotice = isset($settings['minNotice']) ? (int) $settings['minNotice'] : null;
        $allowSameDay = $settings['allowSameDay'] ?? false;
        $providerBufferTimeMinutes = (int) ($settings['bufferTime'] ?? 0);
        $maxBuffer += $providerBufferTimeMinutes;

        $maxDate = Carbon::now()->addDays(min($advanceBooking, $maxDaysToSearch));
        $searchDate = $startFromDate->copy()->startOfDay();

        if ($searchDate->lt(Carbon::now()->startOfDay())) {
            $searchDate = Carbon::now()->startOfDay();
        }

        $daysSearched = 0;
        while ($searchDate->lte($maxDate) && $daysSearched < $maxDaysToSearch) {
            $slot = $this->findFirstSlotOnDate(
                $providerId,
                $totalDuration,
                $maxBuffer,
                $searchDate,
                $settings,
                $minNotice,
                $allowSameDay,
                $excludeAppointmentId
            );

            if ($slot) {
                return $slot;
            }

            $searchDate->addDay();
            $daysSearched++;
        }

        return null;
    }

    /**
     * Find the first available slot on a specific date.
     */
    protected function findFirstSlotOnDate(
        string $providerId,
        int $totalDuration,
        int $maxBuffer,
        Carbon $date,
        array $settings,
        ?int $minNotice,
        bool $allowSameDay,
        ?string $excludeAppointmentId
    ): ?Carbon {
        $dayOfWeek = $date->format('l');

        if (!$allowSameDay && $date->isToday()) {
            return null;
        }

        $workHours = WorkHour::where('provider_id', $providerId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_closed', false)
            ->get();

        if ($workHours->isEmpty()) {
            return null;
        }

        $existingAppointments = Appointment::where('provider_id', $providerId)
            ->whereDate('start_time', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->when($excludeAppointmentId, fn ($q) => $q->where('id', '!=', $excludeAppointmentId))
            ->get();

        foreach ($workHours as $workHour) {
            $start = Carbon::parse($date->format('Y-m-d') . ' ' . $workHour->start_time);
            $end = Carbon::parse($date->format('Y-m-d') . ' ' . $workHour->end_time);

            if ($date->isToday()) {
                $now = Carbon::now();
                $minStartTime = $minNotice !== null
                    ? $now->copy()->addHours($minNotice)->ceilMinutes(30)
                    : $now->copy()->ceilMinutes(30);
                if ($start->lt($minStartTime)) {
                    $start = $minStartTime;
                }
            } elseif ($minNotice !== null) {
                $minSlotTime = Carbon::now()->addHours($minNotice);
                if ($start->lt($minSlotTime)) {
                    $start = $minSlotTime->copy()->ceilMinutes(30);
                }
            }

            $current = $start->copy();

            while ($current->copy()->addMinutes($totalDuration)->lte($end)) {
                $slotStart = $current->copy();
                $slotEnd = $current->copy()->addMinutes($totalDuration);

                if ($minNotice !== null) {
                    $minSlotTime = Carbon::now()->addHours($minNotice);
                    if ($slotStart->lt($minSlotTime)) {
                        $current->addMinutes(30);
                        continue;
                    }
                }

                $isDuringBreak = false;
                if ($workHour->breaks) {
                    foreach ($workHour->breaks as $break) {
                        $breakStart = Carbon::parse($date->format('Y-m-d') . ' ' . $break['start']);
                        $breakEnd = Carbon::parse($date->format('Y-m-d') . ' ' . $break['end']);
                        if ($slotStart->lt($breakEnd) && $slotEnd->gt($breakStart)) {
                            $isDuringBreak = true;
                            break;
                        }
                    }
                }

                $slotEndWithBuffer = $slotEnd->copy()->addMinutes($maxBuffer);
                $isBooked = $existingAppointments->contains(function ($apt) use ($slotStart, $slotEndWithBuffer, $maxBuffer) {
                    $aptEndWithBuffer = $apt->end_time->copy()->addMinutes($apt->buffer_time_minutes ?? 0);
                    return $slotStart->lt($aptEndWithBuffer) && $slotEndWithBuffer->gt($apt->start_time);
                });

                if (!$isDuringBreak && !$isBooked) {
                    return $slotStart;
                }

                $current->addMinutes(30);
            }
        }

        return null;
    }
}
