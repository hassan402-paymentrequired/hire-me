<?php

use App\Models\BusinessProfile;
use App\Models\Service;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function providerInCategory(string $category, bool $verified = true): BusinessProfile
{
    $provider = User::factory()->create(['role' => 'provider', 'is_verified' => $verified]);
    $profile = BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'category' => $category,
    ]);
    Service::factory()->create(['provider_id' => $provider->id]);

    return $profile;
}

it('includes the business phone and city on the provider profile', function () {
    $provider = User::factory()->create(['role' => 'provider', 'is_verified' => true]);
    $profile = BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'category' => 'Salon',
        'phone' => '+2348010000000',
        'city' => 'Lagos',
    ]);
    Service::factory()->create(['provider_id' => $provider->id]);

    $this->get(route('provider.show', $profile->slug))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('marketplace/provider')
            ->where('provider.phone', '+2348010000000')
            ->where('provider.city', 'Lagos'));
});

it('shows at most four nearby providers from the same category', function () {
    $business = providerInCategory('Salon');

    foreach (range(1, 7) as $i) {
        providerInCategory('Salon');
    }
    providerInCategory('Plumbing');
    providerInCategory('Salon', verified: false);

    $this->get(route('provider.show', $business->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('marketplace/provider')
            ->has('nearbyProviders', 4)
            ->where('nearbyProviders', fn ($nearby) => collect($nearby)->every(
                fn (array $p): bool => $p['category'] === 'Salon' && $p['slug'] !== $business->slug && $p['isVerified'],
            )));
});
