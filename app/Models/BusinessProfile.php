<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class BusinessProfile extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'business_name',
        'slug',
        'description',
        'logo_path',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
