<?php

namespace App\Http\Controllers;

use App\Services\EmailVerificationOtpService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;

class EmailVerificationOtpController extends Controller
{
    public function send(Request $request, EmailVerificationOtpService $otpService)
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->hasVerifiedEmail()) {
            return back();
        }

        $code = $otpService->issue($user, true);
        $user->notify(new \App\Notifications\EmailVerificationOtpNotification(
            $code,
            url('/email/verify'),
        ));

        return back()->with('status', 'verification-link-sent');
    }

    public function verify(Request $request, EmailVerificationOtpService $otpService)
    {
        $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if ($user->hasVerifiedEmail()) {
            return app(VerifyEmailResponseContract::class)->toResponse($request);
        }

        $otpService->verifyOrFail($user, (string) $request->input('code'));

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return app(VerifyEmailResponseContract::class)->toResponse($request);
    }
}
