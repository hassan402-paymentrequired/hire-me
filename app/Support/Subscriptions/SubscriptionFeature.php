<?php

namespace App\Support\Subscriptions;

use App\Models\ProviderSubscription;
use App\Models\User;

class SubscriptionFeature
{
    public static function enabled(): bool
    {
        return (bool) config('subscriptions.enabled', false);
    }

    public static function ensureEnabled(): void
    {
        abort_unless(self::enabled(), 404);
    }

    public static function activeSubscriptionForProvider(User $provider): ?ProviderSubscription
    {
        if (! self::enabled()) {
            return null;
        }

        return $provider->providerSubscriptions()
            ->with('plan')
            ->active()
            ->latest('ends_at')
            ->first();
    }

    public static function providerHasActiveSubscription(User $provider): bool
    {
        return self::activeSubscriptionForProvider($provider) !== null;
    }
}
