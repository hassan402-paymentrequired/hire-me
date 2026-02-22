<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use App\Notifications\Concerns\SendsWebPush;

class AppointmentApproveDelayedNotification extends Notification
{
    use Queueable, SendsWebPush;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Appointment $appointment)
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
        return ['mail', 'database', WebPushChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Appointment Delayed - ' . config('app.name'))
            ->markdown('emails.provider.appointment-delayed', [
                'appointment' => $this->appointment
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
            'title' => 'Appointment approval delayed',
            'message' => 'You have an appointment waiting for your confirmation.',
            'action_url' => '/provider/appointments/'. $this->appointment->id,
            'type' => 'appointment_delayed',
        ];
    }
}
