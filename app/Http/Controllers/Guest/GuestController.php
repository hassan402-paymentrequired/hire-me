<?php

namespace App\Http\Controllers\Guest;

use App\Enum\CacheKey;
use App\Http\Controllers\Controller;
use App\Http\Resources\FindOnMapProviderResource;
use App\Http\Resources\ProviderResource;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class GuestController extends Controller
{
    /**
     * Optimized welcome page with aggressive caching and query optimization.
     */
    public function welcome(Request $request)
    {
        $lat = $request->lat ? (float) $request->lat : null;
        $lng = $request->lng ? (float) $request->lng : null;
        $search = $request->search ;
        $category = $request->category !== 'For You' ? $request->category : null;
        $minRating = $request->min_rating ? (float) $request->min_rating : null;
        $sort = $request->input('sort', 'recommended');
        $page = $request->input('page', 1);

        $cacheKey = $this->buildCacheKey([
            'lat' => $lat,
            'lng' => $lng,
            'search' => $search,
            'category' => $category,
            'min_rating' => $minRating,
            'sort' => $sort,
            'page' => $page,
        ]);

        $providers = Cache::tags([CacheKey::PROVIDERS->value, CacheKey::MARKETPLACE->value])->remember(
            $cacheKey,
            now()->addMinutes(5),
            fn () => $this->fetchProviders($lat, $lng, $search, $category, $minRating, $sort, $page)
        );

        $categories = Cache::tags(['categories'])->remember(
            CacheKey::MARKETPLACE_CATEGORIES->value,
            now()->addHour(),
            fn () => Category::orderBy('name')->get(['name', 'slug'])
        );

        return Inertia::render('guest/welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'providers' => Inertia::scroll(fn() => $providers),
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $request->category,
                'lat' => $lat,
                'lng' => $lng,
                'sort' => $sort,
                'min_rating' => $minRating,
            ],
        ]);
    }

    /**
     * Build a unique cache key from filter parameters.
     */
    private function buildCacheKey(array $params): string
    {
        if ($params['lat']) {
            $params['lat'] = round($params['lat'], 3);
        }
        if ($params['lng']) {
            $params['lng'] = round($params['lng'], 3);
        }

        $params = array_filter($params, fn ($v) => $v !== null);

        return CacheKey::PROVIDER_MARKETPLACE->value . md5(json_encode($params));
    }

    /**
     * Fetch providers with optimized queries.
     */
    private function fetchProviders(
        ?float $lat,
        ?float $lng,
        ?string $search,
        ?string $category,
        ?float $minRating,
        string $sort,
        int $page
    ) {
        // Single optimized query with subquery selects instead of multiple separate queries
        $query = User::query()
            ->select([
                'users.id',
                'users.name',
                'users.email',
                'users.is_verified',
                'users.created_at'
            ])
            // Only verified users with business profiles and active services
            ->where('users.is_verified', true)
            ->whereHas('businessProfile')
            ->whereHas('services', fn ($q) => $q->where('status', 'active'))
            // Join business profiles once
            ->join('business_profiles', 'users.id', '=', 'business_profiles.user_id')
            ->addSelect([
                'business_profiles.business_name',
                'business_profiles.description',
                'business_profiles.address',
                'business_profiles.city',
                'business_profiles.state',
                'business_profiles.category',
                'business_profiles.latitude',
                'business_profiles.longitude',
            ])
            ->addSelect([
                'avg_rating' => DB::table('reviews')
                    ->selectRaw('COALESCE(AVG(rating), 0)')
                    ->whereColumn('provider_id', 'users.id'),
                'reviews_count' => DB::table('reviews')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('provider_id', 'users.id'),
                'min_price' => DB::table('services')
                    ->selectRaw('MIN(price)')
                    ->whereColumn('provider_id', 'users.id')
                    ->where('status', 'active'),
            ]);

        if ($lat && $lng) {
            $query
                ->whereNotNull('business_profiles.latitude')
                ->whereNotNull('business_profiles.longitude')
                ->selectRaw('
                    (6371 * acos(
                        cos(radians(?))
                        * cos(radians(business_profiles.latitude))
                        * cos(radians(business_profiles.longitude) - radians(?))
                        + sin(radians(?))
                        * sin(radians(business_profiles.latitude))
                    )) AS distance
                ', [$lat, $lng, $lat]);
        }

        if ($search) {
            $searchTerm = "%{$search}%";
            $query->where(function ($q) use ($searchTerm) {
                $q->whereLike('users.name', 'like', $searchTerm)
                    ->orWhereLike('business_profiles.business_name', $searchTerm)
                    ->orWhereLike('business_profiles.description', $searchTerm)
                    ->orWhereLike('business_profiles.address', $searchTerm)
                    ->orWhereLike('business_profiles.city', $searchTerm);
            });
        }

        if ($category) {
            $query->where('business_profiles.category', $category);
        }

        // Rating filter
        if ($minRating) {
            $query->having('avg_rating', '>=', $minRating);
        }

        // Sorting
        switch ($sort) {
            case 'price_asc':
                $query->orderByRaw('COALESCE(min_price, 999999) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('COALESCE(min_price, 0) DESC');
                break;
            case 'rating_desc':
                $query->orderByRaw('COALESCE(avg_rating, 0) DESC');
                break;
            case 'distance_asc':
                if ($lat && $lng) {
                    $query->orderBy('distance', 'asc');
                } else {
                    $query->latest('users.created_at');
                }
                break;
            default: // 'recommended'
                // Recommended = combination of rating + recency
                $query->orderByRaw('COALESCE(avg_rating, 0) * 0.7 + (DATEDIFF(NOW(), users.created_at) / -365) * 0.3 DESC');
                break;
        }

        // Paginate
        $providers = $query->paginate(12, ['*'], 'page', $page)->withQueryString();

        // Eager load relationships AFTER pagination to avoid loading unnecessary data
        $providers->load([
            'businessProfile.images' => function ($q) {
                $q->select('id', 'business_profile_id', 'image_path', 'is_logo');
            },
            'services' => function ($q) {
                $q->where('status', 'active')
                    ->select('id', 'provider_id', 'name', 'price', 'duration_minutes')
                    ->oldest('price'); // Show cheapest first
            },
        ]);

        // Transform to resource collection
        return ProviderResource::collection($providers);
    }
  

    public function findOnMap(Request $request)
    {
        $users = User::whereHas('businessProfile')
            ->where('is_verified', true)
            ->with([
                'businessProfile.images',
                'services' => function ($query) {
                    $query->where('status', 'active');
                },
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
