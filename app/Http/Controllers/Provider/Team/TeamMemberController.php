<?php

namespace App\Http\Controllers\Provider\Team;

use App\Http\Controllers\Controller;
use App\Notifications\TeamMemberInvitationNotification;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class TeamMemberController extends Controller
{
    /**
     * Display team members list
     */
    public function index()
    {
        $provider = auth()->user();

        $teamMembers = TeamMember::where('provider_id', $provider->id)
            ->with(['user', 'inviter'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'user' => [
                        'id' => $member->user->id,
                        'name' => $member->user->name,
                        'email' => $member->user->email,
                    ],
                    'role' => $member->role,
                    'is_active' => $member->is_active,
                    'invited_by' => $member->inviter ? [
                        'id' => $member->inviter->id,
                        'name' => $member->inviter->name,
                    ] : null,
                    'invited_at' => $member->invited_at?->format('Y-m-d H:i:s'),
                    'accepted_at' => $member->accepted_at?->format('Y-m-d H:i:s'),
                    'appointments_count' => $member->appointments()->count(),
                ];
            });

        return Inertia::render('provider/team/index', [
            'teamMembers' => $teamMembers,
        ]);
    }

    /**
     * Show form to invite a team member
     */
    public function create()
    {
        return Inertia::render('provider/team/create');
    }

    /**
     * Invite a new team member
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:admin,staff',
        ]);

        $provider = auth()->user();
        $user = User::where('email', $request->email)->firstOrFail();

        // Check if user is trying to add themselves
        if ($user->id === $provider->id) {
            return back()->with('error-toast', 'You cannot add yourself as a team member.');
        }

        // Check if user is already a team member
        $existing = TeamMember::where('provider_id', $provider->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            if ($existing->is_active) {
                return back()->with('error-toast', 'This user is already a team member.');
            } else {
                // Reactivate existing team member
                $existing->update([
                    'role' => $request->role,
                    'is_active' => true,
                    'invited_by' => $provider->id,
                    'invited_at' => now(),
                ]);
                return back()->with('success-toast', 'Team member reactivated successfully.');
            }
        }

        try {
            DB::beginTransaction();

            $teamMember = TeamMember::create([
                'provider_id' => $provider->id,
                'user_id' => $user->id,
                'role' => $request->role,
                'is_active' => true,
                'invited_by' => $provider->id,
                'invited_at' => now(),
                'accepted_at' => now(), // Auto-accept for now, can add invitation flow later
            ]);

            DB::commit();

            // TODO: Send invitation email
            $user->notify(new TeamMemberInvitationNotification($teamMember));

            return redirect()->route('business.team.index')
                ->with('success-toast', 'Team member added successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to add team member: ' . $e->getMessage());
        }
    }

    /**
     * Update team member role or status
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'role' => 'sometimes|in:admin,staff',
            'is_active' => 'sometimes|boolean',
        ]);

        $provider = auth()->user();
        $teamMember = TeamMember::where('provider_id', $provider->id)
            ->findOrFail($id);

        // Prevent deactivating the last admin
        if (isset($request->is_active) && !$request->is_active && $teamMember->isAdmin()) {
            $adminCount = TeamMember::where('provider_id', $provider->id)
                ->where('role', 'admin')
                ->where('is_active', true)
                ->count();

            if ($adminCount <= 1) {
                return back()->with('error-toast', 'Cannot deactivate the last admin. Please assign another admin first.');
            }
        }

        $teamMember->update($request->only(['role', 'is_active']));

        return back()->with('success-toast', 'Team member updated successfully.');
    }

    /**
     * Remove a team member
     */
    public function destroy($id)
    {
        $provider = auth()->user();
        $teamMember = TeamMember::where('provider_id', $provider->id)
            ->findOrFail($id);

        // Prevent removing the last admin
        if ($teamMember->isAdmin()) {
            $adminCount = TeamMember::where('provider_id', $provider->id)
                ->where('role', 'admin')
                ->where('is_active', true)
                ->count();

            if ($adminCount <= 1) {
                return back()->with('error-toast', 'Cannot remove the last admin. Please assign another admin first.');
            }
        }

        // Check if team member has active appointments
        $activeAppointments = $teamMember->appointments()
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('start_time', '>', now())
            ->count();

        if ($activeAppointments > 0) {
            return back()->with('error-toast', "Cannot remove team member with {$activeAppointments} active appointment(s). Please reassign or cancel appointments first.");
        }

        try {
            DB::beginTransaction();

            // Reassign appointments to provider
            $teamMember->appointments()->update(['team_member_id' => null]);

            // Deactivate instead of deleting to maintain history
            $teamMember->update(['is_active' => false]);

            DB::commit();

            return back()->with('success-toast', 'Team member removed successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to remove team member: ' . $e->getMessage());
        }
    }

    /**
     * Get team members for dropdown/select (for appointment assignment)
     */
    public function getTeamMembers()
    {
        $provider = auth()->user();

        $teamMembers = TeamMember::where('provider_id', $provider->id)
            ->where('is_active', true)
            ->whereNotNull('accepted_at')
            ->with('user')
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->user->name,
                    'email' => $member->user->email,
                    'role' => $member->role,
                ];
            });

        return response()->json($teamMembers);
    }
}
