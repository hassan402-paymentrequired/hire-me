<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use App\Notifications\Concerns\SendsWebPush;

class AppointmentCancelledProviderNoConfirmNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public function __construct(
        public Appointment $appointment,
        public array $similarProviders = [],
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
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
        return [
            'title' => 'Appointment cancelled',
            'message' => 'Your appointment was cancelled because the provider did not confirm in time.',
            'action_url' => '/my-bookings/'.$this->appointment->id,
            'type' => 'appointment_cancelled',
        ];
    }
}
