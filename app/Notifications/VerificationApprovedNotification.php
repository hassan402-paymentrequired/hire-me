<?php

namespace App\Notifications;

use App\Models\ProviderVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use App\Notifications\Concerns\SendsWebPush;

class VerificationApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    /**
     * Create a new notification instance.
     */
    public function __construct(public ProviderVerification $verification)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $businessName = $notifiable->businessProfile?->business_name ?? 'Your Business';

        return (new MailMessage)
            ->subject('🎉 Business Verification Approved - ' . config('app.name'))
            ->markdown('emails.provider.verification-approved', [
                'user' => $notifiable,
                'verification' => $this->verification,
                'businessName' => $businessName,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Verification approved',
            'message' => 'Your business verification has been approved. You\'re now visible in the marketplace.',
            'action_url' => '/business/dashboard',
            'type' => 'verification_approved',
            'verification_id' => $this->verification->id,
        ];
    }
}
