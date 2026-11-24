<?php

namespace App\Notifications;

use App\Models\BookingWaitlistEntry;
use App\Notifications\Concerns\RespectsNotificationPreferences;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WaitlistSlotOpenedNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;
    use RespectsNotificationPreferences;

    public function __construct(public BookingWaitlistEntry $entry) {}

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
            ->action('Book now', url($data['action_url']))
            ->line('Slots go fast, so book soon if it still works for you.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $businessName = $this->entry->provider?->businessProfile?->business_name ?? $this->entry->provider?->name;
        $slug = $this->entry->provider?->businessProfile?->slug;
        $query = http_build_query(array_filter([
            'service_ids' => implode(',', $this->entry->service_ids ?? []),
            'date' => $this->entry->date->toDateString(),
        ]));

        return [
            'title' => 'A slot just opened at '.$businessName,
            'message' => 'A time opened up on '.$this->entry->date->format('l j F').' at '.$businessName.'.',
            'action_url' => $slug ? "/provider/{$slug}/book?{$query}" : '/my-bookings',
            'type' => 'waitlist_slot_opened',
        ];
    }
}
