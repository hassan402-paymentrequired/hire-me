<?php

namespace App\Notifications;

use App\Models\ProviderSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProviderSubscriptionEndingSoonNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected ProviderSubscription $subscription,
        protected int $daysRemaining,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your provider subscription is almost over')
            ->line("Your {$this->subscription->plan?->name} subscription will end in {$this->daysRemaining} day(s).")
            ->action('Manage Billing', url('/business/billing'))
            ->line('Renew or change your plan to keep full subscription-based payouts active.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'subscription_id' => $this->subscription->id,
            'plan_name' => $this->subscription->plan?->name,
            'days_remaining' => $this->daysRemaining,
            'message' => "Your {$this->subscription->plan?->name} subscription will expire in {$this->daysRemaining} day(s).",
            'link' => '/business/billing',
        ];
    }
}
