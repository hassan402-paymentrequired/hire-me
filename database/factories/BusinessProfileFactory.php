<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BusinessProfileFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->company;
        return [
            'business_name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph,
            'settings' => [
                'auto_confirm' => $this->faker->boolean,
                'allow_same_day' => true,
            ],
        ];
    }
}
