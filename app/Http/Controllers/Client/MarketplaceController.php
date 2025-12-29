<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\BusinessProfile;
use Inertia\Inertia;

class MarketplaceController extends Controller
{
    public function index()
    {
        // Get all providers with their business profiles and services
        $providers = User::where('role', 'provider')
            ->with([
                'businessProfile',
                'services' => function ($query) {
                    $query->where('status', 'active');
                }
            ])
            ->whereHas('businessProfile')
            ->get()
            ->map(function ($provider) {
                return [
                    'id' => $provider->id,
                    'name' => $provider->name,
                    'businessName' => $provider->businessProfile->business_name,
                    'slug' => $provider->businessProfile->slug,
                    'description' => $provider->businessProfile->description,
                    'servicesCount' => $provider->services->count(),
                    'services' => $provider->services->take(3)->map(fn($s) => $s->name),
                ];
            });

        return Inertia::render('marketplace/index', [
            'providers' => $providers,
        ]);
    }

    public function show($slug)
    {
        $businessProfile = BusinessProfile::where('slug', $slug)->firstOrFail();
        $provider = $businessProfile->user()
            ->with([
                'services' => function ($query) {
                    $query->where('status', 'active');
                }
            ])
            ->firstOrFail();

        // Get work hours
        $workHours = \App\Models\WorkHour::where('provider_id', $provider->id)
            ->get()
            ->groupBy('day_of_week')
            ->map(function ($hours, $day) {
                $openHours = $hours->where('is_closed', false);
                if ($openHours->isEmpty()) {
                    return ['isOpen' => false];
                }
                return [
                    'isOpen' => true,
                    'hours' => $openHours->map(fn($h) => [
                        'start' => \Carbon\Carbon::parse($h->start_time)->format('g:i A'),
                        'end' => \Carbon\Carbon::parse($h->end_time)->format('g:i A'),
                    ])->values()->toArray()
                ];
            });

        return Inertia::render('marketplace/provider', [
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'businessName' => $businessProfile->business_name,
                'slug' => $businessProfile->slug,
                'description' => $businessProfile->description,
            ],
            'services' => $provider->services->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'duration' => $service->duration_minutes,
                'price' => $service->price,
            ]),
            'workHours' => $workHours,
        ]);
    }
}
