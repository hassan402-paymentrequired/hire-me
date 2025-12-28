<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Service extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'provider_id',
        'name',
        'description',
        'duration_minutes',
        'price',
        'status',
    ];

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
