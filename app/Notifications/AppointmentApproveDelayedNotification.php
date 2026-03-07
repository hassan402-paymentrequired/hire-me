<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\SendsWebPush;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class AppointmentApproveDelayedNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public function __construct(public Appointment $appointment)
    {
        $this->appointment = $appointment->load(['provider', 'services']);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $serviceNames   = $this->appointment->services->pluck('name')->join(', ');
        $clientName     = $this->appointment->client->name ?? 'a client';
        $hoursBooked    = Carbon::parse($this->appointment->created_at)->diffInHours(now());
        $pendingLabel   = $hoursBooked >= 24
            ? floor($hoursBooked / 24) . ' day' . (floor($hoursBooked / 24) > 1 ? 's' : '')
            : $hoursBooked . ' hour' . ($hoursBooked !== 1 ? 's' : '');

        return (new MailMessage)
            ->subject("Pending for {$pendingLabel}: {$clientName} is waiting — " . config('app.name'))
            ->view('emails.provider.appointment-delayed', [
                'appointment' => $this->appointment,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $serviceNames = $this->appointment->services->pluck('name')->join(', ');
        $clientName   = $this->appointment->client->name ?? 'A client';
        $hoursBooked  = Carbon::parse($this->appointment->created_at)->diffInHours(now());

        $pendingLabel = $hoursBooked >= 24
            ? floor($hoursBooked / 24) . ' day' . (floor($hoursBooked / 24) > 1 ? 's' : '')
            : $hoursBooked . ' hour' . ($hoursBooked !== 1 ? 's' : '');

        return [
            'title'      => "{$clientName} is still waiting ({$pendingLabel})",
            'message'    => "Your {$serviceNames} booking has been pending for {$pendingLabel}. Please confirm or decline.",
            'action_url' => '/provider/appointments/' . $this->appointment->id,
            'type'       => 'appointment_delayed',
        ];
    }
}