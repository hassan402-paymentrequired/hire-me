<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderGalleryItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'created_at' => $this->created_at?->toIso8601String(),
            // Keep nested arrays simple for Inertia/TS (no ResourceCollection wrappers).
            'images' => $this->images
                ->sortBy('sort_order')
                ->values()
                ->map(fn ($img) => (new ProviderGalleryImageResource($img))->toArray($request))
                ->all(),
        ];
    }
}
