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
    protected bool $hasReviewed;

    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment->load(['provider.businessProfile', 'services']);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        // Check if the client has already left a review for this provider
        $hasReviewed = $notifiable->reviewsMade()
            ->where('provider_id', $this->appointment->provider_id)
            ->exists();

        $isFirstAppointment = $notifiable->isFirstAppointmentCompletedAsClient();

        $subject = $isFirstAppointment
            ? 'How was your first experience? — ' . config('app.name')
            : 'Your appointment is complete — ' . config('app.name');

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.client.appointment-completed', [
                'appointment'     => $this->appointment,
                'user'            => $notifiable,
                'hasReviewed'     => $hasReviewed,
                'isFirstAppointment' => $isFirstAppointment,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $providerName = $this->appointment->provider->businessProfile->name ?? 'your provider';
        $serviceNames = $this->appointment->services->pluck('name')->join(', ');

        return [
            'title'      => 'Appointment Completed 🎉',
            'message'    => "Your {$serviceNames} appointment with {$providerName} is complete. How did it go?",
            'action_url' => '/my-bookings/' . $this->appointment->id,
            'type'       => 'appointment_completed',
        ];
    }
}