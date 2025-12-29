<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Laravel\Fortify\Features;


class GuestController extends Controller
{
    public function welcome()
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

        return Inertia::render('guest/welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'providers' => $providers,
        ]);
    }
}
