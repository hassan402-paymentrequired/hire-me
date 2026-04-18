<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $categories = [
            'Home Services',
            'Cleaning',
            'Plumbing',
            'Electrical Repairs',
            'Carpentry',

            'Beauty & Personal Care',
            'Salon',
            'Barbing',
            'Makeup',
            'Nails',
            'Spa & Massage',

            'Fitness & Training',
            'Health & Wellness',

            'Events & Photography',
            'Photography',
            'Videography',

            'Education & Tutoring',
            'Private Tutors',

            'Professional Services',
            
            'Legal Services',

            'Consulting',


            'Automotive',

            'Car Repairs',

            'other'
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => Str::slug($category)],
                ['name' => $category]
            );
        }
    }
}
