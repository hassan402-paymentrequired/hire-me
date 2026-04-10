<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessProfile;
use App\Models\Service;
use App\Models\User;
use App\Models\WorkHour;
use App\Models\Appointment;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\UserService;
use App\Services\PaystackService;
use App\Services\FileUploadService;
use App\Mail\GuestAccountCreatedMail;
use App\Mail\NewBookingMail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class WidgetController extends Controller
{
    /**
     * Get provider information for widget
     */
    public function info($slug)
    {
        $businessProfile = BusinessProfile::where('slug', $slug)->firstOrFail();
        
        // Check if widget is enabled
        if (!$businessProfile->widget_enabled) {
            return response()->json([
                'error' => 'Widget is not enabled for this provider.'
            ], 403);
        }
        
        // Check if provider is verified
        if (!$businessProfile->user->is_verified) {
            return response()->json([
                'error' => 'Provider profile not found.'
            ], 404);
        }
        
        $provider = $businessProfile->user()
            ->with([
                'services' => function ($query) {
                    $query->where('status', 'active');
                }
            ])
            ->firstOrFail();

        // Get logo
        $logoImage = $businessProfile->images->where('is_logo', true)->first();
        $logoUrl = $logoImage 
            ? FileUploadService::url($logoImage->image_path, 'public')
            : ($businessProfile->logo_path ? FileUploadService::url($businessProfile->logo_path, 'public') : null);

        // Get widget settings
        $widgetSettings = $businessProfile->widget_settings ?? [];
        
        return response()->json([
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'businessName' => $businessProfile->business_name,
                'slug' => $businessProfile->slug,
                'description' => $businessProfile->description,
                'logo' => $logoUrl,
            ],
            'services' => $provider->services->map(fn($service) => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'duration' => $service->duration_minutes,
                'price' => $service->price,
            ]),
            'settings' => [
                'advanceBooking' => (int)($businessProfile->settings['advanceBooking'] ?? 30),
                'minNotice' => isset($businessProfile->settings['minNotice']) ? (int)$businessProfile->settings['minNotice'] : null,
                'allowSameDay' => $businessProfile->settings['allowSameDay'] ?? false,
            ],
            'widget' => [
                'primaryColor' => $widgetSettings['primaryColor'] ?? '#3B82F6',
                'size' => $widgetSettings['size'] ?? 'medium',
                'style' => $widgetSettings['style'] ?? 'default',
                'requirePayment' => $widgetSettings['requirePayment'] ?? true,
            ],
        ]);
    }

    /**
     * Get available time slots for widget
     */
    public function availability(Request $request, $slug)
    {
        $request->validate([
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:services,id',
            'date' => 'required|date',
        ]);

        $businessProfile = BusinessProfile::where('slug', $slug)->firstOrFail();
        
        if (!$businessProfile->widget_enabled) {
            return response()->json(['error' => 'Widget is not enabled.'], 403);
        }

        $provider = User::with('businessProfile')->findOrFail($businessProfile->user_id);
        $services = Service::whereIn('id', $request->service_ids)->get();
        
        if ($services->isEmpty()) {
            return response()->json(['slots' => [], 'message' => 'No valid services selected.']);
        }

        $totalDuration = $services->sum('duration_minutes');
        $maxBuffer = $services->max('buffer_time_minutes') ?? 0;

        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->format('l');

        // Get provider settings
        $settings = $provider->businessProfile->settings ?? [];
        $advanceBooking = (int)($settings['advanceBooking'] ?? 30);
        $minNotice = isset($settings['minNotice']) ? (int)$settings['minNotice'] : null;
        $allowSameDay = $settings['allowSameDay'] ?? false;

        // Check advance booking window
        $maxDate = Carbon::now()->addDays($advanceBooking);
        if ($date->gt($maxDate)) {
            return response()->json([
                'slots' => [],
                'message' => "Bookings can only be made up to {$advanceBooking} days in advance."
            ]);
        }

        // Check minimum notice period
        if ($minNotice !== null) {
            $minDateTime = Carbon::now()->addHours($minNotice);
            if ($date->isToday() && Carbon::now()->addHours($minNotice)->gt($date->endOfDay())) {
                return response()->json([
                    'slots' => [],
                    'message' => "Minimum notice period is {$minNotice} hours. Please select a later date."
                ]);
            }
        }

        // Check same-day booking
        if (!$allowSameDay && $date->isToday()) {
            return response()->json([
                'slots' => [],
                'message' => 'Same-day bookings are not allowed. Please select a future date.'
            ]);
        }

        // Get work hours for this day
        $workHours = WorkHour::where('provider_id', $provider->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_closed', false)
            ->get();

        if ($workHours->isEmpty()) {
            return response()->json(['slots' => [], 'message' => 'The provider is closed on this day.']);
        }

        // Get existing appointments for this day
        $existingAppointments = Appointment::where('provider_id', $provider->id)
            ->whereDate('start_time', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->get();

        $slots = [];

        foreach ($workHours as $workHour) {
            $start = Carbon::parse($date->format('Y-m-d') . ' ' . $workHour->start_time);
            $end = Carbon::parse($date->format('Y-m-d') . ' ' . $workHour->end_time);

            // If the date is today, ensure start time meets minimum notice
            if ($date->isToday()) {
                $now = Carbon::now();
                $minStartTime = $now;
                
                if ($minNotice !== null) {
                    $minStartTime = $now->copy()->addHours($minNotice)->ceilMinutes(30);
                } else {
                    $minStartTime = $now->copy()->ceilMinutes(30);
                }
                
                if ($start->lt($minStartTime)) {
                    $start = $minStartTime;
                }
            }
            
            if (!$date->isToday() && $minNotice !== null) {
                $minSlotTime = Carbon::now()->addHours($minNotice);
                if ($start->lt($minSlotTime)) {
                    $start = $minSlotTime->copy()->ceilMinutes(30);
                }
            }

            $current = $start->copy();

            while ($current->copy()->addMinutes($totalDuration)->lte($end)) {
                $slotStart = $current->copy();
                $slotEnd = $current->copy()->addMinutes($totalDuration);
                
                if ($minNotice !== null) {
                    $minSlotTime = Carbon::now()->addHours($minNotice);
                    if ($slotStart->lt($minSlotTime)) {
                        $current->addMinutes(30);
                        continue;
                    }
                }

                // Check if slot is during break
                $isDuringBreak = false;
                if ($workHour->breaks) {
                    foreach ($workHour->breaks as $break) {
                        $breakStart = Carbon::parse($date->format('Y-m-d') . ' ' . $break['start']);
                        $breakEnd = Carbon::parse($date->format('Y-m-d') . ' ' . $break['end']);
                        if ($slotStart->lt($breakEnd) && $slotEnd->gt($breakStart)) {
                            $isDuringBreak = true;
                            break;
                        }
                    }
                }

                // Check if slot overlaps with existing appointment
                $isBooked = $existingAppointments->contains(function ($apt) use ($slotStart, $slotEnd, $maxBuffer) {
                    $aptEndWithBuffer = $apt->end_time->copy()->addMinutes($apt->buffer_time_minutes ?? 0);
                    $slotEndWithBuffer = $slotEnd->copy()->addMinutes($maxBuffer);
                    return $slotStart->lt($aptEndWithBuffer) && $slotEndWithBuffer->gt($apt->start_time);
                });

                if (!$isDuringBreak && !$isBooked) {
                    $slots[] = [
                        'start' => $slotStart->format('H:i'),
                        'end' => $slotEnd->format('H:i'),
                        'display' => $slotStart->format('g:i A'),
                        'datetime' => $slotStart->toIso8601String(),
                    ];
                }

                $current->addMinutes(30);
            }
        }

        return response()->json([
            'slots' => $slots,
            'message' => empty($slots) ? 'No available slots found for the selected services and date.' : null
        ]);
    }

    /**
     * Check user wallet balance by email (for widget payment options)
     */
    public function checkWallet(Request $request, $slug)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            // New user - no wallet yet
            return response()->json([
                'has_wallet' => false,
                'balance' => 0,
            ]);
        }

        $wallet = Wallet::firstOrCreate(['user_id' => $user->id]);
        
        return response()->json([
            'has_wallet' => true,
            'balance' => $wallet->available_balance,
            'user_id' => $user->id,
        ]);
    }

    /**
     * Initialize Paystack payment for widget booking
     */
    public function initializePayment(Request $request, $slug)
    {
        $request->validate([
            'provider_id' => 'required|exists:users,id',
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:services,id',
            'start_time' => 'required|date',
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:500',
        ]);

        $businessProfile = BusinessProfile::where('slug', $slug)->firstOrFail();
        
        if (!$businessProfile->widget_enabled) {
            return response()->json(['error' => 'Widget is not enabled.'], 403);
        }

        $provider = User::findOrFail($request->provider_id);
        $services = Service::whereIn('id', $request->service_ids)->get();
        
        if ($services->isEmpty()) {
            return response()->json(['error' => 'No valid services selected.'], 400);
        }

        $totalPrice = $services->sum('price');
        
        // Find or create user
        $result = UserService::findOrCreateGuestUser([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);
        
        $user = $result['user'];

        if (! $user->canBookProvider($provider)) {
            return response()->json([
                'error' => 'You cannot book your own business or a provider workspace you belong to.',
            ], 422);
        }
        
        // Generate unique reference for this booking payment
        $reference = 'WGT_' . now()->timestamp . '_' . $user->id . '_' . Str::random(8);
        
        // Store booking data temporarily (we'll create appointment after payment)
        // We can use session or cache - let's use cache with reference as key
        $bookingData = [
            'user_id' => $user->id,
            'provider_id' => $provider->id,
            'service_ids' => $request->service_ids,
            'start_time' => $request->start_time,
            'notes' => $request->notes,
            'total_price' => $totalPrice,
            'slug' => $slug,
            'is_new_user' => $result['is_new'],
            'plain_password' => $result['password'],
        ];
        
        // Store in cache for 30 minutes
        cache()->put("widget_booking_{$reference}", $bookingData, now()->addMinutes(30));
        
        // Initialize Paystack payment
        // Use a callback URL that will open in a new window (not iframe)
        $paystack = new PaystackService();
        $callbackUrl = route('widget.payment.callback', [
            'slug' => $slug,
            'reference' => $reference
        ]);
        
        $paymentData = $paystack->initializeTransaction([
            'email' => $user->email,
            'amount' => $totalPrice,
            'reference' => $reference,
            'callback_url' => $callbackUrl,
            'metadata' => [
                'booking_reference' => $reference,
                'user_id' => $user->id,
                'provider_id' => $provider->id,
                'source' => 'widget',
            ],
        ]);

        if (!$paymentData['success']) {
            return response()->json([
                'error' => $paymentData['message'] ?? 'Failed to initialize payment'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'authorization_url' => $paymentData['data']['authorization_url'],
            'access_code' => $paymentData['data']['access_code'],
            'reference' => $reference,
        ]);
    }

    /**
     * Handle booking from widget with wallet payment
     * This is called when user chooses "Pay from Wallet"
     */
    public function book(Request $request, $slug)
    {
        $businessProfile = BusinessProfile::where('slug', $slug)->firstOrFail();
        
        if (!$businessProfile->widget_enabled) {
            return response()->json(['error' => 'Widget is not enabled.'], 403);
        }

        // Get widget settings for payment configuration
        $widgetSettings = $businessProfile->widget_settings ?? [];
        $requirePayment = $widgetSettings['requirePayment'] ?? true;

        // Guest booking - always require guest info
        $request->validate([
            'provider_id' => 'required|exists:users,id',
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:services,id',
            'start_time' => 'required|date',
            'notes' => 'nullable|string|max:500',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'payment_method' => 'required|in:wallet,paystack',
        ]);

        // Find or create guest user
        $result = UserService::findOrCreateGuestUser([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);
        
        $user = $result['user'];
        $isNewUser = $result['is_new'];
        $plainPassword = $result['password'];

        $provider = User::findOrFail($request->provider_id);

        if (! $user->canBookProvider($provider)) {
            return response()->json([
                'error' => 'You cannot book your own business or a provider workspace you belong to.',
            ], 422);
        }

        $services = Service::whereIn('id', $request->service_ids)->get();
        
        if ($services->isEmpty()) {
            return response()->json(['error' => 'No valid services selected.'], 400);
        }
        
        $totalDuration = $services->sum('duration_minutes');
        $maxBuffer = $services->max('buffer_time_minutes') ?? 0;
        
        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($totalDuration);
        
        $totalPrice = $services->sum('price');

        // If payment required and wallet method, check balance
        if ($requirePayment && $request->payment_method === 'wallet') {
            $clientWallet = Wallet::firstOrCreate(['user_id' => $user->id]);
            if ($clientWallet->available_balance < $totalPrice) {
                return response()->json([
                    'error' => 'Insufficient wallet balance. Please use Paystack payment.',
                    'required' => $totalPrice,
                    'balance' => $clientWallet->balance,
                ], 400);
            }
        }

        // If payment not required, skip payment processing
        if (!$requirePayment) {
            return $this->createBookingWithoutPayment($user, $provider, $services, $startTime, $endTime, $maxBuffer, $totalPrice, $request->notes, $isNewUser, $plainPassword);
        }

        // Payment required - process based on method
        if ($request->payment_method === 'wallet') {
            return $this->createBookingWithWallet($user, $provider, $services, $startTime, $endTime, $maxBuffer, $totalPrice, $request->notes, $isNewUser, $plainPassword);
        }

        // Paystack payment is handled separately via initializePayment endpoint
        return response()->json([
            'error' => 'Please use the payment initialization endpoint for Paystack payments.'
        ], 400);
    }

    /**
     * Create booking with wallet payment
     */
    protected function createBookingWithWallet($user, $provider, $services, $startTime, $endTime, $maxBuffer, $totalPrice, $notes, $isNewUser, $plainPassword)
    {
        try {
            DB::beginTransaction();

            $settings = $provider->businessProfile->settings ?? [];
            $autoConfirm = ($settings['autoConfirm'] ?? $settings['auto_confirm'] ?? false);

            $appointment = Appointment::create([
                'client_id' => $user->id,
                'provider_id' => $provider->id,
                'service_id' => $services->first()->id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'buffer_time_minutes' => $maxBuffer,
                'status' => $autoConfirm ? 'confirmed' : 'pending',
                'price' => $totalPrice,
                'notes' => $notes,
                'provider_approved' => $autoConfirm,
                'provider_approved_at' => $autoConfirm ? now() : null,
            ]);

            $appointment->services()->sync($services->pluck('id'));

            // Hold payment in escrow
            $clientWallet = Wallet::firstOrCreate(['user_id' => $user->id]);
            $clientWallet->holdPayment($totalPrice, $appointment, "Payment held for widget booking");
            $appointment->update([
                'escrow_status' => 'held',
                'escrow_amount' => $totalPrice,
            ]);

            DB::commit();

            // Send emails
            Mail::to($user->email)->send(new NewBookingMail($appointment));
            if ($isNewUser && $plainPassword) {
                Mail::to($user->email)->send(new GuestAccountCreatedMail($user, $plainPassword));
            }

            return response()->json([
                'success' => true,
                'appointment' => [
                    'id' => $appointment->id,
                    'status' => $appointment->status,
                ],
                'message' => 'Appointment booked successfully!',
                'is_new_user' => $isNewUser,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create booking without payment (request only)
     */
    protected function createBookingWithoutPayment($user, $provider, $services, $startTime, $endTime, $maxBuffer, $totalPrice, $notes, $isNewUser, $plainPassword)
    {
        try {
            DB::beginTransaction();

            $appointment = Appointment::create([
                'client_id' => $user->id,
                'provider_id' => $provider->id,
                'service_id' => $services->first()->id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'buffer_time_minutes' => $maxBuffer,
                'status' => 'requested',
                'price' => $totalPrice,
                'notes' => $notes,
                'provider_approved' => false,
                'provider_approved_at' => null,
            ]);

            $appointment->services()->sync($services->pluck('id'));

            DB::commit();

            // Send emails
            Mail::to($user->email)->send(new NewBookingMail($appointment));
            if ($isNewUser && $plainPassword) {
                Mail::to($user->email)->send(new GuestAccountCreatedMail($user, $plainPassword));
            }

            return response()->json([
                'success' => true,
                'appointment' => [
                    'id' => $appointment->id,
                    'status' => $appointment->status,
                ],
                'message' => 'Booking request submitted successfully! The provider will review and confirm.',
                'is_new_user' => $isNewUser,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create appointment: ' . $e->getMessage()
            ], 500);
        }
    }

}
