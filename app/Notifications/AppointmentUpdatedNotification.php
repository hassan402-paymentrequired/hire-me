<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;

class AppointmentUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    /**
     * @param  array<int, string>  $changesSummary  Human-readable list of what changed.
     *                                               e.g. ['Date changed to March 10.', 'Haircut replaced with Beard Trim.']
     */
    public function __construct(
        public Appointment $appointment,
        public array $changesSummary = [],
    ) {
        $this->appointment->loadMissing(['client', 'provider.businessProfile', 'services']);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $clientName   = $this->appointment->client?->name ?? 'A client';
        $serviceNames = $this->appointment->services->pluck('name')->join(', ');

        $subject = empty($this->changesSummary)
            ? "{$clientName} updated their appointment — " . config('app.name')
            : "{$clientName} changed: " . implode('; ', array_slice($this->changesSummary, 0, 2))
              . (count($this->changesSummary) > 2 ? '…' : '') . ' — ' . config('app.name');

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.provider.appointment-update-notification', [
                'appointment'    => $this->appointment,
                'changesSummary' => $this->changesSummary,
                'notifiable'     => $notifiable,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $clientName   = $this->appointment->client?->name ?? 'A client';
        $serviceNames = $this->appointment->services->pluck('name')->join(', ');

        $summaryText = empty($this->changesSummary)
            ? 'Appointment details were updated.'
            : implode(' ', $this->changesSummary);

        return [
            'title'      => "{$clientName} updated their appointment",
            'message'    => "{$clientName} made changes to their {$serviceNames} booking. {$summaryText}",
            'action_url' => '/provider/appointments/' . $this->appointment->id,
            'type'       => 'appointment_updated',
        ];
    }
}