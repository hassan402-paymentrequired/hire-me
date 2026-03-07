<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Report;
use App\Models\Service;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WorkHour;
use App\Notifications\AppointmentCompletedNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\NewBookingMail;
use App\Mail\AppointmentCancelledMail;
use App\Mail\AppointmentCompletedMail;
use App\Notifications\NewAppoinmentBookedNotification;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $user = auth_user();
        $statusFilter = $request->get('status', 'active');

        $query = Appointment::where('client_id', $user->id)
            ->with(['provider.businessProfile.images', 'services'])
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
                    if (!$logoUrl) {
                        $logoUrl = '/storage/' . ltrim($path, '/');
                    }
                }
            }
            $data['provider_logo_url'] = $logoUrl;
            return $data;
        });

        return Inertia::render('client/bookings/index', [
            'bookings' => $bookings,
            'statusFilter' => $statusFilter,
        ]);
    }

    public function show($id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->with(['provider.businessProfile', 'services', 'review'])
            ->findOrFail($id);

        $parent = $appointment->recurrence_parent_id
            ? Appointment::find($appointment->recurrence_parent_id)
            : ($appointment->isRecurrenceParent() ? $appointment : null);

        $hasFutureRecurrences = $parent && !$parent->recurrence_stopped_at
            ? Appointment::where('recurrence_parent_id', $parent->id)
                ->where('start_time', '>', now())
                ->where('status', '!=', 'cancelled')
                ->exists()
            : false;

        return Inertia::render('client/bookings/show', [
            'booking' => $appointment,
            'hasFutureRecurrences' => $hasFutureRecurrences,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'provider_id' => 'required|exists:users,id',
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:services,id',
            'start_time' => 'required|date',
            'notes' => 'nullable|string|max:500',
            'reschedule_id' => 'nullable|exists:appointments,id',
            'recurrence_pattern' => 'nullable|in:weekly,bi_weekly,monthly',
            'recurrence_end_date' => 'nullable|date|after:today',
            'recurrence_count' => 'nullable|integer|min:2|max:52',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
        ], [
            'provider_id.required' => 'Please select a provider.',
            'provider_id.exists' => 'The selected provider is no longer available.',
            'service_ids.required' => 'Please select at least one service to book.',
            'service_ids.*.exists' => 'One or more selected services are no longer available. Please refresh and try again.',
            'start_time.required' => 'Please select a date and time for your appointment.',
            'start_time.date' => 'The selected time is invalid. Please choose another slot.',
        ]);

        $provider = User::with('businessProfile')->findOrFail($request->provider_id);
        $settings = $provider->businessProfile->settings ?? [];
        $maxPerWeek = $settings['max_bookings_per_week'] ?? null;
        $maxPerMonth = $settings['max_bookings_per_month'] ?? null;

        if ($maxPerWeek) {
            $weekCount = Appointment::where('client_id', auth()->id())
                ->where('provider_id', $request->provider_id)
                ->where('start_time', '>=', Carbon::now()->startOfWeek())
                ->where('status', '!=', 'cancelled')
                ->count();
            if ($weekCount >= $maxPerWeek) {
                return to_route('client.bookings.index')->with('error-toast', "You have reached the maximum of {$maxPerWeek} bookings per week with this provider.");
            }
        }

        if ($maxPerMonth) {
            $monthCount = Appointment::where('client_id', auth()->id())
                ->where('provider_id', $request->provider_id)
                ->where('start_time', '>=', Carbon::now()->startOfMonth())
                ->where('status', '!=', 'cancelled')
                ->count();
            if ($monthCount >= $maxPerMonth) {
                return to_route('client.bookings.index')->with('error-toast', "You have reached the maximum of {$maxPerMonth} bookings per month with this provider.");
            }
        }

        $services = Service::whereIn('id', $request->service_ids)->get();

        $originalPrice = $services->sum('price');
        $discountPercent = $request->discount_percent ?? 0;
        $totalPrice = $originalPrice * (1 - ($discountPercent / 100));
        $totalDuration = $services->sum('duration_minutes');
        $maxBuffer = $services->max('buffer_time_minutes') ?? 0;

        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($totalDuration);

        // Get or create client wallet
        $clientWallet = Wallet::firstOrCreate(['user_id' => auth()->id()]);

        // Check wallet balance
        if (!$clientWallet->hasSufficientBalance($totalPrice)) {
            return redirect()->route('marketplace.booking', ['slug' => $provider->businessProfile->slug])
                ->with('error-toast', "Insufficient wallet balance. Please top up your wallet with at least ₦" . number_format($totalPrice, 2) . " to book this appointment.")
                ->with('insufficient_balance', true)
                ->with('required_amount', $totalPrice);
        }

        try {
            DB::beginTransaction();

            if ($request->reschedule_id) {
                $appointment = Appointment::where('client_id', auth()->id())->findOrFail($request->reschedule_id);
                
                // For rescheduling with payment hold system:
                // If price changed, handle the difference
                if ($appointment->price != $totalPrice) {
                    $priceDifference = $totalPrice - $appointment->price;
                    
                    if ($priceDifference > 0) {
                        // Client needs to pay more
                        if (!$clientWallet->hasSufficientBalance($priceDifference)) {
                            DB::rollBack();
                            return redirect()->route('marketplace.booking', ['slug' => $provider->businessProfile->slug])
                                ->with('error-toast', "Insufficient wallet balance. You need ₦" . number_format($priceDifference, 2) . " more to reschedule this appointment.")
                                ->with('insufficient_balance', true)
                                ->with('required_amount', $priceDifference);
                        }
                        
                        $clientWallet->holdPayment($priceDifference, $appointment, "Additional payment held for rescheduled appointment");
                        $appointment->update([
                            'escrow_amount' => $appointment->escrow_amount + $priceDifference,
                        ]);
                    } else {
                        // Refund the difference
                        $refundAmount = abs($priceDifference);
                        if ($appointment->escrow_status === 'held' && $appointment->escrow_amount >= $refundAmount) {
                            $clientWallet->refundEscrow($refundAmount, $appointment, "Partial refund for rescheduled appointment (price reduction)");
                            $appointment->update([
                                'escrow_amount' => $appointment->escrow_amount - $refundAmount,
                            ]);
                        }
                    }
                }

                $autoConfirm = ($settings['autoConfirm'] ?? $settings['auto_confirm'] ?? false);
                $appointment->update([
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'buffer_time_minutes' => $maxBuffer,
                    'status' => $autoConfirm ? 'confirmed' : 'pending',
                    'price' => $totalPrice,
                    'notes' => $request->notes,
                    'provider_approved' => $autoConfirm,
                    'provider_approved_at' => $autoConfirm ? now() : null,
                ]);
                $appointment->services()->sync($request->service_ids);
                $message = 'Appointment rescheduled successfully!';
            } else {
                $autoConfirm = ($settings['autoConfirm'] ?? $settings['auto_confirm'] ?? false);
                $appointmentData = [
                    'client_id' => auth()->id(),
                    'provider_id' => $request->provider_id,
                    'service_id' => $request->service_ids[0],
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'buffer_time_minutes' => $maxBuffer,
                    'status' => $autoConfirm ? 'confirmed' : 'pending',
                    'price' => $totalPrice,
                    'notes' => $request->notes,
                    'provider_approved' => $autoConfirm,
                    'provider_approved_at' => $autoConfirm ? now() : null,
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

                $appointment = Appointment::create($appointmentData);
                $appointment->services()->attach($request->service_ids);
                
                $message = $request->recurrence_pattern 
                    ? 'Recurring appointment booked successfully! Future appointments will be created automatically.'
                    : 'Appointment booked successfully!';
            }

            $escrowTransaction = $clientWallet->holdPayment($totalPrice, $appointment, "Payment held for appointment booking (pending dual approval)");
            $appointment->update([
                'escrow_amount' => $totalPrice,
                'escrow_status' => 'held',
                'escrow_transaction_id' => $escrowTransaction->id,
            ]);

            DB::commit();

            // Send email to provider
            // Mail::to($appointment->provider->email)->queue(new NewBookingMail($appointment->load('services')));

            $appointment->provider->notify(new NewAppoinmentBookedNotification($appointment));

            return redirect()->route('client.bookings.show', $appointment->id)
                ->with('success-toast', $message);
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
            if (!empty($request->service_ids)) {
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

    public function cancel($id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->where('status', '!=', 'cancelled')
            ->findOrFail($id);

        $hoursUntilAppointment = Carbon::now()->diffInHours($appointment->start_time, false);
        $isLateCancellation = $hoursUntilAppointment < 5 && $hoursUntilAppointment > 0;

        try {
            DB::beginTransaction();

            // Get the parent appointment if this is a child
            $parentAppointment = $appointment->recurrence_parent_id 
                ? Appointment::find($appointment->recurrence_parent_id)
                : ($appointment->isRecurrenceParent() ? $appointment : null);

            // Cancel this appointment
            $this->cancelSingleAppointment($appointment, $isLateCancellation);

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
                return back()->with('success-toast', 'Recurring appointment series cancelled successfully. All future appointments have been cancelled.');
            }

            DB::commit();

            // Send email to provider
            Mail::to($appointment->provider->email)->queue(new AppointmentCancelledMail($appointment, 'client'));

            $message = $isLateCancellation && $appointment->escrow_status === 'forfeited'
                ? 'Appointment cancelled. Because you cancelled less than 5 hours before the appointment, a 10% late cancellation fee was applied. The remainder has been refunded to your wallet.'
                : 'Appointment cancelled successfully. Your refund has been processed.';

            return back()->with('success-toast', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to cancel appointment: ' . $e->getMessage());
        }
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

        if (!$parent) {
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

            return back()->with('success-toast', 'Remaining recurring appointments have been cancelled. You will receive a refund for each.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to cancel: ' . $e->getMessage());
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

            // System policy: 10% forfeited if cancelled less than 5 hours before
            $cancellationPenaltyPercent = 10;

            if ($isLateCancellation && $cancellationPenaltyPercent > 0) {
                // Apply penalty: forfeit percentage to provider, refund rest
                $penaltyAmount = ($appointment->escrow_amount * $cancellationPenaltyPercent) / 100;
                $refundAmount = $appointment->escrow_amount - $penaltyAmount;
                
                if ($penaltyAmount > 0) {
                    $clientWallet->forfeitEscrow($penaltyAmount, $appointment, "Late cancellation penalty");
                }
                if ($refundAmount > 0) {
                    $clientWallet->refundEscrow($refundAmount, $appointment, "Partial refund after late cancellation");
                }
                $appointment->update(['escrow_status' => 'forfeited']);
            } else {
                // Full refund for early cancellation
                $clientWallet->refundEscrow($appointment->escrow_amount, $appointment, "Full refund for cancelled appointment");
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
            return back()->with('error-toast', 'Failed to complete appointment: ' . $e->getMessage());
        }
    }

    public function reschedule($id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->with('services')
            ->findOrFail($id);

        $slug = $appointment->provider->businessProfile->slug;
        $serviceIds = $appointment->services->pluck('id')->toArray();

        // Redirect to marketplace booking page with services pre-selected
        // We'll need to update marketplace.booking to handle pre-selected services if possible
        return redirect()->route('marketplace.booking', [
            'slug' => $slug,
            'service_ids' => $serviceIds,
            'reschedule_id' => $appointment->id
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
            'reschedule_id' => 'nullable|exists:appointments,id',
        ]);

        $provider = User::with('businessProfile')->findOrFail($request->provider_id);
        $services = Service::whereIn('id', $request->service_ids)->get();
        $totalDuration = $services->sum('duration_minutes');
        $maxBuffer = $services->max('buffer_time_minutes') ?? 0;

        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->format('l');

        // Get provider settings
        $settings = $provider->businessProfile->settings ?? [];
        $advanceBooking = (int)($settings['advanceBooking'] ?? 30); // days
        $minNotice = isset($settings['minNotice']) ? (int)$settings['minNotice'] : null; // hours
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

        // Check if any work hours block can accommodate the total duration
        $maxAvailableBlock = 0;
        foreach ($workHours as $wh) {
            $s = Carbon::parse($wh->start_time);
            $e = Carbon::parse($wh->end_time);
            $maxAvailableBlock = max($maxAvailableBlock, $s->diffInMinutes($e));
        }

        if ($totalDuration > $maxAvailableBlock) {
            return response()->json([
                'slots' => [],
                'message' => "The selected services require {$totalDuration} minutes, which exceeds the provider's longest working block ({$maxAvailableBlock} minutes) on this day."
            ]);
        }

        // Get existing appointments for this day
        $existingAppointments = Appointment::where('provider_id', $provider->id)
            ->whereDate('start_time', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->when($request->reschedule_id, function ($q) use ($request) {
                return $q->where('id', '!=', $request->reschedule_id);
            })
            ->get();

        $slots = [];

        foreach ($workHours as $workHour) {
            $start = Carbon::parse($date->format('Y-m-d') . ' ' . $workHour->start_time);
            $end = Carbon::parse($date->format('Y-m-d') . ' ' . $workHour->end_time);

            // If the date is today, ensure start time meets minimum notice
            if ($date->isToday()) {
                $now = Carbon::now();
                $minStartTime = $now;
                
                // Apply minimum notice if set
                if ($minNotice !== null) {
                    $minStartTime = $now->copy()->addHours($minNotice)->ceilMinutes(30);
                } else {
                    $minStartTime = $now->copy()->ceilMinutes(30); // Start from next 30min block
                }
                
                if ($start->lt($minStartTime)) {
                    $start = $minStartTime;
                }
            }
            
            // For future dates, check minimum notice for each slot
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
                
                // Skip slots that don't meet minimum notice requirement
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
                        // Overlap check
                        if ($slotStart->lt($breakEnd) && $slotEnd->gt($breakStart)) {
                            $isDuringBreak = true;
                            break;
                        }
                    }
                }

                // Check if slot overlaps with existing appointment
                $isBooked = $existingAppointments->contains(function ($apt) use ($slotStart, $slotEnd, $maxBuffer) {
                    $aptEndWithBuffer = $apt->end_time->copy()->addMinutes($apt->buffer_time_minutes);
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
}
