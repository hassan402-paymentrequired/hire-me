<?php

use App\Models\User;
use App\Services\EmailVerificationOtpService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;

test('email verification screen can be rendered', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->get(route('verification.notice'))
        ->assertOk();
});

test('email can be verified with a valid code', function () {
    $user = User::factory()->unverified()->create();
    $code = app(EmailVerificationOtpService::class)->issue($user);

    Event::fake([Verified::class]);

    $this->actingAs($user)
        ->post(route('verification.otp.verify'), ['code' => $code])
        ->assertRedirect(route('home'));

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('email is not verified with an invalid code', function () {
    $user = User::factory()->unverified()->create();
    $code = app(EmailVerificationOtpService::class)->issue($user);
    $wrongCode = $code === '111111' ? '222222' : '111111';

    $this->actingAs($user)
        ->post(route('verification.otp.verify'), ['code' => $wrongCode])
        ->assertSessionHasErrors('code');

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('email is not verified without an issued code', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('verification.otp.verify'), ['code' => '123456'])
        ->assertSessionHasErrors('code');

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('verified providers are sent to the business dashboard', function () {
    $provider = User::factory()->unverified()->create(['role' => 'provider']);
    \App\Models\BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'address' => '1 Main St',
        'has_onboarded' => true,
    ]);
    $code = app(EmailVerificationOtpService::class)->issue($provider);

    $this->actingAs($provider)
        ->post(route('verification.otp.verify'), ['code' => $code])
        ->assertRedirect(route('business.dashboard'))
        ->assertSessionHas('success-toast');
});

test('already verified user submitting a code is redirected without firing event again', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    Event::fake([Verified::class]);

    $this->actingAs($user)
        ->post(route('verification.otp.verify'), ['code' => '123456'])
        ->assertRedirect(route('home'));

    Event::assertNotDispatched(Verified::class);
});
