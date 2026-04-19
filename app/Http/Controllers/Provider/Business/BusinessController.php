<?php

namespace App\Http\Controllers\Provider\Business;

use App\Http\Controllers\Controller;
use App\Models\BusinessImage;
use App\Models\BusinessProfile;
use App\Models\Category;
use App\Models\FavouriteBusiness;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Support\ProviderSettings;

class BusinessController extends Controller
{
    private function managedProvider()
    {
        return auth_user();
    }

    private function managedBusinessProfile(): ?BusinessProfile
    {
        return $this->managedProvider()?->businessProfile;
    }

    public function businessHours()
    {
        return Inertia::render('provider/business/hours/index', $this->businessHoursPayload());
    }

    public function businessHoursHolidays()
    {
        return Inertia::render('provider/business/hours/holidays', $this->businessHoursPayload());
    }

    protected function businessHoursPayload(): array
    {
        $provider = $this->managedProvider();
        $businessProfile = $this->managedBusinessProfile();
        $settings = ProviderSettings::resolve($businessProfile?->settings);

        // Fetch WorkHours from DB
        $workHours = \App\Models\WorkHour::where('provider_id', $provider?->id)->get();

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

        return [
            'initialSchedule' => $schedule,
            'initialHolidays' => $settings['holidays'] ?? [],
        ];
    }

    public function updateBusinessHours(\Illuminate\Http\Request $request)
    {
        $this->syncBusinessHours($request);

        return back()->with('success-toast', 'Weekly schedule updated successfully.');
    }

    public function updateBusinessHourHolidays(\Illuminate\Http\Request $request)
    {
        $profile = $this->managedBusinessProfile();

        if (! $profile) {
            return back()->with('error-toast', 'Business profile not found.');
        }

        $currentSettings = $profile->settings ?? [];
        $profile->settings = array_merge($currentSettings, [
            'holidays' => $request->holidays,
        ]);
        $profile->save();

        return back()->with('success-toast', 'Holiday schedule updated successfully.');
    }

    protected function syncBusinessHours(Request $request): void
    {
        $provider = $this->managedProvider();

        \App\Models\WorkHour::where('provider_id', $provider?->id)->delete();

        if ($request->schedule) {
            foreach ($request->schedule as $day => $data) {
                if (empty($data['isOpen']) || $data['isOpen'] === false) {
                    \App\Models\WorkHour::create([
                        'provider_id' => $provider?->id,
                        'day_of_week' => $day,
                        'is_closed' => true,
                    ]);
                } else {
                    if (!empty($data['shifts'])) {
                        foreach ($data['shifts'] as $shift) {
                            \App\Models\WorkHour::create([
                                'provider_id' => $provider?->id,
                                'day_of_week' => $day,
                                'start_time' => $shift['start'],
                                'end_time' => $shift['end'],
                                'breaks' => $shift['breaks'] ?? [],
                                'is_closed' => false,
                            ]);
                        }
                    }
                }
            }
        }
    }

    public function services(Request $request)
    {
        $provider = $this->managedProvider();
        $profile = $this->managedBusinessProfile();
        $search = trim((string) $request->get('search', ''));

        $servicesQuery = $provider->services()
            ->with('category')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            });

        $services = $servicesQuery->latest()->paginate(12)->withQueryString();
        $allServices = $provider->services()->with('category')->get();
        $businessCategory = null;
        if ($profile?->category) {
            $cat = \App\Models\Category::where('slug', $profile->category)->select(['id', 'name', 'slug'])->first();
            if ($cat) {
                $businessCategory = [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                ];
            }
        }

        // 1. Total Services with "change" (mocked change for now)
        $totalServices = $allServices->count();

        // 2. Active Categories listed
        $activeCategoriesCount = $allServices->whereNotNull('category_id')->pluck('category_id')->unique()->count();

        $activeServicesCount = $allServices->where('status', 'active')->count();
        $inactiveServicesCount = $allServices->where('status', 'inactive')->count();

        // 3. Most Booked Service
        $mostBookedService = $provider->appointmentsAsProvider()
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->selectRaw('services.name, COUNT(appointments.id) as bookings')
            ->whereIn('appointments.status', ['confirmed', 'completed'])
            ->groupBy('services.id', 'services.name')
            ->orderByRaw('COUNT(appointments.id) DESC')
            ->first();

        return Inertia::render('provider/business/services/index', [
            'services' => $services->through(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'description' => $s->description,
                'price' => $s->price,
                'duration_minutes' => $s->duration_minutes,
                'category_id' => $s->category_id,
                'category_name' => $s->category?->name,
                'status' => $s->status,
            ]),
            'businessCategory' => $businessCategory,
            'filters' => $request->only(['search']),
            'stats' => [
                'totalServices' => [
                    'value' => $totalServices,
                    'change' => '+12%', // Mock
                ],
                'activeCategories' => $activeCategoriesCount,
                'activeServices' => $activeServicesCount,
                'inactiveServices' => $inactiveServicesCount,
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
        ]);

        $provider = $this->managedProvider();
        $profile = $this->managedBusinessProfile();
        $categoryId = null;
        if ($profile?->category) {
            $categoryId = \App\Models\Category::where('slug', $profile->category)->value('id');
        }
        if (! $categoryId) {
            return back()->withErrors([
                'category_id' => 'Please set a valid business category in your business profile first.',
            ]);
        }

        \App\Models\Service::create([
            'provider_id' => $provider->id,
            'category_id' => $categoryId,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'duration_minutes' => $request->duration_minutes,
            'status' => 'active',
        ]);

        return back()->with('success-toast', 'Service created successfully.');
    }

    public function updateService(\Illuminate\Http\Request $request, $id)
    {
        $service = \App\Models\Service::where('provider_id', $this->managedProvider()->id)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
        ]);

        $service->update($request->only(['name', 'description', 'price', 'duration_minutes']));

        return back()->with('success-toast', 'Service updated successfully.');
    }

    public function toggleServiceStatus($id)
    {
        $service = \App\Models\Service::where('provider_id', $this->managedProvider()->id)->findOrFail($id);
        $service->status = $service->status === 'active' ? 'inactive' : 'active';
        $service->save();

        return back()->with('success-toast', "Service status changed to '{$service->status}'.");
    }

    public function destroyService($id)
    {
        $service = \App\Models\Service::where('provider_id', $this->managedProvider()->id)->findOrFail($id);
        $name = $service->name;
        $service->delete();

        return back()->with('success-toast', "Service '$name' deleted successfully.");
    }

    public function analytics(\Illuminate\Http\Request $request)
    {
        $provider = $this->managedProvider();
        $profile = $this->managedBusinessProfile();
        $range = $request->get('range', 'this_year'); // this_week, this_month, this_year

        // Calculate date range
        $now = now();
        $startDate = match($range) {
            'this_week' => $now->copy()->startOfWeek(),
            'this_month' => $now->copy()->startOfMonth(),
            'this_year' => $now->copy()->startOfYear(),
            default => $now->copy()->startOfYear(),
        };

        // Helper function to create fresh query instances
        $baseQuery = function() use ($provider, $startDate) {
            return $provider->appointmentsAsProvider()->where('start_time', '>=', $startDate);
        };

        // 1. Revenue Trends (Daily, Weekly, Monthly based on range) - Create fresh instances
        $revenueData = match($range) {
            'this_week' => $this->getDailyRevenue($provider->appointmentsAsProvider()->where('start_time', '>=', $startDate), $startDate),
            'this_month' => $this->getWeeklyRevenue($provider->appointmentsAsProvider()->where('start_time', '>=', $startDate), $startDate),
            'this_year' => $this->getMonthlyRevenue($provider->appointmentsAsProvider()->where('start_time', '>=', $startDate), $startDate),
            default => $this->getMonthlyRevenue($provider->appointmentsAsProvider()->where('start_time', '>=', $startDate), $startDate),
        };

        // 2. Booking Conversion Rates
        $totalViews = $profile?->views ?? 0; // Assuming views are tracked
        $totalBookings = $provider->appointmentsAsProvider()->where('start_time', '>=', $startDate)->count();
        $confirmedBookings = $provider->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereIn('status', ['confirmed', 'completed'])
            ->count();
        $conversionRate = $totalViews > 0 ? ($totalBookings / $totalViews) * 100 : 0;
        $confirmationRate = $totalBookings > 0 ? ($confirmedBookings / $totalBookings) * 100 : 0;

        // 3. Popular Services Analysis
        $topServices = $provider->appointmentsAsProvider()
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->selectRaw('services.name, COUNT(appointments.id) as bookings, SUM(appointments.price) as revenue, AVG(appointments.price) as avg_price')
            ->where('appointments.start_time', '>=', $startDate)
            ->whereIn('appointments.status', ['confirmed', 'completed'])
            ->groupBy('services.id', 'services.name')
            ->orderByRaw('SUM(appointments.price) DESC')
            ->take(10)
            ->get()
            ->map(function ($row) {
                return [
                    'name' => $row->name,
                    'bookings' => $row->bookings,
                    'revenue' => (float) $row->revenue,
                    'revenue_formatted' => '₦' . number_format($row->revenue),
                    'avg_price' => (float) $row->avg_price,
                ];
            });

        // 4. Peak Hours Identification - Create fresh instance
        $peakHours = $provider->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereIn('status', ['confirmed', 'completed'])
            ->selectRaw('HOUR(start_time) as hour, COUNT(*) as bookings')
            ->groupByRaw('HOUR(start_time)')
            ->orderByRaw('COUNT(*) DESC')
            ->get()
            ->map(function ($row) {
                $hour = (int) $row->hour;
                return [
                    'hour' => $hour,
                    'display' => date('g A', mktime($hour, 0, 0)),
                    'bookings' => $row->bookings,
                ];
            });

        // Fill all 24 hours for chart
        $allHours = collect(range(0, 23))->map(function ($h) use ($peakHours) {
            $found = $peakHours->firstWhere('hour', $h);
            return $found ?? [
                'hour' => $h,
                'display' => date('g A', mktime($h, 0, 0)),
                'bookings' => 0,
            ];
        })->sortBy('hour')->values();

        // 5. Customer Retention Metrics
        // Create fresh query instances to avoid contamination from previous queries
        $uniqueClients = $provider->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereNotNull('client_id')
            ->distinct('client_id')
            ->count('client_id');
        
        $returningClients = $provider->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereNotNull('client_id')
            ->select('client_id')
            ->groupBy('client_id')
            ->havingRaw('COUNT(*) > 1')
            ->get()
            ->count();
        
        $retentionRate = $uniqueClients > 0 ? ($returningClients / $uniqueClients) * 100 : 0;

        // Calculate repeat customer bookings
        $repeatBookings = $provider->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereNotNull('client_id')
            ->select('client_id')
            ->groupBy('client_id')
            ->havingRaw('COUNT(*) > 1')
            ->get()
            ->count();

        // 6. Review Sentiment Analysis
        $reviews = \App\Models\Review::where('provider_id', $provider->id)
            ->where('created_at', '>=', $startDate)
            ->get();

        $totalReviews = $reviews->count();
        $positiveReviews = $reviews->where('rating', '>=', 4)->count();
        $neutralReviews = $reviews->where('rating', '=', 3)->count();
        $negativeReviews = $reviews->where('rating', '<=', 2)->count();

        $sentimentData = [
            'total' => $totalReviews,
            'positive' => $totalReviews > 0 ? ($positiveReviews / $totalReviews) * 100 : 0,
            'neutral' => $totalReviews > 0 ? ($neutralReviews / $totalReviews) * 100 : 0,
            'negative' => $totalReviews > 0 ? ($negativeReviews / $totalReviews) * 100 : 0,
            'average_rating' => $totalReviews > 0 ? $reviews->avg('rating') : 0,
        ];

        // 7. Geographic Demand Heatmap (by client location if available, otherwise by appointment aaress) - Create fresh instance
        $geographicData = $provider->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereIn('status', ['confirmed', 'completed'])
            ->join('users', 'appointments.client_id', '=', 'users.id')
            ->leftJoin('business_profiles', 'users.id', '=', 'business_profiles.user_id')
            ->selectRaw('
                COALESCE(business_profiles.city, business_profiles.state, "Unknown") as location,
                COUNT(appointments.id) as bookings,
                SUM(appointments.price) as revenue
            ')
            ->groupBy('location')
            ->orderByRaw('COUNT(appointments.id) DESC')
            ->take(10)
            ->get()
            ->map(function ($row) {
                return [
                    'location' => $row->location,
                    'bookings' => $row->bookings,
                    'revenue' => (float) $row->revenue,
                ];
            });

        // 8. Key Metrics with real calculations - Create fresh instances
        $previousPeriodStart = $startDate->copy()->sub($range === 'this_week' ? '1 week' : ($range === 'this_month' ? '1 month' : '1 year'));
        $previousPeriodEnd = $startDate->copy()->subDay();

        $currentRevenue = $provider->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('price');
        $previousRevenue = $provider->appointmentsAsProvider()
            ->whereIn('status', ['confirmed', 'completed'])
            ->whereBetween('start_time', [$previousPeriodStart, $previousPeriodEnd])
            ->sum('price');

        $currentBookings = $provider->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->count();
        $previousBookings = $provider->appointmentsAsProvider()
            ->whereBetween('start_time', [$previousPeriodStart, $previousPeriodEnd])
            ->count();

        $cancelCount = $provider->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->where('status', 'cancelled')
            ->count();
        $previousCancelCount = $provider->appointmentsAsProvider()
            ->where('status', 'cancelled')
            ->whereBetween('start_time', [$previousPeriodStart, $previousPeriodEnd])
            ->count();

        $cancelRate = $currentBookings > 0 ? ($cancelCount / $currentBookings) * 100 : 0;
        $previousCancelRate = $previousBookings > 0 ? ($previousCancelCount / $previousBookings) * 100 : 0;

        $revenueChange = $previousRevenue > 0 ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;
        $bookingsChange = $previousBookings > 0 ? (($currentBookings - $previousBookings) / $previousBookings) * 100 : 0;
        $cancelChange = $previousCancelRate > 0 ? ($cancelRate - $previousCancelRate) : 0;

        return Inertia::render('provider/business/analytics', [
            'range' => $range,
            'revenueData' => $revenueData,
            'topServices' => $topServices,
            'peakHours' => $allHours,
            'conversionMetrics' => [
                'conversion_rate' => round($conversionRate, 2),
                'confirmation_rate' => round($confirmationRate, 2),
                'total_views' => $totalViews,
                'total_bookings' => $totalBookings,
            ],
            'retentionMetrics' => [
                'unique_clients' => $uniqueClients,
                'returning_clients' => $returningClients,
                'retention_rate' => round($retentionRate, 2),
                'repeat_bookings' => $repeatBookings,
            ],
            'sentimentData' => $sentimentData,
            'geographicData' => $geographicData,
            'metrics' => [
                'totalRevenue' => '₦' . number_format($currentRevenue),
                'revenueChange' => ($revenueChange >= 0 ? '+' : '') . number_format($revenueChange, 1) . '%',
                'totalBookings' => $currentBookings,
                'bookingsChange' => ($bookingsChange >= 0 ? '+' : '') . number_format($bookingsChange, 1) . '%',
                'cancelRate' => number_format($cancelRate, 1) . '%',
                'cancelChange' => ($cancelChange >= 0 ? '+' : '') . number_format($cancelChange, 1) . '%',
            ]
        ]);
    }

    private function getDailyRevenue($appointments, $startDate)
    {
        $endDate = now();
        $days = $startDate->diffInDays($endDate) + 1;
        
        $revenueData = $appointments
            ->whereIn('status', ['confirmed', 'completed'])
            ->selectRaw('DATE(start_time) as date, SUM(price) as value')
            ->groupByRaw('DATE(start_time)')
            ->orderByRaw('DATE(start_time)')
            ->get()
            ->keyBy(function ($row) {
                return \Carbon\Carbon::parse($row->date)->format('Y-m-d');
            });

        return collect(range(0, $days - 1))->map(function ($day) use ($startDate, $revenueData) {
            $date = $startDate->copy()->addDays($day);
            $key = $date->format('Y-m-d');
            $found = $revenueData->get($key);
            return [
                'label' => $date->format('M d'),
                'value' => $found ? (float) $found->value : 0,
            ];
        });
    }

    private function getWeeklyRevenue($appointments, $startDate)
    {
        $endDate = now();
        $weeks = $startDate->diffInWeeks($endDate) + 1;
        
        $revenueData = $appointments
            ->whereIn('status', ['confirmed', 'completed'])
            ->selectRaw('DATE(DATE_SUB(start_time, INTERVAL WEEKDAY(start_time) DAY)) as week_start, SUM(price) as value')
            ->groupByRaw('DATE(DATE_SUB(start_time, INTERVAL WEEKDAY(start_time) DAY))')
            ->orderByRaw('DATE(DATE_SUB(start_time, INTERVAL WEEKDAY(start_time) DAY))')
            ->get()
            ->keyBy(function ($row) {
                return \Carbon\Carbon::parse($row->week_start)->format('Y-m-d');
            });

        return collect(range(0, $weeks - 1))->map(function ($week) use ($startDate, $revenueData) {
            $weekStart = $startDate->copy()->addWeeks($week)->startOfWeek();
            $weekKey = $weekStart->format('Y-m-d');
            $found = $revenueData->get($weekKey);
            return [
                'label' => 'Week ' . ($week + 1) . ' (' . $weekStart->format('M d') . ')',
                'value' => $found ? (float) $found->value : 0,
            ];
        });
    }

    private function getMonthlyRevenue($appointments, $startDate)
    {
        $revenueData = $appointments
            ->whereIn('status', ['confirmed', 'completed'])
            ->selectRaw('MONTH(start_time) as month, SUM(price) as value')
            ->whereYear('start_time', $startDate->year)
            ->groupByRaw('MONTH(start_time)')
            ->orderByRaw('MONTH(start_time)')
            ->get()
            ->map(function ($row) {
                return [
                    'month' => (int) $row->month,
                    'month_name' => date('M', mktime(0, 0, 0, $row->month, 1)),
                    'value' => (float) $row->value,
                ];
            });

        $allMonths = collect(range(1, 12))->map(function ($m) {
            return [
                'number' => $m,
                'name' => date('M', mktime(0, 0, 0, $m, 1)),
            ];
        });
        
        return $allMonths->map(function ($month) use ($revenueData) {
            $found = $revenueData->firstWhere('month', $month['number']);
            return [
                'label' => $month['name'],
                'value' => $found ? $found['value'] : 0,
            ];
        });
    }

    public function settings()
    {
        return $this->renderBusinessSettingsPage('provider/business/settings/index');
    }

    public function settingsLocation()
    {
        return $this->renderBusinessSettingsPage('provider/business/settings/location');
    }

    public function settingsAdvanced()
    {
        return $this->renderBusinessSettingsPage('provider/business/settings/advanced');
    }

    public function settingsAppearance()
    {
        return $this->renderBusinessSettingsPage('provider/business/settings/appearance');
    }

    private function renderBusinessSettingsPage(string $page)
    {
        $provider = $this->managedProvider();
        
        $profile = $provider?->businessProfile()->with('images')->first();
        $categories = Category::orderBy('name')->get()->map(function ($category) {
            return [
                'value' => $category->slug,
                'label' => $category->name,
            ];
        });

        return Inertia::render($page, [
            'profile' => $profile ? [
                'id' => $profile->id,
                'business_name' => $profile->business_name,
                'description' => $profile->description,
                'address' => $profile->address,
                'city' => $profile->city,
                'state' => $profile->state,
                'zip_code' => $profile->zip_code,
                'phone' => $profile->phone,
                'category' => $profile->category,
                'latitude' => $profile->latitude,
                'longitude' => $profile->longitude,
                'settings' => ProviderSettings::resolve($profile->settings ?? []),
                'widget_enabled' => $profile->widget_enabled ?? false,
                'widget_settings' => $profile->widget_settings ?? [],
                'widget_domains' => $profile->widget_domains ?? [],
                'slug' => $profile->slug,
                'images' => $profile->images->map(fn($img) => [
                    'id' => $img->id,
                    'path' => \App\Services\FileUploadService::url($img->image_path, config('filesystems.default')),
                    'is_logo' => $img->is_logo,
                ]),
            ] : null,
            'categories' => $categories,
        ]);
    }

    public function updateSettings(Request $request)
    {
        return $this->updateGeneralSettings($request);
    }

    public function updateGeneralSettings(Request $request)
    {
        $profile = $this->managedBusinessProfile();

        $request->validate([
            'business_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'category' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'offers_home_service' => 'nullable|boolean',
        ]);

        try {
            if (! $profile) {
                return back()->with('error-toast', 'Business profile not found.');
            }

            $profile->update([
                'business_name' => $request->business_name,
                'description' => $request->description,
                'phone' => $request->phone,
                'category' => $request->category,
                'settings' => \App\Support\ProviderSettings::sanitize(array_merge($profile->settings ?? [], [
                    'offers_home_service' => $request->boolean('offers_home_service'),
                ])),
            ]);

            return back()->with('success-toast', 'General business information updated successfully.');
        } catch (\Exception $e) {
            Log::error("Error updating business general settings: {$e->getMessage()}");
            return back()->with('error-toast', 'Error updating business settings. Please try again.');
        }
    }

    public function updateLocationSettings(Request $request)
    {
        $profile = $this->managedBusinessProfile();

        $request->validate([
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        try {
            if (! $profile) {
                return back()->with('error-toast', 'Business profile not found.');
            }

            $profile->update([
                'address' => $request->address,
                'city' => $request->city,
                'state' => $request->state,
                'zip_code' => $request->zip_code,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);

            return back()->with('success-toast', 'Business location updated successfully.');
        } catch (\Exception $e) {
            Log::error("Error updating business location settings: {$e->getMessage()}");
            return back()->with('error-toast', 'Error updating business location. Please try again.');
        }
    }

    public function updateAdvancedSettings(Request $request)
    {
        $profile = $this->managedBusinessProfile();

        $request->validate([
            'settings' => 'nullable|array',
        ]);

        try {
            if (! $profile) {
                return back()->with('error-toast', 'Business profile not found.');
            }

            $profile->update([
                'settings' => \App\Support\ProviderSettings::sanitize(array_merge($profile->settings ?? [], $request->settings ?? [])),
                'has_setup_business_policy' => true,
            ]);

            return back()->with('success-toast', 'Advanced business settings updated successfully.');
        } catch (\Exception $e) {
            Log::error("Error updating business advanced settings: {$e->getMessage()}");
            return back()->with('error-toast', 'Error updating advanced settings. Please try again.');
        }
    }

    public function updateAppearanceSettings(Request $request)
    {
        $profile = $this->managedBusinessProfile();

        if (! $profile) {
            return back()->with('error-toast', 'Business profile not found.');
        }

        $currentBannerCount = $profile->images()->where('is_logo', false)->count();
        $deleteCount = count($request->input('delete_image_ids', []));
        $remainingBannerCount = max(0, $currentBannerCount - $deleteCount);
        $incomingBannerCount = count($request->file('new_images', []));

        $request->validate([
            'logo' => 'nullable|image|max:2048',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|max:5120',
            'delete_image_ids' => 'nullable|array',
            'delete_image_ids.*' => 'exists:business_images,id',
        ]);

        if (($remainingBannerCount + $incomingBannerCount) > 3) {
            return back()->withErrors([
                'new_images' => 'You can only keep up to 3 banner images at a time, excluding your logo.',
            ]);
        }

        try {
            DB::beginTransaction();

            if ($request->hasFile('logo')) {
                $oldLogo = $profile->images()->where('is_logo', true)->first();
                if ($oldLogo) {
                    \App\Services\FileUploadService::delete($oldLogo->image_path, 'public');
                    $oldLogo->delete();
                }

                $path = \App\Services\FileUploadService::upload(
                    $request->file('logo'),
                    'business-logos',
                    'public'
                );
                $profile->images()->create([
                    'image_path' => $path,
                    'is_logo' => true,
                ]);
            }

            if ($request->hasFile('new_images')) {
                foreach ($request->file('new_images') as $image) {
                    $path = \App\Services\FileUploadService::upload(
                        $image,
                        'business-images',
                        'public'
                    );
                    $profile->images()->create([
                        'image_path' => $path,
                        'is_logo' => false,
                    ]);
                }
            }

            if ($request->delete_image_ids) {
                $imagesToDelete = BusinessImage::whereIn('id', $request->delete_image_ids)
                    ->where('business_profile_id', $profile->id)
                    ->get();

                foreach ($imagesToDelete as $img) {
                    \App\Services\FileUploadService::delete($img->image_path, 'public');
                    $img->delete();
                }
            }

            DB::commit();
            return back()->with('success-toast', 'Business appearance updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating business appearance settings: {$e->getMessage()}");
            return back()->with('error-toast', 'Error updating business appearance. Please try again.');
        }
    }

    public function markFavourites(Request $request)
    {
        try {
            $request->validate(['id' => 'required|exists:business_profiles,id']);

            $existing = FavouriteBusiness::query()->where('user_id', auth()->id())->where('business_profile_id', $request->id)->first();
$message = '';
            if(!$existing)
            {
                 FavouriteBusiness::query()->create(
                    [
                        'user_id' => auth()->id(),
                        'business_profile_id' => $request->id
                    ]
                );
                $message = 'Business marked as favourite.';
            }else{
                $existing->delete();
                $message = 'Business removed from favourites.';
            }

            return back()->with('success-toast', $message);

        }catch (\Exception $e) {
            Log::error("Error marking business as favourite: {$e->getMessage()}");
            return back()->with('error-toast', 'Error marking business as favourite. Please try again.');
        }
    }

    public function getUserFav()
    {
        $favourites = FavouriteBusiness::query()->where('user_id', auth()->id())
            ->with(['businessProfile.user', 'user'])
            ->get();
        return response()->json($favourites);
    }
}
