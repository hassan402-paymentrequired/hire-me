<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\GoogleCalendarController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('settings/google-calendar/redirect', [GoogleCalendarController::class, 'redirect'])->name('settings.google-calendar.redirect');
    Route::get('settings/google-calendar/callback', [GoogleCalendarController::class, 'callback'])->name('settings.google-calendar.callback');
    Route::post('settings/google-calendar/disconnect', [GoogleCalendarController::class, 'disconnect'])->name('settings.google-calendar.disconnect');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function (Request $request) {
        $user = $request->user();
        $page = $user->has_provider_setup ? 'settings/appearance' : 'client/settings/appearance';
        
        return Inertia::render($page);
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
