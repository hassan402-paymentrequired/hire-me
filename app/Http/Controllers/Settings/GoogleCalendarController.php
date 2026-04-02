<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\GoogleCalendarAccount;
use App\Services\GoogleCalendarService;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class GoogleCalendarController extends Controller
{
    public function redirect(Request $request)
    {
        config(['services.google.redirect' => route('settings.google-calendar.callback')]);

        $request->session()->put('google_calendar_connecting', true);

        return Socialite::driver('google')
            ->scopes(['https://www.googleapis.com/auth/calendar.events'])
            ->with([
                'access_type' => 'offline',
                'prompt' => 'consent',
                'include_granted_scopes' => 'true',
            ])
            ->redirect();
    }

    public function callback(Request $request)
    {
        if (! $request->session()->pull('google_calendar_connecting')) {
            return redirect()->route('profile.edit')
                ->with('error-toast', 'We could not verify the Google Calendar connection request. Please try again.');
        }

        config(['services.google.redirect' => route('settings.google-calendar.callback')]);

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Throwable $e) {
            return redirect()->route('profile.edit')
                ->with('error-toast', 'Google Calendar connection failed. Please try again.');
        }

        $user = $request->user();
        $existing = $user->googleCalendarAccount;

        GoogleCalendarAccount::updateOrCreate(
            ['user_id' => $user->id],
            [
                'google_email' => $googleUser->getEmail(),
                'google_calendar_id' => 'primary',
                'access_token' => $googleUser->token,
                'refresh_token' => $googleUser->refreshToken ?: $existing?->refresh_token,
                'token_expires_at' => now()->addSeconds((int) ($googleUser->expiresIn ?? 3600)),
                'sync_enabled' => true,
                'last_error' => null,
            ],
        );

        return redirect()->route('profile.edit')
            ->with('success-toast', 'Google Calendar connected successfully.');
    }

    public function disconnect(Request $request, GoogleCalendarService $googleCalendarService)
    {
        $googleCalendarService->disconnect($request->user());

        return back()->with('success-toast', 'Google Calendar has been disconnected.');
    }
}
