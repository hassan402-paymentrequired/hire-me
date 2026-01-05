<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function index()
    {
        $verifications = \App\Models\ProviderVerification::with('user')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('admin/verifications/index', [
            'verifications' => $verifications
        ]);
    }

    public function approve(\App\Models\ProviderVerification $verification)
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($verification) {
            $verification->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'reviewed_by' => auth()->id(),
            ]);

            $verification->user->update(['is_verified' => true]);
        });

        return back()->with('success', 'Provider verified successfully!');
    }

    public function reject(\App\Models\ProviderVerification $verification, \Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $verification->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        return back()->with('success', 'Verification rejected.');
    }
}
