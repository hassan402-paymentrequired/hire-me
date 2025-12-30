<?php

namespace App\Http\Controllers\Provider\Business;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class BusinessController extends Controller
{
    public function businessHours()
    {
        $user = auth()->user();
        $businessProfile = $user->businessProfile;
        $settings = $businessProfile?->settings ?? [];

        // Fetch WorkHours from DB
        $workHours = \App\Models\WorkHour::where('provider_id', $user->id)->get();

        $schedule = null;
        if ($workHours->isNotEmpty()) {
            $schedule = [];
            $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

            foreach ($days as $day) {
                $dayRecords = $workHours->where('day_of_week', $day);

                if ($dayRecords->isEmpty()) {
                    // Default to closed if no record exists for this day but others exist
                    $schedule[$day] = ['isOpen' => false, 'shifts' => []];
                } else {
                    $firstRecord = $dayRecords->first();
                    if ($firstRecord->is_closed) {
                        $schedule[$day] = ['isOpen' => false, 'shifts' => []];
                    } else {
                        $shifts = $dayRecords->map(function ($record) {
                            return [
                                'start' => $record->start_time ? \Carbon\Carbon::parse($record->start_time)->format('H:i') : '09:00',
                                'end' => $record->end_time ? \Carbon\Carbon::parse($record->end_time)->format('H:i') : '17:00',
                                'breaks' => $record->breaks ?? []
                            ];
                        })->values()->toArray();

                        $schedule[$day] = [
                            'isOpen' => true,
                            'shifts' => $shifts
                        ];
                    }
                }
            }
        }

        return Inertia::render('provider/business/hours', [
            'initialSchedule' => $schedule,
            'initialHolidays' => $settings['holidays'] ?? [],
        ]);
    }

    public function updateBusinessHours(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();
        $profile = $user->businessProfile;

        // Update Holidays in Profile Settings
        $currentSettings = $profile->settings ?? [];
        $profile->settings = array_merge($currentSettings, [
            'holidays' => $request->holidays,
        ]);
        $profile->save();

        // Sync Work Hours
        // Strategy: Delete all existing for user and recreate
        \App\Models\WorkHour::where('provider_id', $user->id)->delete();

        if ($request->schedule) {
            foreach ($request->schedule as $day => $data) {
                if (empty($data['isOpen']) || $data['isOpen'] === false) {
                    \App\Models\WorkHour::create([
                        'provider_id' => $user->id,
                        'day_of_week' => $day,
                        'is_closed' => true,
                    ]);
                } else {
                    if (!empty($data['shifts'])) {
                        foreach ($data['shifts'] as $shift) {
                            \App\Models\WorkHour::create([
                                'provider_id' => $user->id,
                                'day_of_week' => $day,
                                'start_time' => $shift['start'],
                                'end_time' => $shift['end'],
                                'breaks' => $shift['breaks'] ?? [],
                                'is_closed' => false,
                            ]);
                        }
                    } else {
                        // Open but no shifts defined? Treat as closed or ignoring?
                        // Let's create a placeholder or just ignore.
                        // If isOpen is true but no shifts, it's ambiguous.
                        // Frontend usually provides at least one shift if isOpen.
                    }
                }
            }
        }

        return back();
    }

    public function services()
    {
        $user = auth()->user();
        $services = $user->services()->with('category')->get();
        $categories = \App\Models\Category::orderBy('name')->get();

        // 1. Total Services with "change" (mocked change for now)
        $totalServices = $services->count();

        // 2. Active Categories listed
        $activeCategoriesCount = $services->whereNotNull('category_id')->pluck('category_id')->unique()->count();

        // 3. Most Booked Service
        $mostBookedService = $user->appointmentsAsProvider()
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->selectRaw('services.name, COUNT(appointments.id) as bookings')
            ->whereIn('appointments.status', ['confirmed', 'completed'])
            ->groupBy('services.id', 'services.name')
            ->orderByDesc('bookings')
            ->first();

        return Inertia::render('provider/business/services/index', [
            'services' => $services->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'description' => $s->description,
                'price' => $s->price,
                'duration_minutes' => $s->duration_minutes,
                'category_id' => $s->category_id,
                'category_name' => $s->category?->name,
                'status' => $s->status,
            ]),
            'categories' => $categories,
            'stats' => [
                'totalServices' => [
                    'value' => $totalServices,
                    'change' => '+12%', // Mock
                ],
                'activeCategories' => $activeCategoriesCount,
                'mostBooked' => [
                    'name' => $mostBookedService?->name ?? 'N/A',
                    'change' => '+5%', // Mock
                ]
            ]
        ]);
    }

    public function storeService(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        \App\Models\Service::create([
            'provider_id' => auth()->id(),
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'duration_minutes' => $request->duration_minutes,
            'status' => 'active',
        ]);

        return back()->with('success', 'Service created successfully.');
    }

    public function updateService(\Illuminate\Http\Request $request, $id)
    {
        $service = \App\Models\Service::where('provider_id', auth()->id())->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $service->update($request->only(['name', 'description', 'price', 'duration_minutes', 'category_id']));

        return back()->with('success', 'Service updated successfully.');
    }

    public function toggleServiceStatus($id)
    {
        $service = \App\Models\Service::where('provider_id', auth()->id())->findOrFail($id);
        $service->status = $service->status === 'active' ? 'inactive' : 'active';
        $service->save();

        return back();
    }

    public function destroyService($id)
    {
        $service = \App\Models\Service::where('provider_id', auth()->id())->findOrFail($id);
        $service->delete();

        return back();
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
