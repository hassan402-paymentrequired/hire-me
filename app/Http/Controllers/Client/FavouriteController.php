<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProviderResource;
use App\Models\Appointment;
use App\Models\FavouriteBusiness;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FavouriteController extends Controller
{
    /**
     * Show the signed-in client's saved providers.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $businessProfileIds = FavouriteBusiness::query()
            ->where('user_id', $user->id)
            ->pluck('business_profile_id');

        $providers = User::query()
            ->whereHas('businessProfile', fn ($query) => $query->whereIn('id', $businessProfileIds))
            ->with([
                'businessProfile.images:id,business_profile_id,image_path,is_logo',
                'services' => fn ($query) => $query->where('status', 'active')->oldest('price'),
            ])
            ->withAvg('reviewsReceived as avg_rating', 'rating')
            ->withCount('reviewsReceived as reviews_count')
            ->withMin(['services as min_price' => fn ($query) => $query->where('status', 'active')], 'price')
            ->get();

        $lastBookedAt = Appointment::query()
            ->where('client_id', $user->id)
            ->whereIn('provider_id', $providers->pluck('id'))
            ->selectRaw('provider_id, MAX(start_time) as last_booked_at')
            ->groupBy('provider_id')
            ->pluck('last_booked_at', 'provider_id');

        return Inertia::render('client/favourites/index', [
            'favourites' => $providers->map(fn (User $provider) => [
                ...(new ProviderResource($provider))->resolve(),
                'businessId' => $provider->businessProfile->id,
                'city' => $provider->businessProfile->city,
                'lastBookedAt' => $lastBookedAt[$provider->id] ?? null,
            ])->values(),
        ]);
    }
}
