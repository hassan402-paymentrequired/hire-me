<?php

use App\Models\Appointment;
use App\Models\BusinessProfile;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function onboardedProvider(): User
{
    $provider = User::factory()->create(['role' => 'provider']);
    BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'address' => '1 Main St',
        'has_onboarded' => true,
    ]);

    return $provider;
}

test('the appointments page loads with an empty list', function () {
    $provider = onboardedProvider();

    $this->actingAs($provider)
        ->get(route('schedule.appointments.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('provider/schedule/appointments')
            ->where('appointments.total', 0)
            ->has('appointments.data', 0)
        );
});

test('the appointments page shares counts for each status', function () {
    $provider = onboardedProvider();
    $client = User::factory()->create();

    foreach (['pending', 'pending', 'confirmed', 'cancelled'] as $status) {
        Appointment::factory()->create([
            'provider_id' => $provider->id,
            'client_id' => $client->id,
            'status' => $status,
        ]);
    }

    $this->actingAs($provider)
        ->get(route('schedule.appointments.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('provider/schedule/appointments')
            ->where('statusCounts.all', 4)
            ->where('statusCounts.pending', 2)
            ->where('statusCounts.confirmed', 1)
            ->where('statusCounts.completed', 0)
            ->where('statusCounts.cancelled', 1)
        );
});

test('confirming from the list can return to the list', function () {
    $provider = onboardedProvider();
    $client = User::factory()->create();

    $appointment = Appointment::factory()->create([
        'provider_id' => $provider->id,
        'client_id' => $client->id,
        'status' => 'pending',
    ]);

    $this->actingAs($provider)
        ->from(route('schedule.appointments.index'))
        ->post("/provider/appointments/{$appointment->id}/confirm", ['return_back' => true])
        ->assertRedirect(route('schedule.appointments.index'));

    expect($appointment->fresh()->status)->toBe('confirmed');
});
