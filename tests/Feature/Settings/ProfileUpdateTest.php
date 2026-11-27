<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});
test('client profile details can be updated from the account settings form', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'first_name' => 'Tolu',
            'last_name' => 'Adeyemi',
            'email' => $user->email,
            'phone' => '+234 803 000 0000',
            'gender' => 'female',
            'date_of_birth' => '1996-04-12',
            'avatar' => UploadedFile::fake()->image('me.jpg'),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Tolu Adeyemi')
        ->and($user->phone)->toBe('+234 803 000 0000')
        ->and($user->gender)->toBe('female')
        ->and($user->date_of_birth->toDateString())->toBe('1996-04-12')
        ->and($user->avatar)->not->toBeNull();
});

test('profile photo can be removed', function () {
    $user = User::factory()->create(['avatar' => 'https://example.test/me.jpg']);

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'first_name' => 'Tolu',
            'email' => $user->email,
            'remove_avatar' => true,
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->avatar)->toBeNull()
        ->and($user->fresh()->name)->toBe('Tolu');
});

test('profile details are validated', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'first_name' => '',
            'email' => $user->email,
            'phone' => 'not-a-phone',
            'gender' => 'unknown',
            'date_of_birth' => now()->addDay()->toDateString(),
        ])
        ->assertSessionHasErrors(['first_name', 'phone', 'gender', 'date_of_birth']);
});
