<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentCancelledProviderNoConfirmNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Appointment $appointment,
        public array $similarProviders = [],
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Appointment cancelled – provider did not confirm in time')
            ->view('emails.client.appointment-cancelled-provider-no-confirm', [
                'appointment' => $this->appointment,
                'similarProviders' => $this->similarProviders,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
