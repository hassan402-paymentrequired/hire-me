<?php

use App\Models\BusinessProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function settingsProvider(): User
{
    $provider = User::factory()->create(['role' => 'provider']);
    BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'has_onboarded' => true,
    ]);

    return $provider;
}

test('general settings page includes location and images', function () {
    $provider = settingsProvider();

    $this->actingAs($provider)
        ->get('/business/settings')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('provider/business/settings/index')
            ->has('profile.address')
            ->has('profile.city')
            ->has('profile.images')
            ->has('profile.slug'));
});

test('old location and appearance pages redirect to general', function (string $path) {
    $this->actingAs(settingsProvider())
        ->get($path)
        ->assertRedirect('/business/settings');
})->with(['/business/settings/location', '/business/settings/appearance']);

test('general settings save details, location, logo and banner together', function () {
    Storage::fake('public');
    $provider = settingsProvider();

    $this->actingAs($provider)
        ->post('/business/settings', [
            'business_name' => 'Glow Studio',
            'phone' => '+2348000000000',
            'address' => '12 Allen Avenue',
            'city' => 'Ikeja',
            'state' => 'Lagos',
            'latitude' => 6.6,
            'longitude' => 3.35,
            'logo' => UploadedFile::fake()->image('logo.png'),
            'new_images' => [UploadedFile::fake()->image('banner.png')],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $profile = $provider->businessProfile->fresh();

    expect($profile->business_name)->toBe('Glow Studio')
        ->and($profile->city)->toBe('Ikeja')
        ->and($profile->state)->toBe('Lagos')
        ->and($profile->logo_path)->not->toBeNull()
        ->and($profile->images()->where('is_logo', false)->count())->toBe(1);
});
