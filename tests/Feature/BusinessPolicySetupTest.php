<?php

use App\Models\BusinessProfile;
use App\Models\User;

it('saves the first-time business policy and stops showing the modal', function () {
    $provider = User::factory()->create(['role' => 'provider']);
    $profile = BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'has_onboarded' => true,
        'has_setup_business_policy' => false,
    ]);

    $this->actingAs($provider)
        ->post(route('business.settings.advanced.update'), [
            'settings' => [
                'billing_model' => 'subscription',
                'service_delivery_mode' => 'both',
                'accept_online_payment' => true,
                'accept_offline_booking' => true,
                'autoConfirm' => true,
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success-toast');

    $profile->refresh();

    expect($profile->has_setup_business_policy)->toBeTrue()
        ->and($profile->settings['billing_model'])->toBe('subscription')
        ->and($profile->settings['accept_offline_booking'])->toBeTrue();
});
