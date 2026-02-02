<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserService
{
    /**
     * Find existing user by email or create a new guest user account
     * 
     * @param array $data ['name', 'email', 'phone']
     * @return array ['user' => User, 'is_new' => bool, 'password' => string|null]
     */
    public static function findOrCreateGuestUser(array $data): array
    {
        // Check if user exists by email
        $user = User::where('email', $data['email'])->first();
        
        if ($user) {
            // Existing user - update phone if provided and different
            if (isset($data['phone']) && $data['phone'] && $user->phone !== $data['phone']) {
                $user->update(['phone' => $data['phone']]);
            }
            
            return [
                'user' => $user,
                'is_new' => false,
                'password' => null, // Don't send password for existing users
            ];
        }
        
        // Generate random secure password
        $plainPassword = Str::random(12); // 12 character random password
        
        // Create new user
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($plainPassword),
            'email_verified_at' => now(), // Auto-verify since they provided email
            'role' => 'client', // Default role
        ]);
        
        // Create wallet for new user
        Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
            'escrow_balance' => 0,
        ]);
        
        return [
            'user' => $user,
            'is_new' => true,
            'password' => $plainPassword, // Return plain password to send via email
        ];
    }
}
