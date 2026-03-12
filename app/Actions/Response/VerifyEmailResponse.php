<?php

namespace App\Actions\Response;

use App\Enum\UserRoleEnum;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;

class VerifyEmailResponse implements VerifyEmailResponseContract
{
    public function toResponse($request)
    {
        $appName = config('app.name');
        $user = $request->user();

        if ($user && $user->role === UserRoleEnum::PROVIDER && $user->canAccessProviderWorkspace()) {
            return redirect()->intended(route('business.dashboard'))
                ->with('success-toast', "Welcome to {$appName}! Your account is ready.");
        }

        return redirect()->intended(route('home'))
            ->with('success-toast', "Welcome to {$appName}! Your account is ready. Discover and manage appointments with ease!");
    }
}
