<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportRequest;
use App\Notifications\SupportRequestResolvedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class SupportRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = SupportRequest::query()->with('user');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $requests = $query
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(function (SupportRequest $supportRequest) {
                return [
                    'id' => $supportRequest->id,
                    'name' => $supportRequest->name,
                    'email' => $supportRequest->email,
                    'subject' => $supportRequest->subject,
                    'category' => $supportRequest->category,
                    'message' => $supportRequest->message,
                    'status' => $supportRequest->status,
                    'source' => $supportRequest->source,
                    'admin_notes' => $supportRequest->admin_notes,
                    'created_at' => $supportRequest->created_at->format('M d, Y g:i A'),
                    'resolved_at' => $supportRequest->resolved_at?->format('M d, Y g:i A'),
                ];
            });

        return Inertia::render('admin/support/index', [
            'requests' => $requests,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function resolve(Request $request, SupportRequest $supportRequest)
    {
        $data = $request->validate([
            'admin_notes' => 'nullable|string|max:5000',
        ]);

        $supportRequest->update([
            'status' => 'resolved',
            'admin_notes' => $data['admin_notes'] ?? null,
            'resolved_at' => now(),
        ]);

        if ($supportRequest->user) {
            $supportRequest->user->notify(new SupportRequestResolvedNotification($supportRequest));
        } else {
            Notification::route('mail', $supportRequest->email)
                ->notify(new SupportRequestResolvedNotification($supportRequest));
        }

        return back()->with('success-toast', 'Support request marked as resolved.');
    }
}
