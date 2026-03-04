<?php

namespace App\Actions\Response;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        return redirect()->route('verification.notice')
            ->with('success-toast', 'Registration successful! Please verify your email address to continue.');
    }
}
