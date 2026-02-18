<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Laravel\Fortify\Features;


use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\BusinessProfile;
use App\Models\Category;
use App\Http\Resources\ProviderResource;
use App\Http\Resources\FindOnMapProviderResource;

class GuestController extends Controller
{
    public function welcome(Request $request)
    {
        $lat = $request->lat ? (float) $request->lat : null;
        $lng = $request->lng ? (float) $request->lng : null;

        $query = User::query()->whereHas('businessProfile')
            ->where('users.is_verified', true) // Only show verified providers
            ->select('users.*')
            ->with([
                'businessProfile.images',
                'services' => function ($sq) {
                    $sq->where('status', 'active');
                }
            ])
            ->whereHas('businessProfile')
            ->leftJoin('business_profiles', 'users.id', '=', 'business_profiles.user_id')
            ->addSelect([
                'avg_rating' => DB::table('reviews')
                    ->selectRaw('avg(rating)')
                    ->whereColumn('provider_id', 'users.id'),
                'reviews_count' => DB::table('reviews')
                    ->selectRaw('count(*)')
                    ->whereColumn('provider_id', 'users.id'),
                'min_price' => DB::table('services')
                    ->selectRaw('min(price)')
                    ->whereColumn('provider_id', 'users.id')
                    ->where('status', 'active'),
            ]);

        // Distance calculation if coords provided
        if ($lat && $lng) {
            $query
            ->whereNotNull('business_profiles.latitude')
            ->whereNotNull('business_profiles.longitude')
           ->selectRaw("
                    (6371 * acos(
                        cos(radians(?))
                        * cos(radians(business_profiles.latitude))
                        * cos(radians(business_profiles.longitude) - radians(?))
                        + sin(radians(?))
                        * sin(radians(business_profiles.latitude))
                    )) AS distance
                ", [$lat, $lng, $lat]);
        }

        // Filter by search
        if ($request->search) {   
            $query->where(function ($q) use ($request) {
                $q->where('users.name', 'like', "%{$request->search}%")
                    ->orWhere('business_profiles.business_name', 'like', "%{$request->search}%")
                    ->orWhere('business_profiles.description', 'like', "%{$request->search}%")
                    ->orWhere('business_profiles.address', 'like', "%{$request->search}%");
            });
        }

        // Filter by category
        if ($request->category && $request->category !== 'For You') {
            $query->where('business_profiles.category', $request->category);
        }

        // Filter by rating
        if ($request->min_rating) {
            $query->having('avg_rating', '>=', (float) $request->min_rating);
        }

        // Sorting
        $sort = $request->input('sort', 'recommended');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('min_price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('min_price', 'desc');
                break;
            case 'rating_desc':
                $query->orderByDesc('avg_rating');
                break;
            case 'distance_asc':
                if ($lat && $lng) {
                    $query->orderBy('distance', 'asc');
                }
                break;
            default:
                $query->latest('users.created_at');
                break;
        }

        $providers = $query->paginate(12)->withQueryString();
        
        $providers = ProviderResource::collection($providers);
        
        $categories = Category::orderBy('name')->get(['name', 'slug']);

        return Inertia::render('guest/welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'providers' => $providers,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'lat', 'lng', 'sort', 'min_rating']),
        ]);
    }

    public function findOnMap(Request $request)
    {
        $users = User::whereHas('businessProfile')
            ->where('is_verified', true)
            ->with([
                'businessProfile.images',
                'services' => function ($query) {
                    $query->where('status', 'active');
                }
            ])
            ->withAvg('reviewsReceived as avg_rating', 'rating')
            ->withCount('reviewsReceived as reviews_count')
            ->get();

        $providers = $users->map(fn ($user) => (new FindOnMapProviderResource($user))->resolve());

        return Inertia::render('guest/find-on-map', [
            'providers' => $providers->values()->all(),
        ]);
    }
}
