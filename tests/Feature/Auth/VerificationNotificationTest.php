<?php

use App\Models\User;
use App\Notifications\EmailVerificationOtpNotification;
use Illuminate\Support\Facades\Notification;

test('sends verification code notification', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->from(route('verification.notice'))
        ->post(route('verification.send'))
        ->assertRedirect(route('verification.notice'))
        ->assertSessionHas('status', 'verification-link-sent');

    Notification::assertSentTo($user, EmailVerificationOtpNotification::class);
});

test('does not send verification code if email is verified', function () {
    Notification::fake();

    $user = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($user)
        ->from(route('home'))
        ->post(route('verification.send'))
        ->assertRedirect(route('home'));

    Notification::assertNothingSent();
});
