<?php

use App\Models\BusinessProfile;
use App\Models\Category;
use App\Models\TeamMember;
use App\Models\User;
use Database\Seeders\CategorySeeder;
use Database\Seeders\ProviderSeeder;

it('seeds providers with valid category slugs and completed onboarding', function () {
    $this->seed([CategorySeeder::class, ProviderSeeder::class]);

    $categorySlugs = Category::pluck('slug');
    $profiles = BusinessProfile::all();

    expect($profiles)->not->toBeEmpty();

    $profiles->each(function (BusinessProfile $profile) use ($categorySlugs) {
        expect($categorySlugs)->toContain($profile->category)
            ->and((bool) $profile->has_onboarded)->toBeTrue()
            ->and(TeamMember::where('provider_id', $profile->user_id)->where('user_id', $profile->user_id)->exists())->toBeTrue();
    });
});

it('lets a seeded provider reach the dashboard instead of onboarding', function () {
    $this->seed([CategorySeeder::class, ProviderSeeder::class]);

    $provider = User::where('email', 'provider1@proxideck.test')->firstOrFail();

    $this->actingAs($provider)
        ->get(route('onboarding.index'))
        ->assertRedirect(route('business.dashboard'));
});

it('fills the demo provider dashboard with appointments and reviews', function () {
    $this->seed([CategorySeeder::class, ProviderSeeder::class, \Database\Seeders\ProviderDashboardSeeder::class]);

    $provider = User::where('email', 'provider1@proxideck.test')->firstOrFail();

    $this->actingAs($provider)
        ->get(route('business.dashboard'))
        ->assertOk()
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('provider/dashboard/index')
            ->where('stats.bookings.value', fn ($value) => $value > 0)
            ->where('stats.revenue.value', fn ($value) => $value > 0)
            ->where('stats.rating.value', fn ($value) => $value >= 4)
            ->has('upcomingAppointments', 5)
            ->where('today.count', fn ($value) => $value > 0)
            ->where('needsAttention', fn ($items) => collect($items)->pluck('type')->contains('pending_client_confirmation')));
});

it('can re-run the dashboard seeder without duplicating data', function () {
    $this->seed([CategorySeeder::class, ProviderSeeder::class, \Database\Seeders\ProviderDashboardSeeder::class]);
    $provider = User::where('email', 'provider1@proxideck.test')->firstOrFail();
    $firstCount = \App\Models\Appointment::where('provider_id', $provider->id)->count();

    $this->seed(\Database\Seeders\ProviderDashboardSeeder::class);

    expect(\App\Models\Appointment::where('provider_id', $provider->id)->count())->toBe($firstCount);
});
