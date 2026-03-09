<?php

namespace App\Notifications;

use App\Models\TeamMember;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamMemberAcceptInvitationNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public TeamMember $teamMember)
    {
        $this->teamMember->loadMissing(['user', 'provider.businessProfile']);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $provider = $this->teamMember->provider;
        $businessName = $provider->businessProfile?->business_name ?? $provider->name . "'s Business";

        return (new MailMessage)
            ->subject($this->teamMember->user->name . ' accepted your team invitation - ' . config('app.name'))
            ->markdown('emails.invitation-accepted-notification', [
                'teamMember' => $this->teamMember,
                'provider' => $provider,
                'businessName' => $businessName,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Team invitation accepted',
            'message' => $this->teamMember->user->name . ' accepted your invitation.',
            'action_url' => '/business/team',
            'type' => 'team_invitation_accepted',
            'team_member_id' => $this->teamMember->id,
        ];
    }
}
