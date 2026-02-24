<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\ProviderVerification;
use App\Models\Report;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfWeek = $now->copy()->startOfWeek();
        $startOfDay = $now->copy()->startOfDay();

        // Cached Statistics (15 minutes)
        $stats = \Illuminate\Support\Facades\Cache::remember('admin.dashboard.stats', 60 * 15, function () use ($now, $startOfMonth, $startOfWeek, $startOfDay) {
            // User Statistics
            $totalUsers = User::count();
            $newUsersThisMonth = User::where('created_at', '>=', $startOfMonth)->count();
            $newUsersThisWeek = User::where('created_at', '>=', $startOfWeek)->count();
            $totalProviders = User::whereHas('businessProfile')->count();
            $totalClients = User::whereDoesntHave('businessProfile')->count();
            $verifiedProviders = User::whereHas('businessProfile', function ($q) {
                $q->where('is_verified', true);
            })->count();

            // Appointment Statistics
            $totalAppointments = Appointment::count();
            $pendingAppointments = Appointment::where('status', 'pending')->count();
            $confirmedAppointments = Appointment::where('status', 'confirmed')->count();
            $completedAppointments = Appointment::where('status', 'completed')->count();
            $cancelledAppointments = Appointment::where('status', 'cancelled')->count();
            $appointmentsThisMonth = Appointment::where('created_at', '>=', $startOfMonth)->count();
            $appointmentsToday = Appointment::where('created_at', '>=', $startOfDay)->count();

            // Financial Statistics
            $totalRevenue = WalletTransaction::where('type', 'escrow_release')
                ->where('status', 'completed')
                ->sum('amount');
            $revenueThisMonth = WalletTransaction::where('type', 'escrow_release')
                ->where('status', 'completed')
                ->where('created_at', '>=', $startOfMonth)
                ->sum('amount');
            $totalEscrowHeld = Wallet::sum('escrow_balance');
            $totalWalletBalance = Wallet::sum('balance');
            $totalTransactions = WalletTransaction::count();
            $transactionsThisMonth = WalletTransaction::where('created_at', '>=', $startOfMonth)->count();

            // Verification Statistics
            $pendingVerifications = ProviderVerification::where('status', 'pending')->count();
            $approvedVerifications = ProviderVerification::where('status', 'approved')->count();
            $rejectedVerifications = ProviderVerification::where('status', 'rejected')->count();

            // Reports & Moderation
            $totalReports = Report::count();
            $unresolvedReports = Report::whereNull('resolved_at')->count();
            $totalReviews = Review::count();

            // Growth Trends (Last 6 months)
            $monthlyStats = [];
            for ($i = 5; $i >= 0; $i--) {
                $monthStart = $now->copy()->subMonths($i)->startOfMonth();
                $monthEnd = $now->copy()->subMonths($i)->endOfMonth();
                
                $monthlyStats[] = [
                    'month' => $monthStart->format('M Y'),
                    'users' => User::whereBetween('created_at', [$monthStart, $monthEnd])->count(),
                    'appointments' => Appointment::whereBetween('created_at', [$monthStart, $monthEnd])->count(),
                    'revenue' => WalletTransaction::where('type', 'escrow_release')
                        ->where('status', 'completed')
                        ->whereBetween('created_at', [$monthStart, $monthEnd])
                        ->sum('amount'),
                ];
            }

            return [
                'users' => [
                    'total' => $totalUsers,
                    'new_this_month' => $newUsersThisMonth,
                    'new_this_week' => $newUsersThisWeek,
                    'providers' => $totalProviders,
                    'clients' => $totalClients,
                    'verified_providers' => $verifiedProviders,
                ],
                'appointments' => [
                    'total' => $totalAppointments,
                    'pending' => $pendingAppointments,
                    'confirmed' => $confirmedAppointments,
                    'completed' => $completedAppointments,
                    'cancelled' => $cancelledAppointments,
                    'this_month' => $appointmentsThisMonth,
                    'today' => $appointmentsToday,
                ],
                'financial' => [
                    'total_revenue' => (float) $totalRevenue,
                    'revenue_this_month' => (float) $revenueThisMonth,
                    'escrow_held' => (float) $totalEscrowHeld,
                    'wallet_balance' => (float) $totalWalletBalance,
                    'total_transactions' => $totalTransactions,
                    'transactions_this_month' => $transactionsThisMonth,
                ],
                'verifications' => [
                    'pending' => $pendingVerifications,
                    'approved' => $approvedVerifications,
                    'rejected' => $rejectedVerifications,
                ],
                'moderation' => [
                    'total_reports' => $totalReports,
                    'unresolved_reports' => $unresolvedReports,
                    'total_reviews' => $totalReviews,
                ],
                'monthlyStats' => $monthlyStats,
            ];
        });

        // Real-time Recent Activity
        $recentReports = Report::with(['appointment', 'user'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'reason' => $report->reason,
                    'description' => $report->description,
                    'user_name' => $report->user->name ?? 'Unknown',
                    'appointment_id' => $report->appointment_id,
                    'created_at' => $report->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $recentUsers = User::latest()
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'is_provider' => $user->isProvider(),
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('admin/dashboard/index', [
            'stats' => $stats,
            'recentReports' => $recentReports,
            'recentUsers' => $recentUsers,
            'monthlyStats' => $monthlyStats,
        ]);
    }
}
