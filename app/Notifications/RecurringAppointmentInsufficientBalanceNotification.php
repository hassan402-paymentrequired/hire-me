<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class RecurringAppointmentInsufficientBalanceNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public function __construct(
        public Appointment $parentAppointment,
        public float $requiredAmount,
        public float $availableBalance,
    ) {
        $this->parentAppointment->loadMissing(['client', 'provider.businessProfile', 'services']);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $providerName = $this->parentAppointment->provider->businessProfile->business_name
                        ?? $this->parentAppointment->provider->name;

        $serviceNames = $this->parentAppointment->services->pluck('name')->join(', ');
        $shortfall    = $this->requiredAmount - $this->availableBalance;

        return (new MailMessage)
            ->subject("Top up ₦" . number_format($shortfall, 2) . " to resume your {$serviceNames} recurring booking — " . config('app.name'))
            ->view('emails.client.recurring-appointment-insufficient-balance', [
                'parentAppointment' => $this->parentAppointment,
                'providerName'      => $providerName,
                'requiredAmount'    => $this->requiredAmount,
                'availableBalance'  => $this->availableBalance,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $serviceNames = $this->parentAppointment->services->pluck('name')->join(', ');
        $shortfall    = $this->requiredAmount - $this->availableBalance;

        return [
            'title'      => '⚠️ Top up needed — recurring appointment skipped',
            'message'    => "Your {$serviceNames} recurring appointment was skipped. Add ₦" . number_format($shortfall, 2) . " to your wallet to resume.",
            'action_url' => '/wallet',
            'type'       => 'recurring_insufficient_balance',
        ];
    }
}