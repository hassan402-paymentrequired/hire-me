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

        return back()->with('success-toast', 'Business configuration updated successfully.');
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
            ->orderByRaw('COUNT(appointments.id) DESC')
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

        return back()->with('success-toast', 'Service created successfully.');
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

        return back()->with('success-toast', 'Service updated successfully.');
    }

    public function toggleServiceStatus($id)
    {
        $service = \App\Models\Service::where('provider_id', auth()->id())->findOrFail($id);
        $service->status = $service->status === 'active' ? 'inactive' : 'active';
        $service->save();

        return back()->with('success-toast', "Service status changed to '{$service->status}'.");
    }

    public function destroyService($id)
    {
        $service = \App\Models\Service::where('provider_id', auth()->id())->findOrFail($id);
        $name = $service->name;
        $service->delete();

        return back()->with('success-toast', "Service '$name' deleted successfully.");
    }

    public function analytics(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();
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
        $baseQuery = function() use ($user, $startDate) {
            return $user->appointmentsAsProvider()->where('start_time', '>=', $startDate);
        };

        // 1. Revenue Trends (Daily, Weekly, Monthly based on range) - Create fresh instances
        $revenueData = match($range) {
            'this_week' => $this->getDailyRevenue($user->appointmentsAsProvider()->where('start_time', '>=', $startDate), $startDate),
            'this_month' => $this->getWeeklyRevenue($user->appointmentsAsProvider()->where('start_time', '>=', $startDate), $startDate),
            'this_year' => $this->getMonthlyRevenue($user->appointmentsAsProvider()->where('start_time', '>=', $startDate), $startDate),
            default => $this->getMonthlyRevenue($user->appointmentsAsProvider()->where('start_time', '>=', $startDate), $startDate),
        };

        // 2. Booking Conversion Rates
        $totalViews = $user->businessProfile?->views ?? 0; // Assuming views are tracked
        $totalBookings = $user->appointmentsAsProvider()->where('start_time', '>=', $startDate)->count();
        $confirmedBookings = $user->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereIn('status', ['confirmed', 'completed'])
            ->count();
        $conversionRate = $totalViews > 0 ? ($totalBookings / $totalViews) * 100 : 0;
        $confirmationRate = $totalBookings > 0 ? ($confirmedBookings / $totalBookings) * 100 : 0;

        // 3. Popular Services Analysis
        $topServices = $user->appointmentsAsProvider()
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
        $peakHours = $user->appointmentsAsProvider()
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
        $uniqueClients = $user->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereNotNull('client_id')
            ->distinct('client_id')
            ->count('client_id');
        
        $returningClients = $user->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereNotNull('client_id')
            ->select('client_id')
            ->groupBy('client_id')
            ->havingRaw('COUNT(*) > 1')
            ->get()
            ->count();
        
        $retentionRate = $uniqueClients > 0 ? ($returningClients / $uniqueClients) * 100 : 0;

        // Calculate repeat customer bookings
        $repeatBookings = $user->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereNotNull('client_id')
            ->select('client_id')
            ->groupBy('client_id')
            ->havingRaw('COUNT(*) > 1')
            ->get()
            ->count();

        // 6. Review Sentiment Analysis
        $reviews = \App\Models\Review::where('provider_id', $user->id)
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

        // 7. Geographic Demand Heatmap (by client location if available, otherwise by appointment address) - Create fresh instance
        $geographicData = $user->appointmentsAsProvider()
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

        $currentRevenue = $user->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('price');
        $previousRevenue = $user->appointmentsAsProvider()
            ->whereIn('status', ['confirmed', 'completed'])
            ->whereBetween('start_time', [$previousPeriodStart, $previousPeriodEnd])
            ->sum('price');

        $currentBookings = $user->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->count();
        $previousBookings = $user->appointmentsAsProvider()
            ->whereBetween('start_time', [$previousPeriodStart, $previousPeriodEnd])
            ->count();

        $cancelCount = $user->appointmentsAsProvider()
            ->where('start_time', '>=', $startDate)
            ->where('status', 'cancelled')
            ->count();
        $previousCancelCount = $user->appointmentsAsProvider()
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
        $user = auth()->user();
        $profile = $user->businessProfile()->with('images')->first();
        $categories = Category::orderBy('name')->get()->map(function ($category) {
            return [
                'value' => $category->slug,
                'label' => $category->name,
            ];
        });

        return Inertia::render('provider/business/settings', [
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
                'settings' => $profile->settings ?? [],
                'widget_enabled' => $profile->widget_enabled ?? false,
                'widget_settings' => $profile->widget_settings ?? [],
                'widget_domains' => $profile->widget_domains ?? [],
                'slug' => $profile->slug,
                'images' => $profile->images->map(fn($img) => [
                    'id' => $img->id,
                    'path' => \App\Services\FileUploadService::url($img->image_path, 'public'),
                    'is_logo' => $img->is_logo,
                ]),
            ] : null,
            'categories' => $categories,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $user = auth()->user();
        $profile = $user->businessProfile;

        $request->validate([
            'business_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'category' => 'nullable|string|max:50',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'settings' => 'nullable|array',
            'widget_enabled' => 'nullable|boolean',
            'widget_settings' => 'nullable|array',
            'widget_domains' => 'nullable|array',
            'logo' => 'nullable|image|max:2048',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|max:5120',
            'delete_image_ids' => 'nullable|array',
            'delete_image_ids.*' => 'exists:business_images,id',
        ]);

        try {
            DB::beginTransaction();

            $profile->update([
                'business_name' => $request->business_name,
                'description' => $request->description,
                'address' => $request->address,
                'city' => $request->city,
                'state' => $request->state,
                'zip_code' => $request->zip_code,
                'phone' => $request->phone,
                'category' => $request->category,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'settings' => array_merge($profile->settings ?? [], $request->settings ?? []),
                'widget_enabled' => $request->has('widget_enabled') ? (bool)$request->widget_enabled : $profile->widget_enabled,
                'widget_settings' => $request->widget_settings ?? $profile->widget_settings,
                'widget_domains' => $request->widget_domains ?? $profile->widget_domains,
            ]);

            // Handle Logo Upload
            if ($request->hasFile('logo')) {
                // Delete old logo
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

            // Handle New Images
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

            // Handle Image Deletion
            if ($request->delete_image_ids) {
                // Get image paths first
                $imagesToDelete = BusinessImage::whereIn('id', $request->delete_image_ids)
                    ->where('business_profile_id', $profile->id)
                    ->get();

                foreach ($imagesToDelete as $img) {
                    \App\Services\FileUploadService::delete($img->image_path, 'public');
                    $img->delete();
                }
            }

            DB::commit();
            return to_route('business.settings')->with('success-toast', 'Business settings updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating business settings: {$e->getMessage()}");
            return to_route('business.settings')->with('error-toast', 'Error updating business settings. Please try again.');
        }
    }

    public function markFavourites(Request $request)
    {
        try {
            $request->validate(['id' => 'required|exists:business_profiles,id']);

            $existing = FavouriteBusiness::query()->where('user_id', auth()->id())->where('business_profile_id', $request->id)->first();

            if(!$existing)
            {
                 FavouriteBusiness::query()->create(
                    [
                        'user_id' => auth()->id(),
                        'business_profile_id' => $request->id
                    ]
                );
            }else{
                $existing->delete();
            }

            return back()->with('success-toast', 'Business marked as favourite successfully.');

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
