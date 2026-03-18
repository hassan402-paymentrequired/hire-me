<?php

namespace App\Notifications;

use App\Models\ProviderVerification;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class VerificationApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public function __construct(public ProviderVerification $verification) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $businessName = $notifiable->businessProfile?->business_name ?? 'Your Business';

        return (new MailMessage)
            ->subject('🎉 You\'re now a Verified Provider — ' . config('app.name'))
            ->view('emails.provider.verification-approved', [
                'user'         => $notifiable,
                'verification' => $this->verification,
                'businessName' => $businessName,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $businessName = $notifiable->businessProfile?->business_name ?? 'Your business';

        return [
            'title'           => '🎉 Verification approved!',
            'message'         => "{$businessName} is now a Verified Provider on " . config('app.name') . ". Your badge is live — go check your profile!",
            'action_url'      => route('business.dashboard'),
            'type'            => 'verification_approved',
            'verification_id' => $this->verification->id,
        ];
    }
}