<?php

use App\Models\Appointment;
use App\Models\BusinessImage;
use App\Models\BusinessProfile;
use App\Models\Review;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\WorkHour;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function profileProvider(array $settings = []): array
{
    $provider = User::factory()->create(['role' => 'provider', 'is_verified' => true, 'name' => 'Amara Obi']);
    $profile = BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'category' => 'Salon',
        'settings' => $settings,
    ]);
    $service = Service::factory()->create(['provider_id' => $provider->id, 'name' => 'Silk press']);

    return [$provider, $profile, $service];
}

function reviewFor(User $provider, Service $service, int $rating, ?TeamMember $member = null, ?Carbon $at = null): Review
{
    $client = User::factory()->create(['name' => 'Chioma Nwosu']);
    $appointment = Appointment::factory()->create([
        'provider_id' => $provider->id,
        'client_id' => $client->id,
        'service_id' => $service->id,
        'team_member_id' => $member?->id,
        'status' => 'completed',
    ]);

    $review = Review::create([
        'appointment_id' => $appointment->id,
        'user_id' => $client->id,
        'provider_id' => $provider->id,
        'rating' => $rating,
        'comment' => 'Lovely work.',
    ]);

    if ($at) {
        $review->forceFill(['created_at' => $at])->save();
    }

    return $review;
}

function acceptedMember(User $provider, string $name, string $role = 'staff', bool $active = true, bool $accepted = true): TeamMember
{
    return TeamMember::create([
        'provider_id' => $provider->id,
        'user_id' => User::factory()->create(['name' => $name])->id,
        'role' => $role,
        'is_active' => $active,
        'accepted_at' => $accepted ? now() : null,
    ]);
}

it('when a business profile photo exists then the page exposes it as the provider logo', function () {
    Storage::fake('public');
    [$provider, $profile] = profileProvider();
    $path = 'business-logos/glow.jpg';
    Storage::disk('public')->put($path, 'logo');

    BusinessImage::query()->create([
        'business_profile_id' => $profile->id,
        'image_path' => $path,
        'is_logo' => true,
    ]);
    $profile->update(['logo_path' => $path]);

    $logoUrl = \App\Services\FileUploadService::url($path, 'public');

    $this->get(route('provider.show', $profile->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('provider.logo', $logoUrl)
            ->where('teamMembers.0.avatar', $logoUrl));
});

it('when reviews exist then the page receives a five-to-one star breakdown', function () {
    [$provider, $profile, $service] = profileProvider();
    reviewFor($provider, $service, 5);
    reviewFor($provider, $service, 5);
    reviewFor($provider, $service, 3);

    $this->get(route('provider.show', $profile->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('marketplace/provider')
            ->where('ratingBreakdown', [
                ['stars' => 5, 'count' => 2],
                ['stars' => 4, 'count' => 0],
                ['stars' => 3, 'count' => 1],
                ['stars' => 2, 'count' => 0],
                ['stars' => 1, 'count' => 0],
            ]));
});

it('when there are no reviews then every star bucket is zero', function () {
    [, $profile] = profileProvider();

    $this->get(route('provider.show', $profile->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->has('ratingBreakdown', 5)
            ->where('ratingBreakdown', fn ($buckets) => collect($buckets)->sum('count') === 0));
});

it('when a review is shown then it includes the booked service and a short date', function () {
    [$provider, $profile, $service] = profileProvider();
    reviewFor($provider, $service, 4, at: Carbon::parse('2026-11-16 10:00'));

    $this->get(route('provider.show', $profile->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('reviews.0.service_name', 'Silk press')
            ->where('reviews.0.date_label', 'Mon, 16 Nov'));
});

it('when the provider has a team then the owner is listed first followed by accepted active members', function () {
    [$provider, $profile] = profileProvider();
    acceptedMember($provider, 'Tobi Bello', 'staff');
    acceptedMember($provider, 'Kemi Eze', 'admin');
    acceptedMember($provider, 'Pending Person', accepted: false);
    acceptedMember($provider, 'Inactive Person', active: false);

    $this->get(route('provider.show', $profile->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->has('teamMembers', 3)
            ->where('teamMembers.0.name', 'Amara Obi')
            ->where('teamMembers.0.role', 'Owner')
            ->where('teamMembers', fn ($members) => collect($members)->pluck('name')->sort()->values()->all() === ['Amara Obi', 'Kemi Eze', 'Tobi Bello'])
            ->where('teamMembers', fn ($members) => collect($members)->firstWhere('name', 'Kemi Eze')['role'] === 'Manager'));
});

it('when a team member handled reviewed appointments then their own average rating is shown', function () {
    [$provider, $profile, $service] = profileProvider();
    $member = acceptedMember($provider, 'Tobi Bello');
    reviewFor($provider, $service, 4, $member);
    reviewFor($provider, $service, 5, $member);
    reviewFor($provider, $service, 2);

    $this->get(route('provider.show', $profile->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('teamMembers.0.rating', 2)
            ->where('teamMembers.0.reviewsCount', 1)
            ->where('teamMembers.1.rating', 4.5)
            ->where('teamMembers.1.reviewsCount', 2));
});

it('when a team member has no reviews then their rating is null', function () {
    [$provider, $profile] = profileProvider();
    acceptedMember($provider, 'Tobi Bello');

    $this->get(route('provider.show', $profile->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('teamMembers.1.rating', null)
            ->where('teamMembers.1.reviewsCount', 0));
});

it('when the team is larger than five then only five people are listed', function () {
    [$provider, $profile] = profileProvider();
    foreach (range(1, 6) as $i) {
        acceptedMember($provider, "Member {$i}");
    }

    $this->get(route('provider.show', $profile->slug))
        ->assertInertia(fn (Assert $page) => $page->has('teamMembers', 5));
});

it('when booking settings are configured then the good-to-know flags reflect them', function () {
    [, $profile] = profileProvider([
        'autoConfirm' => true,
        'accept_online_payment' => false,
        'accept_offline_booking' => true,
    ]);

    $this->get(route('provider.show', $profile->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('provider.autoConfirm', true)
            ->where('provider.acceptsOnlinePayment', false)
            ->where('provider.acceptsOfflinePayment', true));
});

it('when a service has a starting price then the page flags it', function () {
    [$provider, $profile, $service] = profileProvider();
    $service->update(['price_is_starting' => true]);

    $this->get(route('provider.show', $profile->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('services.0.price_is_starting', true));
});

it('when the rest of today is booked then the page shows when it gets busy', function () {
    Carbon::setTestNow(Carbon::parse('2026-11-25 10:30', 'Africa/Lagos'));
    [$provider, $profile, $service] = profileProvider();
    WorkHour::create([
        'provider_id' => $provider->id,
        'day_of_week' => 'Wednesday',
        'start_time' => '09:00',
        'end_time' => '20:00',
        'is_closed' => false,
    ]);
    Appointment::factory()->create([
        'provider_id' => $provider->id,
        'client_id' => User::factory()->create()->id,
        'service_id' => $service->id,
        'status' => 'confirmed',
        'start_time' => Carbon::parse('2026-11-25 17:00'),
        'end_time' => Carbon::parse('2026-11-25 20:00'),
    ]);

    $this->get(route('provider.show', $profile->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('provider.busyFrom', '5 pm'));
});

it('when today still has free time before closing then no busy time is shown', function () {
    Carbon::setTestNow(Carbon::parse('2026-11-25 10:30', 'Africa/Lagos'));
    [$provider, $profile, $service] = profileProvider();
    WorkHour::create([
        'provider_id' => $provider->id,
        'day_of_week' => 'Wednesday',
        'start_time' => '09:00',
        'end_time' => '20:00',
        'is_closed' => false,
    ]);
    Appointment::factory()->create([
        'provider_id' => $provider->id,
        'client_id' => User::factory()->create()->id,
        'service_id' => $service->id,
        'status' => 'confirmed',
        'start_time' => Carbon::parse('2026-11-25 14:00'),
        'end_time' => Carbon::parse('2026-11-25 16:00'),
    ]);

    $this->get(route('provider.show', $profile->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('provider.busyFrom', null));
});
