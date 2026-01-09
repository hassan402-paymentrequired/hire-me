<?php

namespace App\Notifications;

use App\Models\TeamMember;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamMemberInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public TeamMember $teamMember)
    {
        //
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
        // Load relationships if not already loaded
        $this->teamMember->loadMissing(['provider.businessProfile', 'inviter']);
        
        $provider = $this->teamMember->provider;
        $businessName = $provider->businessProfile?->business_name ?? $provider->name . "'s Business";
        $inviterName = $this->teamMember->inviter?->name ?? $provider->name;
        $role = ucfirst($this->teamMember->role);

        return (new MailMessage)
            ->subject('You\'ve been invited to join ' . $businessName . ' - ' . config('app.name'))
            ->markdown('emails.provider.team-member-invitation', [
                'user' => $notifiable,
                'teamMember' => $this->teamMember,
                'provider' => $provider,
                'businessName' => $businessName,
                'inviterName' => $inviterName,
                'role' => $role,
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
            'team_member_id' => $this->teamMember->id,
            'provider_id' => $this->teamMember->provider_id,
            'role' => $this->teamMember->role,
        ];
    }
}
