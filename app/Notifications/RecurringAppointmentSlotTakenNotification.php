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

class RecurringAppointmentSlotTakenNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public function __construct(
        public Appointment $parentAppointment,
        public Carbon $proposedDate,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $providerName = $this->parentAppointment->provider->businessProfile->business_name ?? $this->parentAppointment->provider->name;

        return (new MailMessage)
            ->subject('Recurring appointment skipped – no alternative slot found')
            ->view('emails.client.recurring-appointment-slot-taken', [
                'parentAppointment' => $this->parentAppointment,
                'providerName' => $providerName,
                'proposedDateFormatted' => $this->proposedDate->format('M j, Y \a\t g:i A'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Recurring appointment skipped',
            'message' => 'No alternative slot was found for your recurring appointment.',
            'action_url' => '/bookings',
            'type' => 'recurring_slot_taken',
        ];
    }
}
