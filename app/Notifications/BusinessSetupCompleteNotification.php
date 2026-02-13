<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use App\Notifications\Concerns\SendsWebPush;

class BusinessSetupCompleteNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

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
        return ['mail', 'database', WebPushChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Business Setup Complete - ' . config('app.name'))
            ->markdown('emails.provider.business-setup-complete', ['user' => $notifiable]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Business setup complete',
            'message' => 'Your business profile is ready. Complete verification to go live in the marketplace.',
            'action_url' => '/onboarding/verification',
            'type' => 'business_setup_complete',
        ];
    }
}
