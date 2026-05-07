<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Notifications\VerificationApprovedNotification;
use App\Notifications\VerificationRejectedNotification;
use App\Services\ProviderLogService;

class VerificationController extends Controller
{
    public function index()
    {
        $verifications = \App\Models\ProviderVerification::with('user')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('admin/verifications/index', [
            'verifications' => $verifications->through(function ($verification) {
                return [
                    'id' => $verification->id,
                    'status' => $verification->status,
                    'document_type' => $verification->document_type,
                    'document_path' => $verification->document_path,
                    'rejection_reason' => $verification->rejection_reason,
                    'created_at' => $verification->created_at->format('Y-m-d H:i:s'),
                    'user' => [
                        'id' => $verification->user->id,
                        'name' => $verification->user->name,
                        'email' => $verification->user->email,
                        'business_profile' => $verification->user->businessProfile ? [
                            'business_name' => $verification->user->businessProfile->business_name,
                        ] : null,
                    ],
                ];
            }),
        ]);
    }

    public function show(\App\Models\ProviderVerification $verification)
    {
        $verification->load([
            'user.businessProfile',
            'user.services' => function ($query) {
                $query->where('status', 'active');
            },
            'user.wallet',
        ]);

        $user = $verification->user;

        // Get work hours
        $workHours = \App\Models\WorkHour::where('provider_id', $user->id)->get();

        // Get additional statistics
        $appointmentsCount = $user->appointmentsAsProvider()->count();
        $completedAppointments = $user->appointmentsAsProvider()->where('status', 'completed')->count();

        // Get reviews (reviews are on appointments, not directly on users)
        $reviews = \App\Models\Review::where('provider_id', $user->id)
            ->with('user')
            ->latest()
            ->limit(10)
            ->get();
        $averageRating = \App\Models\Review::where('provider_id', $user->id)->avg('rating');

        return \Inertia\Inertia::render('admin/verifications/show', [
            'verification' => [
                'id' => $verification->id,
                'status' => $verification->status,
                'document_type' => $verification->document_type,
                'document_path' => $verification->document_path,
                'rejection_reason' => $verification->rejection_reason,
                'reviewed_at' => $verification->reviewed_at?->format('Y-m-d H:i:s'),
                'created_at' => $verification->created_at->format('Y-m-d H:i:s'),
            ],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? null,
                'is_verified' => $user->is_verified ?? false,
                'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i:s'),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            ],
            'business_profile' => $user->businessProfile ? [
                'id' => $user->businessProfile->id,
                'business_name' => $user->businessProfile->business_name,
                'slug' => $user->businessProfile->slug,
                'description' => $user->businessProfile->description,
                'address' => $user->businessProfile->address,
                'city' => $user->businessProfile->city,
                'state' => $user->businessProfile->state,
                'zip_code' => $user->businessProfile->zip_code,
                'phone' => $user->businessProfile->phone,
                'category' => $user->businessProfile->category,
                'latitude' => $user->businessProfile->latitude,
                'longitude' => $user->businessProfile->longitude,
                'logo_path' => $user->businessProfile->logo_path,
                'settings' => $user->businessProfile->settings,
            ] : null,
            'services' => $user->services->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'price' => (float) $service->price,
                    'duration' => $service->duration,
                    'status' => $service->status,
                ];
            }),
            'work_hours' => $workHours->map(function ($workHour) {
                return [
                    'id' => $workHour->id,
                    'day' => $workHour->day_of_week,
                    'start_time' => $workHour->start_time,
                    'end_time' => $workHour->end_time,
                    'is_closed' => $workHour->is_closed,
                ];
            }),
            'wallet' => $user->wallet ? [
                'balance' => (float) $user->wallet->balance,
                'escrow_balance' => (float) $user->wallet->escrow_balance,
                'available_balance' => (float) $user->wallet->available_balance,
            ] : null,
            'statistics' => [
                'appointments_count' => $appointmentsCount,
                'completed_appointments' => $completedAppointments,
                'services_count' => $user->services->count(),
                'average_rating' => $averageRating ? round($averageRating, 2) : null,
                'reviews_count' => \App\Models\Review::where('provider_id', $user->id)->count(),
            ],
            'recent_reviews' => $reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'client_name' => $review->user->name ?? 'Unknown',
                    'created_at' => $review->created_at->format('Y-m-d H:i:s'),
                ];
            }),
        ]);
    }

    public function approve(\App\Models\ProviderVerification $verification)
    {
        \Illuminate\Support\Facades\DB::transaction(function () use ($verification) {
            $verification->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'admin_reviewed_by' => auth('admin')->id(),
            ]);

            $verification->user->update(['is_verified' => true]);

            ProviderLogService::log($verification->user_id, 'Verification Approved', 'Your business verification was approved');

            $verification->user->notify(new VerificationApprovedNotification($verification));
        });

        return back()->with('success-toast', 'Provider verified successfully!');
    }

    public function reject(\App\Models\ProviderVerification $verification, \Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:200',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $verification) {

            $verification->update([
                'status' => 'rejected',
                'rejection_reason' => $validated['rejection_reason'],
                'reviewed_at' => now(),
                'admin_reviewed_by' => auth('admin')->id(),
            ]);

            ProviderLogService::log($verification->user_id, 'Verification Rejected', 'Your business verification was rejected because '.$validated['rejection_reason']);

            $verification->user->notify(new VerificationRejectedNotification($verification));
        });

        return back()->with('success-toast', 'Verification rejected.');
    }

    /**
     * Serve verification document securely
     * Only admins can access verification documents
     */
    public function viewDocument(\App\Models\ProviderVerification $verification)
    {
        // Ensure user is admin (already checked by middleware, but double-check)
        if (! auth_user('admin') || ! is_admin('admin')) {
            abort(403, 'Unauthorized access. you are not authorized to view this document');
        }

        if (! $verification->document_path) {
            abort(404, 'Document not found');
        }

        $documentPath = $verification->document_path;

        if (! \App\Services\FileUploadService::exists($documentPath, 'private')) {
            abort(404, 'Document file not found');
        }

        // On S3, hand the admin a short-lived pre-signed URL so the file is
        // streamed straight from object storage without proxying through PHP.
        if (\App\Services\FileUploadService::isS3Configured()) {
            $signedUrl = \App\Services\FileUploadService::temporaryUrl($documentPath, 15);

            if (! $signedUrl) {
                abort(500, 'Failed to generate document URL');
            }

            return redirect($signedUrl);
        }

        // Local private storage: stream the file through this controller so
        // it stays behind the admin auth layer.
        try {
            $disk = \Illuminate\Support\Facades\Storage::disk('private');
            $filePath = $disk->path($documentPath);

            if (! file_exists($filePath)) {
                abort(404, 'Document file not found');
            }

            $mimeType = $disk->mimeType($documentPath)
                ?? mime_content_type($filePath)
                ?? 'application/octet-stream';

            return response()->file($filePath, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'inline; filename="'.basename($documentPath).'"',
                'Cache-Control' => 'private, max-age=3600',
            ]);
        } catch (\Exception $e) {
            abort(500, 'Failed to serve document: '.$e->getMessage());
        }
    }
}
