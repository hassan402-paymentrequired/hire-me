<?php

use App\Models\Category;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the business profile onboarding step', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('onboarding.business-profile'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('provider/onboarding/business-profile')
            ->has('categories'));
});

it('stores onboarding photos as listing banners not profile logos', function () {
    Storage::fake('public');
    Category::firstOrCreate(['slug' => 'salon'], ['name' => 'Salon']);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('onboarding.business-profile.store'), [
            'business_name' => 'Glow Studio',
            'description' => 'We glow',
            'images' => [UploadedFile::fake()->image('storefront.jpg')],
            'cover_index' => 0,
            'address' => '12 Allen Avenue',
            'city' => 'Ikeja',
            'state' => 'Lagos',
            'category' => 'salon',
        ])
        ->assertRedirect(route('onboarding.work-hours'));

    $profile = $user->fresh()->businessProfile;

    expect($profile)->not->toBeNull()
        ->and($profile->logo_path)->toBeNull()
        ->and($profile->images()->where('is_logo', true)->count())->toBe(0)
        ->and($profile->images()->where('is_logo', false)->count())->toBe(1);
});
