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

class RecurringAppointmentRescheduledNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public function __construct(
        public Appointment $appointment,
        public Carbon $originalProposedTime,
    ) {
        $this->appointment->loadMissing(['client', 'provider.businessProfile', 'services']);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $providerName = $this->appointment->provider->businessProfile->business_name
                        ?? $this->appointment->provider->name;

        $serviceNames = $this->appointment->services->pluck('name')->join(', ');

        return (new MailMessage)
            ->subject("New time for your {$serviceNames} recurring booking — " . config('app.name'))
            ->view('emails.client.recurring-appointment-rescheduled', [
                'appointment'  => $this->appointment,
                'providerName' => $providerName,
                'originalTime' => $this->originalProposedTime->format('l, F j, Y \a\t g:i A'),
                'newTime'      => Carbon::parse($this->appointment->start_time)->format('l, F j, Y \a\t g:i A'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $serviceNames = $this->appointment->services->pluck('name')->join(', ');
        $newTime      = Carbon::parse($this->appointment->start_time)->format('M j \a\t g:i A');

        return [
            'title'      => 'Recurring appointment rescheduled',
            'message'    => "Your {$serviceNames} was moved to {$newTime}. Tap to review or change the time.",
            'action_url' => '/bookings/' . $this->appointment->id,
            'type'       => 'recurring_rescheduled',
        ];
    }
}