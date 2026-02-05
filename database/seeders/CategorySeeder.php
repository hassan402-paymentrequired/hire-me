<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Salon & Barber',
            'Spa & Wellness',
            'Fitness & Training',
            'Healthcare',
            'Automotive',
            'Home Services',
            'Professional Services',
            'Cleaning Services',
            'Education & Tutoring',
            'Events & Photography',
            'Legal & Financial',
            'Other',
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => Str::slug($category)],
                ['name' => $category]
            );
        }
    }
}
