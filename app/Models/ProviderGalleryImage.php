<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderGalleryImage extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'gallery_item_id',
        'image_path',
        'sort_order',
    ];

    public function galleryItem()
    {
        return $this->belongsTo(ProviderGalleryItem::class, 'gallery_item_id');
    }
}

