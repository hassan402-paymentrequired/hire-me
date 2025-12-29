<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\User;
use App\Models\WorkHour;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $appointments = Appointment::where('client_id', $user->id)
            ->with(['provider', 'service'])
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'providerName' => $appointment->provider->name,
                    'serviceName' => $appointment->service->name,
                    'startTime' => $appointment->start_time->format('M d, Y g:i A'),
                    'endTime' => $appointment->end_time->format('g:i A'),
                    'status' => $appointment->status,
                    'price' => $appointment->price,
                    'notes' => $appointment->notes,
                ];
            });

        return Inertia::render('client/bookings/index', [
            'appointments' => $appointments,
        ]);
    }

    public function show($id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->with(['provider.businessProfile', 'service'])
            ->findOrFail($id);

        return Inertia::render('client/bookings/show', [
            'appointment' => [
                'id' => $appointment->id,
                'provider' => [
                    'name' => $appointment->provider->name,
                    'businessName' => $appointment->provider->businessProfile->business_name,
                ],
                'service' => [
                    'name' => $appointment->service->name,
                    'duration' => $appointment->service->duration_minutes,
                ],
                'startTime' => $appointment->start_time->format('M d, Y g:i A'),
                'endTime' => $appointment->end_time->format('g:i A'),
                'status' => $appointment->status,
                'price' => $appointment->price,
                'notes' => $appointment->notes,
                'createdAt' => $appointment->created_at->format('M d, Y'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'provider_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:services,id',
            'start_time' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $service = Service::findOrFail($request->service_id);
        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($service->duration_minutes);

        $appointment = Appointment::create([
            'client_id' => auth()->id(),
            'provider_id' => $request->provider_id,
            'service_id' => $request->service_id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'pending',
            'price' => $service->price,
            'notes' => $request->notes,
        ]);

        return redirect()->route('client.bookings.show', $appointment->id)
            ->with('success', 'Appointment booked successfully!');
    }

    public function cancel($id)
    {
        $appointment = Appointment::where('client_id', auth()->id())
            ->where('status', '!=', 'cancelled')
            ->findOrFail($id);

        $appointment->update(['status' => 'cancelled']);

        return back()->with('success', 'Appointment cancelled successfully.');
    }

    public function availableSlots(Request $request)
    {
        $request->validate([
            'provider_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:services,id',
            'date' => 'required|date',
        ]);

        $provider = User::findOrFail($request->provider_id);
        $service = Service::findOrFail($request->service_id);
        $date = Carbon::parse($request->date);
        $dayOfWeek = $date->format('l');

        // Get work hours for this day
        $workHours = WorkHour::where('provider_id', $provider->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_closed', false)
            ->get();

        if ($workHours->isEmpty()) {
            return response()->json(['slots' => []]);
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
            $current = $start->copy();

            while ($current->copy()->addMinutes($service->duration_minutes)->lte($end)) {
                $slotStart = $current->copy();
                $slotEnd = $current->copy()->addMinutes($service->duration_minutes);

                // Check if slot is during break
                $isDuringBreak = false;
                if ($workHour->breaks) {
                    foreach ($workHour->breaks as $break) {
                        $breakStart = Carbon::parse($date->format('Y-m-d') . ' ' . $break['start']);
                        $breakEnd = Carbon::parse($date->format('Y-m-d') . ' ' . $break['end']);
                        if (
                            $slotStart->between($breakStart, $breakEnd, false) ||
                            $slotEnd->between($breakStart, $breakEnd, false)
                        ) {
                            $isDuringBreak = true;
                            break;
                        }
                    }
                }

                // Check if slot overlaps with existing appointment
                $isBooked = $existingAppointments->contains(function ($apt) use ($slotStart, $slotEnd) {
                    return $slotStart->lt($apt->end_time) && $slotEnd->gt($apt->start_time);
                });

                // Only include future slots
                $isFuture = $slotStart->isFuture();

                if (!$isDuringBreak && !$isBooked && $isFuture) {
                    $slots[] = [
                        'start' => $slotStart->format('H:i'),
                        'end' => $slotEnd->format('H:i'),
                        'display' => $slotStart->format('g:i A'),
                        'datetime' => $slotStart->toIso8601String(),
                    ];
                }

                $current->addMinutes(30); // 30-minute intervals
            }
        }

        return response()->json(['slots' => $slots]);
    }
}
