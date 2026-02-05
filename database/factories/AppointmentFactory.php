<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('now', '+1 month');
        $duration = 60;
        $end = (clone $start)->modify("+{$duration} minutes");

        return [
            'start_time' => $start,
            'end_time' => $end,
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'completed', 'cancelled']),
            'price' => $this->faker->randomFloat(2, 5000, 50000),
            'notes' => $this->faker->sentence,
            'client_name' => $this->faker->name,
            'client_email' => $this->faker->email,
        ];
    }
}
