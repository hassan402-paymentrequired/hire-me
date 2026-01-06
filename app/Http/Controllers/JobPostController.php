<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class JobPostController extends Controller
{
    public function store(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|gt:budget_min',
            'address' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $job = \App\Models\JobPost::create([
            'client_id' => auth()->id(),
            'status' => 'open',
            ...$validated
        ]);

        // TODO: Fire Event to notify nearby providers

        return back()->with('success-toast', 'Job posted successfully! Providers will be notified.');
    }

    public function create()
    {
        $categories = \App\Models\Category::all();
        return Inertia::render('client/jobs/post', ['categories' => $categories]);
    }

    public function clientIndex()
    {
        $jobs = \App\Models\JobPost::query()->where('client_id', auth()->id())
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
        $user = auth()->user();
        $profile = $user->businessProfile;

        // Simple Haversine for nearby jobs
        $lat = $profile->latitude;
        $lng = $profile->longitude;
        $radius = 50; // km

        $jobs = \App\Models\JobPost::query()->select('job_posts.*')
            ->selectRaw("(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance", [$lat, $lng, $lat])
            ->where('status', 'open')
            ->where('category', $profile->category) // Filter by provider category
            ->having('distance', '<', $radius)
            ->orderBy('distance')
            ->latest()
            ->paginate(12);

        return Inertia::render('provider/jobs/board', ['jobs' => $jobs]);
    }
}
