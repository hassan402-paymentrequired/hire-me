<?php

namespace App\Http\Controllers\Client\Bookings;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $bookings = $user->appointmentsAsClient()
            ->with(['provider.businessProfile', 'service'])
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'provider_name' => $booking->provider->businessProfile->business_name ?? $booking->provider->name,
                    'service_name' => $booking->service->name,
                    'start_time' => $booking->start_time->format('M d, Y h:i A'),
                    'status' => ucfirst($booking->status),
                    'price' => '₦' . number_format($booking->price),
                    'avatar' => $booking->provider->businessProfile->logo_path ?? null,
                ];
            });

        return Inertia::render('client/bookings/index', [
            'bookings' => $bookings,
        ]);
    }

    public function show($id)
    {
        $user = auth()->user();

        $booking = Appointment::where('client_id', $user->id)
            ->where('id', $id)
            ->with(['provider.businessProfile', 'service'])
            ->firstOrFail();

        return Inertia::render('client/bookings/show', [
            'booking' => [
                'id' => $booking->id,
                'provider_name' => $booking->provider->businessProfile->business_name ?? $booking->provider->name,
                'service_name' => $booking->service->name,
                'duration' => $booking->service->duration_minutes . ' mins',
                'start_time' => $booking->start_time->format('l, F j, Y'),
                'time_slot' => $booking->start_time->format('h:i A') . ' - ' . $booking->end_time->format('h:i A'),
                'status' => ucfirst($booking->status),
                'price' => '₦' . number_format($booking->price),
                'notes' => $booking->notes,
                // Add more details if necessary
            ]
        ]);
    }
}
