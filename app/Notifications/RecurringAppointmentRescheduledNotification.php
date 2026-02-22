<?php

namespace App\Notifications;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use App\Notifications\Concerns\SendsWebPush;

class RecurringAppointmentRescheduledNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public function __construct(
        public Appointment $appointment,
        public Carbon $originalProposedTime,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $providerName = $this->appointment->provider->businessProfile->business_name ?? $this->appointment->provider->name;

        return (new MailMessage)
            ->subject('Your recurring appointment was rescheduled – new time assigned')
            ->view('emails.client.recurring-appointment-rescheduled', [
                'appointment' => $this->appointment,
                'providerName' => $providerName,
                'originalTime' => $this->originalProposedTime->format('M j, Y \a\t g:i A'),
                'newTime' => $this->appointment->start_time->format('M j, Y \a\t g:i A'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Recurring appointment rescheduled',
            'message' => 'Your recurring appointment was moved to a new time.',
            'action_url' => '/bookings',
            'type' => 'recurring_rescheduled',
        ];
    }
}
