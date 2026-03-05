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

    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment->load([
            'provider.businessProfile',
            'services',
        ]);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your confirmation is needed — '.config('app.name'))
            ->view('emails.client.await-client-confirmation', [
                'appointment' => $this->appointment,
                'user' => $notifiable,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $serviceNames = $this->appointment->services
            ->pluck('name')
            ->join(', ');

        $providerName = $this->appointment->provider->businessProfile->name ?? 'Your provider';

        return [
            'title' => 'Confirm your appointment is complete',
            'message' => "{$providerName} has marked your {$serviceNames} appointment as completed. Tap to confirm and release payment.",
            'action_url' => '/my-bookings/'.$this->appointment->id,
            'type' => 'awaiting_client_confirmation',
        ];
    }
}
