<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get logo image
        $logoImage = $this->businessProfile->images->firstWhere('is_logo', true);
        $logoUrl = null;
        
        if ($logoImage && $logoImage->image_path) {
            $logoUrl = \App\Services\FileUploadService::url($logoImage->image_path, 'public');
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'businessName' => $this->businessProfile->business_name,
            'slug' => $this->businessProfile->slug,
            'logo' => $logoUrl,
            'address' => $this->businessProfile->address,
            'servicesCount' => $this->services->count(),
            'services' => $this->services->take(3)->map(fn($s) => $s->name),
            'distance' => isset($this->distance) ? round($this->distance, 1) : null,
            'rating' => isset($this->avg_rating) && $this->avg_rating ? round((float) $this->avg_rating, 1) : 0,
            'reviewsCount' => $this->reviews_count ?? 0,
            'minPrice' => $this->min_price ?? 0,
            'isVerified' => $this->is_verified,
            'category' => $this->businessProfile->category
        ];
    }
}
