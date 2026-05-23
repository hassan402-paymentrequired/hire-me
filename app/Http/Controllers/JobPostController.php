<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class JobPostController extends Controller
{
    protected function ensureJobBoardEnabled(): void
    {
        abort_unless(config('features.job_board', false), 404);
    }

    public function store(Request $request)
    {
        $this->ensureJobBoardEnabled();
        $validated = $request->validate([
            'category' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|gt:budget_min',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);
        try {

            $job = \App\Models\JobPost::create([
                'client_id' => Auth::id(),
                'status' => 'open',
                ...$validated
            ]);

            // TODO: Fire Event to notify nearby providers the vent goes here

            return back()->with('success-toast', 'Job posted successfully! Providers will be notified.');
        } catch (Exception $e) {
            Log::error($e->getMessage());
            return back()->with('error-toast', ' An error occurred while posting your job');
        }
    }

    public function create()
    {
        $this->ensureJobBoardEnabled();
        $categories = \App\Models\Category::all();
        return Inertia::render('client/jobs/post', ['categories' => $categories]);
    }

    public function clientIndex()
    {
        $this->ensureJobBoardEnabled();
        $jobs = \App\Models\JobPost::query()->where('client_id', Auth::id())
            ->with([
                'bids' => function ($query) {
                    $query->with('provider.businessProfile')->latest();
                }
            ])
            ->withCount('bids')
            ->latest()
            ->get();

        return Inertia::render('client/jobs/index', ['jobs' => $jobs]);
    }

    public function providerBoard(\Illuminate\Http\Request $request)
    {
        $this->ensureJobBoardEnabled();
        $user = Auth::user();
        $profile = $user->businessProfile;

        if (!$profile) {
            return Inertia::render('provider/jobs/board', ['jobs' => collect([])]);
        }

        // If provider doesn't have location, show all jobs in their category (without distance)
        if (!$profile->latitude || !$profile->longitude) {
            $jobs = \App\Models\JobPost::query()
                ->where('status', 'open')
                ->where('category', $profile->category ?? '')
                ->latest()
                ->paginate(12);

            return Inertia::render('provider/jobs/board', ['jobs' => $jobs]);
        }

        // Simple Haversine for nearby jobs (only for jobs with coordinates)
        $lat = $profile->latitude;
        $lng = $profile->longitude;
        $radius = 50; // km

        $jobs = \App\Models\JobPost::query()->select('job_posts.*')
            ->selectRaw("(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance", [$lat, $lng, $lat])
            ->where('status', 'open')
            ->where('category', $profile->category) // Filter by provider category
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->having('distance', '<', $radius)
            ->orderBy('distance')
            ->latest()
            ->paginate(12);

        return Inertia::render('provider/jobs/board', ['jobs' => $jobs]);
    }
}
