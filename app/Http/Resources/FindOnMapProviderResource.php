<?php

namespace App\Http\Resources;

use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FindOnMapProviderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $lat = $this->businessProfile->latitude;
        $lng = $this->businessProfile->longitude;

        $images = $this->businessProfile->images
            ? $this->businessProfile->images->map(fn ($img) => $img->image_path
                ? FileUploadService::url($img->image_path, 'public')
                : null)->filter()->values()->all()
            : [];

        return [
            'id' => $this->id,
            'name' => $this->name,
            'businessName' => $this->businessProfile->business_name,
            'slug' => $this->businessProfile->slug,
            'description' => $this->businessProfile->description,
            'address' => $this->businessProfile->address,
            'phone' => $this->businessProfile->phone,
            'latitude' => $lat !== null ? (float) $lat : null,
            'longitude' => $lng !== null ? (float) $lng : null,
            'servicesCount' => $this->services->count(),
            'services' => $this->services->take(3)->pluck('name')->values()->all(),
            'rating' => isset($this->avg_rating) && $this->avg_rating ? round((float) $this->avg_rating, 1) : null,
            'reviewsCount' => (int) ($this->reviews_count ?? 0),
            'images' => $images,
        ];
    }
}
