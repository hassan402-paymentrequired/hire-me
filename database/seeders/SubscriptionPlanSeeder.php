<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter Monthly',
                'slug' => 'starter-monthly',
                'price' => 5000,
                'duration_days' => 30,
                'description' => 'A simple monthly plan for providers who want full booking payouts.',
                'features' => [ 'Monthly billing'],
                'sort_order' => 1,
            ],
            [
                'name' => 'Growth Quarterly',
                'slug' => 'growth-quarterly',
                'price' => 13500,
                'duration_days' => 90,
                'description' => 'A discounted quarterly option for active providers.',
                'features' => [ 'Quarterly billing'],
                'sort_order' => 2,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan + ['is_active' => true]
            );
        }
    }
}
