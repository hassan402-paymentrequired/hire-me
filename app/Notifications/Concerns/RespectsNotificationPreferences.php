<?php

namespace App\Notifications\Concerns;

use NotificationChannels\WebPush\WebPushChannel;

trait RespectsNotificationPreferences
{
    /**
     * Every user gets booking updates in-app, by email and by push.
     *
     * @return array<int, string>
     */
    protected function bookingChannels(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }
}
