<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Support\Subscriptions\SubscriptionFeature;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubscriptionPlanController extends Controller
{
    public function index()
    {
        SubscriptionFeature::ensureEnabled();

        return Inertia::render('admin/subscriptions/index', [
            'plans' => SubscriptionPlan::query()
                ->orderBy('sort_order')
                ->orderBy('created_at')
                ->get()
                ->map(fn (SubscriptionPlan $plan) => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'slug' => $plan->slug,
                    'price' => (float) $plan->price,
                    'duration_days' => $plan->duration_days,
                    'description' => $plan->description,
                    'features' => $plan->features ?? [],
                    'is_active' => $plan->is_active,
                    'sort_order' => $plan->sort_order,
                ]),
        ]);
    }

    public function store(Request $request)
    {
        SubscriptionFeature::ensureEnabled();

        $validated = $this->validatePlan($request);
        SubscriptionPlan::create($validated);

        return back()->with('success-toast', 'Subscription plan created successfully.');
    }

    public function update(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        SubscriptionFeature::ensureEnabled();

        $validated = $this->validatePlan($request, $subscriptionPlan->id);
        $subscriptionPlan->update($validated);

        return back()->with('success-toast', 'Subscription plan updated successfully.');
    }

    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        SubscriptionFeature::ensureEnabled();

        $subscriptionPlan->delete();

        return back()->with('success-toast', 'Subscription plan deleted successfully.');
    }

    protected function validatePlan(Request $request, ?string $ignoreId = null): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:subscription_plans,slug,' . $ignoreId],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
            'features' => ['nullable', 'array'],
            'features.*' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['slug'] = $validated['slug'] ?: Str::slug($validated['name']);
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        return $validated;
    }
}
