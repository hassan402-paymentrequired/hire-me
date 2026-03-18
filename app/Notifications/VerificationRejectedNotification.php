<?php

namespace App\Notifications;

use App\Models\ProviderVerification;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class VerificationRejectedNotification extends Notification implements ShouldQueue
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
            ->subject('Action needed: Verification update for ' . $businessName . ' — ' . config('app.name'))
            ->view('emails.provider.verification-rejected', [
                'user'            => $notifiable,
                'verification'    => $this->verification,
                'businessName'    => $businessName,
                'rejectionReason' => $this->verification->rejection_reason,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $businessName = $notifiable->businessProfile?->business_name ?? 'Your business';

        return [
            'title'           => 'Verification needs attention',
            'message'         => "Your verification for {$businessName} was not approved. Review the reason and resubmit your documents.",
            'action_url'      => route('business.dashboard'),
            'type'            => 'verification_rejected',
            'verification_id' => $this->verification->id,
        ];
    }
}