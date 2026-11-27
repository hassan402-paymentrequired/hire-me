<?php

use App\Models\BusinessProfile;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the become provider page to users without a business', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('become-provider'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('provider/become-provider')
            ->where('hasStartedOnboarding', false));
});

it('sends users to onboarding when they start setup', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('become-provider.store'))
        ->assertRedirect(route('onboarding.index'));
});

it('redirects existing providers to their dashboard', function () {
    $user = User::factory()->create(['role' => 'provider']);
    BusinessProfile::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('become-provider'))
        ->assertRedirect(route('business.dashboard'));
});
