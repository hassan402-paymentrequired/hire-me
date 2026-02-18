<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Services\FileUploadService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VerificationController extends Controller
{
    public function store(Request $request)
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
            'document_type' => 'required|in:passport,national_id,drivers_license,cac_registration',
            'document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        // Store document securely
        // $path = $request->file('document')->store('verifications', 'private');
        try {
            DB::beginTransaction();

            
            $path = FileUploadService::upload($request->file('document'), 'verifications', 'private');

            \App\Models\ProviderVerification::create([
                'user_id' => $user->id,
                'document_type' => $validated['document_type'],
                'document_path' => $path,
                'status' => 'pending',
            ]);

            $user->notify(new \App\Notifications\BusinessVerificationSubmittedNotification());

            DB::commit();

            return back()->with('success', 'Verification request submitted successfully! We will review it shortly.');

        } catch (Exception $th) {
            DB::rollBack();
            Log::error("An error occur while sending verification document by {$user->name} : {$user->id} with error: {$th->getMessage()}");
            return back()->with('error', 'An error occurred while submitting your verification. Please try again later.');  
        }

    }
}
