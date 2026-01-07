<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class WalletTransaction extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'wallet_id',
        'user_id',
        'appointment_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'status',
        'description',
        'reference',
        'metadata',
    ];

    // Transaction types
    const TYPE_DEPOSIT = 'deposit';
    const TYPE_WITHDRAWAL = 'withdrawal';
    const TYPE_ESCROW_HOLD = 'escrow_hold';
    const TYPE_ESCROW_RELEASE = 'escrow_release';
    const TYPE_ESCROW_REFUND = 'escrow_refund';
    const TYPE_ESCROW_FORFEIT = 'escrow_forfeit';

    // Transaction statuses
    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}
