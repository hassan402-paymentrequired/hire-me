<?php

namespace App\Http\Controllers\Provider\Onboarding;

use App\Http\Controllers\Controller;
use App\Models\BusinessProfile;
use App\Models\Service;
use App\Models\WorkHour;
use App\Models\Category;
use App\Notifications\BusinessSetupCompleteNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
        $categories = Category::orderBy('name')->get()->map(function ($category) {
            return [
                'value' => $category->slug,
                'label' => $category->name,
            ];
        });

        return Inertia::render('provider/onboarding/business-profile', [
            'step' => 'profile',
            'categories' => $categories
        ]);
    }

    public function storeBusinessProfile(Request $request)
    {
        $request->validate([
            'business_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'images' => 'required|array|min:2|max:3',
            'images.*' => 'image|max:5120',
            'logo_index' => 'required|integer|min:0|max:2',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'category' => 'nullable|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        try {
            DB::beginTransaction();
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

            $businessProfile = BusinessProfile::create($data);

            // Handle images upload
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('business-images', 'public');
                    $businessProfile->images()->create([
                        'image_path' => $path,
                        'is_logo' => $index == $request->logo_index,
                    ]);
                }
            }

            DB::commit();
            return redirect()->route('onboarding.index');
        }catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error creating business profile: {$e->getMessage()}");
            return back()->withErrors(['business_name' => 'Error creating business profile. Please try again.']);
        }
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

        WorkHour::where('provider_id', $user->id)->delete();

        foreach ($validated['schedule'] as $day => $dayData) {
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

        $user->notify(new BusinessSetupCompleteNotification());

        return redirect()->route('onboarding.success');
    }

    public function success()
    {
        return Inertia::render('provider/onboarding/success');
    }

    public function skip()
    {
        return redirect()->route('business.dashboard');
    }
}
