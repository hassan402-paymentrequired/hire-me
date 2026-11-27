<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\FileUploadService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $page = $request->routeIs('business.account.*') ? 'settings/profile' : 'client/settings/profile';

        return Inertia::render($page, [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'genders' => ProfileUpdateRequest::GENDERS,
            'googleCalendar' => [
                'connected' => (bool) $user->googleCalendarAccount,
                'email' => $user->googleCalendarAccount?->google_email,
                'sync_enabled' => (bool) $user->googleCalendarAccount?->sync_enabled,
                'last_synced_at' => $user->googleCalendarAccount?->last_synced_at?->toIso8601String(),
                'last_error' => $user->googleCalendarAccount?->last_error,
            ],
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->profileAttributes());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($request->hasFile('avatar')) {
            $path = FileUploadService::upload($request->file('avatar'), 'avatars', 'public');
            $user->avatar = FileUploadService::url($path, 'public');
        } elseif ($request->boolean('remove_avatar')) {
            $user->avatar = null;
        }

        $user->save();

        return back(fallback: route('profile.edit'));
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
