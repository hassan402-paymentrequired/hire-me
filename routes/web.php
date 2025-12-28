<?php

use Illuminate\Support\Facades\Route;


Route::get('/', [\App\Http\Controllers\Guest\GuestController::class, 'welcome'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\Provider\ProviderController::class, 'dashboard'])->name('dashboard');
});

require __DIR__.'/settings.php';
