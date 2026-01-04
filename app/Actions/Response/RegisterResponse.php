<?php

namespace App\Actions\Response;


use App\Enum\UserRoleEnum;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{

    public function toResponse($request): RedirectResponse
    {
        // Redirect based on user role (role is cast to UserRoleEnum in User model)
        if ($request->user()->role === UserRoleEnum::PROVIDER) {
            return redirect()->route('onboarding.index');
        }
        
        return redirect()->intended(route('home'))
            ->with('success-toast', 'Registration successful!');
    }
}
