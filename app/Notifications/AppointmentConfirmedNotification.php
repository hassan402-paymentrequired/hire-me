<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use Illuminate\Contracts\Queue\ShouldQueue;


class AppointmentConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public Appointment $appointment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment->load(['provider.businessProfile', 'service']);

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
            ->subject('Appointment Confirmed! - '.' - '.$this->appointment->service->name.' - '.config('app.name'))
            ->view('emails.client.appointment-confirmed', ['appointment' => $this->appointment]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Your Appointment has being approved '.config('app.name'),
            'message' => 'You have a new booking request from '.$this->appointment->client->name.' for '.$this->appointment->service->name.'.',
            'action_url' => '/my-bookings/'.$this->appointment->id,
            'type' => 'appointment_confirmed',
        ];
    }
}
