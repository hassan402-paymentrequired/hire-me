<?php

use App\Models\BusinessProfile;
use App\Models\Category;
use App\Models\ProviderServiceCategory;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Str;

function onboardingProvider(string $businessCategory = 'salon'): User
{
    Category::firstOrCreate(['slug' => 'salon'], ['name' => 'Salon']);

    $provider = User::factory()->create(['role' => 'provider']);
    BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'slug' => 'biz-'.Str::random(6),
        'address' => '1 Main St',
        'category' => $businessCategory,
        'has_onboarded' => false,
    ]);

    return $provider;
}

function onboardingServicePayload(User $provider, string $name): array
{
    $serviceCategory = ProviderServiceCategory::firstOrCreate(
        ['provider_id' => $provider->id, 'name' => 'Hair'],
        ['slug' => 'hair-'.Str::random(5)],
    );

    return [
        'service_category_id' => $serviceCategory->id,
        'name' => $name,
        'price' => 5000,
        'duration_minutes' => 60,
    ];
}

it('adds the onboarding service without overwriting existing services', function () {
    $provider = onboardingProvider();
    $category = Category::where('slug', 'salon')->first();
    Service::factory()->create(['provider_id' => $provider->id, 'category_id' => $category->id, 'name' => 'Existing cut']);

    $this->actingAs($provider)
        ->post(route('onboarding.services.store'), onboardingServicePayload($provider, 'New braids'))
        ->assertRedirect(route('onboarding.success'));

    expect(Service::where('provider_id', $provider->id)->pluck('name')->sort()->values()->all())
        ->toBe(['Existing cut', 'New braids'])
        ->and((bool) $provider->businessProfile->fresh()->has_onboarded)->toBeTrue();
});

it('returns a category_id error when the business category is invalid', function () {
    $provider = onboardingProvider('Not A Real Category');

    $this->actingAs($provider)
        ->from(route('onboarding.services'))
        ->post(route('onboarding.services.store'), onboardingServicePayload($provider, 'Cut'))
        ->assertSessionHasErrors('category_id');

    expect(Service::where('provider_id', $provider->id)->exists())->toBeFalse();
});
