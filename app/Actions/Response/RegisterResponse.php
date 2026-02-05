<?php

namespace App\Actions\Response;


use App\Enum\UserRoleEnum;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Features;

class RegisterResponse implements RegisterResponseContract
{

    public function toResponse($request): RedirectResponse
    {
        $user = $request->user();
        
        // If email verification is required and not yet verified, redirect to verification page
        if (Features::enabled(Features::emailVerification()) && !$user->hasVerifiedEmail()) {
            // Store intended destination based on role
            if ($user->role === UserRoleEnum::PROVIDER) {
                $request->session()->put('url.intended', route('onboarding.index'));
            } else {
                $request->session()->put('url.intended', route('home'));
            }
            
            return redirect()->route('verification.notice')
                ->with('success-toast', 'Registration successful! Please verify your email address to continue.');
        }
        
        // If already verified, proceed with normal redirect
        if ($user->role === UserRoleEnum::PROVIDER) {
            return redirect()->route('onboarding.index')
                ->with('success-toast', 'Registration successful!');
        }
        
        return redirect()->intended(route('home'))
            ->with('success-toast', 'Registration successful!');
    }
}
