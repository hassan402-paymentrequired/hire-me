<?php

use App\Models\BusinessProfile;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function accountSettingsProvider(): User
{
    $provider = User::factory()->create(['role' => 'provider']);
    BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'has_onboarded' => true,
    ]);

    return $provider;
}

test('providers see provider account pages inside the business workspace', function (string $routeName, string $component) {
    $this->actingAs(accountSettingsProvider())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    ['business.account.profile', 'settings/profile'],
    ['business.account.password', 'settings/password'],
    ['business.account.two-factor', 'settings/two-factor'],
]);

test('providers still get client settings pages on the client side', function (string $routeName, string $component) {
    $this->actingAs(accountSettingsProvider())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    ['profile.edit', 'client/settings/profile'],
    ['user-password.edit', 'client/settings/password'],
    ['two-factor.show', 'client/settings/two-factor'],
    ['appearance.edit', 'client/settings/appearance'],
]);

test('clients cannot open the provider account pages', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('business.account.profile'))
        ->assertRedirect();
});

test('profile update returns to the page it came from', function () {
    $provider = accountSettingsProvider();

    $this->actingAs($provider)
        ->from(route('business.account.profile'))
        ->patch(route('profile.update'), [
            'name' => 'Updated Name',
            'email' => $provider->email,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('business.account.profile'));
});
