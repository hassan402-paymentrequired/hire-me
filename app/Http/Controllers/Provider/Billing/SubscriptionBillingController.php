<?php

namespace App\Http\Controllers\Provider\Billing;

use App\Http\Controllers\Controller;
use App\Models\ProviderSubscription;
use App\Models\SubscriptionPlan;
use App\Support\ProviderSettings;
use App\Support\Subscriptions\SubscriptionFeature;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionBillingController extends Controller
{
    protected function provider()
    {
        abort_unless(auth_user()->hasProviderSetup(), 403);

        return auth_user()->managedProvider();
    }

    public function index()
    {
        SubscriptionFeature::ensureEnabled();

        $provider = $this->provider();
        $plans = SubscriptionPlan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get();
        $currentSubscription = SubscriptionFeature::activeSubscriptionForProvider($provider);
        $settings = ProviderSettings::resolve($provider?->businessProfile?->settings ?? []);

        return Inertia::render('provider/billing/index', [
            'billingModel' => $settings['billing_model'] ?? 'commission',
            'plans' => $plans->map(fn (SubscriptionPlan $plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'price' => (float) $plan->price,
                'duration_days' => $plan->duration_days,
                'description' => $plan->description,
                'features' => $plan->features ?? [],
            ]),
            'currentSubscription' => $currentSubscription ? [
                'id' => $currentSubscription->id,
                'status' => $currentSubscription->status,
                'starts_at' => $currentSubscription->starts_at?->toIso8601String(),
                'ends_at' => $currentSubscription->ends_at?->toIso8601String(),
                'plan' => [
                    'id' => $currentSubscription->plan?->id,
                    'name' => $currentSubscription->plan?->name,
                    'price' => (float) ($currentSubscription->plan?->price ?? 0),
                    'duration_days' => $currentSubscription->plan?->duration_days,
                ],
            ] : null,
            'history' => $provider->providerSubscriptions()
                ->with('plan')
                ->latest('ends_at')
                ->limit(10)
                ->get()
                ->map(fn (ProviderSubscription $subscription) => [
                    'id' => $subscription->id,
                    'status' => $subscription->status,
                    'starts_at' => $subscription->starts_at?->toIso8601String(),
                    'ends_at' => $subscription->ends_at?->toIso8601String(),
                    'plan_name' => $subscription->plan?->name,
                    'price' => (float) ($subscription->plan?->price ?? 0),
                ]),
        ]);
    }

    public function subscribe(Request $request)
    {
        SubscriptionFeature::ensureEnabled();

        $provider = $this->provider();
        $validated = $request->validate([
            'plan_id' => ['required', 'exists:subscription_plans,id'],
        ]);

        $plan = SubscriptionPlan::query()->where('is_active', true)->findOrFail($validated['plan_id']);

        $provider->providerSubscriptions()
            ->active()
            ->get()
            ->each(function (ProviderSubscription $subscription) {
                $subscription->update([
                    'status' => ProviderSubscription::STATUS_CANCELLED,
                    'cancelled_at' => now(),
                    'ends_at' => now(),
                ]);
            });

        $provider->providerSubscriptions()->create([
            'subscription_plan_id' => $plan->id,
            'status' => ProviderSubscription::STATUS_ACTIVE,
            'starts_at' => now(),
            'ends_at' => now()->addDays($plan->duration_days),
            'metadata' => [
                'source' => 'provider_billing_page',
            ],
        ]);

        return back()->with('success-toast', 'Subscription activated successfully.');
    }

    public function cancel()
    {
        SubscriptionFeature::ensureEnabled();

        $provider = $this->provider();
        $subscription = $provider->providerSubscriptions()->active()->latest('ends_at')->first();

        if (! $subscription) {
            return back()->with('error-toast', 'No active subscription was found.');
        }

        $subscription->update([
            'status' => ProviderSubscription::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ]);

        return back()->with('success-toast', 'Subscription cancelled successfully.');
    }
}
