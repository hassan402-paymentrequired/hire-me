<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\FavouriteBusiness;
use App\Models\User;
use App\Models\BusinessProfile;
use App\Models\Appointment;
use App\Models\TeamMember;
use App\Models\Wallet;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class MarketplaceController extends Controller
{
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
                    $query->where('status', 'active');
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
        
        // Calculate total service hours
        $totalServiceHours = $provider->services->sum('duration_minutes') / 60;

        return Inertia::render('marketplace/provider', [
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'businessId' => $businessProfile->id,
                'businessName' => $businessProfile->business_name,
                'address' => $businessProfile->address,
                'slug' => $businessProfile->slug,
                'description' => $businessProfile->description,
                'images' => $businessProfile->images->map(fn($img) => [
                    'url' => \App\Services\FileUploadService::url($img->image_path, 'public'),
                    'isLogo' => $img->is_logo
                ]),
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
                'total_service_hours' => round($totalServiceHours, 1),
            ],
            'services' => $provider->services,
            'workHours' => $workHours,
            'reviews' => $reviews->map(fn($r) => [
                'id' => $r->id,
                'client_name' => $r->client->name ?? 'Anonymous',
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at->diffForHumans(),
            ]),
            'canEdit' => Auth::check(),
            'isFavourite' => $isFavourite
        ]);
    }

    public function booking($slug)
    {
        $businessProfile = BusinessProfile::where('slug', $slug)->firstOrFail();
        
        $provider = $businessProfile->user()
            ->with([
                'services' => function ($query) {
                    $query->where('status', 'active');
                }
            ])
            ->firstOrFail();


        $walletBalance = null;
        if (auth()->check()) {
            $wallet = Wallet::firstOrCreate(['user_id' => auth()->id()]);
            $walletBalance = $wallet->balance;
        }

        // Get provider settings
        $settings = $businessProfile->settings ?? [];
        $teamMembers = TeamMember::query()
            ->where('provider_id', $provider->id)
            ->where('is_active', true)
            ->whereNotNull('accepted_at')
            ->with('user:id,name,email,avatar')
            ->get();
        $bookableTeamMembers = $teamMembers
            ->where('user_id', '!=', $provider->id)
            ->values();


        return Inertia::render('marketplace/booking', [
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'businessName' => $businessProfile->business_name,
                'address' => $businessProfile->address,
                'slug' => $businessProfile->slug,
                'logo' => $businessProfile->images->where('is_logo', true)->first()?->image_path
                    ? \App\Services\FileUploadService::url($businessProfile->images->where('is_logo', true)->first()->image_path, 'public')
                    : null,
            ],
            'services' => $provider->services->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'duration' => $service->duration_minutes,
                'price' => $service->price,
            ]),
            'walletBalance' => $walletBalance,
            'teamMembers' => $teamMembers->count() > 0
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
                'max_bookings_per_week' => $settings['max_bookings_per_week'] ?? null,
                'max_bookings_per_month' => $settings['max_bookings_per_month'] ?? null,
            ],
        ]);
    }
}
