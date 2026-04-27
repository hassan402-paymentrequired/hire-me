<?php

namespace App\Console\Commands;

use App\Models\ProviderSubscription;
use App\Notifications\ProviderSubscriptionEndingSoonNotification;
use App\Support\Subscriptions\SubscriptionFeature;
use Illuminate\Console\Command;

class SendProviderSubscriptionReminders extends Command
{
    protected $signature = 'app:send-provider-subscription-reminders';
    protected $description = 'Send reminders for provider subscriptions that are close to expiry.';

    public function handle(): int
    {
        if (! SubscriptionFeature::enabled()) {
            $this->info('Subscriptions feature is disabled.');
            return self::SUCCESS;
        }

        $days = max(1, (int) config('subscriptions.reminder_days_before_end', 3));
        $start = now()->startOfDay();
        $end = now()->addDays($days)->endOfDay();

        ProviderSubscription::query()
            ->with(['provider', 'plan'])
            ->active()
            ->whereNull('reminder_sent_at')
            ->whereBetween('ends_at', [$start, $end])
            ->chunkById(100, function ($subscriptions) {
                foreach ($subscriptions as $subscription) {
                    $daysRemaining = max(1, now()->diffInDays($subscription->ends_at, false));
                    $subscription->provider?->notify(
                        new ProviderSubscriptionEndingSoonNotification($subscription, $daysRemaining)
                    );
                    $subscription->update(['reminder_sent_at' => now()]);
                }
            }, 'id');

        $this->info('Provider subscription reminders processed successfully.');

        return self::SUCCESS;
    }
}
