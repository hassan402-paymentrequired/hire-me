<?php

namespace App\Notifications;

use App\Models\TeamMember;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamMemberInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public TeamMember $teamMember,
        public string $password,
    ) {}

    public function via(object $notifiable): array
    {
        // Mail only — no push/database since this goes to a new user
        // who may not yet have a device token or in-app account active
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->teamMember->loadMissing(['provider.businessProfile', 'inviter']);

        $provider     = $this->teamMember->provider;
        $businessName = $provider->businessProfile?->business_name
                        ?? $provider->name . "'s Business";
        $inviterName  = $this->teamMember->inviter?->name ?? $provider->name;
        $role         = ucfirst($this->teamMember->role);

        return (new MailMessage)
            ->subject("You've been invited to join {$businessName} — " . config('app.name'))
            ->view('emails.provider.team-member-invitation', [
                'user'         => $notifiable,
                'teamMember'   => $this->teamMember,
                'provider'     => $provider,
                'businessName' => $businessName,
                'inviterName'  => $inviterName,
                'role'         => $role,
                'password'     => $this->password,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $businessName = $this->teamMember->provider?->businessProfile?->business_name
                        ?? 'A business';

        return [
            'title'          => 'Team invitation',
            'message'        => "You've been invited to join {$businessName} as a team member.",
            'action_url'     => '/business/team',
            'type'           => 'team_invitation',
            'team_member_id' => $this->teamMember->id,
        ];
    }
}