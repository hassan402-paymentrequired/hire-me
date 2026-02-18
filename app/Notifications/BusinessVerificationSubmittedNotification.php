<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class BusinessVerificationSubmittedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
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
        return ['mail', WebPushChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Business Verification Received')
            ->markdown('emails.provider.verification-sent-notification', [
                'user' => $notifiable,
                'businessName' => $notifiable->businessProfile?->business_name ?? 'your business',
            ]);
    }

      /**
     * Get the web push representation of the notification.
     */
    public function toWebPush(object $notifiable): WebPushMessage
    {
        return (new WebPushMessage)
            ->title('Business Verification Submitted')
            ->body('Your business verification request has been submitted successfully.')
            ->action('View Dashboard', 'business_verification_submitted')
            ->data([
                'action_url' => route('business.dashboard'),
                'type' => 'business_verification_submitted',
            ])
            ->badge(asset('logo/android-chrome-192x192.png'))
            ->icon(asset('logo/android-chrome-192x192.png'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Business Verification Submitted',
            'message' => 'Your business verification request has been submitted successfully.',
            'action_url' => '/business',
            'type' => 'business_verification_submitted',
        ];
    }
}
