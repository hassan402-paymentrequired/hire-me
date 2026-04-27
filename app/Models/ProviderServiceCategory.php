<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderServiceCategory extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'provider_id',
        'name',
        'slug',
    ];

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'service_category_id');
    }
}
