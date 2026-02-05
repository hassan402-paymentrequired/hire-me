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

        if (!$user->hasProviderSetup()) {
            return redirect()->route('onboarding.index')->with('error-toast', 'Please complete your provider profile before continuing.');
        }


        // Calculate date ranges for comparison
        $now = now();
        $currentMonthStart = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        // Revenue Stats
        $currentRevenue = $user->appointmentsAsProvider()
            ->whereIn('status', ['confirmed', 'completed'])
            ->where('start_time', '>=', $currentMonthStart)
            ->sum('price');
        
        $previousRevenue = $user->appointmentsAsProvider()
            ->whereIn('status', ['confirmed', 'completed'])
            ->whereBetween('start_time', [$lastMonthStart, $lastMonthEnd])
            ->sum('price');
        
        $revenueChange = $previousRevenue > 0 
            ? round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
            : ($currentRevenue > 0 ? 100 : 0);

        // Bookings Stats
        $currentBookings = $user->appointmentsAsProvider()
            ->where('start_time', '>=', $currentMonthStart)
            ->count();
        
        $previousBookings = $user->appointmentsAsProvider()
            ->whereBetween('start_time', [$lastMonthStart, $lastMonthEnd])
            ->count();
        
        $bookingsChange = $previousBookings > 0
            ? round((($currentBookings - $previousBookings) / $previousBookings) * 100, 1)
            : ($currentBookings > 0 ? 100 : 0);

        // New Clients Stats (unique client emails)
        $currentClients = $user->appointmentsAsProvider()
            ->where('start_time', '>=', $currentMonthStart)
            ->whereNotNull('client_email')
            ->distinct('client_email')
            ->count('client_email');
        
        $previousClients = $user->appointmentsAsProvider()
            ->whereBetween('start_time', [$lastMonthStart, $lastMonthEnd])
            ->whereNotNull('client_email')
            ->distinct('client_email')
            ->count('client_email');
        
        $clientsChange = $previousClients > 0
            ? round((($currentClients - $previousClients) / $previousClients) * 100, 1)
            : ($currentClients > 0 ? 100 : 0);

        // Rating Stats (from reviews)
        $currentRating = \App\Models\Review::where('provider_id', $user->id)
            ->where('created_at', '>=', $currentMonthStart)
            ->avg('rating') ?? 0;
        
        $previousRating = \App\Models\Review::where('provider_id', $user->id)
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->avg('rating') ?? 0;
        
        // Overall rating (all time)
        $overallRating = \App\Models\Review::where('provider_id', $user->id)
            ->avg('rating') ?? 0;
        
        $ratingChange = $previousRating > 0
            ? round($overallRating - $previousRating, 1)
            : ($overallRating > 0 ? $overallRating : 0);

        // Key Stats
        $stats = [
            'revenue' => [
                'value' => $currentRevenue,
                'change' => $revenueChange,
            ],
            'bookings' => [
                'value' => $currentBookings,
                'change' => $bookingsChange,
            ],
            'new_clients' => [
                'value' => $currentClients,
                'change' => $clientsChange,
            ],
            'rating' => [
                'value' => round($overallRating, 1),
                'change' => $ratingChange,
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

        // Recent Activity - Combine appointments and reviews
        $recentAppointments = $user->appointmentsAsProvider()
            ->with('service')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($apt) {
                return [
                    'id' => 'apt_' . $apt->id,
                    'type' => 'appointment',
                    'message' => "New booking from " . ($apt->client_name ?? 'Guest') . " - " . ($apt->service->name ?? 'Service'),
                    'time' => $apt->created_at->diffForHumans(),
                    'timestamp' => $apt->created_at->timestamp,
                ];
            });
        
        // Recent reviews
        $recentReviews = \App\Models\Review::where('provider_id', $user->id)
            ->with('client:id,name')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($review) {
                return [
                    'id' => 'review_' . $review->id,
                    'type' => 'review',
                    'message' => "New " . $review->rating . "⭐ review from " . ($review->client->name ?? 'Client'),
                    'time' => $review->created_at->diffForHumans(),
                    'timestamp' => $review->created_at->timestamp,
                ];
            });
        
        // Combine and sort by timestamp (most recent first)
        $recentActivity = $recentAppointments
            ->concat($recentReviews)
            ->sortByDesc('timestamp')
            ->take(5)
            ->map(function ($item) {
                // Remove timestamp before sending to frontend
                unset($item['timestamp']);
                return $item;
            })
            ->values();
        
        // If no activity, show a default message
        if ($recentActivity->isEmpty()) {
            $recentActivity = collect([
                [
                    'id' => 'empty',
                    'type' => 'info',
                    'message' => 'No recent activity. Start by completing your profile!',
                    'time' => 'Just now',
                ]
            ]);
        }

        // Check verification status
        $verificationStatus = null;
        $existingVerification = \App\Models\ProviderVerification::where('user_id', $user->id)
            ->latest()
            ->first();
        
        if ($existingVerification) {
            $verificationStatus = [
                'status' => $existingVerification->status,
                'rejection_reason' => $existingVerification->rejection_reason,
                'created_at' => $existingVerification->created_at,
            ];
        }

        return Inertia::render('provider/dashboard/index', [
            'stats' => $stats,
            'upcomingAppointments' => $upcomingAppointments,
            'recentActivity' => $recentActivity,
            'is_verified' => $user->is_verified,
            'verification_status' => $verificationStatus,
        ]);
    }

}
