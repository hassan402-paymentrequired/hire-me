<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\BusinessProfile;
use App\Models\Review;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\WorkHour;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ProviderProfileService
{
    public const MAX_TEAM_MEMBERS = 5;

    /**
     * Share of an hour that must be booked for it to count as busy.
     */
    public const BUSY_HOUR_THRESHOLD = 0.5;

    /**
     * The owner followed by accepted, active team members. Ratings come from
     * reviews of appointments each person handled; appointments without an
     * assigned team member count towards the owner.
     *
     * @return array<int, array{id: string, name: string, role: string, avatar: ?string, rating: ?float, reviewsCount: int}>
     */
    public function teamMembers(User $provider): array
    {
        $provider->loadMissing('businessProfile.images');

        $members = TeamMember::query()
            ->where('provider_id', $provider->id)
            ->where('user_id', '!=', $provider->id)
            ->where('is_active', true)
            ->whereNotNull('accepted_at')
            ->with('user:id,name,avatar')
            ->oldest('accepted_at')
            ->limit(self::MAX_TEAM_MEMBERS - 1)
            ->get()
            ->filter(fn (TeamMember $member): bool => $member->user !== null);

        $ratings = Review::query()
            ->join('appointments', 'appointments.id', '=', 'reviews.appointment_id')
            ->where('reviews.provider_id', $provider->id)
            ->groupBy('appointments.team_member_id')
            ->select([
                'appointments.team_member_id',
                DB::raw('AVG(reviews.rating) as average_rating'),
                DB::raw('COUNT(*) as reviews_count'),
            ])
            ->get()
            ->keyBy(fn ($row): string => (string) ($row->team_member_id ?? ''));

        $ratingFor = function (?string $teamMemberId) use ($ratings): array {
            $row = $ratings->get($teamMemberId ?? '');

            return [
                'rating' => $row ? round((float) $row->average_rating, 1) : null,
                'reviewsCount' => $row ? (int) $row->reviews_count : 0,
            ];
        };

        $owner = [
            'id' => (string) $provider->id,
            'name' => (string) $provider->name,
            'role' => 'Owner',
            'avatar' => $this->businessProfilePhotoUrl($provider->businessProfile) ?? $provider->avatar,
            ...$ratingFor(null),
        ];

        return [
            $owner,
            ...$members->map(fn (TeamMember $member): array => [
                'id' => (string) $member->id,
                'name' => (string) $member->user->name,
                'role' => $member->isAdmin() ? 'Manager' : 'Specialist',
                'avatar' => $member->user->avatar,
                ...$ratingFor((string) $member->id),
            ])->values()->all(),
        ];
    }

    /**
     * Review counts per star, ordered from five stars down to one.
     *
     * @param  Collection<int, Review>  $reviews
     * @return array<int, array{stars: int, count: int}>
     */
    public function ratingBreakdown(Collection $reviews): array
    {
        $counts = $reviews->countBy(fn (Review $review): int => (int) $review->rating);

        return collect(range(5, 1))
            ->map(fn (int $stars): array => [
                'stars' => $stars,
                'count' => (int) $counts->get($stars, 0),
            ])
            ->all();
    }

    /**
     * The time from which the rest of today's opening hours are mostly booked,
     * e.g. "5 pm". Null when the provider is closed today or still has free
     * time right up to closing.
     */
    public function busyFrom(User $provider, CarbonInterface $now): ?string
    {
        $workHour = WorkHour::query()
            ->where('provider_id', $provider->id)
            ->where('day_of_week', $now->format('l'))
            ->where('is_closed', false)
            ->orderByDesc('end_time')
            ->first();

        if (! $workHour?->start_time || ! $workHour->end_time) {
            return null;
        }

        $opensAt = Carbon::parse($now->toDateString().' '.$workHour->start_time, $now->getTimezone());
        $closesAt = Carbon::parse($now->toDateString().' '.$workHour->end_time, $now->getTimezone());
        $firstHour = $now->copy()->addHour()->startOfHour()->max($opensAt->copy()->startOfHour());

        if ($closesAt->lessThanOrEqualTo($firstHour)) {
            return null;
        }

        $appointments = Appointment::query()
            ->where('provider_id', $provider->id)
            ->where('status', '!=', 'cancelled')
            ->where('start_time', '<', $closesAt)
            ->where('end_time', '>', $firstHour)
            ->get(['start_time', 'end_time']);

        if ($appointments->isEmpty()) {
            return null;
        }

        $busyFrom = null;

        for ($hour = $closesAt->copy()->subMinute()->startOfHour(); $hour->greaterThanOrEqualTo($firstHour); $hour->subHour()) {
            $slotStart = $hour->copy();
            $slotEnd = $hour->copy()->addHour()->min($closesAt);
            $slotMinutes = $slotStart->diffInMinutes($slotEnd);

            $bookedMinutes = $appointments->sum(function (Appointment $appointment) use ($slotStart, $slotEnd): float {
                $overlapStart = $appointment->start_time->max($slotStart);
                $overlapEnd = $appointment->end_time->min($slotEnd);

                return $overlapEnd->greaterThan($overlapStart) ? $overlapStart->diffInMinutes($overlapEnd) : 0;
            });

            if ($slotMinutes <= 0 || min($bookedMinutes, $slotMinutes) / $slotMinutes < self::BUSY_HOUR_THRESHOLD) {
                break;
            }

            $busyFrom = $slotStart->copy();
        }

        if (! $busyFrom) {
            return null;
        }

        return $busyFrom->format('g a');
    }

    private function businessProfilePhotoUrl(?BusinessProfile $profile): ?string
    {
        if (! $profile) {
            return null;
        }

        $logoImage = $profile->images->firstWhere('is_logo', true);

        if ($logoImage?->image_path) {
            return \App\Services\FileUploadService::url($logoImage->image_path, 'public');
        }

        if ($profile->logo_path) {
            return \App\Services\FileUploadService::url($profile->logo_path, 'public');
        }

        return null;
    }
}
