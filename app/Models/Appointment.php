<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Appointment extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'provider_id',
        'client_id',
        'service_id',
        'start_time',
        'end_time',
        'buffer_time_minutes',
        'status',
        'price',
        'notes',
        'client_name',
        'client_email',
        'cancelled_by',
        'cancellation_reason',
        'first_reminder_sent_at',
        'last_reminder_sent_at',
        'reminder_count',
        'escrow_amount',
        'escrow_status',
        'escrow_transaction_id',
        'payment_released_at',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'price' => 'decimal:2',
        'escrow_amount' => 'decimal:2',
        'payment_released_at' => 'datetime',
    ];

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'appointment_services');
    }

    public function review()
    {
        return $this->hasMany(Review::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function escrowTransaction()
    {
        return $this->belongsTo(WalletTransaction::class, 'escrow_transaction_id');
    }
}
