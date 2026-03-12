<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderGalleryImageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $url = \App\Services\FileUploadService::url($this->image_path, 'public');

        return [
            'id' => $this->id,
            'url' => $url ?? '/storage/' . ltrim((string) $this->image_path, '/'),
            'sort_order' => $this->sort_order,
        ];
    }
}

