<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProviderGalleryItemResource;
use App\Models\FavouriteBusiness;
use App\Models\User;
use App\Models\BusinessProfile;
use App\Models\Appointment;
use App\Models\ClientAddress;
use App\Models\TeamMember;
use App\Models\Wallet;
use App\Models\ProviderGalleryImage;
use App\Models\ProviderGalleryItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Support\ProviderSettings;

class MarketplaceController extends Controller
{
    private function bookingEligibilityForProvider(User $provider): array
    {
        $user = auth()->user();

        if (! $user) {
            return [
                'canBook' => true,
                'bookingBlockedReason' => null,
            ];
        }

        if (! $user->canBookProvider($provider)) {
            return [
                'canBook' => false,
                'bookingBlockedReason' => 'You cannot book your own business or a provider workspace you belong to.',
            ];
        }

        return [
            'canBook' => true,
            'bookingBlockedReason' => null,
        ];
    }

    public function index()
    {
        // Get all verified providers with their business profiles and services
        $providers = User::whereHas('businessProfile')
            ->where('is_verified', true) // Only show verified providers
            ->with([
                'businessProfile',
                'services' => function ($query) {
                    $query->where('status', 'active');
                }
            ])
            ->get()
            ->map(function ($provider) {
                return [
                    'id' => $provider->id,
                    'name' => $provider->name,
                    'isVerified' => (bool) $provider->is_verified,
                    'businessName' => $provider->businessProfile->business_name,
                    'slug' => $provider->businessProfile->slug,
                    'description' => $provider->businessProfile->description,
                    'address' => $provider->businessProfile->address,
                    'latitude' => $provider->businessProfile->latitude,
                    'longitude' => $provider->businessProfile->longitude,
                    'servicesCount' => $provider->services->count(),
                    'services' => $provider->services->take(3)->map(fn($s) => $s->name),
                ];
            });

        return Inertia::render('marketplace/index', [
            'providers' => $providers,
        ]);
    }

    public function show(string $slug)
    {
        $businessProfile = BusinessProfile::where('slug', $slug)->firstOrFail();
        
        $provider = $businessProfile->user()
            ->with([
                'services' => function ($query) {
                    $query->where('status', 'active')->with('serviceCategory');
                }
            ])
            ->firstOrFail();

       
        $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $workHoursData = \App\Models\WorkHour::where('provider_id', $provider->id)
            ->get()
            ->groupBy('day_of_week');
        
        $workHours = collect($dayNames)->mapWithKeys(function ($dayName) use ($workHoursData) {
            // Access by day name string, not numeric index
            $hours = $workHoursData->get($dayName, collect());
            $openHours = $hours->where('is_closed', false);
            
            if ($openHours->isEmpty()) {
                return [$dayName => ['isOpen' => false]];
            }
            
            return [
                $dayName => [
                    'isOpen' => true,
                    'hours' => $openHours->map(fn($h) => [
                        'start' => Carbon::parse($h->start_time)->format('g:i A'),
                        'end' => Carbon::parse($h->end_time)->format('g:i A'),
                    ])->values()->toArray()
                ]
            ];
        });

        // Get reviews
        $reviews = \App\Models\Review::where('provider_id', $provider->id)
            ->with('client:id,name')
            ->latest()
            ->get();

        $canReview = false;
        $isFavourite = false;
        $bookingEligibility = $this->bookingEligibilityForProvider($provider);

        if (auth()->check()) {
            $canReview = Appointment::where('client_id', auth()->id())
                ->where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereDoesntHave('review')
                ->exists();
            $isFavourite = FavouriteBusiness::query()->where('user_id', auth()->id())->where('business_profile_id', $businessProfile->id)->exists();
        }


        // Calculate years in business from business profile creation date
        $yearsInBusiness = $businessProfile->created_at 
            ? round($businessProfile->created_at->diffInYears(now()), 1)
            : 0;

        // Active team members that accepted the invite. If missing (older providers), default to 1 (the provider).
        $teamMembersCount = TeamMember::query()
            ->where('provider_id', $provider->id)
            ->where('is_active', true)
            ->whereNotNull('accepted_at')
            ->count();
        
        // Calculate total service hours
        $totalServiceHours = $provider->services->sum('duration_minutes') / 60;

        $nearbyProviders = collect();
        if (!empty($businessProfile->category)) {
            $targetLat = $businessProfile->latitude ? (float) $businessProfile->latitude : null;
            $targetLng = $businessProfile->longitude ? (float) $businessProfile->longitude : null;

            $nearbyQuery = User::query()
                ->select([
                    'users.id',
                    'users.name',
                    'users.is_verified',
                ])
                ->where('users.is_verified', true)
                ->where('users.id', '!=', $provider->id)
                ->whereHas('services', fn ($q) => $q->where('status', 'active'))
                ->join('business_profiles', 'users.id', '=', 'business_profiles.user_id')
                ->where('business_profiles.category', $businessProfile->category)
                ->addSelect([
                    'business_profiles.business_name',
                    'business_profiles.slug',
                    'business_profiles.address',
                    'business_profiles.category',
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
                    'services_count' => DB::table('services')
                        ->selectRaw('COUNT(*)')
                        ->whereColumn('provider_id', 'users.id')
                        ->where('status', 'active'),
                    // Prefer logo, fallback to first image.
                    'image_path' => DB::table('business_images')
                        ->select('image_path')
                        ->whereColumn('business_profile_id', 'business_profiles.id')
                        ->orderByDesc('is_logo')
                        ->orderBy('id')
                        ->limit(1),
                ]);

            if ($targetLat && $targetLng) {
                $nearbyQuery
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
                    ', [$targetLat, $targetLng, $targetLat])
                    ->orderBy('distance', 'asc');
            } else {
                $nearbyQuery->orderByRaw('COALESCE(avg_rating, 0) DESC');
            }

            $nearbyProviders = $nearbyQuery
                ->limit(10)
                ->get()
                ->map(function ($row) {
                    $logoUrl = null;
                    if (!empty($row->image_path)) {
                        $logoUrl = \App\Services\FileUploadService::url($row->image_path, 'public');
                    }

                    return [
                        'id' => (string) $row->id,
                        'name' => (string) $row->name,
                        'businessName' => (string) $row->business_name,
                        'slug' => (string) $row->slug,
                        'address' => (string) $row->address,
                        'logo' => $logoUrl,
                        'distance' => property_exists($row, 'distance') ? (float) $row->distance : null,
                        'servicesCount' => (int) ($row->services_count ?? 0),
                        'rating' => isset($row->avg_rating) ? round((float) $row->avg_rating, 1) : 0,
                        'reviewsCount' => (int) ($row->reviews_count ?? 0),
                        'minPrice' => (float) ($row->min_price ?? 0),
                        'category' => (string) ($row->category ?? ''),
                        'isVerified' => (bool) $row->is_verified,
                    ];
                })
                ->values();
        }

        $images = $businessProfile->images->map(fn($img) => [
                    'url' => \App\Services\FileUploadService::url($img->image_path, 'public'),
                    'isLogo' => $img->is_logo
                ]);

        // Pull the latest images from the provider's actual gallery (ProviderGalleryItem/Image),
        // not the business hero images. Only need a small teaser + total count for "+N more".
        $galleryImageQuery = ProviderGalleryImage::query()
            ->whereHas('galleryItem', function ($query) use ($provider, $businessProfile) {
                $query->where('provider_id', $provider->id)
                    ->where('business_profile_id', $businessProfile->id);
            });

        $galleryPreview = (clone $galleryImageQuery)
            ->latest('id')
            ->limit(3)
            ->get(['id', 'image_path'])
            ->map(fn (ProviderGalleryImage $image) => [
                'id' => (string) $image->id,
                'url' => \App\Services\FileUploadService::url($image->image_path, 'public')
                    ?? '/storage/' . ltrim((string) $image->image_path, '/'),
            ])
            ->values();

        $galleryTotal = (clone $galleryImageQuery)->count();


        return Inertia::render('marketplace/provider', [
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'isVerified' => (bool) $provider->is_verified,
                'businessId' => $businessProfile->id,
                'businessName' => $businessProfile->business_name,
                'address' => $businessProfile->address,
                'slug' => $businessProfile->slug,
                'description' => $businessProfile->description,
                'images' => $images,
                'rating' => $reviews->avg('rating') ? round($reviews->avg('rating'), 1) : 0,
                'reviews_count' => $reviews->count(),
                'can_review' => $canReview,
                'latitude' => $businessProfile->latitude,
                'longitude' => $businessProfile->longitude,
                'pending_appointment_id' => $canReview ? Appointment::where('client_id', auth()->id())
                    ->where('provider_id', $provider->id)
                    ->where('status', 'completed')
                    ->whereDoesntHave('review')
                    ->first()?->id : null,
                'years_in_business' => $yearsInBusiness,
                'team_members_count' => max(1, (int) $teamMembersCount),
                'total_service_hours' => round($totalServiceHours, 1),
                'canBook' => $bookingEligibility['canBook'],
                'bookingBlockedReason' => $bookingEligibility['bookingBlockedReason'],
            ],
            'services' => $provider->services->map(fn ($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'duration_minutes' => $service->duration_minutes,
                'price' => $service->price,
                'service_category_id' => $service->service_category_id,
                'service_category_name' => $service->serviceCategory?->name,
            ])->values(),
            'workHours' => $workHours,
            'reviews' => $reviews->map(fn($r) => [
                'id' => $r->id,
                'client_name' => $r->client->name ?? 'Anonymous',
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at->diffForHumans(),
            ]),
            'canEdit' => Auth::check(),
            'isFavourite' => $isFavourite,
            'nearbyProviders' => $nearbyProviders,
            'galleryPreview' => $galleryPreview,
            'galleryTotal' => $galleryTotal,
        ]);
    }

    public function booking($slug)
    {
        $businessProfile = BusinessProfile::where('slug', $slug)->firstOrFail();
        
        $provider = $businessProfile->user()
            ->with([
                'services' => function ($query) {
                    $query->where('status', 'active')
                        ->with('serviceCategory:id,name');
                }
            ])
            ->firstOrFail();


        $walletBalance = null;
        if (auth()->check()) {
            $wallet = Wallet::firstOrCreate(['user_id' => auth()->id()]);
            $walletBalance = $wallet->balance;
        }

        $user = auth()->user();
        $clientAddresses = $user
            ? ClientAddress::query()
                ->where('user_id', $user->id)
                ->orderByDesc('is_active')
                ->latest()
                ->get([
                    'id',
                    'label',
                    'address',
                    'city',
                    'state',
                    'latitude',
                    'longitude',
                    'is_active',
                ])
            : collect();

        $managedProvider = $user?->managedProvider();
        $businessAddressOption = null;
        if ($managedProvider?->businessProfile?->address) {
            $businessAddressOption = [
                'label' => $managedProvider->businessProfile->business_name ?: 'Business address',
                'address' => $managedProvider->businessProfile->address,
                'city' => $managedProvider->businessProfile->city,
                'state' => $managedProvider->businessProfile->state,
                'latitude' => $managedProvider->businessProfile->latitude,
                'longitude' => $managedProvider->businessProfile->longitude,
            ];
        }

        // Get provider settings
        $settings = ProviderSettings::resolve($businessProfile->settings ?? []);
        $teamMembers = TeamMember::query()
            ->where('provider_id', $provider->id)
            ->where('is_active', true)
            ->whereNotNull('accepted_at')
            ->with('user:id,name,email,avatar')
            ->get();
        $bookableTeamMembers = $teamMembers
            ->where('user_id', '!=', $provider->id)
            ->values();


        $bookingEligibility = $this->bookingEligibilityForProvider($provider);

        return Inertia::render('marketplace/booking', [
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'isVerified' => (bool) $provider->is_verified,
                'businessName' => $businessProfile->business_name,
                'address' => $businessProfile->address,
                'slug' => $businessProfile->slug,
                'logo' => $businessProfile->images->where('is_logo', true)->first()?->image_path
                    ? \App\Services\FileUploadService::url($businessProfile->images->where('is_logo', true)->first()->image_path, 'public')
                    : null,
                'canBook' => $bookingEligibility['canBook'],
                'bookingBlockedReason' => $bookingEligibility['bookingBlockedReason'],
            ],
            'services' => $provider->services->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'duration' => $service->duration_minutes,
                'price' => $service->price,
                'categoryId' => $service->service_category_id,
                'categoryName' => $service->serviceCategory?->name,
            ]),
            'walletBalance' => $walletBalance,
            'clientAddresses' => $clientAddresses,
            'businessAddressOption' => $businessAddressOption,
            'teamMembers' => $bookableTeamMembers->count() > 0
                ? $bookableTeamMembers->map(fn ($member) => [
                    'id' => $member->id,
                    'name' => $member->user?->name,
                    'email' => $member->user?->email,
                    'role' => $member->role,
                    'avatar' => $member->user?->avatar ?? null,
                ])->values()
                : [],
            'settings' => [
                'advanceBooking' => $settings['advanceBooking'] ?? '30', // days
                'minNotice' => $settings['minNotice'] ?? null, // hours
                'allowSameDay' => $settings['allowSameDay'] ?? false,
                'autoConfirm' => $settings['autoConfirm'] ?? $settings['auto_confirm'] ?? false,
                'allowOffHoursRequests' => $settings['allowOffHoursRequests'] ?? false,
                'max_bookings_per_week' => $settings['max_bookings_per_week'] ?? null,
                'max_bookings_per_month' => $settings['max_bookings_per_month'] ?? null,
                'accept_online_payment' => $settings['accept_online_payment'] ?? true,
                'accept_offline_booking' => $settings['accept_offline_booking'] ?? false,
                'offers_home_service' => $settings['offers_home_service'] ?? false,
            ],
            'recurringDiscountPercent' => (float) config('booking.recurring_discount_percent', 10),
        ]);
    }

    public function gallery(Request $request, string $slug)
    {
        $businessProfile = BusinessProfile::where('slug', $slug)->firstOrFail();

        $provider = $businessProfile->user()->firstOrFail();

        $items = ProviderGalleryItem::query()
            ->where('provider_id', $provider->id)
            ->where('business_profile_id', $businessProfile->id)
            ->with('images')
            ->latest()
            ->paginate(6)
            ->withQueryString()
            ->through(fn (ProviderGalleryItem $item) => (new ProviderGalleryItemResource($item))->toArray($request));

        return Inertia::render('marketplace/gallery', [
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'businessName' => $businessProfile->business_name,
                'slug' => $businessProfile->slug,
                'logo' => $businessProfile->images->where('is_logo', true)->first()?->image_path
                    ? \App\Services\FileUploadService::url($businessProfile->images->where('is_logo', true)->first()->image_path, 'public')
                    : null,
            ],
            // Required for @inertiajs/react <InfiniteScroll /> to track/restore scroll state.
            'items' => Inertia::scroll(fn () => $items),
        ]);
    }
}
