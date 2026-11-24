<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\WorkHour;
use App\Support\ProviderSettings;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Works out bookable times for a provider.
 *
 * A booking can involve several professionals (one per service). An existing
 * appointment blocks a new one when their time windows overlap and they share
 * at least one professional, where "no specific professional" is its own pool.
 */
class BookingAvailabilityService
{
    public const SLOT_INTERVAL_MINUTES = 30;

    public const BLOCKING_STATUSES = ['pending', 'confirmed', 'pending_completion'];

    private const NO_PROFESSIONAL_KEY = '__none__';

    /**
     * @param  Collection<int, Service>  $services
     * @param  array<int, string|null>  $teamMemberIds
     * @return array{slots: array<int, array{start: string, end: string, display: string, datetime: string}>, message: string|null}
     */
    public function slotsForDate(
        User $provider,
        Collection $services,
        Carbon $date,
        array $teamMemberIds,
        ?string $ignoreAppointmentId = null,
    ): array {
        $context = $this->context($provider, $services, $date->copy()->startOfDay(), $date->copy()->endOfDay(), $ignoreAppointmentId);

        return $this->computeSlots($context, $date->copy()->startOfDay(), $this->poolKeys($teamMemberIds));
    }

    /**
     * Number of open slots for each of the seven days starting at $weekStart.
     *
     * @param  Collection<int, Service>  $services
     * @param  array<int, string|null>  $teamMemberIds
     * @return array<int, array{date: string, slots: int, closed: bool}>
     */
    public function weekSummary(
        User $provider,
        Collection $services,
        Carbon $weekStart,
        array $teamMemberIds,
        ?string $ignoreAppointmentId = null,
    ): array {
        $start = $weekStart->copy()->startOfDay();
        $context = $this->context($provider, $services, $start, $start->copy()->addDays(6)->endOfDay(), $ignoreAppointmentId);
        $pool = $this->poolKeys($teamMemberIds);

        return collect(range(0, 6))
            ->map(function (int $offset) use ($context, $start, $pool): array {
                $day = $start->copy()->addDays($offset);

                return [
                    'date' => $day->toDateString(),
                    'slots' => count($this->computeSlots($context, $day, $pool)['slots']),
                    'closed' => ! $context['workHoursByDay']->has($day->format('l')),
                ];
            })
            ->all();
    }

    /**
     * First open slot for the given professional (null = anyone) within the provider's booking window.
     *
     * @param  Collection<int, Service>  $services
     */
    public function nextAvailableSlot(User $provider, Collection $services, ?string $teamMemberId, int $maxDays = 14): ?Carbon
    {
        $settings = ProviderSettings::resolve($provider->businessProfile?->settings ?? []);
        $searchDays = min($maxDays, max(1, (int) $settings['advanceBooking']));
        $start = Carbon::today();
        $context = $this->context($provider, $services, $start, $start->copy()->addDays($searchDays)->endOfDay(), null);
        $pool = $this->poolKeys([$teamMemberId]);

        for ($offset = 0; $offset <= $searchDays; $offset++) {
            $slots = $this->computeSlots($context, $start->copy()->addDays($offset), $pool)['slots'];

            if ($slots !== []) {
                return Carbon::parse($slots[0]['datetime']);
            }
        }

        return null;
    }

    /**
     * @param  array<int, string|null>  $teamMemberIds
     */
    public function conflicts(
        string $providerId,
        Carbon $start,
        Carbon $end,
        int $bufferMinutes,
        array $teamMemberIds,
        ?string $ignoreAppointmentId = null,
    ): bool {
        $appointments = $this->blockingAppointments($providerId, $start->copy()->startOfDay(), $start->copy()->endOfDay(), $ignoreAppointmentId);

        return $this->overlapsAny($appointments, $start, $end, $bufferMinutes, $this->poolKeys($teamMemberIds));
    }

    /**
     * Who does each service. A per-service map wins; otherwise one professional
     * (or nobody in particular) covers every service.
     *
     * @param  array<int, string>  $serviceIds
     * @param  array<string, string|null>  $serviceTeamMemberIds
     * @return array<string, TeamMember|null>|null null when a chosen professional isn't bookable
     */
    public function resolveTeamMembers(string $providerId, array $serviceIds, array $serviceTeamMemberIds, ?string $fallbackTeamMemberId): ?array
    {
        $requested = collect($serviceIds)->mapWithKeys(fn (string $serviceId) => [
            $serviceId => ($serviceTeamMemberIds[$serviceId] ?? null) ?: ($fallbackTeamMemberId ?: null),
        ]);

        $members = TeamMember::query()
            ->whereIn('id', $requested->filter()->unique()->values())
            ->where('provider_id', $providerId)
            ->where('is_active', true)
            ->whereNotNull('accepted_at')
            ->get()
            ->keyBy('id');

        if ($requested->filter()->unique()->count() !== $members->count()) {
            return null;
        }

        return $requested->map(fn (?string $id) => $id ? $members->get($id) : null)->all();
    }

    /**
     * Professionals an existing appointment occupies.
     *
     * @return array<int, string>
     */
    public function poolKeysFor(Appointment $appointment): array
    {
        if ($appointment->team_member_id) {
            return [$appointment->team_member_id];
        }

        $ids = $appointment->services->map(fn (Service $service) => $service->pivot?->team_member_id)->all();

        return $this->poolKeys($ids === [] ? [null] : $ids);
    }

    /**
     * @param  Collection<int, Service>  $services
     * @return array<string, mixed>
     */
    private function context(User $provider, Collection $services, Carbon $from, Carbon $to, ?string $ignoreAppointmentId): array
    {
        $provider->loadMissing('businessProfile');
        $settings = ProviderSettings::resolve($provider->businessProfile?->settings ?? []);

        return [
            'settings' => $settings,
            'duration' => (int) $services->sum('duration_minutes'),
            'buffer' => (int) ($services->max('buffer_time_minutes') ?? 0) + (int) ($settings['bufferTime'] ?? 0),
            'workHoursByDay' => WorkHour::where('provider_id', $provider->id)
                ->where('is_closed', false)
                ->get()
                ->groupBy('day_of_week'),
            'dailyCounts' => Appointment::where('provider_id', $provider->id)
                ->whereBetween('start_time', [$from, $to])
                ->where('status', '!=', 'cancelled')
                ->get(['start_time'])
                ->countBy(fn (Appointment $appointment) => $appointment->start_time->toDateString()),
            'appointments' => $this->blockingAppointments($provider->id, $from, $to, $ignoreAppointmentId),
        ];
    }

    /**
     * @return Collection<int, Appointment>
     */
    private function blockingAppointments(string $providerId, Carbon $from, Carbon $to, ?string $ignoreAppointmentId): Collection
    {
        return Appointment::where('provider_id', $providerId)
            ->whereBetween('start_time', [$from, $to])
            ->whereIn('status', self::BLOCKING_STATUSES)
            ->when($ignoreAppointmentId, fn ($query) => $query->where('id', '!=', $ignoreAppointmentId))
            ->with(['services' => fn ($query) => $query->select('services.id')])
            ->get();
    }

    /**
     * @param  array<string, mixed>  $context
     * @param  array<int, string>  $pool
     * @return array{slots: array<int, array{start: string, end: string, display: string, datetime: string}>, message: string|null}
     */
    private function computeSlots(array $context, Carbon $date, array $pool): array
    {
        $settings = $context['settings'];
        $totalDuration = $context['duration'];
        $advanceBooking = (int) $settings['advanceBooking'];
        $minNotice = $settings['minNotice'] !== null ? (int) $settings['minNotice'] : null;
        $maxDaily = $settings['maxDaily'] !== null ? (int) $settings['maxDaily'] : null;

        if ($date->lt(Carbon::today())) {
            return $this->none('This day has already passed.');
        }

        if ($maxDaily && ($context['dailyCounts'][$date->toDateString()] ?? 0) >= $maxDaily) {
            return $this->none('This provider has reached the maximum number of appointments for that day.');
        }

        if ($date->gt(Carbon::now()->addDays($advanceBooking))) {
            return $this->none("Bookings can only be made up to {$advanceBooking} days in advance.");
        }

        if ($minNotice !== null && $date->isToday() && Carbon::now()->addHours($minNotice)->gt($date->copy()->endOfDay())) {
            return $this->none("Minimum notice period is {$minNotice} hours. Please select a later date.");
        }

        if (! $settings['allowSameDay'] && $date->isToday()) {
            return $this->none('Same-day bookings are not allowed. Please select a future date.');
        }

        /** @var Collection<int, WorkHour> $workHours */
        $workHours = $context['workHoursByDay']->get($date->format('l'), collect());

        if ($workHours->isEmpty()) {
            return $this->none('The provider is closed on this day.');
        }

        $longestBlock = $workHours->max(fn (WorkHour $workHour) => Carbon::parse($workHour->start_time)->diffInMinutes(Carbon::parse($workHour->end_time)));

        if ($totalDuration > $longestBlock) {
            return $this->none("The selected services require {$totalDuration} minutes, which exceeds the provider's longest working block ({$longestBlock} minutes) on this day.");
        }

        $dayString = $date->format('Y-m-d');
        $dayAppointments = $context['appointments']->filter(fn (Appointment $appointment) => $appointment->start_time->isSameDay($date));
        $earliestStart = $minNotice !== null
            ? Carbon::now()->addHours($minNotice)
            : Carbon::now();
        $slots = [];

        foreach ($workHours as $workHour) {
            $start = Carbon::parse($dayString.' '.$workHour->start_time);
            $end = Carbon::parse($dayString.' '.$workHour->end_time);

            if ($start->lt($earliestStart)) {
                $start = $earliestStart->copy()->ceilMinutes(self::SLOT_INTERVAL_MINUTES);
            }

            for ($current = $start->copy(); $current->copy()->addMinutes($totalDuration)->lte($end); $current->addMinutes(self::SLOT_INTERVAL_MINUTES)) {
                $slotStart = $current->copy();
                $slotEnd = $current->copy()->addMinutes($totalDuration);

                if ($this->overlapsBreak($workHour, $dayString, $slotStart, $slotEnd)
                    || $this->overlapsAny($dayAppointments, $slotStart, $slotEnd, $context['buffer'], $pool)) {
                    continue;
                }

                $slots[] = [
                    'start' => $slotStart->format('H:i'),
                    'end' => $slotEnd->format('H:i'),
                    'display' => $slotStart->format('g:i A'),
                    'datetime' => $slotStart->toIso8601String(),
                ];
            }
        }

        return [
            'slots' => $slots,
            'message' => $slots === [] ? 'No available slots found for the selected services and date.' : null,
        ];
    }

    /**
     * @param  Collection<int, Appointment>  $appointments
     * @param  array<int, string>  $pool
     */
    private function overlapsAny(Collection $appointments, Carbon $start, Carbon $end, int $bufferMinutes, array $pool): bool
    {
        $endWithBuffer = $end->copy()->addMinutes($bufferMinutes);

        return $appointments->contains(function (Appointment $appointment) use ($start, $endWithBuffer, $pool): bool {
            if (array_intersect($this->poolKeysFor($appointment), $pool) === []) {
                return false;
            }

            $appointmentEnd = $appointment->end_time->copy()->addMinutes((int) ($appointment->buffer_time_minutes ?? 0));

            return $start->lt($appointmentEnd) && $endWithBuffer->gt($appointment->start_time);
        });
    }

    private function overlapsBreak(WorkHour $workHour, string $dayString, Carbon $start, Carbon $end): bool
    {
        foreach ($workHour->breaks ?? [] as $break) {
            $breakStart = Carbon::parse($dayString.' '.$break['start']);
            $breakEnd = Carbon::parse($dayString.' '.$break['end']);

            if ($start->lt($breakEnd) && $end->gt($breakStart)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<int, string|null>  $teamMemberIds
     * @return array<int, string>
     */
    private function poolKeys(array $teamMemberIds): array
    {
        $keys = array_map(fn (?string $id) => $id ?: self::NO_PROFESSIONAL_KEY, $teamMemberIds === [] ? [null] : $teamMemberIds);

        return array_values(array_unique($keys));
    }

    /**
     * @return array{slots: array<int, never>, message: string}
     */
    private function none(string $message): array
    {
        return ['slots' => [], 'message' => $message];
    }
}
