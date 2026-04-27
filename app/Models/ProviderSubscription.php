<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderSubscription extends Model
{
    use HasFactory, HasUlids;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_EXPIRED = 'expired';

    protected $fillable = [
        'provider_id',
        'subscription_plan_id',
        'status',
        'starts_at',
        'ends_at',
        'cancelled_at',
        'reminder_sent_at',
        'metadata',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>', now());
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && $this->starts_at?->lte(now())
            && $this->ends_at?->gt(now());
    }
}
