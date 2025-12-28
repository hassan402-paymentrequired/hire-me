<?php

use Illuminate\Support\Facades\Route;


Route::get('/', [\App\Http\Controllers\Guest\GuestController::class, 'welcome'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::prefix('dashboard')->group(function () {
        Route::get('/', [\App\Http\Controllers\Provider\Dashboard\DashboardController::class, 'dashboard'])->name('dashboard');
    });

    Route::prefix('business')->group(function () {
        Route::get('/hours', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'businessHours'])->name('business.hours.index');
        Route::get('/analytics', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'analytics'])->name('business.analytics.index');
    });

    Route::prefix('schedule')->group(function () {
        Route::get('/calender', [App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'calender'])->name('schedule.calender.index');
        Route::get('/appointments', [App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'appointments'])->name('schedule.appointments.index');
    });


});

require __DIR__.'/settings.php';
