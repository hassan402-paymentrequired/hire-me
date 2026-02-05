<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinancialController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->start_date 
            ? Carbon::parse($request->start_date) 
            : Carbon::now()->startOfMonth();
        $endDate = $request->end_date 
            ? Carbon::parse($request->end_date) 
            : Carbon::now()->endOfDay();

        // Overall Financial Summary
        $totalRevenue = WalletTransaction::where('type', 'escrow_release')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $totalDeposits = WalletTransaction::where('type', 'deposit')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $totalWithdrawals = WalletTransaction::where('type', 'withdrawal')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $totalRefunds = WalletTransaction::where('type', 'escrow_refund')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $totalEscrowHeld = Wallet::sum('escrow_balance');
        $totalWalletBalance = Wallet::sum('balance');

        // Transaction Statistics
        $transactionStats = WalletTransaction::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('type, status, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('type', 'status')
            ->get();

        // Top Providers by Revenue
        $topProviders = Appointment::where('status', 'completed')
            ->whereBetween('payment_released_at', [$startDate, $endDate])
            ->whereNotNull('payment_released_at')
            ->selectRaw('provider_id, COUNT(*) as appointments_count, SUM(price) as total_revenue')
            ->with('provider.businessProfile')
            ->groupBy('provider_id')
            ->orderBy('total_revenue', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'provider_id' => $item->provider_id,
                    'provider_name' => $item->provider->businessProfile->business_name ?? $item->provider->name,
                    'appointments_count' => $item->appointments_count,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            });

        // Fraud Detection - Suspicious Patterns
        $fraudIndicators = $this->detectFraud($startDate, $endDate);

        // Recent Large Transactions (Potential Fraud Detection)
        $largeTransactions = WalletTransaction::where('amount', '>=', 100000) // ₦100,000+
            ->whereBetween('created_at', [$startDate, $endDate])
            ->with('user')
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'amount' => (float) $transaction->amount,
                    'status' => $transaction->status,
                    'user_name' => $transaction->user->name ?? 'Unknown',
                    'user_email' => $transaction->user->email ?? 'Unknown',
                    'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'description' => $transaction->description,
                ];
            });

        // Daily Revenue Chart Data (Last 30 days)
        $dailyRevenue = [];
        $currentDate = $startDate->copy();
        while ($currentDate->lte($endDate) && count($dailyRevenue) < 30) {
            $dayEnd = $currentDate->copy()->endOfDay();
            $revenue = WalletTransaction::where('type', 'escrow_release')
                ->where('status', 'completed')
                ->whereBetween('created_at', [$currentDate, $dayEnd])
                ->sum('amount');

            $dailyRevenue[] = [
                'date' => $currentDate->format('Y-m-d'),
                'revenue' => (float) $revenue,
            ];

            $currentDate->addDay();
        }

        // Transaction List
        $transactions = WalletTransaction::whereBetween('created_at', [$startDate, $endDate])
            ->with('user')
            ->latest()
            ->paginate(50)
            ->withQueryString()
            ->through(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'amount' => (float) $transaction->amount,
                    'status' => $transaction->status,
                    'user_name' => $transaction->user->name ?? 'System',
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('admin/financial/index', [
            'summary' => [
                'total_revenue' => (float) $totalRevenue,
                'total_deposits' => (float) $totalDeposits,
                'total_withdrawals' => (float) $totalWithdrawals,
                'total_refunds' => (float) $totalRefunds,
                'escrow_held' => (float) $totalEscrowHeld,
                'wallet_balance' => (float) $totalWalletBalance,
            ],
            'transactionStats' => $transactionStats,
            'topProviders' => $topProviders,
            'largeTransactions' => $largeTransactions,
            'fraudIndicators' => $fraudIndicators,
            'dailyRevenue' => $dailyRevenue,
            'transactions' => $transactions,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Detect potential fraud patterns
     */
    protected function detectFraud($startDate, $endDate)
    {
        $indicators = [];

        // 1. Multiple failed transactions from same user
        $failedTransactions = WalletTransaction::where('status', 'failed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('user_id, COUNT(*) as failed_count')
            ->groupBy('user_id')
            ->having('failed_count', '>=', 5)
            ->with('user')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => 'multiple_failed_transactions',
                    'severity' => 'medium',
                    'user_id' => $item->user_id,
                    'user_name' => $item->user->name ?? 'Unknown',
                    'count' => $item->failed_count,
                    'description' => "User has {$item->failed_count} failed transactions",
                ];
            });

        // 2. Rapid large deposits (potential money laundering)
        $rapidDeposits = WalletTransaction::where('type', 'deposit')
            ->where('status', 'completed')
            ->where('amount', '>=', 50000)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('user_id, COUNT(*) as deposit_count, SUM(amount) as total_amount, MIN(created_at) as first_deposit, MAX(created_at) as last_deposit')
            ->groupBy('user_id')
            ->havingRaw('TIMESTAMPDIFF(HOUR, MIN(created_at), MAX(created_at)) < 24')
            ->having('deposit_count', '>=', 3)
            ->with('user')
            ->get()
            ->map(function ($item) {
                $hoursDiff = Carbon::parse($item->first_deposit)->diffInHours(Carbon::parse($item->last_deposit));
                return [
                    'type' => 'rapid_large_deposits',
                    'severity' => 'high',
                    'user_id' => $item->user_id,
                    'user_name' => $item->user->name ?? 'Unknown',
                    'count' => $item->deposit_count,
                    'total_amount' => (float) $item->total_amount,
                    'time_span_hours' => $hoursDiff,
                    'description' => "User made {$item->deposit_count} large deposits (₦" . number_format($item->total_amount, 2) . ") within {$hoursDiff} hours",
                ];
            });

        // 3. Unusual refund patterns
        $unusualRefunds = WalletTransaction::where('type', 'escrow_refund')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('user_id, COUNT(*) as refund_count')
            ->groupBy('user_id')
            ->having('refund_count', '>=', 10)
            ->with('user')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => 'excessive_refunds',
                    'severity' => 'medium',
                    'user_id' => $item->user_id,
                    'user_name' => $item->user->name ?? 'Unknown',
                    'count' => $item->refund_count,
                    'description' => "User has {$item->refund_count} refunds (potential abuse)",
                ];
            });

        // 4. Suspicious withdrawal patterns
        $suspiciousWithdrawals = WalletTransaction::where('type', 'withdrawal')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('user_id, COUNT(*) as withdrawal_count, SUM(amount) as total_amount')
            ->groupBy('user_id')
            ->having('withdrawal_count', '>=', 20)
            ->with('user')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => 'excessive_withdrawals',
                    'severity' => 'low',
                    'user_id' => $item->user_id,
                    'user_name' => $item->user->name ?? 'Unknown',
                    'count' => $item->withdrawal_count,
                    'total_amount' => (float) $item->total_amount,
                    'description' => "User has {$item->withdrawal_count} withdrawals",
                ];
            });

        return [
            'multiple_failed' => $failedTransactions,
            'rapid_deposits' => $rapidDeposits,
            'excessive_refunds' => $unusualRefunds,
            'excessive_withdrawals' => $suspiciousWithdrawals,
            'total_indicators' => $failedTransactions->count() + $rapidDeposits->count() + $unusualRefunds->count() + $suspiciousWithdrawals->count(),
        ];
    }
}
