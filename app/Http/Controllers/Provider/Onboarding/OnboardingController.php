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
        return redirect()->route('business.dashboard');
    }

    public function businessProfile()
    {
        return Inertia::render('provider/onboarding/business-profile', ['step' => 'profile']);
    }

    public function storeBusinessProfile(Request $request)
    {
        $request->validate([
            'business_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|max:2048', // 2MB max
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'category' => 'nullable|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $user = auth()->user();

        $data = [
            'user_id' => $user->id,
            'business_name' => $request->business_name,
            'slug' => Str::slug($request->business_name) . '-' . Str::random(6),
            'description' => $request->description,
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'zip_code' => $request->zip_code,
            'phone' => $request->phone,
            'category' => $request->category,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ];

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('business-logos', 'public');
            $data['logo_path'] = $logoPath;
        }

        BusinessProfile::create($data);

        return redirect()->route('onboarding.index');
    }

    public function workHours()
    {
        return Inertia::render('provider/onboarding/work-hours', ['step' => 'hours']);
    }

    public function storeWorkHours(Request $request)
    {
        $validated = $request->validate([
            'schedule' => 'required|array',
            'schedule.*.isOpen' => 'required|boolean',
            'schedule.*.shifts' => 'required|array',
            'schedule.*.shifts.*.start' => 'required|string',
            'schedule.*.shifts.*.end' => 'required|string',
            'schedule.*.shifts.*.breaks' => 'nullable|array',
            'schedule.*.shifts.*.breaks.*.start' => 'required|string',
            'schedule.*.shifts.*.breaks.*.end' => 'required|string',
        ]);

        $user = auth()->user();

        // Delete existing work hours for this provider (in case of re-onboarding)
        WorkHour::where('provider_id', $user->id)->delete();

        foreach ($validated['schedule'] as $day => $dayData) {
            // Get the first shift (current schema supports one time period per day)
            $firstShift = $dayData['shifts'][0] ?? null;

            WorkHour::create([
                'provider_id' => $user->id,
                'day_of_week' => $day,
                'start_time' => !$dayData['isOpen'] || !$firstShift ? null : $firstShift['start'] . ':00',
                'end_time' => !$dayData['isOpen'] || !$firstShift ? null : $firstShift['end'] . ':00',
                'breaks' => !$dayData['isOpen'] || !$firstShift ? null : array_map(function ($break) {
                    return [
                        'start' => $break['start'],
                        'end' => $break['end']
                    ];
                }, $firstShift['breaks'] ?? []),
                'is_closed' => !$dayData['isOpen'],
            ]);
        }

        return redirect()->route('onboarding.index');
    }

    public function services()
    {
        return Inertia::render('provider/onboarding/services', ['step' => 'services']);
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

        return redirect()->route('business.dashboard');
    }

    public function skip()
    {
        return redirect()->route('business.dashboard');
    }
}
