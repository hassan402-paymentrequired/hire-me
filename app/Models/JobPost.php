<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobPost extends Model
{
    protected $fillable = [
        'client_id',
        'category',
        'title',
        'description',
        'budget_min',
        'budget_max',
        'address',
        'latitude',
        'longitude',
        'radius_km',
        'status',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'radius_km' => 'integer',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function bids()
    {
        return $this->hasMany(JobBid::class);
    }
}
