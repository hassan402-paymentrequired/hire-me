<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create super admin
        Admin::firstOrCreate(
            ['email' => 'admin@proxideck.com'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@hireme.com',
                'password' => Hash::make('1234567890'), // Change this in production!
                'role' => 'super_admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create regular admin
        Admin::firstOrCreate(
            ['email' => 'admin2@proxideck.com'],
            [
                'name' => 'Admin User',
                'email' => 'admin2@proxideck.com',
                'password' => Hash::make('1234567890'), // Change this in production!
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create moderator
        Admin::firstOrCreate(
            ['email' => 'moderator@proxideck.com'],
            [
                'name' => 'Moderator',
                'email' => 'moderator@hireme.com',
                'password' => Hash::make('1234567890'), // Change this in production!
                'role' => 'moderator',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

         User::query()->whereDoesntHave('wallet')->chunk(100, function ($users) {
            foreach ($users as $user) {
                $user->wallet()->create([
                    'balance' => 0,
                    'escrow_balance' => 0,
                ]);
            }
        });

        $this->command->info('Admin users created successfully!');
        $this->command->info('Super Admin: admin@proxideck.com / 1234567890');
        $this->command->info('Admin: admin2@proxideck.com / 1234567890');
        $this->command->info('Moderator: moderator@proxideck.com / 1234567890');
        $this->command->warn('⚠️  Please change these passwords in production!');
    }
}
