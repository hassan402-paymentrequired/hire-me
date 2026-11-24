<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingWaitlistEntry extends Model
{
    /** @use HasFactory<\Database\Factories\BookingWaitlistEntryFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'client_id',
        'provider_id',
        'date',
        'service_ids',
        'notified_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'service_ids' => 'array',
            'notified_at' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}
