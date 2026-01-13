<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\BusinessProfile;
use App\Models\Service;
use App\Models\User;
use App\Models\WorkHour;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            AdminSeeder::class,
        ]);
    }
}
