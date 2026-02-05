<?php

namespace App\Notifications;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RecurringAppointmentSlotTakenNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Appointment $parentAppointment,
        public Carbon $proposedDate,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
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
        return [];
    }
}
