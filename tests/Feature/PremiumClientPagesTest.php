<?php

use App\Models\Appointment;
use App\Models\BusinessProfile;
use App\Models\FavouriteBusiness;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use App\Notifications\AppointmentConfirmedNotification;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;
use NotificationChannels\WebPush\WebPushChannel;

beforeEach(fn () => Cache::flush());

function listedProvider(array $profile = []): BusinessProfile
{
    $provider = User::factory()->create(['role' => 'provider', 'is_verified' => true]);
    $business = BusinessProfile::factory()->create(['user_id' => $provider->id, ...$profile]);
    Service::factory()->create(['provider_id' => $provider->id, 'status' => 'active']);

    return $business;
}

it('shows featured providers on the landing page', function () {
    listedProvider();

    $this->get(route('home'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('guest/welcome')
            ->has('featuredProviders', 1));
});

it('filters the explore page by location', function () {
    listedProvider(['city' => 'Lekki']);
    listedProvider(['city' => 'Abuja', 'address' => 'Wuse 2', 'state' => 'FCT']);

    $this->get(route('explore.index', ['location' => 'Lekki']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('guest/explore')
            ->where('filters.location', 'Lekki')
            ->has('providers.data', 1));
});

it('lists only the signed-in client’s favourite providers with their last booking', function () {
    $client = User::factory()->create();
    $favourite = listedProvider();
    listedProvider();

    FavouriteBusiness::create(['user_id' => $client->id, 'business_profile_id' => $favourite->id]);
    Appointment::factory()->create([
        'client_id' => $client->id,
        'provider_id' => $favourite->user_id,
        'service_id' => Service::where('provider_id', $favourite->user_id)->value('id'),
        'start_time' => '2026-11-02 10:00:00',
    ]);

    $this->actingAs($client)
        ->get(route('favourites.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/favourites/index')
            ->has('favourites', 1)
            ->where('favourites.0.businessId', $favourite->id)
            ->whereNot('favourites.0.lastBookedAt', null));
});

it('renders my bookings empty state for clients with no appointments', function () {
    $client = User::factory()->create();

    $this->actingAs($client)
        ->get(route('client.bookings.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/bookings/index')
            ->where('counts.all', 0)
            ->has('bookings', 0));
});

it('returns booking counts and review status on my bookings', function () {
    $client = User::factory()->create();
    $provider = listedProvider();
    $serviceId = Service::where('provider_id', $provider->user_id)->value('id');

    $completed = Appointment::factory()->create(['client_id' => $client->id, 'provider_id' => $provider->user_id, 'service_id' => $serviceId, 'status' => 'completed']);
    Appointment::factory()->create(['client_id' => $client->id, 'provider_id' => $provider->user_id, 'service_id' => $serviceId, 'status' => 'confirmed']);
    Review::create(['appointment_id' => $completed->id, 'user_id' => $client->id, 'provider_id' => $provider->user_id, 'rating' => 5]);

    $this->actingAs($client)
        ->get(route('client.bookings.index', ['status' => 'completed']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('counts.active', 1)
            ->where('counts.completed', 1)
            ->where('counts.all', 2)
            ->where('bookings.0.has_review', true));
});

it('no longer has a notification settings page', function () {
    $this->actingAs(User::factory()->create())
        ->get('/settings/notifications')
        ->assertNotFound();
});

it('sends booking notifications on every channel', function () {
    $user = User::factory()->create(['notification_preferences' => ['email' => false, 'push' => false]]);
    $provider = listedProvider();
    $appointment = Appointment::factory()->create([
        'client_id' => $user->id,
        'provider_id' => $provider->user_id,
        'service_id' => Service::where('provider_id', $provider->user_id)->value('id'),
    ]);

    expect((new AppointmentConfirmedNotification($appointment))->via($user))
        ->toBe(['mail', 'database', WebPushChannel::class]);
});

it('passes support contact details to the contact page', function () {
    config(['app.support' => ['email' => 'help@example.test', 'whatsapp' => null, 'phone' => null]]);

    $this->get(route('contact'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('guest/pages/contact')
            ->where('support.email', 'help@example.test'));
});
