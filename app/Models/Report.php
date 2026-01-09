<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'appointment_id',
        'user_id',
        'reason',
        'description',
        'resolved_at',
        'resolved_by',
        'action_taken',
        'penalty_applied',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
