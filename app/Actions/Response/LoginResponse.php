<?php

namespace App\Actions\Response;

use App\Enum\UserRoleEnum;
use App\Models\TeamMember;
use App\Services\ProviderTeamInvitationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function __construct(
        private ProviderTeamInvitationService $providerTeamInvitationService,
    ) {
    }

    public function toResponse($request): RedirectResponse
    {
        $user = $request->user();
        $invitationToken = $request->input('invitation_token');

        // Manual invite flow: if the user was created as a team member with credentials,
        // auto-accept the pending invite on first successful login (no extra accept link step).
        $pendingMembership = TeamMember::query()
            ->where('user_id', $user->id)
            ->where('is_active', false)
            ->whereNull('accepted_at')
            ->whereNotNull('invitation_expires_at')
            ->where('invitation_expires_at', '>', now())
            ->latest('invited_at')
            ->with(['inviter:id,name', 'provider:id,name'])
            ->first();

        if ($pendingMembership) {
            DB::transaction(function () use ($pendingMembership) {
                $pendingMembership->update([
                    'is_active' => true,
                    'accepted_at' => now(),
                    'invitation_link' => null,
                    'invitation_expires_at' => null,
                ]);

                if ($pendingMembership->inviter) {
                    $pendingMembership->inviter->notify(
                        new \App\Notifications\TeamMemberAcceptInvitationNotification($pendingMembership),
                    );
                }
            });
        }

        $response = $user->role === UserRoleEnum::PROVIDER
            ? redirect()->intended(route('business.dashboard'))
            : redirect()->intended(route('home'));

        if (! $invitationToken) {
            return $response->with('success-toast', 'Login successful!');
        }

        $result = $this->providerTeamInvitationService->attachUserFromToken($user, $invitationToken);

        return $response->with(
            $result['status'] === 'success' ? 'success-toast' : 'error-toast',
            $result['status'] === 'success'
                ? $result['message']
                : 'Login successful! '.$result['message'],
        );
    }
}
