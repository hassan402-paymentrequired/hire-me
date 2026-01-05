<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function store(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();

        // Check if already verified
        if ($user->is_verified) {
            return back()->with('error', 'You are already verified.');
        }

        // Check for pending verification
        $existingPending = \App\Models\ProviderVerification::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existingPending) {
            return back()->with('error', 'You already have a pending verification request.');
        }

        $validated = $request->validate([
            'document_type' => 'required|in:passport,national_id,drivers_license',
            'document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB
        ]);

        // Store document securely
        $path = $request->file('document')->store('verifications', 'private');

        \App\Models\ProviderVerification::create([
            'user_id' => $user->id,
            'document_type' => $validated['document_type'],
            'document_path' => $path,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Verification request submitted successfully! We will review it shortly.');
    }
}
