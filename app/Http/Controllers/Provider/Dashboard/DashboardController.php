<?php

namespace App\Http\Controllers\Provider\Dashboard;

use App\Enum\UserRoleEnum;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{

    public function dashboard()
    {
        $user = auth()->user();

        if ($user->role === UserRoleEnum::PROVIDER && !$user->businessProfile) {
            return redirect()->route('onboarding.index')->with('error-toast', 'Please complete your profile before continuing.');
        }


        // Key Stats
        $stats = [
            'revenue' => [
                'value' => $user->appointmentsAsProvider()
                    ->whereIn('status', ['confirmed', 'completed'])
                    ->sum('price'),
                'change' => 10, // Mock change % for now
            ],
            'bookings' => [
                'value' => $user->appointmentsAsProvider()->count(),
                'change' => 5,
            ],
            'new_clients' => [
                'value' => $user->appointmentsAsProvider()->distinct('client_email')->count(),
                'change' => 2,
            ],
            'rating' => [
                'value' => 4.9, // Placeholder until reviews implemented
                'change' => 0.1,
            ],
        ];

        // Upcoming Schedule
        $upcomingAppointments = $user->appointmentsAsProvider()
            ->with(['service'])
            ->where('start_time', '>=', now())
            ->orderBy('start_time', 'asc')
            ->take(5)
            ->get()
            ->map(function ($apt) {
                return [
                    'id' => $apt->id,
                    'client' => $apt->client_name ?? 'Guest Client',
                    'service' => $apt->service->name,
                    'time' => $apt->start_time->format('h:i A'),
                    'date' => $apt->start_time->isToday() ? 'Today' : $apt->start_time->format('M d'),
                    'status' => ucfirst($apt->status),
                    'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($apt->client_name ?? 'User'),
                ];
            });

        // Recent Activity (Mocked using recent bookings)
        $recentActivity = $user->appointmentsAsProvider()
            ->latest()
            ->take(4)
            ->get()
            ->map(function ($apt) {
                return [
                    'id' => $apt->id,
                    'message' => "New booking from " . ($apt->client_name ?? 'Guest'),
                    'time' => $apt->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('provider/dashboard/index', [
            'stats' => $stats,
            'upcomingAppointments' => $upcomingAppointments,
            'recentActivity' => $recentActivity,
        ]);
    }

}
