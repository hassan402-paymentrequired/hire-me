<?php

namespace App\Notifications;

use App\Models\SupportRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupportRequestResolvedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public SupportRequest $supportRequest) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Your support request has been resolved — ' . config('app.name'))
            ->greeting('Hello ' . $this->supportRequest->name . ',')
            ->line('Your support request has been marked as resolved by our team.')
            ->line('Subject: ' . $this->supportRequest->subject);

        if ($this->supportRequest->admin_notes) {
            $mail->line('Resolution note: ' . $this->supportRequest->admin_notes);
        }

        return $mail
            ->action('View support page', $this->requesterActionUrl())
            ->line('If you still need help, you can reply with a new support request.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Support request resolved',
            'message' => '"' . $this->supportRequest->subject . '" has been marked as resolved.',
            'action_url' => $this->requesterActionUrl(),
            'type' => 'support_request_resolved',
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
