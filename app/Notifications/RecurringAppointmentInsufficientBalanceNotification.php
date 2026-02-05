<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RecurringAppointmentInsufficientBalanceNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Appointment $parentAppointment,
        public float $requiredAmount,
        public float $availableBalance,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
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
        return [];
    }
}
