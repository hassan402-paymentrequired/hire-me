<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class AppointmentUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    /**
     * @param  array<int,string>  $changesSummary
     */
    public function __construct(
        public Appointment $appointment,
        public array $changesSummary = [],
    ) {
        $this->appointment->loadMissing(['client', 'provider.businessProfile', 'services']);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $providerName = $notifiable->name;
        $clientName = $this->appointment->client?->name ?? 'a client';

        $summaryText = empty($this->changesSummary)
            ? 'Details of the appointment have been updated.'
            : implode(' ', $this->changesSummary);

        $mail = (new MailMessage)
            ->subject('Appointment updated - '.config('app.name'))
            ->greeting("Hello {$providerName},")
            ->line("{$clientName} updated their appointment with you.")
            ->line($summaryText)
            ->action('View appointment', url('/provider/appointments/'.$this->appointment->id));

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        $clientName = $this->appointment->client?->name ?? 'Client';
        $serviceNames = $this->appointment->services
            ->pluck('name')
            ->join(', ');

        $summaryText = empty($this->changesSummary)
            ? 'Appointment details were updated.'
            : implode(' ', $this->changesSummary);

        return [
            'title' => 'Appointment updated - '.config('app.name'),
            'message' => "{$clientName} updated their appointment for {$serviceNames}. {$summaryText}",
            'action_url' => '/provider/appointments/'.$this->appointment->id,
            'type' => 'appointment_updated',
        ];
    }
}

