<?php

namespace App\Notifications;

use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class BusinessVerificationSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public function __construct() {}

    public function via(object $notifiable): array
    {
        return ['mail', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $businessName = $notifiable->businessProfile?->business_name ?? 'Your Business';

        return (new MailMessage)
            ->subject('Verification documents received — ' . config('app.name'))
            ->view('emails.provider.verification-sent-notification', [
                'user'         => $notifiable,
                'businessName' => $businessName,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $businessName = $notifiable->businessProfile?->business_name ?? 'Your business';

        return [
            'title'      => 'Documents received ✓',
            'message'    => "We've received your verification documents for {$businessName}. Our team will review them within 1–3 business days.",
            'action_url' => route('business.dashboard'),
            'type'       => 'business_verification_submitted',
        ];
    }
}