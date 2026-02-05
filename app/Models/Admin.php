<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use App\Enum\UserRoleEnum;

class Admin extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasUlids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'role' => UserRoleEnum::class
        ];
    }

    /**
     * Check if admin is a super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if admin is a moderator
     */
    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    /**
     * Check if admin can manage other admins
     */
    public function canManageAdmins(): bool
    {
        return $this->isSuperAdmin();
    }

    /**
     * Check if admin can access financial reports
     */
    public function canAccessFinancial(): bool
    {
        return in_array($this->role, ['super_admin', 'admin']);
    }

    /**
     * Check if admin can moderate content
     */
    public function canModerate(): bool
    {
        return in_array($this->role, ['super_admin', 'admin', 'moderator']);
    }
}
