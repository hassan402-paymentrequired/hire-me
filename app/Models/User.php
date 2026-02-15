<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enum\UserRoleEnum;
use App\Observers\UserObserver;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use NotificationChannels\WebPush\HasPushSubscriptions;

#[ObservedBy(UserObserver::class)]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasPushSubscriptions, Notifiable, TwoFactorAuthenticatable, HasUlids;

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
        'referral_code',
        'referred_by',
        'is_verified',
    ];

    public function isProvider(): bool
    {
        return $this->businessProfile !== null;
    }

    public function isClient(): bool
    {
        return true; // All authenticated users can be clients
    }

    public function hasProviderSetup(): bool
    {
        return $this->businessProfile !== null;
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
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
            'two_factor_confirmed_at' => 'datetime',
            'role' => UserRoleEnum::class
        ];
    }

    public function businessProfile()
    {
        return $this->hasOne(BusinessProfile::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'provider_id');
    }

    public function appointmentsAsProvider()
    {
        return $this->hasMany(Appointment::class, 'provider_id');
    }

    public function appointmentsAsClient()
    {
        return $this->hasMany(Appointment::class, 'client_id');
    }

    /** Reviews received as a provider (provider_id = this user) */
    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'provider_id');
    }

    public function referrer()
    {
        return $this->belongsTo(\App\Models\User::class, 'referred_by');
    }

    public function referredUsers()
    {
        return $this->hasMany(\App\Models\User::class, 'referred_by');
    }

    public function referralEarnings()
    {
        return $this->hasMany(\App\Models\ReferralEarning::class, 'user_id');
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function clientBankAccount()
    {
        return $this->hasOne(ClientBankAccount::class);
    }

    public function providerBankAccount()
    {
        return $this->hasOne(ProviderBankAccount::class);
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * Get team memberships (where this user is a team member)
     */
    public function teamMemberships()
    {
        return $this->hasMany(TeamMember::class, 'user_id');
    }

    /**
     * Get team members (where this user is the provider)
     */
    public function teamMembers()
    {
        return $this->hasMany(TeamMember::class, 'provider_id');
    }

    /**
     * Check if user is a team member of a provider
     */
    public function isTeamMemberOf(User $provider): bool
    {
        return $this->teamMemberships()
            ->where('provider_id', $provider->id)
            ->where('is_active', true)
            ->whereNotNull('accepted_at')
            ->exists();
    }

    /**
     * Check if user can manage a provider's business (is provider or admin team member)
     */
    public function canManageProvider(User $provider): bool
    {
        // User is the provider themselves
        if ($this->id === $provider->id) {
            return true;
        }

        // User is an admin team member
        $teamMember = $this->teamMemberships()
            ->where('provider_id', $provider->id)
            ->where('is_active', true)
            ->whereNotNull('accepted_at')
            ->first();

        return $teamMember && $teamMember->isAdmin();
    }


}
