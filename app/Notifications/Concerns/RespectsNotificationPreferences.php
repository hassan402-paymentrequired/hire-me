<?php

namespace App\Notifications\Concerns;

use App\Models\User;
use NotificationChannels\WebPush\WebPushChannel;

trait RespectsNotificationPreferences
{
    /**
     * In-app notifications always send; email and push follow the user's settings.
     *
     * @return array<int, string>
     */
    protected function bookingChannels(object $notifiable): array
    {
        $preferences = $notifiable instanceof User
            ? $notifiable->notificationPreferences()
            : ['email' => true, 'push' => true];

        return array_values(array_filter([
            $preferences['email'] ? 'mail' : null,
            'database',
            $preferences['push'] ? WebPushChannel::class : null,
        ]));
    }
}
