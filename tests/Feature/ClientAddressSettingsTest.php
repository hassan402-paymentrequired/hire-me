<?php

use App\Models\ClientAddress;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows saved addresses on the addresses tab', function () {
    $user = User::factory()->create();
    ClientAddress::create([
        'user_id' => $user->id,
        'label' => 'Home',
        'address' => '14 Admiralty Way, Lekki Phase 1',
        'city' => 'Lekki',
        'state' => 'Lagos',
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->get(route('client-addresses.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/settings/addresses')
            ->has('addresses', 1)
            ->where('addresses.0.label', 'Home'));
});

it('keeps coordinates when an address is saved from the settings form', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/client-addresses', [
            'label' => 'Office',
            'address' => 'Plot 8, Adeola Odeku St, Victoria Island',
            'city' => 'Victoria Island',
            'state' => 'Lagos',
            'latitude' => 6.4281,
            'longitude' => 3.4219,
            'is_active' => true,
        ])
        ->assertSuccessful()
        ->assertJsonPath('address.label', 'Office');

    $address = ClientAddress::where('user_id', $user->id)->first();

    expect((float) $address->latitude)->toBe(6.4281)
        ->and((float) $address->longitude)->toBe(3.4219)
        ->and($address->is_active)->toBeTrue();
});
