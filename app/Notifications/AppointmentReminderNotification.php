<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Notifications\Concerns\RespectsNotificationPreferences;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;
    use RespectsNotificationPreferences;

    public function __construct(public Appointment $appointment, public bool $isDayBefore)
    {
        $this->appointment = $appointment->loadMissing(['provider.businessProfile', 'services']);
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return $this->bookingChannels($notifiable);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $data = $this->toArray($notifiable);

        return (new MailMessage)
            ->subject($data['title'])
            ->greeting('Hi '.$notifiable->name.',')
            ->line($data['message'])
            ->action('View booking', url($data['action_url']));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $businessName = $this->appointment->provider?->businessProfile?->business_name ?? $this->appointment->provider?->name;
        $when = $this->isDayBefore
            ? 'tomorrow at '.$this->appointment->start_time->format('g:i a')
            : 'at '.$this->appointment->start_time->format('g:i a').' today';

        return [
            'title' => $this->isDayBefore ? 'Your visit is tomorrow' : 'Your visit is in 2 hours',
            'message' => $this->appointment->services->pluck('name')->join(' + ').' with '.$businessName.' '.$when.'.',
            'action_url' => '/my-bookings/'.$this->appointment->id,
            'type' => 'appointment_reminder',
        ];
    }
}
