<?php

namespace App\Actions\Response;

use App\Enum\UserRoleEnum;
use App\Services\ProviderTeamInvitationService;
use Illuminate\Http\RedirectResponse;
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
