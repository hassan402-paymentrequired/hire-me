<?php

namespace App\Http\Controllers\Provider\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\ProviderVerification;
use App\Models\Review;
use App\Models\WalletTransaction;
use Inertia\Inertia;

class DashboardController extends Controller
{

    public function dashboard()
    {
        $user = auth_user();

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
        $currentRating = Review::where('provider_id', $user->id)
            ->where('created_at', '>=', $currentMonthStart)
            ->avg('rating') ?? 0;
        
        $previousRating = Review::where('provider_id', $user->id)
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->avg('rating') ?? 0;
        
        // Overall rating (all time)
        $overallRating = Review::where('provider_id', $user->id)
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
            ->where('status', 'confirmed')
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

        // Check verification status
        $verificationStatus = null;
        $existingVerification = ProviderVerification::where('user_id', $user->id)
            ->latest()
            ->first();
        
        if ($existingVerification) {
            $verificationStatus = [
                'status' => $existingVerification->status,
                'rejection_reason' => $existingVerification->rejection_reason,
                'created_at' => $existingVerification->created_at,
            ];
        }

        $urgentBookingsCount = $user->appointmentsAsProvider()
            ->where('status', 'pending')
            ->whereBetween('start_time', [$now, $now->copy()->addHours(3)])
            ->count();

        $appointmentsAwaitingConfirmationCount = $user->appointmentsAsProvider()
            ->where('status', 'pending')
            ->where('start_time', '>', $now->copy()->addHours(3))
            ->count();

        $pendingClientConfirmationCount = $user->appointmentsAsProvider()
            ->where('status', 'pending_completion')
            ->where('provider_approved', true)
            ->where(function ($query) {
                $query->whereNull('client_approved')
                    ->orWhere('client_approved', false);
            })
            ->count();

        $failedPayoutCount = WalletTransaction::where('user_id', $user->id)
            ->where('type', WalletTransaction::TYPE_WITHDRAWAL)
            ->where('status', WalletTransaction::STATUS_FAILED)
            ->count();

        $delayedPayoutCount = WalletTransaction::where('user_id', $user->id)
            ->where('type', WalletTransaction::TYPE_WITHDRAWAL)
            ->where('status', WalletTransaction::STATUS_PENDING)
            ->where('created_at', '<=', $now->copy()->subDay())
            ->count();

        $payoutIssueCount = $failedPayoutCount + $delayedPayoutCount;

        $needsAttention = collect([
            $urgentBookingsCount > 0 ? [
                'type' => 'urgent_bookings',
                'count' => $urgentBookingsCount,
                'label' => 'Urgent bookings',
                'description' => 'Pending appointments starting within the next 3 hours.',
                'href' => '/schedule/appointments?status=pending',
                'action_label' => 'Review now',
                'tone' => 'danger',
            ] : null,
            $appointmentsAwaitingConfirmationCount > 0 ? [
                'type' => 'awaiting_confirmation',
                'count' => $appointmentsAwaitingConfirmationCount,
                'label' => 'Awaiting confirmation',
                'description' => 'Bookings are waiting for you to confirm or decline.',
                'href' => '/schedule/appointments?status=pending',
                'action_label' => 'Open bookings',
                'tone' => 'warning',
            ] : null,
            $pendingClientConfirmationCount > 0 ? [
                'type' => 'pending_client_confirmation',
                'count' => $pendingClientConfirmationCount,
                'label' => 'Pending client confirmations',
                'description' => 'Completed appointments still need client confirmation.',
                'href' => '/schedule/appointments?status=pending_completion',
                'action_label' => 'View appointments',
                'tone' => 'info',
            ] : null,
            $payoutIssueCount > 0 ? [
                'type' => 'payout_issues',
                'count' => $payoutIssueCount,
                'label' => 'Payout issues',
                'description' => 'Failed or delayed withdrawals need your attention.',
                'href' => '/wallet/withdraw',
                'action_label' => 'Open wallet',
                'tone' => 'warning',
            ] : null,
            (! $user->is_verified && (! $existingVerification || $existingVerification->status === 'rejected')) ? [
                'type' => 'verification_issue',
                'count' => 1,
                'label' => $existingVerification?->status === 'rejected'
                    ? 'Verification rejected'
                    : 'Verification required',
                'description' => $existingVerification?->status === 'rejected'
                    ? 'Resubmit your verification to keep your business visible to clients.'
                    : 'Complete verification so clients can discover your business profile.',
                'href' => '/onboarding/verification',
                'action_label' => $existingVerification?->status === 'rejected'
                    ? 'Resubmit'
                    : 'Verify now',
                'tone' => 'danger',
            ] : null,
        ])->filter()->values();

        return Inertia::render('provider/dashboard/index', [
            'stats' => $stats,
            'upcomingAppointments' => $upcomingAppointments,
            'needsAttention' => $needsAttention,
            'is_verified' => $user->is_verified,
            'verification_status' => $verificationStatus,
        ]);
    }

}
