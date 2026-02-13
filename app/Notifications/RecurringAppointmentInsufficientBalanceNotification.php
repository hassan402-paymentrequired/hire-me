<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use App\Notifications\Concerns\SendsWebPush;

class RecurringAppointmentInsufficientBalanceNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public function __construct(
        public Appointment $parentAppointment,
        public float $requiredAmount,
        public float $availableBalance,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $providerName = $this->parentAppointment->provider->businessProfile->business_name ?? $this->parentAppointment->provider->name;

        return (new MailMessage)
            ->subject('Recurring appointment skipped – top up wallet required')
            ->view('emails.client.recurring-appointment-insufficient-balance', [
                'parentAppointment' => $this->parentAppointment,
                'providerName' => $providerName,
                'requiredAmount' => $this->requiredAmount,
                'availableBalance' => $this->availableBalance,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Wallet top-up needed',
            'message' => 'A recurring appointment was skipped. Top up your wallet to continue.',
            'action_url' => '/wallet',
            'type' => 'recurring_insufficient_balance',
        ];
    }
}
