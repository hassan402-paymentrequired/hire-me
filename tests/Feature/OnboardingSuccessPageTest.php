<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the onboarding success page with the verification state', function (bool $isVerified) {
    $user = User::factory()->create(['is_verified' => $isVerified]);

    $this->actingAs($user)
        ->get(route('onboarding.success'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('provider/onboarding/success')
            ->where('is_verified', $isVerified));
})->with([
    'unverified' => false,
    'verified' => true,
]);
