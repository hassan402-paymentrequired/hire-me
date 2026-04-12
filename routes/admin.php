<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\FinancialController;
use App\Http\Controllers\Admin\ModerationController;
use App\Http\Controllers\Admin\SupportRequestController;
use App\Http\Controllers\Admin\VerificationController;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Admin authentication routes (login/logout) are public.
| All other admin routes are protected by the 'admin' middleware.
|
*/

// Public admin authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('admin.login');
    Route::post('/login', [LoginController::class, 'login']);
});

// Protected admin routes
Route::middleware(['admin'])->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('admin.logout');
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    // User Management
    Route::prefix('users')->name('admin.users.')->group(function () {
        Route::get('/', [UserManagementController::class, 'index'])->name('index');
        Route::get('/{id}', [UserManagementController::class, 'show'])->name('show');
        Route::put('/{id}', [UserManagementController::class, 'update'])->name('update');
        Route::put('/{id}/wallet', [UserManagementController::class, 'updateWallet'])->name('wallet.update');
        Route::post('/{id}/suspend', [UserManagementController::class, 'suspend'])->name('suspend');
        Route::delete('/{id}', [UserManagementController::class, 'delete'])->name('delete');
    });

    // Financial Reporting
    Route::prefix('financial')->name('admin.financial.')->group(function () {
        Route::get('/', [FinancialController::class, 'index'])->name('index');
    });

    // Content Moderation
    Route::prefix('moderation')->name('admin.moderation.')->group(function () {
        Route::get('/reports', [ModerationController::class, 'reports'])->name('reports');
        Route::post('/reports/{id}/resolve', [ModerationController::class, 'resolveReport'])->name('reports.resolve');
        Route::get('/reviews', [ModerationController::class, 'reviews'])->name('reviews');
        Route::delete('/reviews/{id}', [ModerationController::class, 'deleteReview'])->name('reviews.delete');
    });

    Route::prefix('support')->name('admin.support.')->group(function () {
        Route::get('/', [SupportRequestController::class, 'index'])->name('index');
        Route::post('/{supportRequest}/resolve', [SupportRequestController::class, 'resolve'])->name('resolve');
    });

    // Provider Verifications
    Route::prefix('verifications')->name('admin.verifications.')->group(function () {
        Route::get('/', [VerificationController::class, 'index'])->name('index');
        Route::get('/{verification}', [VerificationController::class, 'show'])->name('show');
        Route::get('/{verification}/document', [VerificationController::class, 'viewDocument'])->name('document');
        Route::post('/{verification}/approve', [VerificationController::class, 'approve'])->name('approve');
        Route::post('/{verification}/reject', [VerificationController::class, 'reject'])->name('reject');
    });
});
