<?php

namespace Database\Factories;

use App\Models\BookingWaitlistEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BookingWaitlistEntry>
 */
class BookingWaitlistEntryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'client_id' => User::factory(),
            'provider_id' => User::factory()->state(['role' => 'provider']),
            'date' => now()->addDays(2)->toDateString(),
            'service_ids' => [],
            'notified_at' => null,
        ];
    }
}
