<?php

namespace App\Models;

use App\Observers\BusinessProfileObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

#[ObservedBy(BusinessProfileObserver::class)]
class BusinessProfile extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'business_name',
        'slug',
        'description',
        'logo_path',
        'address',
        'city',
        'state',
        'zip_code',
        'phone',
        'category',
        'latitude',
        'longitude',
        'settings',
        'widget_enabled',
        'widget_settings',
        'widget_domains',
        'has_onboarded'
    ];

    protected $casts = [
        'settings' => 'array',
        'widget_enabled' => 'boolean',
        'widget_settings' => 'array',
        'widget_domains' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(BusinessImage::class);
    }

    public function logo()
    {
        return $this->hasOne(BusinessImage::class)->where('is_logo', true);
    }
}
