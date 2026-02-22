<?php

namespace App\Http\Controllers\Provider\Team;

use App\Enum\UserRoleEnum;
use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use App\Models\User;
use App\Notifications\InviteUserNotification;
use App\Notifications\TeamMemberInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use App\Services\ProviderLogService;

class TeamMemberController extends Controller
{
    /**
     * Display team members list
     */
    public function index(Request $request)
    {
        $provider = auth_user();

        $search = $request->search ??= null;
        $role = $request->role ??= null;

        $teamMembers = TeamMember::where('provider_id', $provider->id)
            ->with(['user:id,name,email', 'inviter:id,name'])
            ->withCount('appointments')
            ->when($search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->whereLike('users.name', $search)
                        ->orWhereLike('users.email', $search);
                });
            })
            ->when($role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = TeamMember::where('provider_id', $provider->id)
            ->selectRaw("
        COUNT(*) as total,
        SUM(is_active) as active,
        SUM(is_active = 0) as deactivated,
        SUM(role = 'staff') as staffs,
        SUM(role = 'admin') as admins
    ")
            ->first();

        return Inertia::render('provider/team/index', [
            'teamMembers' => $teamMembers,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'role' => $request->role,
            ],
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
            'name' => 'required|string|min:3',
            'email' => 'required|email',
            'role' => 'required|in:admin,staff',
        ]);

        $provider = auth()->user();
        $user = User::where('email', $request->email)->first();

        // Check if user is trying to add themselves
        if ($user) {
            if ($user->id === $provider->id) {
                return back()->with('error-toast', 'You cannot add yourself as a team member.');
            }

            if ($user->isProvider()) {
                return back()->with('error-toast', 'User already have a business profile.');
            }

            // Check if user is already a team member
            $existing = TeamMember::where('provider_id', $provider->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existing) {
                return back()->with('error-toast', 'This user is already a team member.');
            }

            throw ValidationException::withMessages([
                'exists' => true,
            ]);
        }

        try {
            DB::beginTransaction();

            $password = generate_random(10);

            $user = User::query()->create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $password,
                'role' => UserRoleEnum::PROVIDER->value,
            ]);

            $teamMember = TeamMember::create([
                'provider_id' => $provider->id,
                'user_id' => $user->id,
                'role' => $request->role,
                'is_active' => false,
                'invited_by' => $provider->id,
                'invited_at' => now(),
                'invitation_link' => generate_random(30),
                'invitation_expires_at' => now()->addDays(7),
            ]);

            DB::commit();

            $user->notify(new TeamMemberInvitationNotification($teamMember, $password));

            return redirect()->route('business.team.index')
                ->with('success-toast', 'Team member added successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error-toast', 'Failed to add team member: '.$e->getMessage());
        }
    }

    public function inviteUser(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:admin,staff',
        ]);

        try {
            DB::beginTransaction();
            $user = User::where('email', $request->email)->first();
            $provider = auth()->user();

            $teamMember = TeamMember::create([
                'provider_id' => $provider->id,
                'user_id' => $user->id,
                'role' => $request->role,
                'is_active' => false,
                'invited_by' => $provider->id,
                'invited_at' => now(),
                'invitation_link' => generate_random(30),
                'invitation_expires_at' => now()->addDays(7),
            ]);

            $user->notify(new InviteUserNotification($teamMember));

            DB::commit();

            return redirect()->route('business.team.index')
                ->with('success-toast', 'Team member invite sent successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error-toast', 'Failed to add team member: '.$e->getMessage());
        }
    }

    public function acceptInvite(Request $request, string $link)
    {
        $member = TeamMember::query()->where('invitation_link', $link)
        ->whereDate('invitation_expires_at', '>', now())
        ->first();

        if(!$member){
            abort(401);
        }
        
          \Illuminate\Support\Facades\DB::transaction(function () use ($request, $member) {
            $member->update([
                'is_active' => true,
                'invitation_link' => null,
                'invitation_expires_at' => null
            ]);


            ProviderLogService::log($member->provider_id, 'Invitation accepted by ' . $memeber->user->name, 'Invitation accepted');

           $member->inviter->notify(new TeamMemberAcceptInvitation($member));
        });

        return back()->with('success-toast', 'Provider verified successfully!');
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

        $provider = auth_user();
        $teamMember = TeamMember::where('provider_id', $provider->id)
            ->findOrFail($id);

        // Prevent deactivating the last admin
        if (isset($request->is_active) && ! $request->is_active && $teamMember->isAdmin()) {
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

            return back()->with('error-toast', 'Failed to remove team member: '.$e->getMessage());
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
