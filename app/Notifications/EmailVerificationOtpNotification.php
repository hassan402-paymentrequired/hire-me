<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationOtpNotification extends Notification
{
    public function __construct(
        public string $code,
        public string $entryUrl,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify your email address — ' . config('app.name'))
            ->view('emails.verify-email-otp', [
                'user' => $notifiable,
                'code' => $this->code,
                'entryUrl' => $this->entryUrl,
                'expiresMinutes' => \App\Services\EmailVerificationOtpService::EXPIRY_MINUTES,
            ]);
    }
}
