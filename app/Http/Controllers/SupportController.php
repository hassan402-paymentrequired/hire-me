<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\SupportRequest;
use App\Notifications\SupportRequestSubmittedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class SupportController extends Controller
{
    public function contact()
    {
        $user = auth()->user();

        return Inertia::render('guest/pages/contact', [
            'title' => 'Contact Us',
            'prefill' => [
                'name' => $user?->name ?? '',
                'email' => $user?->email ?? '',
            ],
        ]);
    }

    public function submitContact(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'message' => 'required|string|min:20|max:5000',
        ]);

        $supportRequest = SupportRequest::create([
            ...$data,
            'user_id' => auth()->id(),
            'source' => auth()->check() ? 'contact_page_authenticated' : 'contact_page_guest',
        ]);

        $this->notifyOnSupportSubmission($supportRequest);

        return back()->with('success-toast', 'Your message has been sent. Our support team will get back to you soon.');
    }

    public function helpCenter()
    {
        $user = auth()->user();

        return Inertia::render('support/index', [
            'prefill' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'requests' => SupportRequest::query()
                ->where('user_id', $user->id)
                ->latest()
                ->paginate(20)
                ->withQueryString()
                ->through(fn (SupportRequest $supportRequest) => [
                    'id' => $supportRequest->id,
                    'subject' => $supportRequest->subject,
                    'category' => $supportRequest->category,
                    'status' => $supportRequest->status,
                    'message' => $supportRequest->message,
                    'created_at' => $supportRequest->created_at->format('M d, Y g:i A'),
                    'resolved_at' => $supportRequest->resolved_at?->format('M d, Y g:i A'),
                ]),
        ]);
    }

    public function submitHelpCenter(Request $request)
    {
        $user = auth()->user();

        $data = $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'message' => 'required|string|min:20|max:5000',
        ]);

        $supportRequest = SupportRequest::create([
            ...$data,
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'source' => 'help_center',
        ]);

        $this->notifyOnSupportSubmission($supportRequest);

        return back()->with('success-toast', 'Support request submitted successfully. We will be in touch soon.');
    }

    protected function notifyOnSupportSubmission(SupportRequest $supportRequest): void
    {
        $admins = Admin::query()->where('is_active', true)->get();

        if ($admins->isNotEmpty()) {
            Notification::send($admins, new SupportRequestSubmittedNotification($supportRequest, true));
        }

        if ($supportRequest->user) {
            $supportRequest->user->notify(new SupportRequestSubmittedNotification($supportRequest));

            return;
        }

        Notification::route('mail', $supportRequest->email)
            ->notify(new SupportRequestSubmittedNotification($supportRequest));
    }
}
