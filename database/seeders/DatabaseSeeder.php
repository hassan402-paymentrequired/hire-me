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
        // Create Main Provider User
        $provider = User::factory()->create([
            'name' => 'Dr. Hassan Provider',
            'email' => 'provider@example.com',
            'password' => bcrypt('password'), // Ensure you can login
        ]);

        // Create Business Profile
        BusinessProfile::factory()->create([
            'user_id' => $provider->id,
            'business_name' => 'Hassan Wellness',
            'slug' => 'hassan-wellness',
        ]);

        // Create Services
        $services = Service::factory(5)->create([
            'provider_id' => $provider->id,
        ]);

        // Create Work Hours
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        foreach ($days as $day) {
            WorkHour::create([
                'provider_id' => $provider->id,
                'day_of_week' => $day,
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'is_closed' => false,
            ]);
        }
        WorkHour::create([
            'provider_id' => $provider->id,
            'day_of_week' => 'Saturday',
            'start_time' => '10:00:00',
            'end_time' => '14:00:00',
            'is_closed' => false,
        ]);
        WorkHour::create([
            'provider_id' => $provider->id,
            'day_of_week' => 'Sunday',
            'is_closed' => true,
        ]);

        // Create Appointments
        foreach ($services as $service) {
            Appointment::factory(5)->create([
                'provider_id' => $provider->id,
                'service_id' => $service->id,
                'price' => $service->price,
            ]);
        }
    }
}
