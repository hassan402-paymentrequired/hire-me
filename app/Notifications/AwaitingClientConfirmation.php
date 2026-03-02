<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class AwaitingClientConfirmation extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    protected Appointment $appointment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
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
        ->subject('Awaiting your confirmation ' . config('app.name'))
        ->markdown('emails.client.await-client-confirmation', [
            'appointment'=> $this->appointment,
            'user' => $notifiable,
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
             'title' => 'Waiting for your confirmation',
            'message' => "The provider has confirmed the appointment {$this->appointment->id}. Please confirm to proceed.",
            'action_url' => '/my-bookings/'.$this->appointment->id,
            'type' => 'appointment_confirmed_provider',
        ];
    }
}
