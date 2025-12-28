<?php

namespace App\Http\Controllers\Provider\Onboarding;

use App\Http\Controllers\Controller;
use App\Models\BusinessProfile;
use App\Models\Service;
use App\Models\WorkHour;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Determine current step based on what's missing
        // 1. Business Profile
        if (!$user->businessProfile) {
            return redirect()->route('onboarding.business-profile');
        }

        // 2. Work Hours (check if any exist)
        if (!WorkHour::where('provider_id', $user->id)->exists()) {
            return redirect()->route('onboarding.work-hours');
        }

        // 3. Services (check if any exist)
        if (!Service::where('provider_id', $user->id)->exists()) {
            return redirect()->route('onboarding.services');
        }

        // All done
        return redirect()->route('dashboard');
    }

    public function businessProfile()
    {
        return Inertia::render('provider/onboarding/business-profile');
    }

    public function storeBusinessProfile(Request $request)
    {
        $request->validate([
            'business_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $user = auth()->user();

        BusinessProfile::create([
            'user_id' => $user->id,
            'business_name' => $request->business_name,
            'slug' => Str::slug($request->business_name) . '-' . Str::random(6),
            'description' => $request->description,
        ]);

        return redirect()->route('onboarding.index'); // Will auto-redirect to next step
    }

    public function workHours()
    {
        return Inertia::render('provider/onboarding/work-hours');
    }

    public function storeWorkHours(Request $request)
    {
        // For simplicity, we'll just create default M-F 9-5 hours if they choose to "Save & Continue"
        // In a real app, this would receive a complex schedule object.
        // Or we can just skip to default setup.

        $user = auth()->user();
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        foreach ($days as $day) {
            WorkHour::create([
                'provider_id' => $user->id,
                'day_of_week' => $day,
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'is_closed' => false,
            ]);
        }

        return redirect()->route('onboarding.index');
    }

    public function services()
    {
        return Inertia::render('provider/onboarding/services');
    }

    public function storeServices(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'duration_minutes' => 'required|integer',
        ]);

        $user = auth()->user();

        Service::create([
            'provider_id' => $user->id,
            'name' => $request->name,
            'description' => $request->description,
            'duration_minutes' => $request->duration_minutes,
            'price' => $request->price,
            'status' => 'active',
        ]);

        return redirect()->route('dashboard');
    }

    public function skip()
    {
        return redirect()->route('dashboard');
    }
}
