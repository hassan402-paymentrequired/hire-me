<?php

namespace App\Notifications\Concerns;

use NotificationChannels\WebPush\WebPushMessage;

trait SendsWebPush
{
    /**
     * Build Web Push message from toArray() so notifications work when user is not in the app.
     */
    public function toWebPush(object $notifiable, object $notification): WebPushMessage
    {
        $data = $this->toArray($notifiable);
        $title = $data['title'] ?? 'Notification';
        $message = $data['message'] ?? '';
        $actionUrl = $data['action_url'] ?? '/';
        $url = url($actionUrl);

        return (new WebPushMessage)
            ->title($title)
            ->body($message)
            ->action('View', 'view')
            ->data(['url' => $url])
            ->icon(url('/logo/android-chrome-192x192.png'));
    }
}
