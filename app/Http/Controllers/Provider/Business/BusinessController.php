<?php

namespace App\Http\Controllers\Provider\Business;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class BusinessController extends Controller
{
    public function businessHours()
    {
        return Inertia::render('provider/business/hours');
    }

    public function analytics()
    {
        $user = auth()->user();

        // 1. Monthly Revenue (Current Year)
        $revenueData = $user->appointmentsAsProvider()
            ->selectRaw('MONTH(start_time) as month, SUM(price) as value')
            ->whereYear('start_time', date('Y'))
            ->whereIn('status', ['confirmed', 'completed'])
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($row) {
                return [
                    'month' => date('M', mktime(0, 0, 0, $row->month, 1)),
                    'value' => (float) $row->value,
                ];
            });

        // Fill missing months with 0
        $allMonths = collect(range(1, 12))->map(function ($m) {
            return date('M', mktime(0, 0, 0, $m, 1));
        });
        $revenueData = $allMonths->map(function ($month) use ($revenueData) {
            $found = $revenueData->firstWhere('month', $month);
            return $found ?? ['month' => $month, 'value' => 0];
        });


        // 2. Top Services
        $topServices = $user->appointmentsAsProvider()
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->selectRaw('services.name, COUNT(appointments.id) as bookings, SUM(appointments.price) as revenue')
            ->whereIn('appointments.status', ['confirmed', 'completed'])
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('revenue')
            ->take(5)
            ->get()
            ->map(function ($row) {
                return [
                    'name' => $row->name,
                    'bookings' => $row->bookings,
                    'revenue' => '₦' . number_format($row->revenue),
                ];
            });

        // 3. Key Metrics
        $totalRevenue = $user->appointmentsAsProvider()->whereIn('status', ['confirmed', 'completed'])->sum('price');
        $totalBookings = $user->appointmentsAsProvider()->count();
        $cancelCount = $user->appointmentsAsProvider()->where('status', 'cancelled')->count();
        $cancelRate = $totalBookings > 0 ? ($cancelCount / $totalBookings) * 100 : 0;

        return Inertia::render('provider/business/analytics', [
            'revenueData' => $revenueData,
            'topServices' => $topServices,
            'metrics' => [
                'totalRevenue' => '₦' . number_format($totalRevenue),
                'revenueChange' => '+20.1%', // Mock
                'totalBookings' => $totalBookings,
                'bookingsChange' => '+12%', // Mock
                'cancelRate' => number_format($cancelRate, 1) . '%',
                'cancelChange' => '+1.2%', // Mock
            ]
        ]);
    }
}
