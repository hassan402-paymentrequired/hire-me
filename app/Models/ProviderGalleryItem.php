<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderGalleryItem extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'business_profile_id',
        'provider_id',
        'title',
        'description',
    ];

    public function businessProfile()
    {
        return $this->belongsTo(BusinessProfile::class);
    }

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    public function images()
    {
        return $this->hasMany(ProviderGalleryImage::class, 'gallery_item_id')->orderBy('sort_order');
    }
}

