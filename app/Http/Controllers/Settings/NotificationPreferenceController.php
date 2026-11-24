<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\NotificationPreferenceUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPreferenceController extends Controller
{
    /**
     * Show the user's notification settings.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('client/settings/notifications', [
            'preferences' => $request->user()->notificationPreferences(),
        ]);
    }

    /**
     * Save which channels the user wants booking updates on.
     */
    public function update(NotificationPreferenceUpdateRequest $request): RedirectResponse
    {
        $request->user()->update(['notification_preferences' => $request->validated()]);

        return back()->with('success-toast', 'Notification settings saved.');
    }
}
