<?php

namespace App\Models;

use App\Observers\ServiceObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;


#[ObservedBy(ServiceObserver::class)]
class Service extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'provider_id',
        'category_id',
        'name',
        'description',
        'duration_minutes',
        'buffer_time_minutes',
        'price',
        'status',
    ];

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
