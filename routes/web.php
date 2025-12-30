<?php

use Illuminate\Support\Facades\Route;


Route::get('/', [\App\Http\Controllers\Guest\GuestController::class, 'welcome'])->name('home');
Route::get('/provider/{slug}', [\App\Http\Controllers\Client\MarketplaceController::class, 'show'])->name('provider.show');
Route::get('/appointments/slots', [\App\Http\Controllers\Client\AppointmentController::class, 'availableSlots'])->name('slots');

Route::middleware(['auth', 'verified'])->group(function () {

    // Provider Business Management
    Route::prefix('business')->name('business.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Provider\Dashboard\DashboardController::class, 'dashboard'])->name('dashboard');
        // Hours & Config
        Route::get('/hours', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'businessHours'])->name('hours');
        Route::post('/hours', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'updateBusinessHours'])->name('hours.update');

        // Services
        Route::post('/services', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'storeService'])->name('services.store');
        Route::put('/services/{id}', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'updateService'])->name('services.update');
        Route::delete('/services/{id}', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'destroyService'])->name('services.destroy');

        Route::get('/analytics', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'analytics'])->name('analytics');
    });

    Route::prefix('schedule')->group(function () {
        Route::get('/calender', [App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'calender'])->name('schedule.calender.index');
        Route::get('/appointments', [App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'appointments'])->name('schedule.appointments.index');
    });

    // Provider Appointment Management
    Route::prefix('provider/appointments')->name('provider.appointments.')->group(function () {
        Route::post('/{id}/confirm', [\App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'confirmAppointment'])->name('confirm');
        Route::post('/{id}/cancel', [\App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'cancelAppointment'])->name('cancel');
        Route::get('/{id}', [\App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'showAppointment'])->name('show');
    });


    // Provider Onboarding
    Route::prefix('onboarding')->name('onboarding.')->middleware(\App\Http\Middleware\EnsureOnboardingComplete::class)->group(function () {
        Route::get('/', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'index'])->name('index');
        Route::get('/business-profile', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'businessProfile'])->name('business-profile');
        Route::post('/business-profile', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'storeBusinessProfile'])->name('business-profile.store');
        Route::get('/work-hours', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'workHours'])->name('work-hours');
        Route::post('/work-hours', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'storeWorkHours'])->name('work-hours.store');
        Route::get('/services', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'services'])->name('services');
        Route::post('/services', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'storeServices'])->name('services.store');
        Route::get('/success', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'success'])->name('success');
        Route::post('/skip', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'skip'])->name('skip');
    });

    // Marketplace (public)
    Route::get('/marketplace', [\App\Http\Controllers\Client\MarketplaceController::class, 'index'])->name('marketplace.index');


    // Client Appointments
    Route::prefix('appointments')->name('appointments.')->group(function () {
        Route::post('/', [\App\Http\Controllers\Client\AppointmentController::class, 'store'])->name('store');
        Route::post('/{id}/cancel', [\App\Http\Controllers\Client\AppointmentController::class, 'cancel'])->name('cancel');
        Route::post('/{id}/complete', [\App\Http\Controllers\Client\AppointmentController::class, 'complete'])->name('complete');
    });

    // Client Bookings
    Route::prefix('my-bookings')->name('client.bookings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Client\AppointmentController::class, 'index'])->name('index');
        Route::get('/{id}', [\App\Http\Controllers\Client\AppointmentController::class, 'show'])->name('show');
    });

    // Reviews
    Route::post('/reviews', [\App\Http\Controllers\Guest\ReviewController::class, 'store'])->name('reviews.store');

});

require __DIR__ . '/settings.php';
