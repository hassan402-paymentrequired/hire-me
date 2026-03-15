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
        'client_approved',
        'provider_approved',
        'client_approved_at',
        'provider_approved_at',
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
        'platform_fee_percent',
        'platform_fee_amount',
        'provider_payout_amount',
        'recurrence_pattern',
        'recurrence_parent_id',
        'recurrence_end_date',
        'recurrence_count',
        'original_price',
        'discount_percent',
        'recurrence_stopped_at',
        'team_member_id',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'price' => 'decimal:2',
        'escrow_amount' => 'decimal:2',
        'payment_released_at' => 'datetime',
        'recurrence_end_date' => 'date',
        'recurrence_stopped_at' => 'datetime',
        'original_price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'client_approved' => 'boolean',
        'provider_approved' => 'boolean',
        'client_approved_at' => 'datetime',
        'provider_approved_at' => 'datetime',
        'platform_fee_percent' => 'decimal:2',
        'platform_fee_amount' => 'decimal:2',
        'provider_payout_amount' => 'decimal:2',
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

    /**
     * Get the team member assigned to this appointment
     */
    public function teamMember()
    {
        return $this->belongsTo(TeamMember::class);
    }

    /**
     * Get the parent appointment if this is a recurring appointment
     */
    public function recurrenceParent()
    {
        return $this->belongsTo(Appointment::class, 'recurrence_parent_id');
    }

    /**
     * Get all child appointments in the recurrence series
     */
    public function recurrenceChildren()
    {
        return $this->hasMany(Appointment::class, 'recurrence_parent_id')->orderBy('start_time');
    }

    /**
     * Check if this appointment is part of a recurrence series
     */
    public function isRecurring(): bool
    {
        return !is_null($this->recurrence_pattern) || !is_null($this->recurrence_parent_id);
    }

    /**
     * Check if this is the parent appointment in a recurrence series
     */
    public function isRecurrenceParent(): bool
    {
        return !is_null($this->recurrence_pattern) && is_null($this->recurrence_parent_id);
    }

    /**
     * Get the next appointment date based on recurrence pattern
     */
    public function getNextRecurrenceDate(\Carbon\Carbon $fromDate = null): ?\Carbon\Carbon
    {
        if (!$this->recurrence_pattern) {
            return null;
        }

        $fromDate = $fromDate ?? $this->start_time;

        return match ($this->recurrence_pattern) {
            'weekly' => $fromDate->copy()->addWeek(),
            'bi_weekly' => $fromDate->copy()->addWeeks(2),
            'monthly' => $fromDate->copy()->addMonth(),
            default => null,
        };
    }
}
