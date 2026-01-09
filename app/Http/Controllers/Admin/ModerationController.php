<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Review;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ModerationController extends Controller
{
    public function reports(Request $request)
    {
        $query = Report::with(['user', 'appointment.provider.businessProfile']);

        // Filter by status
        if ($request->status === 'resolved') {
            $query->whereNotNull('resolved_at');
        } elseif ($request->status === 'unresolved') {
            $query->whereNull('resolved_at');
        }

        // Filter by reason
        if ($request->reason) {
            $query->where('reason', $request->reason);
        }

        $reports = $query->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(function ($report) {
                return [
                    'id' => $report->id,
                    'reason' => $report->reason,
                    'description' => $report->description,
                    'user_name' => $report->user->name ?? 'Unknown',
                    'user_email' => $report->user->email ?? 'Unknown',
                    'appointment_id' => $report->appointment_id,
                    'provider_name' => $report->appointment?->provider?->businessProfile?->business_name ?? 'Unknown',
                    'resolved_at' => $report->resolved_at?->format('Y-m-d H:i:s'),
                    'resolved_by' => $report->resolved_by,
                    'created_at' => $report->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('admin/moderation/reports', [
            'reports' => $reports,
            'filters' => $request->only(['status', 'reason']),
        ]);
    }

    public function resolveReport(Request $request, $id)
    {
        $report = Report::findOrFail($id);

        $validated = $request->validate([
            'action_taken' => 'required|string|max:500',
            'penalty_applied' => 'nullable|in:warning,suspend,ban',
        ]);

        DB::beginTransaction();
        try {
            $report->update([
                'resolved_at' => now(),
                // Note: resolved_by is constrained to users table, so we leave it null for admin reviews
                'action_taken' => $validated['action_taken'],
                'penalty_applied' => $validated['penalty_applied'] ?? null,
            ]);

            // Apply penalty if specified
            if (isset($validated['penalty_applied'])) {
                $this->applyPenalty($report, $validated['penalty_applied']);
            }

            DB::commit();

            return back()->with('success-toast', 'Report resolved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to resolve report: ' . $e->getMessage());
        }
    }

    public function reviews(Request $request)
    {
        $query = Review::with(['user', 'provider.businessProfile', 'appointment']);

        // Filter by rating
        if ($request->rating) {
            $query->where('rating', $request->rating);
        }

        // Filter by flagged (low rating reviews)
        if ($request->flagged === '1') {
            $query->where('rating', '<=', 2);
        }

        $reviews = $query->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'user_name' => $review->user->name ?? 'Unknown',
                    'provider_name' => $review->provider->businessProfile->business_name ?? 'Unknown',
                    'appointment_id' => $review->appointment_id,
                    'created_at' => $review->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('admin/moderation/reviews', [
            'reviews' => $reviews,
            'filters' => $request->only(['rating', 'flagged']),
        ]);
    }

    public function deleteReview($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return back()->with('success-toast', 'Review deleted successfully.');
    }

    protected function applyPenalty(Report $report, string $penalty)
    {
        $user = $report->user;

        switch ($penalty) {
            case 'warning':
                // Log warning (could add to user settings or create warnings table)
                break;
            case 'suspend':
                // Suspend user account
                $user->update(['email_verified_at' => null]);
                break;
            case 'ban':
                // Permanently ban user
                $user->update(['email_verified_at' => null]);
                // Could add banned_at field
                break;
        }
    }
}
