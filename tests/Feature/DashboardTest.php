<?php

use App\Models\BusinessProfile;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get(route('business.dashboard'))->assertRedirect(route('login'));
});

test('onboarded providers can visit the business dashboard', function () {
    $provider = User::factory()->create(['role' => 'provider']);
    BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'address' => '1 Main St',
        'has_onboarded' => true,
    ]);

    $this->actingAs($provider)
        ->get(route('business.dashboard'))
        ->assertOk();
});

test('the business dashboard shares weekly revenue, today summary and booking link', function () {
    $provider = User::factory()->create(['role' => 'provider']);
    $profile = BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'address' => '1 Main St',
        'has_onboarded' => true,
    ]);

    $this->actingAs($provider)
        ->get(route('business.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('provider/dashboard/index')
            ->has('revenueThisWeek', 7)
            ->has('revenueThisWeek.0', fn (Assert $day) => $day
                ->hasAll(['label', 'date', 'value', 'is_today'])
            )
            ->where('today.count', 0)
            ->where('booking_url', route('provider.show', $profile->slug))
        );
});
