<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobBid extends Model
{
    protected $fillable = [
        'job_post_id',
        'provider_id',
        'price',
        'message',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function jobPost()
    {
        return $this->belongsTo(JobPost::class);
    }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}
