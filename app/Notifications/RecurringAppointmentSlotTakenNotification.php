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

class RecurringAppointmentSlotTakenNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public function __construct(
        public Appointment $parentAppointment,
        public Carbon $proposedDate,
    ) {
        $this->parentAppointment->loadMissing(['client', 'provider.businessProfile', 'services']);
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $providerName = $this->parentAppointment->provider->businessProfile->business_name
                        ?? $this->parentAppointment->provider->name;

        $serviceNames = $this->parentAppointment->services->pluck('name')->join(', ');

        return (new MailMessage)
            ->subject("Your {$serviceNames} recurring appointment was skipped — " . config('app.name'))
            ->view('emails.client.recurring-appointment-slot-taken', [
                'parentAppointment'     => $this->parentAppointment,
                'providerName'          => $providerName,
                'proposedDateFormatted' => $this->proposedDate->format('l, F j, Y \a\t g:i A'),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $serviceNames = $this->parentAppointment->services->pluck('name')->join(', ');
        $dateLabel    = $this->proposedDate->format('M j \a\t g:i A');

        return [
            'title'      => 'Recurring appointment skipped',
            'message'    => "Your {$serviceNames} on {$dateLabel} was skipped — no available slot found. Tap to book a new time.",
            'action_url' => '/bookings',
            'type'       => 'recurring_slot_taken',
        ];
    }
}