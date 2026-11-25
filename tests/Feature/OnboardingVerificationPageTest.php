<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the identity verification step', function () {
    $user = User::factory()->create(['is_verified' => false]);

    $this->actingAs($user)
        ->get(route('onboarding.verification'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('provider/onboarding/verification')
            ->where('is_verified', false));
});
