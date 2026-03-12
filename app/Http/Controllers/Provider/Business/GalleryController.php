<?php

namespace App\Http\Controllers\Provider\Business;

use App\Http\Controllers\Controller;
use App\Models\ProviderGalleryImage;
use App\Models\ProviderGalleryItem;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GalleryController extends Controller
{
    public function index()
    {
        $provider = auth_user();
        $businessProfile = $provider->businessProfile;

        $items = ProviderGalleryItem::query()
            ->where('provider_id', $provider->id)
            ->where('business_profile_id', $businessProfile->id)
            ->with('images')
            ->latest()
            ->get()
            ->map(function (ProviderGalleryItem $item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'description' => $item->description,
                    'created_at' => $item->created_at?->toIso8601String(),
                    'images' => $item->images->map(fn (ProviderGalleryImage $img) => [
                        'id' => $img->id,
                        'url' => FileUploadService::url($img->image_path, 'public') ?? '/storage/' . ltrim($img->image_path, '/'),
                        'sort_order' => $img->sort_order,
                    ])->values(),
                ];
            });

        return Inertia::render('provider/business/gallery/index', [
            'items' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $provider = auth_user();
        $businessProfile = $provider->businessProfile;

        $validated = $request->validate([
            'title' => 'required|string|max:120',
            'description' => 'nullable|string|max:2000',
            'images' => 'required|array|min:1|max:10',
            'images.*' => 'required|image|max:5120',
        ]);

        try {
            DB::beginTransaction();

            $item = ProviderGalleryItem::create([
                'business_profile_id' => $businessProfile->id,
                'provider_id' => $provider->id,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
            ]);

            foreach ($request->file('images') as $index => $image) {
                $path = FileUploadService::upload($image, 'gallery-images', 'public');

                ProviderGalleryImage::create([
                    'gallery_item_id' => $item->id,
                    'image_path' => $path,
                    'sort_order' => $index,
                ]);
            }

            DB::commit();

            return back()->with('success-toast', 'Gallery item created successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to create gallery item. Please try again.');
        }
    }

    public function destroy(string $id)
    {
        $provider = auth_user();

        $item = ProviderGalleryItem::query()
            ->where('provider_id', $provider->id)
            ->with('images')
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            foreach ($item->images as $img) {
                FileUploadService::delete($img->image_path, 'public');
            }

            $item->delete();

            DB::commit();

            return back()->with('success-toast', 'Gallery item deleted.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to delete gallery item.');
        }
    }
}

