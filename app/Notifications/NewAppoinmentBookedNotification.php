<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class NewAppoinmentBookedNotification extends Notification implements ShouldQueue
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
        return ['mail','database', WebPushChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $appointment = $this->appointment->load(['client', 'service']);

        return (new MailMessage)
            ->subject('New Booking Request - '.config('app.name'))
            ->markdown('emails.provider.new-appointment-booked', compact('appointment'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Booking Request Received '.config('app.name'),
            'message' => 'You have a new booking request from '.$this->appointment->client->name.' for '.$this->appointment->service->name.'.',
            'action_url' => '/schedule/appointments',
            'type' => 'new_appointment',
        ];
    }
}
