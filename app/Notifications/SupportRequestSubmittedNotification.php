<?php

namespace App\Notifications;

use App\Models\SupportRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupportRequestSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public SupportRequest $supportRequest,
        public bool $forAdmin = false,
    ) {}

    public function via(object $notifiable): array
    {
        return $this->forAdmin ? ['mail', 'database'] : ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        if ($this->forAdmin) {
            return (new MailMessage)
                ->subject('New support request received — ' . config('app.name'))
                ->greeting('Hello ' . ($notifiable->name ?? 'Admin') . ',')
                ->line('A new support request has been submitted on ' . config('app.name') . '.')
                ->line('Subject: ' . $this->supportRequest->subject)
                ->line('Category: ' . ($this->supportRequest->category ?? 'General'))
                ->line('From: ' . $this->supportRequest->name . ' (' . $this->supportRequest->email . ')')
                ->action('Review support requests', route('admin.support.index'))
                ->line('Please review it when you can.');
        }

        return (new MailMessage)
            ->subject('We received your support request — ' . config('app.name'))
            ->greeting('Hello ' . $this->supportRequest->name . ',')
            ->line('We have received your support request and our team will review it shortly.')
            ->line('Subject: ' . $this->supportRequest->subject)
            ->line('Category: ' . ($this->supportRequest->category ?? 'General'))
            ->action('View support page', $this->requesterActionUrl())
            ->line('You can also reach us at support@proxideck.com if needed.');
    }

    public function toArray(object $notifiable): array
    {
        if ($this->forAdmin) {
            return [
                'title' => 'New support request',
                'message' => $this->supportRequest->subject . ' from ' . $this->supportRequest->name,
                'action_url' => route('admin.support.index'),
                'type' => 'support_request_submitted_admin',
                'support_request_id' => $this->supportRequest->id,
            ];
        }

        return [
            'title' => 'Support request received',
            'message' => 'We received "' . $this->supportRequest->subject . '" and will review it soon.',
            'action_url' => $this->requesterActionUrl(),
            'type' => 'support_request_submitted',
            'support_request_id' => $this->supportRequest->id,
        ];
    }

    protected function requesterActionUrl(): string
    {
        return $this->supportRequest->user_id
            ? route('support.index')
            : route('contact');
    }
}
