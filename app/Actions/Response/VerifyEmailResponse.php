<?php

namespace App\Actions\Response;

use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;

class VerifyEmailResponse implements VerifyEmailResponseContract
{
    public function toResponse($request)
    {
        $appName = config('app.name');
        return redirect()->intended(route('home'))
            ->with('success-toast', "Welcome to {$appName}! Your account is ready. Discover and manage appointments with ease!");
    }
}
