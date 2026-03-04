<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Wallet;
use App\Notifications\WelcomeNotification;
use App\Services\Cache\CacheService;

class UserObserver
{
    public function created(User $user): void
    {
        // Generate unique referral code
        if (! $user->referral_code) {
            $user->referral_code = strtoupper(substr(md5(uniqid($user->id, true)), 0, 8));
            $user->saveQuietly();
        }

        Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
            'escrow_balance' => 0,
        ]);
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        if ($user->isDirty('email_verified_at')) {
            $user->notify(new WelcomeNotification);
        }
        if ($user->isDirty('is_verified')) {
            CacheService::clearMarketplaceCache();
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        CacheService::clearMarketplaceCache();
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}
