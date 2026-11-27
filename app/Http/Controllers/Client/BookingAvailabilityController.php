<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\User;
use App\Services\BookingAvailabilityService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingAvailabilityController extends Controller
{
    public function __construct(private BookingAvailabilityService $availability) {}

    /**
     * Open slot counts for the seven days starting at `start`.
     */
    public function week(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:users,id',
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:services,id',
            'start' => 'required|date',
            'service_team_members' => 'nullable|array',
            'service_team_members.*' => 'nullable|string',
            'reschedule_id' => 'nullable|exists:appointments,id',
        ]);

        $provider = User::with('businessProfile')->findOrFail($validated['provider_id']);
        $teamMembers = $this->availability->resolveTeamMembers(
            $provider->id,
            array_values($validated['service_ids']),
            $validated['service_team_members'] ?? [],
            null,
        );

        if ($teamMembers === null) {
            return response()->json(['days' => [], 'message' => 'The selected team member is no longer available.'], 422);
        }

        return response()->json([
            'days' => $this->availability->weekSummary(
                $provider,
                Service::whereIn('id', $validated['service_ids'])->where('provider_id', $provider->id)->get(),
                Carbon::parse($validated['start']),
                collect($teamMembers)->map(fn (?TeamMember $member) => $member?->id)->values()->all(),
                $validated['reschedule_id'] ?? null,
            ),
        ]);
    }

    /**
     * Soonest open time for one service with anyone, and with each professional.
     */
    public function nextAvailable(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:services,id',
        ]);

        $provider = User::with('businessProfile')->findOrFail($validated['provider_id']);
        $services = Service::whereKey($validated['service_id'])->where('provider_id', $provider->id)->get();

        if ($services->isEmpty()) {
            return response()->json(['message' => 'This service is no longer available.'], 422);
        }

        $teamMemberIds = TeamMember::query()
            ->where('provider_id', $provider->id)
            ->where('user_id', '!=', $provider->id)
            ->where('is_active', true)
            ->whereNotNull('accepted_at')
            ->pluck('id');

        $next = ['any' => $this->availability->nextAvailableSlot($provider, $services, null)?->toIso8601String()];

        foreach ($teamMemberIds as $teamMemberId) {
            $next[$teamMemberId] = $this->availability->nextAvailableSlot($provider, $services, $teamMemberId)?->toIso8601String();
        }

        return response()->json(['next' => $next]);
    }
}
