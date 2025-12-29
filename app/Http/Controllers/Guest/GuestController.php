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

class GuestController extends Controller
{
    public function welcome(Request $request)
    {
        $query = User::where('role', 'provider')
            ->with([
                'businessProfile',
                'services' => function ($query) {
                    $query->where('status', 'active');
                }
            ])
            ->whereHas('businessProfile');

        // Filter by search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhereHas('businessProfile', function ($bq) use ($request) {
                        $bq->where('business_name', 'like', "%{$request->search}%")
                            ->orWhere('description', 'like', "%{$request->search}%");
                    });
            });
        }

        // Filter by category
        if ($request->category && $request->category !== 'For You') {
            $query->whereHas('businessProfile', function ($bq) use ($request) {
                $bq->where('category', $request->category);
            });
        }

        if ($request->lat && $request->lng) {
            $lat = (float) $request->lat;
            $lng = (float) $request->lng;

            $query->leftJoin('business_profiles', 'users.id', '=', 'business_profiles.user_id')
                ->select('users.*', DB::raw("
                    (6371 * acos(cos(radians($lat))
                    * cos(radians(business_profiles.latitude))
                    * cos(radians(business_profiles.longitude) - radians($lng))
                    + sin(radians($lat))
                    * sin(radians(business_profiles.latitude)))) AS distance
                "))
                ->orderBy('distance');
        }

        $providers = $query->simplePaginate(12)->through(function ($provider) {
            return [
                'id' => $provider->id,
                'name' => $provider->name,
                'businessName' => $provider->businessProfile->business_name,
                'slug' => $provider->businessProfile->slug,
                'description' => $provider->businessProfile->description,
                'servicesCount' => $provider->services->count(),
                'services' => $provider->services->take(3)->map(fn($s) => $s->name),
                'distance' => isset($provider->distance) ? round($provider->distance, 1) : null,
            ];
        });

        $categories = Category::orderBy('name')->get(['name', 'slug']);

        return Inertia::render('guest/welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'providers' => $providers,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'lat', 'lng']),
        ]);
    }
}
