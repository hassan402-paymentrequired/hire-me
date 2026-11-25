<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Jobs\DeleteGoogleCalendarEventJob;
use App\Jobs\SyncAppointmentToGoogleCalendarJob;
use App\Mail\AppointmentCancelledMail;
use App\Models\Appointment;
use App\Models\ClientAddress;
use App\Models\Report;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WorkHour;
use App\Notifications\AppointmentCompletedNotification;
use App\Notifications\AppointmentUpdatedNotification;
use App\Notifications\NewAppoinmentBookedNotification;
use App\Services\BookingAvailabilityService;
use App\Services\BookingCheckoutService;
use App\Services\BookingQuoteService;
use App\Services\PaystackService;
use App\Services\PromoCodeService;
use App\Support\ProviderSettings;
use App\Support\ServiceDeliveryMode;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    private const APPOINTMENT_CHANGE_CUTOFF_HOURS = 12;

    private const LATE_CANCELLATION_PENALTY_PERCENT = 10;

    private const CHECKOUT_CACHE_PREFIX = 'booking_checkout_';

    private const CHECKOUT_TTL_MINUTES = 60;

    public function __construct(
        private BookingAvailabilityService $availability,
        private BookingQuoteService $quotes,
        private PromoCodeService $promoCodes,
    ) {}

    public static function changeCutoffHours(): int
    {
        return self::APPOINTMENT_CHANGE_CUTOFF_HOURS;
    }

    public function index(Request $request)
    {
        $user = auth_user();
        $statusFilter = $request->get('status', 'active');

        $query = Appointment::where('client_id', $user->id)
            ->with(['provider.businessProfile.images', 'services'])
            ->withExists('review as has_review')
            ->orderBy('start_time', 'desc');

        if ($statusFilter === 'active') {
            $query->whereIn('status', ['pending', 'confirmed', 'pending_completion']);
        } elseif ($statusFilter === 'cancelled') {
            $query->where('status', 'cancelled');
        } elseif ($statusFilter === 'completed') {
            $query->where('status', 'completed');
        }
        // 'all' = no additional filter

        $bookings = $query->get();

        $bookings = $bookings->map(function ($booking) {
            $data = $booking->toArray();
            $bp = $booking->provider?->businessProfile;
            $logoUrl = null;
            if ($bp) {
                $logoImage = $bp->images->where('is_logo', true)->first();
                $path = $logoImage?->image_path ?? $bp->logo_path;
                if ($path) {
                    $logoUrl = \App\Services\FileUploadService::url($path, 'public');
                    if (! $logoUrl) {
                        $logoUrl = '/storage/'.ltrim($path, '/');
                    }
                }
            }
            $data['provider_logo_url'] = $logoUrl;

            return $data;
        });

        $statusCounts = Appointment::where('client_id', $user->id)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('client/bookings/index', [
            'bookings' => $bookings,
            'statusFilter' => $statusFilter,
            'counts' => [
                'active' => $statusCounts->only(['pending', 'confirmed', 'pending_completion'])->sum(),
                'completed' => (int) $statusCounts->get('completed', 0),
                'cancelled' => (int) $statusCounts->get('cancelled', 0),
                'all' => $statusCounts->sum(),
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->with(['provider.businessProfile', 'services'])
            ->findOrFail($id);

        // Safety: only allow editing future appointments and at least the cutoff window before start
        $hoursUntilStart = Carbon::now()->diffInHours($appointment->start_time, false);
        if ($hoursUntilStart < self::APPOINTMENT_CHANGE_CUTOFF_HOURS || $appointment->start_time->isPast()) {
            return redirect()
                ->route('client.bookings.show', $appointment->id)
                ->with('error-toast', 'You can only edit this appointment up to '.self::APPOINTMENT_CHANGE_CUTOFF_HOURS.' hours before it starts.');
        }

        $request->validate([
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:services,id',
            'start_time' => 'required|date',
            'notes' => 'nullable|string|max:500',
            'team_member_id' => 'nullable|exists:team_members,id',
            'service_team_members' => 'nullable|array',
            'service_team_members.*' => 'nullable|string',
            'client_address_id' => 'nullable|exists:client_addresses,id',
            'use_business_address' => 'nullable|boolean',
            'set_address_active' => 'nullable|boolean',
        ]);

        $provider = $appointment->provider->load('businessProfile');
        $serviceIds = array_values($request->service_ids);
        $segmentTeamMembers = $this->availability->resolveTeamMembers(
            $provider->id,
            $serviceIds,
            (array) $request->input('service_team_members', []),
            $request->team_member_id,
        );
        if ($segmentTeamMembers === null) {
            return back()->withErrors([
                'team_member_id' => 'The selected team member is no longer available.',
            ]);
        }

        $teamMemberIds = collect($segmentTeamMembers)->map(fn (?TeamMember $member) => $member?->id)->values()->all();
        $uniquePros = array_unique(array_filter($teamMemberIds));
        $sharedTeamMemberId = count($uniquePros) === 1 ? reset($uniquePros) : null;

        $settings = ProviderSettings::resolve($provider->businessProfile->settings ?? []);
        $providerBufferTimeMinutes = (int) ($settings['bufferTime'] ?? 0);

        if ($response = $this->validateServiceLocationForBooking($request, $settings)) {
            return $response;
        }

        $services = Service::whereIn('id', $request->service_ids)->get();

        $originalPrice = (float) $appointment->price;
        $totalPrice = (float) $services->sum('price');
        $totalDuration = $services->sum('duration_minutes');
        $maxBuffer = ($services->max('buffer_time_minutes') ?? 0) + $providerBufferTimeMinutes;

        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($totalDuration);

        $allowOffHoursRequests = (bool) ($settings['allowOffHoursRequests'] ?? false);
        $inWorkHours = $this->isWithinProviderWorkHours($provider->id, $startTime, $endTime);
        if (! $inWorkHours && ! $allowOffHoursRequests) {
            return back()->with('error-toast', 'The selected time is outside the provider’s working hours.');
        }

        if ($this->availability->conflicts($provider->id, $startTime, $endTime, $maxBuffer, $teamMemberIds, $appointment->id)) {
            return back()->with('error-toast', 'This time slot was just booked. Please select another time.');
        }

        $clientWallet = Wallet::firstOrCreate(['user_id' => auth()->id()]);

        try {
            DB::beginTransaction();

            $changesSummary = [];

            // Adjust escrow only by the difference, if payment is still held
            if ($appointment->escrow_status === 'held' && $originalPrice !== $totalPrice) {
                $priceDifference = $totalPrice - $originalPrice;

                if ($priceDifference > 0) {
                    // Client needs to pay more
                    if (! $clientWallet->hasSufficientBalance($priceDifference)) {
                        DB::rollBack();

                        return back()
                            ->with('error-toast', 'Insufficient wallet balance to cover the increased total. Please top up your wallet and try again.');
                    }

                    $clientWallet->holdPayment(
                        $priceDifference,
                        $appointment,
                        'Additional payment held for updated appointment',
                    );

                    $appointment->escrow_amount = ((float) $appointment->escrow_amount) + $priceDifference;
                    $appointment->save();
                } else {
                    // Refund the difference
                    $refundAmount = abs($priceDifference);
                    if ($appointment->escrow_amount >= $refundAmount) {
                        $clientWallet->refundEscrow(
                            $refundAmount,
                            $appointment,
                            'Partial refund for updated appointment (price reduction)',
                        );
                        $appointment->escrow_amount = ((float) $appointment->escrow_amount) - $refundAmount;
                        $appointment->save();
                    }
                }
            }

            $autoConfirm = ($settings['autoConfirm'] ?? $settings['auto_confirm'] ?? false);
            if (! $inWorkHours && $allowOffHoursRequests) {
                $autoConfirm = false;
            }
            $originalAppointment = $appointment->replicate();
            $originalServiceIds = $appointment->services->pluck('id')->toArray();

            $appointment->update([
                'start_time' => $startTime,
                'end_time' => $endTime,
                'buffer_time_minutes' => $maxBuffer,
                'status' => $autoConfirm ? 'confirmed' : 'pending',
                'price' => $totalPrice,
                'notes' => $request->notes,
                'team_member_id' => $sharedTeamMemberId,
                'provider_approved' => $autoConfirm,
                'provider_approved_at' => $autoConfirm ? now() : null,
                ...$this->resolveAppointmentServiceAddressData(
                    auth_user(),
                    ...$this->serviceAddressInputsForBooking($request, $settings),
                ),
            ]);
            $appointment->services()->sync(
                collect($segmentTeamMembers)->mapWithKeys(fn (?TeamMember $member, string $serviceId) => [
                    $serviceId => ['team_member_id' => $member?->id],
                ])->all(),
            );

            $message = 'Appointment updated successfully!';

            // Build change summary for provider notification
            $newServiceIds = $request->service_ids;
            sort($originalServiceIds);
            sort($newServiceIds);

            if ($originalServiceIds !== $newServiceIds) {
                $addedServiceIds = array_diff($newServiceIds, $originalServiceIds);
                $removedServiceIds = array_diff($originalServiceIds, $newServiceIds);

                $addedServices = $services->whereIn('id', $addedServiceIds)->pluck('name')->implode(', ');
                $removedServices = Service::whereIn('id', $removedServiceIds)->pluck('name')->implode(', ');

                if ($addedServices) {
                    $changesSummary[] = "Client added service(s): {$addedServices}.";
                }
                if ($removedServices) {
                    $changesSummary[] = "Client removed service(s): {$removedServices}.";
                }
            }

            if (! $originalAppointment->start_time->equalTo($startTime)) {
                $changesSummary[] = sprintf(
                    'Start time changed from %s to %s.',
                    $originalAppointment->start_time->format('M j, Y g:i A'),
                    $startTime->format('M j, Y g:i A'),
                );
            }

            if ($originalAppointment->notes !== $request->notes) {
                $changesSummary[] = 'Appointment notes were updated.';
            }

            if ($originalPrice !== $totalPrice) {
                $changesSummary[] = sprintf(
                    'Total price changed from ₦%s to ₦%s.',
                    number_format($originalPrice, 2),
                    number_format($totalPrice, 2),
                );
            }

            DB::commit();

            SyncAppointmentToGoogleCalendarJob::dispatch($appointment->id);

            if (! empty($changesSummary)) {
                $appointment->provider->notify(new AppointmentUpdatedNotification($appointment, $changesSummary));
            }

            return redirect()
                ->route('client.bookings.show', $appointment->id)
                ->with('success-toast', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Appointment update failed', ['error' => $e->getMessage()]);

            return back()->with('error-toast', 'We could not update your appointment. Please try again.');
        }
    }

    public function show($id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->with(['provider.businessProfile', 'services' => fn ($query) => $query->withPivot('team_member_id'), 'review', 'teamMember.user'])
            ->findOrFail($id);

        $parent = $appointment->recurrence_parent_id
            ? Appointment::find($appointment->recurrence_parent_id)
            : ($appointment->isRecurrenceParent() ? $appointment : null);

        $hasFutureRecurrences = $parent && ! $parent->recurrence_stopped_at
            ? Appointment::where('recurrence_parent_id', $parent->id)
                ->where('start_time', '>', now())
                ->where('status', '!=', 'cancelled')
                ->exists()
            : false;

        $providerId = $appointment->provider_id;
        $settings = ProviderSettings::resolve($appointment->provider->businessProfile->settings ?? []);
        $serviceTeamMembers = [];
        foreach ($appointment->services as $service) {
            $proId = $service->pivot->team_member_id ?? $appointment->team_member_id;
            $serviceTeamMembers[$service->id] = $proId ? (string) $proId : '';
        }

        return Inertia::render('client/bookings/show', [
            'booking' => [
                ...$appointment->toArray(),
                'service_address_source' => $appointment->service_address_source,
                'service_address_label' => $appointment->service_address_label,
                'service_address' => $appointment->service_address,
                'service_address_city' => $appointment->service_address_city,
                'service_address_state' => $appointment->service_address_state,
            ],
            'hasFutureRecurrences' => $hasFutureRecurrences,
            'providerRating' => [
                'average' => round((float) $appointment->provider->reviewsReceived()->avg('rating'), 1),
                'count' => $appointment->provider->reviewsReceived()->count(),
            ],
            'policy' => [
                'changeCutoffHours' => self::APPOINTMENT_CHANGE_CUTOFF_HOURS,
                'latePenaltyPercent' => self::LATE_CANCELLATION_PENALTY_PERCENT,
            ],
            'rescheduleOptions' => [
                'serviceTeamMembers' => $serviceTeamMembers,
                'settings' => $settings,
                'closedDays' => $this->closedWeekdays($providerId),
                'popularHours' => $this->popularBookingHours($providerId),
            ],
            'openReschedule' => (bool) session('openReschedule'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'provider_id' => 'required|exists:users,id',
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:services,id',
            'start_time' => 'required|date',
            'payment_option' => 'nullable|in:online,offline,card',
            'notes' => 'nullable|string|max:500',
            'team_member_id' => 'nullable|exists:team_members,id',
            'service_team_members' => 'nullable|array',
            'service_team_members.*' => 'nullable|string',
            'promo_code' => 'nullable|string|max:32',
            'recurrence_pattern' => 'nullable|in:weekly,bi_weekly,monthly',
            'recurrence_end_date' => 'nullable|date|after:today',
            'recurrence_count' => 'nullable|integer|min:2|max:52',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'client_address_id' => 'nullable|exists:client_addresses,id',
            'use_business_address' => 'nullable|boolean',
            'set_address_active' => 'nullable|boolean',
        ], [
            'provider_id.required' => 'Please select a provider.',
            'provider_id.exists' => 'The selected provider is no longer available.',
            'service_ids.required' => 'Please select at least one service to book.',
            'service_ids.*.exists' => 'One or more selected services are no longer available. Please refresh and try again.',
            'start_time.required' => 'Please select a date and time for your appointment.',
            'start_time.date' => 'The selected time is invalid. Please choose another slot.',
        ]);

        return $this->placeBooking($request);
    }

    /**
     * Paystack sends the client back here after a card or bank transfer payment.
     * The money lands in their wallet first, then the booking is placed from it.
     */
    public function checkoutCallback(Request $request)
    {
        $reference = (string) ($request->query('reference') ?? $request->query('trxref'));
        $checkout = $reference !== '' ? cache()->get(self::CHECKOUT_CACHE_PREFIX.$reference) : null;

        if (! $checkout || $checkout['client_id'] !== auth()->id()) {
            return to_route('client.bookings.index')->with('error-toast', 'This payment session has expired. If you were charged, the money is in your wallet.');
        }

        $bookingPageUrl = route('marketplace.booking', ['slug' => $checkout['slug']]);
        $checkouts = app(BookingCheckoutService::class);

        if (! $checkouts->isCredited($reference)) {
            $verification = app(PaystackService::class)->verifyTransaction($reference);

            if (! $verification['success'] || ($verification['status'] ?? null) !== 'success') {
                return redirect($bookingPageUrl)->with('error-toast', 'Your payment didn’t go through, so nothing was booked. Please try again.');
            }

            $checkouts->creditWallet(auth()->id(), $reference, (float) $verification['amount']);
        }

        cache()->forget(self::CHECKOUT_CACHE_PREFIX.$reference);

        $bookingRequest = Request::create($bookingPageUrl, 'POST', [...$checkout['payload'], 'payment_option' => 'online']);
        $error = null;

        try {
            $response = $this->placeBooking($bookingRequest);
        } catch (ValidationException $exception) {
            $response = null;
            $error = collect($exception->errors())->flatten()->first();
        }

        if ($response instanceof RedirectResponse && str_contains($response->getTargetUrl(), '/booked')) {
            return $response;
        }

        $error ??= session('error-toast') ?? session('errors')?->first() ?? 'We couldn’t place the booking.';

        return redirect($bookingPageUrl)->with('error-toast', 'Your payment is safe in your wallet. '.$error);
    }

    protected function placeBooking(Request $request)
    {
        $provider = User::with('businessProfile')->findOrFail($request->provider_id);
        $client = auth_user();

        if (! $client->canBookProvider($provider)) {
            return back()->with('error-toast', 'You cannot book your own business or a provider workspace you belong to.');
        }

        $serviceIds = array_values((array) $request->service_ids);
        $segmentTeamMembers = $this->availability->resolveTeamMembers(
            $provider->id,
            $serviceIds,
            (array) $request->input('service_team_members', []),
            $request->team_member_id,
        );
        if ($segmentTeamMembers === null) {
            return back()->withErrors([
                'team_member_id' => 'The selected team member is no longer available.',
            ]);
        }
        $teamMemberIds = collect($segmentTeamMembers)->map(fn (?TeamMember $member) => $member?->id)->values()->all();
        $sharedTeamMemberId = count(array_unique($teamMemberIds)) === 1 ? $teamMemberIds[0] : null;

        $settings = ProviderSettings::resolve($provider->businessProfile->settings ?? []);

        if ($response = $this->validateServiceLocationForBooking($request, $settings)) {
            return $response;
        }

        $maxPerWeek = $settings['max_bookings_per_week'] ?? null;
        $maxPerMonth = $settings['max_bookings_per_month'] ?? null;
        $maxDaily = $settings['maxDaily'] ?? null;
        $advanceBookingDays = (int) ($settings['advanceBooking'] ?? 30); // days
        $minNoticeHours = isset($settings['minNotice']) ? (int) $settings['minNotice'] : null; // hours
        $allowSameDay = (bool) ($settings['allowSameDay'] ?? false);
        $providerBufferTimeMinutes = (int) ($settings['bufferTime'] ?? 0);
        $allowOffHoursRequests = (bool) ($settings['allowOffHoursRequests'] ?? false);
        $acceptOnlinePayment = (bool) ($settings['accept_online_payment'] ?? true);
        $acceptOfflineBooking = (bool) ($settings['accept_offline_booking'] ?? false);

        $paymentOption = $request->input('payment_option');
        if (! $paymentOption) {
            $paymentOption = $acceptOnlinePayment ? 'online' : 'offline';
        }

        if (in_array($paymentOption, ['online', 'card'], true) && ! $acceptOnlinePayment) {
            return back()->withErrors([
                'payment_option' => 'This provider is not accepting online payment for bookings right now.',
            ]);
        }

        if ($paymentOption === 'offline' && ! $acceptOfflineBooking) {
            return back()->withErrors([
                'payment_option' => 'This provider is not accepting unpaid booking requests right now.',
            ]);
        }

        if ($maxPerWeek) {
            $weekStart = Carbon::now()->startOfWeek();
            $weekEnd = Carbon::now()->endOfWeek();
            $weekCount = Appointment::where('client_id', auth()->id())
                ->where('provider_id', $request->provider_id)
                ->whereBetween('start_time', [$weekStart, $weekEnd])
                ->where('status', '!=', 'cancelled')
                ->count();
            if ($weekCount >= $maxPerWeek) {
                return to_route('client.bookings.index')->with('error-toast', "You have reached the maximum of {$maxPerWeek} bookings per week with this provider.");
            }
        }

        if ($maxPerMonth) {
            $monthStart = Carbon::now()->startOfMonth();
            $monthEnd = Carbon::now()->endOfMonth();
            $monthCount = Appointment::where('client_id', auth()->id())
                ->where('provider_id', $request->provider_id)
                ->whereBetween('start_time', [$monthStart, $monthEnd])
                ->where('status', '!=', 'cancelled')
                ->count();
            if ($monthCount >= $maxPerMonth) {
                return to_route('client.bookings.index')->with('error-toast', "You have reached the maximum of {$maxPerMonth} bookings per month with this provider.");
            }
        }

        $services = Service::whereIn('id', $serviceIds)
            ->where('provider_id', $provider->id)
            ->get()
            ->sortBy(fn (Service $service) => array_search($service->id, $serviceIds, true))
            ->values();

        if ($services->count() !== count(array_unique($serviceIds))) {
            return back()->withErrors([
                'service_ids' => 'One or more selected services are no longer available. Please refresh and try again.',
            ]);
        }

        [$serviceClientAddressId, $serviceAtBusinessAddress] = $this->serviceAddressInputsForBooking($request, $settings);
        $promoCode = $this->promoCodes->resolve($provider->id, $request->input('promo_code'));
        // Prices come from the server so the client cannot tamper with discounts or fees.
        $quote = $this->quotes->quote(
            $services,
            $settings,
            isRecurring: (bool) $request->recurrence_pattern,
            atClientLocation: filled($serviceClientAddressId) || $serviceAtBusinessAddress,
            promoCode: $promoCode,
        );
        $originalPrice = $quote['subtotal'];
        $discountPercent = $quote['recurring_discount_percent'];
        $totalPrice = $quote['total'];
        $totalDuration = $services->sum('duration_minutes');
        $maxBuffer = ($services->max('buffer_time_minutes') ?? 0) + $providerBufferTimeMinutes;

        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($totalDuration);

        // Enforce provider booking rules server-side (don't rely on the UI).
        $maxDate = Carbon::now()->addDays($advanceBookingDays)->endOfDay();
        if ($startTime->gt($maxDate)) {
            return back()->with('error-toast', "Bookings can only be made up to {$advanceBookingDays} days in advance.");
        }

        if (! $allowSameDay && $startTime->isToday()) {
            return back()->with('error-toast', 'Same-day bookings are not allowed for this provider.');
        }

        if ($minNoticeHours !== null) {
            $minStart = Carbon::now()->addHours($minNoticeHours);
            if ($startTime->lt($minStart)) {
                return back()->with('error-toast', "Minimum notice period is {$minNoticeHours} hours. Please select a later time.");
            }
        }

        if ($maxDaily) {
            $dailyCount = Appointment::where('provider_id', $request->provider_id)
                ->whereDate('start_time', $startTime->toDateString())
                ->where('status', '!=', 'cancelled')
                ->count();
            if ($dailyCount >= (int) $maxDaily) {
                return back()->with('error-toast', 'This provider has reached the maximum number of appointments for that day. Please choose another day.');
            }
        }

        $inWorkHours = $this->isWithinProviderWorkHours($provider->id, $startTime, $endTime);
        if (! $inWorkHours && ! $allowOffHoursRequests) {
            return back()->with('error-toast', 'The selected time is outside the provider’s working hours.');
        }

        if ($this->availability->conflicts($provider->id, $startTime, $endTime, $maxBuffer, $teamMemberIds)) {
            return back()->with('error-toast', 'This time slot was just booked. Please select another time.');
        }

        if ($paymentOption === 'card') {
            return $this->startCardCheckout($request, $client, $provider, $totalPrice);
        }

        $clientWallet = null;
        if ($paymentOption === 'online') {
            $clientWallet = Wallet::firstOrCreate(['user_id' => auth()->id()]);

            if (! $clientWallet->hasSufficientBalance($totalPrice)) {
                return redirect()->route('marketplace.booking', ['slug' => $provider->businessProfile->slug])
                    ->with('error-toast', 'Insufficient wallet balance. Please top up your wallet with at least ₦'.number_format($totalPrice, 2).' to book this appointment.')
                    ->with('insufficient_balance', true)
                    ->with('required_amount', $totalPrice);
            }
        }

        try {
            DB::beginTransaction();

            $autoConfirm = ($settings['autoConfirm'] ?? $settings['auto_confirm'] ?? false);
            if (! $inWorkHours && $allowOffHoursRequests) {
                $autoConfirm = false;
            }
            if ($paymentOption === 'offline') {
                $autoConfirm = false;
            }
            $appointmentData = [
                'client_id' => auth()->id(),
                'provider_id' => $request->provider_id,
                'service_id' => $services->first()->id,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'buffer_time_minutes' => $maxBuffer,
                'status' => $autoConfirm ? 'confirmed' : 'pending',
                'price' => $totalPrice,
                'home_service_fee' => $quote['home_service_fee'],
                'promo_code_id' => $promoCode?->id,
                'promo_discount_amount' => $quote['promo_discount'],
                'payment_method' => $paymentOption,
                'notes' => $request->notes,
                'team_member_id' => $sharedTeamMemberId,
                'provider_approved' => $autoConfirm,
                'provider_approved_at' => $autoConfirm ? now() : null,
                ...$this->resolveAppointmentServiceAddressData(
                    $client,
                    ...$this->serviceAddressInputsForBooking($request, $settings),
                ),
            ];

            // Add recurrence data if provided
            if ($request->recurrence_pattern) {
                $appointmentData['recurrence_pattern'] = $request->recurrence_pattern;
                $appointmentData['original_price'] = $originalPrice;
                $appointmentData['discount_percent'] = $discountPercent;

                if ($request->recurrence_end_date) {
                    $appointmentData['recurrence_end_date'] = Carbon::parse($request->recurrence_end_date);
                }

                if ($request->recurrence_count) {
                    $appointmentData['recurrence_count'] = $request->recurrence_count;
                }
            }

            if ($promoCode) {
                $this->promoCodes->redeem($promoCode);
            }

            $appointment = Appointment::create($appointmentData);
            $appointment->services()->attach(
                collect($segmentTeamMembers)->map(fn (?TeamMember $member) => ['team_member_id' => $member?->id])->all()
            );

            $message = $request->recurrence_pattern
                ? 'Recurring appointment booked successfully! Future appointments will be created automatically.'
                : 'Appointment booked successfully!';

            if ($paymentOption === 'online') {
                $escrowTransaction = $clientWallet->holdPayment($totalPrice, $appointment, 'Payment held for appointment booking (pending dual approval)');
                $appointment->update([
                    'escrow_amount' => $totalPrice,
                    'escrow_status' => 'held',
                    'escrow_transaction_id' => $escrowTransaction->id,
                ]);
            } else {
                $message = $request->recurrence_pattern
                    ? 'Recurring booking request submitted successfully. Future appointments will stay pending until reviewed.'
                    : 'Booking request submitted successfully. The provider will review it before confirming.';
            }

            DB::commit();

            SyncAppointmentToGoogleCalendarJob::dispatch($appointment->id);

            $appointment->provider->notify(new NewAppoinmentBookedNotification($appointment));

            return redirect()->route('client.bookings.booked', $appointment->id)
                ->with('success-toast', $message);
        } catch (ValidationException $e) {
            DB::rollBack();

            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Appointment booking failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            $userMessage = match (true) {
                str_contains($e->getMessage(), 'Insufficient balance') => 'Your wallet balance is too low to complete this booking. Please top up your wallet and try again.',
                str_contains($e->getMessage(), 'integrity constraint') => 'This time slot may have just been booked by someone else. Please select a different slot and try again.',
                str_contains($e->getMessage(), 'Connection') => 'We could not process your booking right now due to a connection issue. Please try again in a moment.',
                default => 'We could not complete your booking. Please check your wallet balance, ensure you have selected a valid time slot, and try again. If the problem persists, contact support.',
            };

            $redirectParams = ['slug' => $provider->businessProfile->slug];
            if (! empty($request->service_ids)) {
                $redirectParams['service_ids'] = is_array($request->service_ids)
                    ? implode(',', $request->service_ids)
                    : $request->service_ids;
            }
            if ($request->reschedule_id) {
                $redirectParams['reschedule_id'] = $request->reschedule_id;
            }

            return redirect()->route('marketplace.booking', $redirectParams)
                ->with('error-toast', $userMessage);
        }
    }

    public function cancel(Request $request, $id)
    {
        $request->validate(['reason' => 'nullable|string|max:500']);

        $appointment = Appointment::where('client_id', auth()->id())
            ->where('status', '!=', 'cancelled')
            ->findOrFail($id);

        if ($appointment->start_time->isPast()) {
            return back()->with('error-toast', 'This appointment has already started or passed and can no longer be cancelled.');
        }

        $hoursUntilAppointment = Carbon::now()->diffInHours($appointment->start_time, false);
        $isLateCancellation = $hoursUntilAppointment < self::APPOINTMENT_CHANGE_CUTOFF_HOURS && $hoursUntilAppointment > 0;

        try {
            DB::beginTransaction();

            // Get the parent appointment if this is a child
            $parentAppointment = $appointment->recurrence_parent_id
                ? Appointment::find($appointment->recurrence_parent_id)
                : ($appointment->isRecurrenceParent() ? $appointment : null);

            // Cancel this appointment
            $this->cancelSingleAppointment($appointment, $isLateCancellation);

            if ($request->filled('reason')) {
                $appointment->update(['cancellation_reason' => $request->input('reason')]);
            }

            // If this is a parent recurring appointment, cancel all future children
            if ($parentAppointment && $parentAppointment->id === $appointment->id) {
                $futureChildren = Appointment::where('recurrence_parent_id', $appointment->id)
                    ->where('start_time', '>', now())
                    ->where('status', '!=', 'cancelled')
                    ->get();

                foreach ($futureChildren as $child) {
                    $this->cancelSingleAppointment($child, false); // Future appointments are always early cancellation
                }

                DB::commit();

                DeleteGoogleCalendarEventJob::dispatch($appointment->id);
                foreach ($futureChildren as $child) {
                    DeleteGoogleCalendarEventJob::dispatch($child->id);
                }

                return back()->with('success-toast', 'Recurring appointment series cancelled successfully. All future appointments have been cancelled.');
            }

            DB::commit();

            DeleteGoogleCalendarEventJob::dispatch($appointment->id);

            // Send email to provider
            Mail::to($appointment->provider->email)->queue(new AppointmentCancelledMail($appointment, 'client'));

            $message = $isLateCancellation && $appointment->escrow_status === 'forfeited'
                ? 'Appointment cancelled. Because you cancelled less than '.self::APPOINTMENT_CHANGE_CUTOFF_HOURS.' hours before the appointment, a '.self::LATE_CANCELLATION_PENALTY_PERCENT.'% late cancellation fee was applied. The remainder has been refunded to your wallet.'
                : 'Appointment cancelled successfully. Your refund has been processed.';

            return back()->with('success-toast', $message);
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error-toast', 'Failed to cancel appointment: '.$e->getMessage());
        }
    }

    protected function resolveAppointmentServiceAddressData(
        User $client,
        ?string $clientAddressId,
        bool $useBusinessAddress,
        bool $setAddressActive = true,
    ): array {
        $selectedClientAddress = null;
        if ($clientAddressId) {
            $selectedClientAddress = ClientAddress::query()
                ->where('user_id', $client->id)
                ->find($clientAddressId);

            if (! $selectedClientAddress) {
                abort(422, 'The selected address is no longer available.');
            }
        }

        $businessAddressProfile = null;
        if ($useBusinessAddress) {
            $businessAddressProfile = $client->managedProvider()?->businessProfile;

            if (! $businessAddressProfile?->address) {
                abort(422, 'Your business address is not available right now.');
            }
        }

        if ($selectedClientAddress) {
            if ($setAddressActive) {
                ClientAddress::query()
                    ->where('user_id', $client->id)
                    ->where('id', '!=', $selectedClientAddress->id)
                    ->update(['is_active' => false]);

                $selectedClientAddress->update(['is_active' => true]);
            }

            return [
                'service_address_source' => 'client_address',
                'service_address_label' => $selectedClientAddress->label,
                'service_address' => $selectedClientAddress->address,
                'service_address_city' => $selectedClientAddress->city,
                'service_address_state' => $selectedClientAddress->state,
                'service_address_latitude' => $selectedClientAddress->latitude,
                'service_address_longitude' => $selectedClientAddress->longitude,
            ];
        }

        if ($businessAddressProfile?->address) {
            return [
                'service_address_source' => 'business_address',
                'service_address_label' => $businessAddressProfile->business_name ?: 'Business address',
                'service_address' => $businessAddressProfile->address,
                'service_address_city' => $businessAddressProfile->city,
                'service_address_state' => $businessAddressProfile->state,
                'service_address_latitude' => $businessAddressProfile->latitude,
                'service_address_longitude' => $businessAddressProfile->longitude,
            ];
        }

        return [
            'service_address_source' => null,
            'service_address_label' => null,
            'service_address' => null,
            'service_address_city' => null,
            'service_address_state' => null,
            'service_address_latitude' => null,
            'service_address_longitude' => null,
        ];
    }

    /**
     * Cancel remaining future recurrences in a series (keeps completed/past appointments intact)
     */
    public function cancelRemainingRecurrences($id)
    {
        $user = auth_user();
        $appointment = Appointment::where('client_id', $user->id)
            ->findOrFail($id);

        $parent = $appointment->recurrence_parent_id
            ? Appointment::where('client_id', $user->id)->find($appointment->recurrence_parent_id)
            : ($appointment->isRecurrenceParent() ? $appointment : null);

        if (! $parent) {
            return back()->with('error-toast', 'This is not a recurring appointment.');
        }

        $futureChildren = Appointment::where('recurrence_parent_id', $parent->id)
            ->where('start_time', '>', now())
            ->where('status', '!=', 'cancelled')
            ->get();

        if ($futureChildren->isEmpty()) {
            return back()->with('success-toast', 'No future appointments to cancel in this series.');
        }

        try {
            DB::beginTransaction();

            foreach ($futureChildren as $child) {
                $this->cancelSingleAppointment($child, false);
            }

            $parent->update(['recurrence_stopped_at' => now()]);

            DB::commit();

            foreach ($futureChildren as $child) {
                DeleteGoogleCalendarEventJob::dispatch($child->id);
            }

            return back()->with('success-toast', 'Remaining recurring appointments have been cancelled. You will receive a refund for each.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error-toast', 'Failed to cancel: '.$e->getMessage());
        }
    }

    /**
     * Cancel a single appointment and handle upfront payment refund
     */
    protected function cancelSingleAppointment(Appointment $appointment, bool $isLateCancellation): void
    {
        $appointment->update(['status' => 'cancelled', 'cancelled_by' => 'client']);

        // Handle payment refund/penalty
        // Only process if payment is held in escrow
        if ($appointment->escrow_status === 'held' && $appointment->escrow_amount > 0) {
            $clientWallet = Wallet::firstOrCreate(['user_id' => auth()->id()]);

            // System policy: 10% forfeited if cancelled within the cutoff window
            $cancellationPenaltyPercent = self::LATE_CANCELLATION_PENALTY_PERCENT;

            if ($isLateCancellation && $cancellationPenaltyPercent > 0) {
                // Apply penalty: forfeit percentage to provider, refund rest
                $penaltyAmount = ($appointment->escrow_amount * $cancellationPenaltyPercent) / 100;
                $refundAmount = $appointment->escrow_amount - $penaltyAmount;

                if ($penaltyAmount > 0) {
                    $clientWallet->forfeitEscrow($penaltyAmount, $appointment, 'Late cancellation penalty');
                }
                if ($refundAmount > 0) {
                    $clientWallet->refundEscrow($refundAmount, $appointment, 'Partial refund after late cancellation');
                }
                $appointment->update(['escrow_status' => 'forfeited']);
            } else {
                // Full refund for early cancellation
                $clientWallet->refundEscrow($appointment->escrow_amount, $appointment, 'Full refund for cancelled appointment');
                $appointment->update(['escrow_status' => 'refunded']);
            }
        }
    }

    public function complete(Request $request, $id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->whereIn('status', ['confirmed', 'pending_completion'])
            ->findOrFail($id);

        // Safety check: only allow completion after the appointment has ended
        if ($appointment->end_time && $appointment->end_time->isFuture()) {
            return back()->with('error-toast', 'You can only mark an appointment as completed after it has ended.');
        }

        try {
            DB::beginTransaction();

            $user = auth_user();

            // Mark client approval
            $appointment->update([
                'client_approved' => true,
                'client_approved_at' => now(),
            ]);

            // Refresh to get latest values
            $appointment->refresh();

            // New rule: when client marks as completed, release funds immediately
            if ($appointment->escrow_status === 'held' && $appointment->escrow_amount > 0) {
                $clientWallet = Wallet::firstOrCreate(['user_id' => $user->id]);
                $clientWallet->releaseHeldPayment(
                    $appointment->escrow_amount,
                    $appointment,
                    'Payment released after client completion'
                );

                $appointment->update([
                    'escrow_status' => 'released',
                    'payment_released_at' => now(),
                ]);
            }

            // Mark appointment as completed for the client
            $appointment->update(['status' => 'completed']);

            if (isset($request->rating)) {
                $appointment->review()->create([
                    'user_id' => $user->id,
                    'provider_id' => $appointment->provider_id,
                    'rating' => $request->rating,
                    'comment' => $request->comment,
                ]);
            }

            DB::commit();

            $appointment->client->notify(new AppointmentCompletedNotification($appointment));

            return back()->with('success-toast', 'Appointment completed and payment released to provider.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to complete appointment', ['error' => $e->getMessage()]);

            return back()->with('error-toast', 'Failed to complete appointment: '.$e->getMessage());
        }
    }

    public function reschedule($id): RedirectResponse
    {
        $appointment = Appointment::where('client_id', auth()->id())->findOrFail($id);

        return redirect()
            ->route('client.bookings.show', $appointment->id)
            ->with('openReschedule', true);
    }

    public function edit($id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->with(['provider.businessProfile', 'services' => fn ($query) => $query->withPivot('team_member_id')])
            ->findOrFail($id);

        // Only allow editing for future appointments and at least the cutoff window before start
        $hoursUntilStart = Carbon::now()->diffInHours($appointment->start_time, false);
        if ($hoursUntilStart < self::APPOINTMENT_CHANGE_CUTOFF_HOURS || $appointment->start_time->isPast()) {
            return redirect()
                ->route('client.bookings.show', $appointment->id)
                ->with('error-toast', 'You can only edit this appointment up to '.self::APPOINTMENT_CHANGE_CUTOFF_HOURS.' hours before it starts.');
        }

        $provider = $appointment->provider;
        $businessProfile = $provider->businessProfile;

        $serviceTeamMembers = [];
        foreach ($appointment->services as $service) {
            $proId = $service->pivot->team_member_id ?? $appointment->team_member_id;
            $serviceTeamMembers[$service->id] = $proId ? (string) $proId : '';
        }

        $wallet = Wallet::firstOrCreate(['user_id' => auth()->id()]);

        $services = $provider->services()
            ->where('status', 'active')
            ->with('serviceCategory')
            ->get();

        return Inertia::render('client/bookings/edit', [
            'appointment' => [
                'id' => $appointment->id,
                'start_time' => $appointment->start_time->toIso8601String(),
                'end_time' => $appointment->end_time?->toIso8601String(),
                'notes' => $appointment->notes,
                'price' => (float) $appointment->price,
                'service_ids' => $appointment->services->pluck('id')->values()->all(),
                'payment_method' => $appointment->payment_method,
                'escrow_status' => $appointment->escrow_status,
            ],
            'serviceTeamMembers' => $serviceTeamMembers,
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'businessName' => $businessProfile->business_name,
                'address' => $businessProfile->address,
                'slug' => $businessProfile->slug,
                'canBook' => true,
                'logo' => $businessProfile->images->where('is_logo', true)->first()?->image_path
                    ? \App\Services\FileUploadService::url($businessProfile->images->where('is_logo', true)->first()->image_path, 'public')
                    : null,
            ],
            'services' => $services->map(fn (Service $service): array => [
                'id' => $service->id,
                'name' => $service->name,
                'description' => $service->description,
                'duration' => $service->duration_minutes,
                'price' => $service->price,
                'categoryId' => $service->service_category_id,
                'categoryName' => $service->serviceCategory?->name,
            ])->values(),
            'walletBalance' => (float) $wallet->balance,
            'teamMembers' => $this->eligibleTeamMembersForProvider($provider),
            'policy' => [
                'changeCutoffHours' => self::APPOINTMENT_CHANGE_CUTOFF_HOURS,
            ],
        ]);
    }

    public function report(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $appointment = Appointment::where('client_id', auth()->id())->findOrFail($id);

        Report::create([
            'appointment_id' => $appointment->id,
            'user_id' => auth()->id(),
            'reason' => $request->reason,
            'description' => $request->description,
        ]);

        return back()->with('success-toast', 'Issue reported successfully. Our team will look into it.');
    }

    public function availableSlots(Request $request)
    {
        $request->validate([
            'provider_id' => 'required|exists:users,id',
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:services,id',
            'date' => 'required|date',
            'team_member_id' => 'nullable|exists:team_members,id',
            'service_team_members' => 'nullable|array',
            'service_team_members.*' => 'nullable|string',
            'reschedule_id' => 'nullable|exists:appointments,id',
        ]);

        $provider = User::with('businessProfile')->findOrFail($request->provider_id);

        if (! auth_user()->canBookProvider($provider)) {
            return response()->json([
                'slots' => [],
                'message' => 'You cannot book your own business or a provider workspace you belong to.',
            ], 422);
        }

        $teamMembers = $this->availability->resolveTeamMembers(
            $provider->id,
            array_values($request->service_ids),
            (array) $request->input('service_team_members', []),
            $request->team_member_id,
        );

        if ($teamMembers === null) {
            return response()->json([
                'slots' => [],
                'message' => 'The selected team member is no longer available.',
            ], 422);
        }

        return response()->json($this->availability->slotsForDate(
            $provider,
            Service::whereIn('id', $request->service_ids)->get(),
            Carbon::parse($request->date),
            collect($teamMembers)->map(fn (?TeamMember $member) => $member?->id)->values()->all(),
            $request->reschedule_id,
        ));
    }

    /**
     * Holds the booking details, then sends the client to Paystack to pay by card or bank transfer.
     */
    private function startCardCheckout(Request $request, User $client, User $provider, float $amount)
    {
        $reference = 'BKG_'.Str::ulid();

        cache()->put(self::CHECKOUT_CACHE_PREFIX.$reference, [
            'client_id' => $client->id,
            'slug' => $provider->businessProfile->slug,
            'payload' => $request->except(['payment_option']),
        ], now()->addMinutes(self::CHECKOUT_TTL_MINUTES));

        $payment = app(PaystackService::class)->initializeTransaction([
            'email' => $client->email,
            'amount' => $amount,
            'reference' => $reference,
            'callback_url' => route('appointments.checkout.callback'),
            'metadata' => [
                'type' => BookingCheckoutService::METADATA_TYPE,
                'user_id' => $client->id,
                'provider_id' => $provider->id,
            ],
        ]);

        if (! $payment['success']) {
            cache()->forget(self::CHECKOUT_CACHE_PREFIX.$reference);

            return back()->with('error-toast', 'We couldn’t start the card payment. Please try again or pay from your wallet.');
        }

        return Inertia::location($payment['data']['authorization_url']);
    }

    private function isWithinProviderWorkHours(string $providerId, Carbon $startTime, Carbon $endTime): bool
    {
        $dayOfWeek = $startTime->format('l');

        $workHours = WorkHour::where('provider_id', $providerId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_closed', false)
            ->get();

        if ($workHours->isEmpty()) {
            return false;
        }

        foreach ($workHours as $workHour) {
            $start = Carbon::parse($startTime->format('Y-m-d').' '.$workHour->start_time);
            $end = Carbon::parse($startTime->format('Y-m-d').' '.$workHour->end_time);

            if ($startTime->lt($start) || $endTime->gt($end)) {
                continue;
            }

            if ($this->overlapsWorkHourBreak($workHour, $startTime, $endTime)) {
                continue;
            }

            return true;
        }

        return false;
    }

    private function overlapsWorkHourBreak(WorkHour $workHour, Carbon $startTime, Carbon $endTime): bool
    {
        if (! $workHour->breaks) {
            return false;
        }

        foreach ($workHour->breaks as $break) {
            $breakStart = Carbon::parse($startTime->format('Y-m-d').' '.$break['start']);
            $breakEnd = Carbon::parse($startTime->format('Y-m-d').' '.$break['end']);

            if ($startTime->lt($breakEnd) && $endTime->gt($breakStart)) {
                return true;
            }
        }

        return false;
    }

    private function resolveSelectedTeamMember(string $providerId, ?string $teamMemberId): ?TeamMember
    {
        if (! $teamMemberId) {
            return null;
        }

        return TeamMember::query()
            ->whereKey($teamMemberId)
            ->where('provider_id', $providerId)
            ->where('is_active', true)
            ->whereNotNull('accepted_at')
            ->first();
    }

    private function eligibleTeamMembersForProvider(User $provider): array
    {
        $teamMembers = TeamMember::query()
            ->where('provider_id', $provider->id)
            ->where('is_active', true)
            ->whereNotNull('accepted_at')
            ->with('user:id,name,email')
            ->get();

        if ($teamMembers->count() <= 1) {
            return [];
        }

        return $teamMembers->map(fn ($member) => [
            'id' => $member->id,
            'name' => $member->user?->name,
            'email' => $member->user?->email,
            'role' => $member->role,
        ])->values()->all();
    }

    protected function validateServiceLocationForBooking(Request $request, array $settings): ?\Illuminate\Http\RedirectResponse
    {
        $mode = ServiceDeliveryMode::resolve($settings);

        if (ServiceDeliveryMode::requiresClientServiceAddress($mode) && ! $request->filled('client_address_id')) {
            return back()->withErrors([
                'client_address_id' => 'Please add your service address so the professional knows where to come.',
            ])->with('error-toast', 'A service address is required for this booking.');
        }

        return null;
    }

    protected function serviceAddressInputsForBooking(Request $request, array $settings): array
    {
        $mode = ServiceDeliveryMode::resolve($settings);

        if ($mode === ServiceDeliveryMode::CLIENT_VISITS_PROVIDER) {
            return [null, false, $request->boolean('set_address_active')];
        }

        return [
            $request->input('client_address_id'),
            $request->boolean('use_business_address'),
            $request->boolean('set_address_active'),
        ];
    }

    /**
     * @return array<int, string>
     */
    private function closedWeekdays(string $providerId): array
    {
        $openDays = WorkHour::query()
            ->where('provider_id', $providerId)
            ->where('is_closed', false)
            ->whereNotNull('start_time')
            ->pluck('day_of_week')
            ->unique();

        if ($openDays->isEmpty()) {
            return [];
        }

        return collect(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
            ->diff($openDays)
            ->values()
            ->all();
    }

    /**
     * @return array<int, int>
     */
    private function popularBookingHours(string $providerId): array
    {
        return Appointment::query()
            ->where('provider_id', $providerId)
            ->where('status', '!=', 'cancelled')
            ->where('start_time', '>=', now()->subDays(90))
            ->get(['start_time'])
            ->countBy(fn (Appointment $appointment): int => $appointment->start_time->hour)
            ->filter(fn (int $count): bool => $count >= 3)
            ->sortDesc()
            ->keys()
            ->take(2)
            ->values()
            ->all();
    }
}
