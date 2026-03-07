<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\SendsWebPush;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class AppointmentUrgentApprovalNotification extends Notification implements ShouldQueue
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
        $timeLabel = Carbon::parse($this->appointment->start_time)
            ->diffForHumans(['parts' => 1, 'syntax' => CarbonInterface::DIFF_ABSOLUTE]);

        $serviceNames = $this->appointment->services->pluck('name')->join(', ');

        return (new MailMessage)
            ->subject("🚨 Action needed: {$serviceNames} appointment in {$timeLabel} — " . config('app.name'))
            ->priority(1)
            ->view('emails.provider.urgent-appointment', [
                'appointment' => $this->appointment,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $serviceNames = $this->appointment->services->pluck('name')->join(', ');

        $timeLabel = Carbon::parse($this->appointment->start_time)
            ->diffForHumans(['parts' => 1, 'syntax' => CarbonInterface::DIFF_ABSOLUTE]);

        return [
            'title'      => "⚡ Respond now — {$serviceNames} in {$timeLabel}",
            'message'    => "Your appointment with {$this->appointment->client_name} starts in {$timeLabel}. Confirm or cancel immediately.",
            'action_url' => '/business/schedule/appointments/' . $this->appointment->id,
            'type'       => 'appointment_urgent',
        ];
    }
}