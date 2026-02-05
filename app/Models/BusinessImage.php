<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BusinessImage extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'business_profile_id',
        'image_path',
        'is_logo',
    ];

    public function businessProfile()
    {
        return $this->belongsTo(BusinessProfile::class);
    }
}
