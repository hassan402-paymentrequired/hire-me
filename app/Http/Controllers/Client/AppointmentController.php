<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Report;
use App\Models\Service;
use App\Models\User;
use App\Models\WorkHour;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\NewBookingMail;
use App\Mail\AppointmentCancelledMail;
use App\Mail\AppointmentCompletedMail;

class AppointmentController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $bookings = Appointment::where('client_id', $user->id)
            ->with(['provider.businessProfile', 'services'])
            ->orderBy('start_time', 'desc')
            ->get();

        return Inertia::render('client/bookings/index', [
            'bookings' => $bookings,
        ]);
    }

    public function show($id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->with(['provider.businessProfile', 'services', 'review'])
            ->findOrFail($id);

        return Inertia::render('client/bookings/show', [
            'booking' => $appointment,
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
        ]);

        // Constraint: One active appointment per provider
        $existingActive = Appointment::where('client_id', auth()->id())
            ->where('provider_id', $request->provider_id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->when($request->reschedule_id, function ($q) use ($request) {
                return $q->where('id', '!=', $request->reschedule_id);
            })
            ->first();

        if ($existingActive) {
            return redirect()->route('client.bookings.show', $existingActive->id)
                ->with('error-toast', 'You already have an active appointment with this provider. Please manage your existing booking.');
        }

        // Frequency Limits check
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
        $totalPrice = $services->sum('price');
        $totalDuration = $services->sum('duration_minutes');
        $maxBuffer = $services->max('buffer_time_minutes') ?? 0;

        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($totalDuration);

        if ($request->reschedule_id) {
            $appointment = Appointment::where('client_id', auth()->id())->findOrFail($request->reschedule_id);
            $appointment->update([
                'start_time' => $startTime,
                'end_time' => $endTime,
                'buffer_time_minutes' => $maxBuffer,
                'status' => 'pending',
                'price' => $totalPrice,
                'notes' => $request->notes,
            ]);
            $appointment->services()->sync($request->service_ids);
            $message = 'Appointment rescheduled successfully!';
        } else {
            $appointment = Appointment::create([
                'client_id' => auth()->id(),
                'provider_id' => $request->provider_id,
                'service_id' => $request->service_ids[0],
                'start_time' => $startTime,
                'end_time' => $endTime,
                'buffer_time_minutes' => $maxBuffer,
                'status' => 'pending',
                'price' => $totalPrice,
                'notes' => $request->notes,
            ]);
            $appointment->services()->attach($request->service_ids);
            $message = 'Appointment booked successfully!';
        }

        // Send email to provider
        Mail::to($appointment->provider->email)->send(new NewBookingMail($appointment->load('services')));

        return redirect()->route('client.bookings.show', $appointment->id)
            ->with('success-toast', $message);
    }

    public function cancel($id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->where('status', '!=', 'cancelled')
            ->findOrFail($id);

        if (Carbon::now()->addHours(5)->gt($appointment->start_time)) {
            return back()->with('error-toast', 'Appointments can only be cancelled 5 hours before the start time.');
        }

        $appointment->update(['status' => 'cancelled', 'cancelled_by' => 'client']);

        // Send email to provider
        Mail::to($appointment->provider->email)->send(new AppointmentCancelledMail($appointment, 'client'));

        return back()->with('success-toast', 'Appointment cancelled successfully.');
    }

    public function complete(Request $request, $id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->where('status', 'confirmed')
            ->findOrFail($id);

        $appointment->update(['status' => 'completed']);

        // Optional Review
        if ($request->has('rating') && $request->has('comment')) {
            $appointment->review()->create([
                'client_id' => auth()->id(),
                'provider_id' => $appointment->provider_id,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);
        }

        // Send email to client
        Mail::to($appointment->client->email)->send(new AppointmentCompletedMail($appointment));

        return back()->with('success-toast', 'Appointment marked as completed.');
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

        $provider = User::findOrFail($request->provider_id);
        $services = Service::whereIn('id', $request->service_ids)->get();
        $totalDuration = $services->sum('duration_minutes');
        $maxBuffer = $services->max('buffer_time_minutes') ?? 0;

        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->format('l');

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

            // If the date is today, ensure start time is at least now
            if ($date->isToday()) {
                $now = Carbon::now();
                if ($start->lt($now)) {
                    $start = $now->copy()->ceilMinutes(30); // Start from next 30min block
                }
            }

            $current = $start->copy();

            while ($current->copy()->addMinutes($totalDuration)->lte($end)) {
                $slotStart = $current->copy();
                $slotEnd = $current->copy()->addMinutes($totalDuration);

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
