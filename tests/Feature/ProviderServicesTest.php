<?php

use App\Models\BusinessProfile;
use App\Models\Category;
use App\Models\ProviderServiceCategory;
use App\Models\Service;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function providerWithServiceCategory(): array
{
    $provider = User::factory()->create(['role' => 'provider']);
    $category = Category::create(['name' => 'Beauty', 'slug' => 'beauty']);
    BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'category' => 'beauty',
        'has_onboarded' => true,
    ]);
    $serviceCategory = ProviderServiceCategory::create([
        'provider_id' => $provider->id,
        'name' => 'Braids',
        'slug' => 'braids',
    ]);

    return [$provider, $serviceCategory, $category];
}

test('a service can be created hidden from booking', function () {
    [$provider, $serviceCategory] = providerWithServiceCategory();

    $this->actingAs($provider)
        ->post('/business/services', [
            'service_category_id' => $serviceCategory->id,
            'name' => 'Braids (medium)',
            'price' => 15000,
            'duration_minutes' => 180,
            'status' => 'inactive',
        ])
        ->assertSessionHasNoErrors();

    expect(Service::where('provider_id', $provider->id)->first()->status)->toBe('inactive');
});

test('updating a service can change its availability', function () {
    [$provider, $serviceCategory, $category] = providerWithServiceCategory();
    $service = Service::factory()->create([
        'provider_id' => $provider->id,
        'category_id' => $category->id,
        'service_category_id' => $serviceCategory->id,
    ]);

    $this->actingAs($provider)
        ->put("/business/services/{$service->id}", [
            'service_category_id' => $serviceCategory->id,
            'name' => $service->name,
            'price' => 9000,
            'duration_minutes' => 60,
            'status' => 'inactive',
        ])
        ->assertSessionHasNoErrors();

    expect($service->fresh()->status)->toBe('inactive');
});

test('services page shares bookings this month per service', function () {
    [$provider, $serviceCategory, $category] = providerWithServiceCategory();
    Service::factory()->create([
        'provider_id' => $provider->id,
        'category_id' => $category->id,
        'service_category_id' => $serviceCategory->id,
    ]);

    $this->actingAs($provider)
        ->get('/business/services')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('provider/business/services/index')
            ->where('services.data.0.bookings_this_month', 0)
            ->where('stats.mostBooked.bookings', 0));
});
