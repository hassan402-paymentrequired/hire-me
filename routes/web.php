<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['provider.setup'])->group(function () {
    Route::get('/', [\App\Http\Controllers\Guest\GuestController::class, 'welcome'])->name('home');
    Route::get('/provider/{slug}', [\App\Http\Controllers\Client\MarketplaceController::class, 'show'])->name('provider.show');
    
    // Widget embed page (public, no auth required)
    Route::get('/widget/{slug}', [\App\Http\Controllers\Widget\WidgetEmbedController::class, 'embed'])->name('widget.embed');
    
    // Widget payment callback (opens in new window, not iframe)
    Route::get('/widget/{slug}/payment/callback/{reference}', [\App\Http\Controllers\Widget\WidgetPaymentCallbackController::class, 'callback'])->name('widget.payment.callback');

    // Static pages
    Route::get('/about', [\App\Http\Controllers\Guest\StaticPageController::class, 'about'])->name('about');
    Route::get('/history', [\App\Http\Controllers\Guest\StaticPageController::class, 'history'])->name('history');
    Route::get('/our-team', [\App\Http\Controllers\Guest\StaticPageController::class, 'ourTeam'])->name('our-team');
    Route::get('/faqs', [\App\Http\Controllers\Guest\StaticPageController::class, 'faqs'])->name('faqs');
    Route::get('/contact', [\App\Http\Controllers\Guest\StaticPageController::class, 'contact'])->name('contact');
    Route::get('/privacy-policy', [\App\Http\Controllers\Guest\StaticPageController::class, 'privacyPolicy'])->name('privacy-policy');
    Route::get('/terms', [\App\Http\Controllers\Guest\StaticPageController::class, 'termsAndConditions'])->name('terms');
});

Route::middleware(['auth', 'verified', 'provider.setup'])->group(function () {

    Route::get('/provider/{slug}/book', [\App\Http\Controllers\Client\MarketplaceController::class, 'booking'])->name('marketplace.booking');
    Route::get('/appointments/slots', [\App\Http\Controllers\Client\AppointmentController::class, 'availableSlots'])->name('slots');
    // Become a Provider (available to all authenticated users)
    Route::get('/become-provider', [\App\Http\Controllers\Provider\BecomeProviderController::class, 'index'])->name('become-provider');
    Route::post('/become-provider', [\App\Http\Controllers\Provider\BecomeProviderController::class, 'store'])->name('become-provider.store');

    // Provider Onboarding (available to all authenticated users, no provider setup required)
    Route::prefix('onboarding')->name('onboarding.')->middleware(\App\Http\Middleware\EnsureOnboardingComplete::class)->group(function () {
        Route::get('/', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'index'])->name('index');
        Route::get('/business-profile', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'businessProfile'])->name('business-profile');
        Route::post('/business-profile', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'storeBusinessProfile'])->name('business-profile.store');
        Route::get('/work-hours', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'workHours'])->name('work-hours');
        Route::post('/work-hours', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'storeWorkHours'])->name('work-hours.store');
        Route::get('/services', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'services'])->name('services');
        Route::post('/services', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'storeServices'])->name('services.store');
        Route::get('/verification', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'verification'])->name('verification');
        Route::post('/verification', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'storeVerification'])->name('verification.store');
        Route::get('/success', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'success'])->name('success');
        Route::post('/skip', [\App\Http\Controllers\Provider\Onboarding\OnboardingController::class, 'skip'])->name('skip');
    });

    Route::middleware('provider')->group(function () {

        // Provider Business Management
        Route::prefix('business')->name('business.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Provider\Dashboard\DashboardController::class, 'dashboard'])->name('dashboard');
            // Hours & Config
            Route::get('/hours', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'businessHours'])->name('hours');
            Route::post('/hours', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'updateBusinessHours'])->name('hours.update');

            // Services
            Route::get('/services', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'services'])->name('services');
            Route::post('/services', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'storeService'])->name('services.store');
            Route::put('/services/{id}', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'updateService'])->name('services.update');
            Route::delete('/services/{id}', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'destroyService'])->name('services.destroy');
            Route::post('/services/{id}/toggle', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'toggleServiceStatus'])->name('services.toggle');

            Route::get('/analytics', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'analytics'])->name('analytics');
            Route::get('/settings', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'settings'])->name('settings');
            Route::post('/settings', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'updateSettings'])->name('settings.update');
            
            // Widget settings (auto-save)
            Route::post('/widget/settings', [\App\Http\Controllers\Provider\Widget\WidgetSettingsController::class, 'update'])->name('widget.settings.update');

            // Team Management
            Route::prefix('team')->name('team.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Provider\Team\TeamMemberController::class, 'index'])->name('index');
                Route::get('/create', [\App\Http\Controllers\Provider\Team\TeamMemberController::class, 'create'])->name('create');
                Route::post('/', [\App\Http\Controllers\Provider\Team\TeamMemberController::class, 'store'])->name('store');
                Route::put('/{id}', [\App\Http\Controllers\Provider\Team\TeamMemberController::class, 'update'])->name('update');
                Route::delete('/{id}', [\App\Http\Controllers\Provider\Team\TeamMemberController::class, 'destroy'])->name('destroy');
                Route::get('/members/list', [\App\Http\Controllers\Provider\Team\TeamMemberController::class, 'getTeamMembers'])->name('members.list');
            });
        });

        Route::prefix('schedule')->group(function () {
            Route::get('/calender', [App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'calender'])->name('schedule.calender.index');
            Route::get('/appointments', [App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'appointments'])->name('schedule.appointments.index');
        });

        // Provider Appointment Management
        Route::prefix('provider/appointments')->name('provider.appointments.')->group(function () {
            Route::post('/{id}/confirm', [\App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'confirmAppointment'])->name('confirm');
            Route::post('/{id}/cancel', [\App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'cancelAppointment'])->name('cancel');
            Route::post('/{id}/complete', [\App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'completeAppointment'])->name('complete');
            Route::post('/{id}/report', [\App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'reportClient'])->name('report');
            Route::get('/{id}', [\App\Http\Controllers\Provider\Schedule\ScheduleController::class, 'showAppointment'])->name('show');
        });
    });

    // Client Appointments
    Route::prefix('appointments')->name('appointments.')->group(function () {
        Route::post('/', [\App\Http\Controllers\Client\AppointmentController::class, 'store'])->name('store');
        Route::post('/{id}/cancel-remaining-recurrences', [\App\Http\Controllers\Client\AppointmentController::class, 'cancelRemainingRecurrences'])->name('cancel-remaining');
        Route::post('/{id}/cancel', [\App\Http\Controllers\Client\AppointmentController::class, 'cancel'])->name('cancel');
        Route::post('/{id}/complete', [\App\Http\Controllers\Client\AppointmentController::class, 'complete'])->name('complete');
        Route::get('/{id}/reschedule', [\App\Http\Controllers\Client\AppointmentController::class, 'reschedule'])->name('reschedule');
        Route::post('/{id}/report', [\App\Http\Controllers\Client\AppointmentController::class, 'report'])->name('report');
    });

    // Client Bookings
    Route::prefix('my-bookings')->name('client.bookings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Client\AppointmentController::class, 'index'])->name('index');
        Route::get('/{id}', [\App\Http\Controllers\Client\AppointmentController::class, 'show'])->name('show');
    });

    // Client Wallet
    Route::prefix('wallet')->name('wallet.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Client\WalletController::class, 'index'])->name('index');
        Route::post('/top-up/initialize', [\App\Http\Controllers\Client\WalletController::class, 'initializeTopUp'])->name('top-up.initialize');
        Route::post('/top-up/verify', [\App\Http\Controllers\Client\WalletController::class, 'verifyTopUp'])->name('top-up.verify');
        // Client withdrawal routes - use different paths to avoid collision with provider routes
        Route::post('/client/withdraw/recipient', [\App\Http\Controllers\Client\WalletController::class, 'createRecipient'])->name('client.withdraw.recipient');
        Route::post('/client/withdraw', [\App\Http\Controllers\Client\WalletController::class, 'withdraw'])->name('client.withdraw');
    });

    // Provider Withdrawals
    Route::middleware('provider')->group(function () {
        Route::prefix('wallet/withdraw')->name('wallet.withdraw.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Provider\WithdrawalController::class, 'index'])->name('index');
            Route::post('/recipient', [\App\Http\Controllers\Provider\WithdrawalController::class, 'createRecipient'])->name('recipient');
            Route::post('/', [\App\Http\Controllers\Provider\WithdrawalController::class, 'withdraw'])->name('create');
        });
    });

    // Job Broadcasting (Client)
    Route::prefix('jobs')->name('jobs.')->group(function () {
        Route::get('/', [\App\Http\Controllers\JobPostController::class, 'clientIndex'])->name('index');
        Route::get('/post', [\App\Http\Controllers\JobPostController::class, 'create'])->name('post');
        Route::post('/', [\App\Http\Controllers\JobPostController::class, 'store'])->name('store');
        Route::post('/bids/{bid}/accept', [\App\Http\Controllers\JobBidController::class, 'accept'])->name('bids.accept');
    });

    // Job Broadcasting (Provider)
    Route::middleware('provider')->group(function () {
        Route::get('/job-board', [\App\Http\Controllers\JobPostController::class, 'providerBoard'])->name('jobs.board');
        Route::post('/jobs/{jobPost}/bid', [\App\Http\Controllers\JobBidController::class, 'store'])->name('jobs.bid');

        // Provider Verification
        Route::post('/verification/submit', [\App\Http\Controllers\Provider\VerificationController::class, 'store'])->name('verification.submit');
    });

    // Admin routes are now in routes/admin.php

    Route::post('/mark-as-favourite', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'markFavourites'])->name('favourite.update');
    Route::get('/service/favourite', [\App\Http\Controllers\Provider\Business\BusinessController::class, 'getUserFav'])->name('favourite.index');

    // Reviews
    Route::post('/reviews', [\App\Http\Controllers\Guest\ReviewController::class, 'store'])->name('reviews.store');
});

// Widget API (public endpoints)
Route::prefix('api/widget')->name('api.widget.')->group(function () {
    Route::get('/{slug}/info', [\App\Http\Controllers\Api\WidgetController::class, 'info'])->name('info');
    Route::get('/{slug}/availability', [\App\Http\Controllers\Api\WidgetController::class, 'availability'])->name('availability');
    Route::post('/{slug}/check-wallet', [\App\Http\Controllers\Api\WidgetController::class, 'checkWallet'])->name('check-wallet');
    Route::post('/{slug}/initialize-payment', [\App\Http\Controllers\Api\WidgetController::class, 'initializePayment'])->name('initialize-payment');
    Route::post('/{slug}/book', [\App\Http\Controllers\Api\WidgetController::class, 'book'])->name('book');
});

// Paystack Webhook (no auth required)
Route::post('/paystack/webhook', [\App\Http\Controllers\PaystackWebhookController::class, 'handleWebhook'])->name('paystack.webhook');
Route::get('/paystack/callback', [\App\Http\Controllers\PaystackWebhookController::class, 'handleCallback'])->name('paystack.callback');

require __DIR__ . '/settings.php';
