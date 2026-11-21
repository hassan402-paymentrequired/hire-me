<?php

use App\Models\BusinessProfile;
use App\Models\Category;
use App\Models\Service;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the booking page with the provider active services', function () {
    $category = Category::firstOrCreate(['slug' => 'salon'], ['name' => 'Salon']);
    $provider = User::factory()->create(['role' => 'provider', 'is_verified' => true]);
    BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'slug' => 'book-me',
        'address' => '1 Main St',
        'category' => 'salon',
        'has_onboarded' => true,
    ]);
    Service::factory()->create(['provider_id' => $provider->id, 'category_id' => $category->id, 'name' => 'Active cut']);
    Service::factory()->create(['provider_id' => $provider->id, 'category_id' => $category->id, 'name' => 'Old cut', 'status' => 'inactive']);

    $client = User::factory()->create(['role' => 'client']);

    $this->actingAs($client)
        ->get(route('marketplace.booking', 'book-me'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('marketplace/booking')
            ->has('services', 1)
            ->where('services.0.name', 'Active cut'));
});
