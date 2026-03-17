<?php

namespace App\Http\Controllers\Provider\Onboarding;

use App\Enum\UserRoleEnum;
use App\Http\Controllers\Controller;
use App\Jobs\SaveWorkHourJob;
use App\Models\BusinessProfile;
use App\Models\Category;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\WorkHour;
use App\Notifications\BusinessSetupCompleteNotification;
use App\Services\ProviderLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function index()
    {
        $user = auth_user();
        $hasService = Service::where('provider_id', $user->id)->exists();

        if ($user->businessProfile()->exists() && $user->businessProfile->has_onboarded) {
            return to_route('business.dashboard')->with('error-toast', 'You. already have a business profile.');
        }

        // Determine current step based on what's missing
        // 1. Business Profile
        if ($user->businessProfile && $hasService) {
            return to_route('business.dashboard')->with('error-toast', 'You. already have a business profile.');
        }

        if (! $user->businessProfile) {
            return redirect()->route('onboarding.business-profile');
        }

        // 2. Work Hours (check if any exist)
        if (! WorkHour::where('provider_id', $user->id)->exists()) {
            return redirect()->route('onboarding.work-hours');
        }

        // 3. Services (check if any exist)
        if (! $hasService) {
            return redirect()->route('onboarding.services');
        }

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
            'categories' => $categories,
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
            'address' => 'required|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'category' => 'required|string|exists:categories,slug',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        try {
            DB::beginTransaction();
            $user = auth_user();

            $data = [
                'user_id' => $user->id,
                'business_name' => $request->business_name,
                'slug' => Str::slug($request->business_name).'-'.Str::random(6),
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
                    $path = \App\Services\FileUploadService::upload(
                        $image,
                        'business-images',
                        'public'
                    );
                    $businessProfile->images()->create([
                        'image_path' => $path,
                        'is_logo' => $index == $request->logo_index,
                    ]);
                }
            }

            $this->ensureProviderTeamMember($user);

            DB::commit();

            return redirect()->route('onboarding.index');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error creating business profile: {$e->getMessage()}");

            return back()->withErrors(['business_name' => 'Error creating business profile. Please try again.']);
        }
    }

    public function workHours()
    {
        $user = auth_user();
        if (! $user->businessProfile) {
            return to_route('onboarding.business-profile')
                ->with('error-toast', 'Please create your business profile before setting work hours.');
        }

        if ($user->businessProfile->has_onboarded) {
            return to_route('business.dashboard')->with('error-toast', 'You. already have a business profile.');
        }
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
        $user = auth_user();

        // Additional sanity checks (avoid invalid times silently saving).
        foreach ($validated['schedule'] as $day => $dayData) {
            if (! ($dayData['isOpen'] ?? false)) {
                continue;
            }

            $shift = $dayData['shifts'][0] ?? null;
            if (! $shift) {
                return back()->withErrors([
                    "schedule.$day.shifts" => 'Please add a shift for this day.',
                ]);
            }

            $start = (string) ($shift['start'] ?? '');
            $end = (string) ($shift['end'] ?? '');

            if ($start === '' || $end === '' || $start >= $end) {
                return back()->withErrors([
                    "schedule.$day.shifts.0.start" => 'Start time must be before end time.',
                ]);
            }

            foreach (($shift['breaks'] ?? []) as $breakIndex => $break) {
                $bStart = (string) ($break['start'] ?? '');
                $bEnd = (string) ($break['end'] ?? '');
                if ($bStart === '' || $bEnd === '' || $bStart >= $bEnd) {
                    return back()->withErrors([
                        "schedule.$day.shifts.0.breaks.$breakIndex.start" => 'Break start must be before break end.',
                    ]);
                }
                if ($bStart < $start || $bEnd > $end) {
                    return back()->withErrors([
                        "schedule.$day.shifts.0.breaks.$breakIndex.start" => 'Break must be within the shift time.',
                    ]);
                }
            }
        }

        try {
            SaveWorkHourJob::dispatch($validated['schedule'], $user);
        } catch (\Throwable $e) {
            Log::error('Error saving work hours', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error-toast', 'Could not save your work hours. Please try again.');
        }

        return redirect()->route('onboarding.index')->with('success-toast', 'Work hours saved.');
    }

    public function services()
    {

         $user = auth_user();

         if(!$user->businessProfile)
         {
            return to_route('home')->with('error-toast', 'You. already have a business profile.');
         }


         if ($user->businessProfile->has_onboarded) {
            return to_route('business.dashboard')->with('error-toast', 'You. already have a business profile.');
        }

        return Inertia::render('provider/onboarding/services', [
            'step' => 'services',
            'categories' => Category::orderBy('name')->select(['id', 'name'])->get(),
        ]);
    }

    public function storeServices(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'duration_minutes' => 'required|integer',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
        ]);

        $user = auth_user();

        Service::create([
            'provider_id' => $user->id,
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'duration_minutes' => $request->duration_minutes,
            'price' => $request->price,
            'status' => 'active',
        ]);

        $this->ensureProviderTeamMember($user);
        $user->notify(new BusinessSetupCompleteNotification);

        return redirect()->route('onboarding.success');   

    }

    public function success()
    {
        $user = auth_user();

        return Inertia::render('provider/onboarding/success', [
            'is_verified' => $user->is_verified ?? false,
        ]);
    }

    public function verification()
    {
        $user = auth_user();
        $existingVerification = \App\Models\ProviderVerification::where('user_id', $user->id)
            ->latest()
            ->first();

        return Inertia::render('provider/onboarding/verification', [
            'step' => 'verification',
            'existingVerification' => $existingVerification ? [
                'status' => $existingVerification->status,
                'document_type' => $existingVerification->document_type,
                'rejection_reason' => $existingVerification->rejection_reason,
                'created_at' => $existingVerification->created_at,
            ] : null,
            'is_verified' => (bool) $user->is_verified,
        ]);
    }

    public function storeVerification(Request $request)
    {
        $user = auth_user();

        // Check if already verified
        if ($user->is_verified) {
            return redirect()->route('onboarding.index');
        }

        // Check for pending verification
        $existingPending = \App\Models\ProviderVerification::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existingPending) {
            return back()->withErrors(['document' => 'You already have a pending verification request.']);
        }

        $validated = $request->validate([
            'document_type' => 'required|in:voters_card,utility_bill,bank_statement,drivers_license,national_id,passport,cac_registration,tax_certificate,business_license',
            'document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB
        ]);

        // Store document securely using FileUploadService
        $path = \App\Services\FileUploadService::upload(
            $request->file('document'),
            'verifications',
            'private'
        );

        \App\Models\ProviderVerification::create([
            'user_id' => $user->id,
            'document_type' => $validated['document_type'],
            'document_path' => $path,
            'status' => 'pending',
        ]);

        return redirect()->route('business.dashboard')->with('success-toast', 'Verification request submitted successfully! We will review it shortly.');
    }

    public function skip(string $stage)
    {

        if (! in_array($stage, ['work-hours', 'services'])) {
            return redirect()->route('onboarding.index')->with('error', 'Invalid onboarding stage.');
        }

        $user = auth_user();

        if ($stage === 'work-hours') {
            $defaultDays = days();
            SaveWorkHourJob::dispatch($defaultDays, $user);

            return redirect()->route('onboarding.services');
        }

        ProviderLogService::log($user->id, 'Finish setting up business profile', 'Just finish setting up business profile');

        $user->businessProfile->update(['has_onboarded' => true]);
        $user->update(['role' => UserRoleEnum::PROVIDER->value]);
        $this->ensureProviderTeamMember($user);

        $user->notify(new BusinessSetupCompleteNotification);

        return redirect()->route('onboarding.success');

    }

    private function ensureProviderTeamMember($user): void
    {
        TeamMember::firstOrCreate(
            [
                'provider_id' => $user->id,
                'user_id' => $user->id,
            ],
            [
                'role' => 'admin',
                'is_active' => true,
                'invited_by' => $user->id,
                'invited_at' => now(),
                'accepted_at' => now(),
            ],
        );
    }
}
