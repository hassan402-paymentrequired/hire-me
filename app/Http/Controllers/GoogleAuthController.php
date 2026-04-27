<?php

namespace App\Http\Controllers;

use App\Enum\UserRoleEnum;
use App\Models\User;
use App\Services\ProviderTeamInvitationService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request)
    {
        $invitationToken = $request->query('invitation');

        if ($invitationToken) {
            $request->session()->put('social_invitation_token', $invitationToken);
        } else {
            $request->session()->forget('social_invitation_token');
        }

        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request, ProviderTeamInvitationService $providerTeamInvitationService)
    {
        $invitationToken = $request->session()->pull('social_invitation_token');

        if ($invitationToken && ! $providerTeamInvitationService->resolveProviderFromToken($invitationToken)) {
            return redirect()
                ->route('register', ['invitation' => $invitationToken])
                ->with('error-toast', 'This invitation link is invalid or no longer available.');
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            return redirect()
                ->route('login', $invitationToken ? ['invitation' => $invitationToken] : [])
                ->with('error-toast', 'Google authentication failed. Please try again.');
        }

        $email = $googleUser->getEmail();

        if (! $email) {
            return redirect()
                ->route('login', $invitationToken ? ['invitation' => $invitationToken] : [])
                ->with('error-toast', 'Google did not return an email address for this account.');
        }

        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            $user = User::create([
                'name' => $googleUser->getName() ?: ($googleUser->getNickname() ?: 'User'),
                'email' => $email,
                'password' => Str::random(48),
                'role' => $invitationToken ? UserRoleEnum::PROVIDER->value : UserRoleEnum::CLIENT->value,
                // Team-member accounts are allowed into the provider workspace.
                'is_verified' => $invitationToken ? true : false,
            ]);

        }

        if ($invitationToken) {
            $result = $providerTeamInvitationService->attachUserFromToken($user, $invitationToken);
            if (($result['status'] ?? null) !== 'success') {
                return redirect()
                    ->route('login', ['invitation' => $invitationToken])
                    ->with('error-toast', $result['message'] ?? 'Could not accept this team invitation.');
            }

            // Ensure invited users behave like providers in the UI, but permissions remain governed by team role.
            $user->forceFill([
                'role' => UserRoleEnum::PROVIDER->value,
                'is_verified' => true,
            ])->save();
        }

        // Trust Google as an email verification signal.
        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->intended(route('home'))->with('success-toast', 'Logged in successfully.');
    }
}

