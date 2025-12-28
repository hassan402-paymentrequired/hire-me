<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class WorkHour extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'provider_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_closed',
    ];

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }
}
