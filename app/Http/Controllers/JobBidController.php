<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class JobBidController extends Controller
{
    public function store(\Illuminate\Http\Request $request, \App\Models\JobPost $jobPost)
    {
        // Check if provider is verified (optional feature for later)
        if (auth()->user()->role !== 'provider') {
            abort(403, 'Only providers can bid.');
        }

        $validated = $request->validate([
            'price' => 'required|numeric|min:0',
            'message' => 'nullable|string',
        ]);

        $jobPost->bids()->create([
            'provider_id' => auth()->id(),
            'status' => 'pending',
            ...$validated
        ]);

        return back()->with('success', 'Bid placed successfully!');
    }

    public function accept(\App\Models\JobBid $bid)
    {
        $jobPost = $bid->jobPost;

        if (auth()->id() !== $jobPost->client_id) {
            abort(403);
        }

        // DB Transaction for consistency
        \Illuminate\Support\Facades\DB::transaction(function () use ($bid, $jobPost) {
            $bid->update(['status' => 'accepted']);
            $jobPost->update(['status' => 'awarded']);

            // Reject other bids
            $jobPost->bids()->where('id', '!=', $bid->id)->update(['status' => 'rejected']);

            // TODO: Convert to Appointment logic here
        });

        return back()->with('success', 'Bid accepted! You can now coordinate with the provider.');
    }
}
