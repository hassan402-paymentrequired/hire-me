<?php

namespace Database\Seeders;

use App\Models\BusinessProfile;
use App\Models\Category;
use App\Models\Service;
use App\Models\User;
use App\Models\WorkHour;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProviderSeeder extends Seeder
{
    private const COUNT = 30;

    private const BUSINESS_PREFIXES = [
        'Elite', 'Premier', 'Urban', 'City', 'Metro', 'Downtown', 'Riverside',
        'Sunset', 'Lakeside', 'Oak', 'Cedar', 'Maple', 'Pine', 'Summit',
        'Valley', 'Harbor', 'Park', 'Plaza', 'Square', 'Corner', 'Main',
        'First', 'Prime', 'Select', 'Modern', 'Classic', 'Fresh', 'Pure',
    ];

    private const BUSINESS_SUFFIXES = [
        'Salon', 'Spa', 'Barbershop', 'Studio', 'Clinic', 'Workshop',
        'Care', 'Wellness', 'Services', 'Pros', 'Experts', 'Hub',
    ];

    private const DAYS = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    ];

    public function run(): void
    {
        $categories = Category::all();
        if ($categories->isEmpty()) {
            $this->command->warn('Run CategorySeeder first. Skipping ProviderSeeder.');
            return;
        }

        $categoryNames = $categories->pluck('name')->all();

        for ($i = 0; $i < self::COUNT; $i++) {
            $name = fake()->name();
            $email = 'provider' . ($i + 1) . '@proxideck.test';

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'role' => 'provider',
                    'is_verified' => true,
                    'email_verified_at' => now(),
                ]
            );

            $businessName = $this->uniqueBusinessName($i);
            $slug = Str::slug($businessName) . '-' . ($i + 1);

            $profile = BusinessProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'business_name' => $businessName,
                    'slug' => $slug,
                    'description' => fake()->paragraph(),
                    'address' => fake()->streetAddress(),
                    'city' => fake()->city(),
                    'state' => fake()->stateAbbr(),
                    'zip_code' => fake()->postcode(),
                    'phone' => fake()->phoneNumber(),
                    'category' => fake()->randomElement($categoryNames),
                    'latitude' => fake()->latitude(),
                    'longitude' => fake()->longitude(),
                ]
            );

            $this->seedServices($user, $categories);
            $this->seedWorkHours($user);
        }

        $this->command->info('Seeded ' . self::COUNT . ' providers. Login: provider1@proxideck.test … provider' . self::COUNT . '@proxideck.test / password');
    }

    private function uniqueBusinessName(int $index): string
    {
        $prefix = self::BUSINESS_PREFIXES[$index % count(self::BUSINESS_PREFIXES)];
        $suffix = self::BUSINESS_SUFFIXES[(int) ($index / count(self::BUSINESS_PREFIXES)) % count(self::BUSINESS_SUFFIXES)];

        return $prefix . ' ' . $suffix;
    }

    private function seedServices(User $provider, $categories): void
    {
        $serviceNames = [
            ['Consultation', 30, 5000],
            ['Basic Service', 60, 15000],
            ['Premium Service', 90, 25000],
            ['Full Package', 120, 40000],
            ['Express', 45, 10000],
            ['Standard', 60, 18000],
            ['Deluxe', 90, 32000],
        ];

        Service::where('provider_id', $provider->id)->delete();

        $numServices = random_int(1, 3);
        $picked = array_rand($serviceNames, min($numServices, count($serviceNames)));
        $picked = is_array($picked) ? $picked : [$picked];

        foreach ($picked as $idx) {
            [$name, $duration, $price] = $serviceNames[$idx];
            $cat = $categories->random();

            Service::create([
                'provider_id' => $provider->id,
                'category_id' => $cat->id,
                'name' => $name,
                'description' => fake()->sentence(),
                'duration_minutes' => $duration,
                'buffer_time_minutes' => 0,
                'price' => $price + random_int(-500, 2000),
                'status' => 'active',
            ]);
        }
    }

    private function seedWorkHours(User $provider): void
    {
        WorkHour::where('provider_id', $provider->id)->delete();

        foreach (self::DAYS as $day) {
            $isClosed = $day === 'Sunday';
            WorkHour::create([
                'provider_id' => $provider->id,
                'day_of_week' => $day,
                'start_time' => $isClosed ? null : '09:00',
                'end_time' => $isClosed ? null : ($day === 'Saturday' ? '13:00' : '17:00'),
                'is_closed' => $isClosed,
            ]);
        }
    }
}
