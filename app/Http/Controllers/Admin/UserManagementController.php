<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Filter by role
        if ($request->role) {
            $query->where('role', $request->role);
        }

        // Filter by provider status
        if ($request->has('is_provider')) {
            if ($request->is_provider === '1') {
                $query->whereHas('businessProfile');
            } else {
                $query->whereDoesntHave('businessProfile');
            }
        }

        // Filter by verification status
        if ($request->has('is_verified')) {
            $query->whereHas('businessProfile', function ($q) use ($request) {
                $q->where('is_verified', $request->is_verified === '1');
            });
        }

        $users = $query->with(['businessProfile', 'wallet'])
            ->withCount(['appointmentsAsClient', 'appointmentsAsProvider'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'is_provider', 'is_verified']),
        ]);
    }

    public function show($id)
    {
        $user = User::with([
            'businessProfile',
            'wallet',
            'appointmentsAsClient' => function ($q) {
                $q->latest()->limit(10);
            },
            'appointmentsAsProvider' => function ($q) {
                $q->latest()->limit(10);
            },
            'services',
            'reviews',
        ])
            ->withCount(['appointmentsAsClient', 'appointmentsAsProvider', 'services', 'reviews'])
            ->findOrFail($id);

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:client,provider,admin',
            'is_verified' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        // Update business profile verification if needed
        if ($request->has('is_verified') && $user->businessProfile) {
            $user->businessProfile->update(['is_verified' => $request->is_verified]);
        }

        return back()->with('success-toast', 'User updated successfully.');
    }

    public function updateWallet(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'balance' => ['required', 'numeric', 'min:0'],
            'escrow_balance' => ['required', 'numeric', 'min:0', 'lte:balance'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        DB::beginTransaction();
        try {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'escrow_balance' => 0],
            );

            $beforeBalance = (float) $wallet->balance;
            $beforeEscrow = (float) $wallet->escrow_balance;

            $wallet->balance = $validated['balance'];
            $wallet->escrow_balance = $validated['escrow_balance'];
            $wallet->save();

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'user_id' => $user->id,
                'type' => 'admin_adjustment',
                'amount' => (float) $wallet->balance - $beforeBalance,
                'balance_before' => $beforeBalance,
                'balance_after' => (float) $wallet->balance,
                'status' => WalletTransaction::STATUS_COMPLETED,
                'description' => $validated['reason']
                    ? "Admin wallet adjustment: {$validated['reason']}"
                    : 'Admin wallet adjustment',
                'metadata' => [
                    'admin_id' => auth()->id(),
                    'escrow_before' => $beforeEscrow,
                    'escrow_after' => (float) $wallet->escrow_balance,
                ],
            ]);

            DB::commit();
            return back()->with('success-toast', 'Wallet updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to update wallet: ' . $e->getMessage());
        }
    }

    public function suspend($id)
    {
        $user = User::findOrFail($id);

        // TODO: Add suspended_at field to users table
        // For now, we can use a settings field or create a separate table
        $user->update(['email_verified_at' => null]); 

        return back()->with('success-toast', 'User suspended successfully.');
    }

    public function delete($id)
    {
        $user = User::findOrFail($id);

        // Check if user has active appointments
        $activeAppointments = $user->appointmentsAsClient()
            ->whereIn('status', ['pending', 'confirmed'])
            ->count();

        if ($activeAppointments > 0) {
            return back()->with('error-toast', "Cannot delete user with {$activeAppointments} active appointment(s).");
        }

        DB::beginTransaction();
        try {
            // Delete related records
            $user->appointmentsAsClient()->delete();
            $user->appointmentsAsProvider()->delete();
            $user->services()->delete();
            $user->businessProfile?->delete();
            $user->wallet?->delete();

            $user->delete();

            DB::commit();

            return redirect()->route('admin.users.index')
                ->with('success-toast', 'User deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to delete user: ' . $e->getMessage());
        }
    }
}
