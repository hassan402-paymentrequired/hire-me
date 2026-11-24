<?php

namespace App\Services;

use App\Models\Review;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ProviderProfileService
{
    public const MAX_TEAM_MEMBERS = 5;

    /**
     * The owner followed by accepted, active team members. Ratings come from
     * reviews of appointments each person handled; appointments without an
     * assigned team member count towards the owner.
     *
     * @return array<int, array{id: string, name: string, role: string, avatar: ?string, rating: ?float, reviewsCount: int}>
     */
    public function teamMembers(User $provider): array
    {
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
            'avatar' => $provider->avatar,
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
}
