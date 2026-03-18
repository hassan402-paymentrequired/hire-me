<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

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
        $serviceNames = $this->appointment->services->pluck('name')->join(', ');
        $providerName = $this->appointment->provider->businessProfile->business_name
                        ?? $this->appointment->provider->name
                        ?? 'your provider';

        return (new MailMessage)
            ->subject("Your {$serviceNames} appointment was cancelled — ".config('app.name'))
            ->view('emails.client.appointment-cancelled-provider-no-confirm', [
                'appointment' => $this->appointment,
                'similarProviders' => $this->similarProviders,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $serviceNames = $this->appointment->services->pluck('name')->join(', ');
        $providerName = $this->appointment->provider->businessProfile->business_name
                        ?? $this->appointment->provider->name
                        ?? 'your provider';

        $hasSimilar = count($this->similarProviders) > 0;

        return [
            'title' => 'Appointment cancelled — refund issued',
            'message' => "Your {$serviceNames} with {$providerName} was auto-cancelled (provider didn't confirm). Your payment has been refunded."
                          .($hasSimilar ? ' We found similar providers for you.' : ''),
            'action_url' => '/my-bookings/'.$this->appointment->id,
            'type' => 'appointment_cancelled',
        ];
    }
}
