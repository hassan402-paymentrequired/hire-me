<?php

namespace App\Notifications;

use App\Models\ProviderVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerificationRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

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
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $businessName = $notifiable->businessProfile?->business_name ?? 'Your Business';
        
        return (new MailMessage)
            ->subject('Business Verification Update - ' . config('app.name'))
            ->markdown('emails.provider.verification-rejected', [
                'user' => $notifiable,
                'verification' => $this->verification,
                'businessName' => $businessName,
                'rejectionReason' => $this->verification->rejection_reason,
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
            'verification_id' => $this->verification->id,
            'status' => 'rejected',
            'rejection_reason' => $this->verification->rejection_reason,
        ];
    }
}
