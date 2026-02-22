<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class AppointmentCancelledNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public Appointment $appointment;

    public string $cancelledBy;

    /**
     * Create a new notification instance.
     */
    public function __construct(Appointment $appointment, string $cancelledBy)
    {
        $this->appointment = $appointment->load(['client', 'provider.businessProfile', 'service']);
        $this->cancelledBy = $cancelledBy;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database',WebPushChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Appointment Cancelled - '.config('app.name'))
            ->view('emails.appointment-cancelled', ['appointment' => $this->appointment]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Your Appointment has being rejected '.config('app.name'),
            'message' => 'Your booking request from '.$this->appointment->client->name.' for '.$this->appointment->service->name.' has being cancelled by the provider.',
            'action_url' => '/my-bookings/'.$this->appointment->id,
            'type' => 'appointment_cancelled',
        ];
    }
}
