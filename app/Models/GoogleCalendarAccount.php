<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoogleCalendarAccount extends Model
{
    protected $fillable = [
        'user_id',
        'google_email',
        'google_calendar_id',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'sync_enabled',
        'last_synced_at',
        'last_error',
    ];

    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'token_expires_at' => 'datetime',
            'sync_enabled' => 'boolean',
            'last_synced_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
