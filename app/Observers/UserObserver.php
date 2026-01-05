<?php

namespace App\Observers;

use App\Models\User;
use App\Notifications\WelcomeNotification;

class UserObserver
{
    public function created(User $user): void
    {
        // Generate unique referral code
        if (!$user->referral_code) {
            $user->referral_code = strtoupper(substr(md5(uniqid($user->id, true)), 0, 8));
            $user->saveQuietly(); // Avoid infinite loop
        }
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        if ($user->email_verified_at !== null) {

            $user->notify(new WelcomeNotification());
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
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
