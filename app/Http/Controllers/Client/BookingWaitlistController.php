<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use App\Services\BookingWaitlistService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BookingWaitlistController extends Controller
{
    public function __construct(private BookingWaitlistService $waitlist) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:users,id',
            'date' => 'required|date|after_or_equal:today',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:services,id',
        ]);

        $provider = User::findOrFail($validated['provider_id']);
        $client = auth_user();

        if (! $client->canBookProvider($provider)) {
            return back()->with('error-toast', 'You cannot join the waitlist for your own business.');
        }

        $serviceIds = Service::whereIn('id', $validated['service_ids'] ?? [])
            ->where('provider_id', $provider->id)
            ->pluck('id')
            ->all();
        $date = Carbon::parse($validated['date']);

        $this->waitlist->join($client, $provider, $date, $serviceIds);

        return back()->with('success-toast', 'You’re on the waitlist for '.$date->format('D j M').'. We’ll tell you if a slot opens up.');
    }
}
