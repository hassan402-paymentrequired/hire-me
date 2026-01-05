<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProviderVerification extends Model
{
    protected $fillable = [
        'user_id',
        'document_type',
        'document_path',
        'status',
        'rejection_reason',
        'reviewed_at',
        'reviewed_by',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(\App\Models\User::class, 'reviewed_by');
    }
}
