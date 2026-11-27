<?php

namespace Database\Factories;

use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<PromoCode>
 */
class PromoCodeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'provider_id' => User::factory()->state(['role' => 'provider']),
            'code' => Str::upper(fake()->unique()->bothify('????##')),
            'discount_type' => PromoCode::TYPE_PERCENT,
            'discount_value' => 10,
            'max_uses' => null,
            'times_used' => 0,
            'expires_at' => null,
            'is_active' => true,
        ];
    }

    public function fixed(float $amount): static
    {
        return $this->state(fn (): array => [
            'discount_type' => PromoCode::TYPE_FIXED,
            'discount_value' => $amount,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (): array => ['expires_at' => now()->subDay()]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
