<?php

namespace App\Http\Controllers\Provider\Schedule;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function calender()
    {
        $user = auth()->user();
        $appointments = $user->appointmentsAsProvider()
            ->with(['service'])
            ->get()
            ->map(function ($apt) {
                return [
                    'id' => $apt->id,
                    'service' => $apt->service->name,
                    'client' => $apt->client_name ?? 'Guest',
                    'start_time' => $apt->start_time,
                    'end_time' => $apt->end_time,
                    'duration' => $apt->start_time->diffInHours($apt->end_time),
                    'day' => $apt->start_time->format('D'), // Mon, Tue...
                    'hour' => (int) $apt->start_time->format('H'),
                    'color' => 'bg-blue-100 border-blue-200 text-blue-700', // Dynamic coloring later
                ];
            });

        return Inertia::render('provider/schedule/calendar', [
            'appointments' => $appointments
        ]);
    }

    public function appointments(Request $request)
    {
        $user = auth()->user();
        $query = $user->appointmentsAsProvider()->with(['service']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('client_name', 'like', "%{$search}%");
        }

        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $appointments = $query->latest()->paginate(10)->withQueryString()->through(function ($apt) {
            return [
                'id' => $apt->id,
                'client' => $apt->client_name ?? 'Guest',
                'service' => $apt->service->name,
                'amount' => '₦' . number_format($apt->price),
                'date' => $apt->start_time->format('M d, Y'),
                'time' => $apt->start_time->format('h:i A'),
                'status' => ucfirst($apt->status),
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($apt->client_name ?? 'User'),
                'paymentStatus' => 'Paid', // Mock for now
            ];
        });

        return Inertia::render('provider/schedule/appointments', [
            'appointments' => $appointments,
            'filters' => $request->only(['search', 'status']),
        ]);
    }
}
