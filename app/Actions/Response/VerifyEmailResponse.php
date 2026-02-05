<?php

namespace App\Actions\Response;

use App\Enum\UserRoleEnum;
use Illuminate\Support\Facades\Log;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;

class VerifyEmailResponse implements VerifyEmailResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();

        if ($user->role === UserRoleEnum::PROVIDER) {
            return redirect()->intended(route('onboarding.index'));
        }

        return redirect()->intended(route('home'))
            ->with('success-toast', 'Your account has been created!');
    }

}
