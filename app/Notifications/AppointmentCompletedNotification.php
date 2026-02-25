<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class AppointmentCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    protected Appointment $appointment;

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
        $isFirstApp = $notifiable->isFirstAppointmentCompletedAsClient();
        $subject = $isFirstApp ? 'How was your experience? - '.config('app.name') : 'Appointments completed '.config('app.name');

        return (new MailMessage)
            ->subject($subject)
            ->markdown('emails.client.appointment-completed', ['appointment' => $this->appointment]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Appointment Completed',
            'message' => 'Your appointment is completed',
            'action_url' => '/my-bookings/'.$this->appointment->id,
            'type' => 'appointment_completed',
        ];
    }
}
