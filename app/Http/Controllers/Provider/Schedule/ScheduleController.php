<?php

namespace App\Http\Controllers\Provider\Schedule;

use App\Enum\AppointmentStatusEnum;
use App\Http\Controllers\Controller;
use App\Jobs\DeleteGoogleCalendarEventJob;
use App\Models\Appointment;
use App\Models\Report;
use App\Models\Wallet;
use App\Notifications\AppointmentConfirmedNotification;
use App\Notifications\AwaitingClientConfirmation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function calender(Request $request)
    {
        $user = auth_user();

        // Get date range from request or default to current week
        $startDate = $request->input('start_date')
            ? \Carbon\Carbon::parse($request->input('start_date'))
            : now()->startOfWeek();

        $endDate = $startDate->copy()->endOfWeek();

        $appointments = $user->appointmentsAsProvider()
            ->with(['service', 'client', 'teamMember.user'])
            ->whereBetween('start_time', [$startDate, $endDate])
            ->orderBy('start_time', 'asc')
            ->get();

        return Inertia::render('provider/schedule/calendar', [
            'appointments' => $appointments,
            'currentWeekStart' => $startDate->toIso8601String(),
        ]);
    }

    public function appointments(Request $request)
    {
        $user = auth_user();
        $search = $request->search ?? null;
        $status = $request->status ?? null;

        $query = $user->appointmentsAsProvider()->with(['services', 'client', 'teamMember.user'])
            ->when($search, function ($q, $search) {
                $q->whereHas('client', function($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($status && $status !== 'all', function ($q) use($status) {
                $q->where('status', $status);
            });

        $appointments = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('provider/schedule/appointments', [
            'appointments' => $appointments,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function confirmAppointment($id)
    {
        $appointment = Appointment::where('provider_id', auth()->id())
            ->where('status', 'pending')
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $appointment->update(['status' => 'confirmed']);

            DB::commit();

            $appointment->client->notify(new AppointmentConfirmedNotification($appointment));

            return to_route('provider.appointments.show', ['id' => $appointment->id])->with('success-toast', 'Appointment confirmed successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error-toast', 'Failed to confirm appointment: '.$e->getMessage());
        }
    }

    public function cancelAppointment(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $appointment = Appointment::where('provider_id', auth()->id())
            ->where('status', '!=', 'cancelled')
            ->findOrFail($id);

        $canCancel = $appointment->start_time->isFuture() && ! in_array($appointment->status, ['cancelled', 'completed']);

        if (! $canCancel) {
            return back()->with('error-toast', 'You cannot cancel a past appointment.');
        }

        try {
            DB::beginTransaction();

            $appointment->update([
                'status' => 'cancelled',
                'cancellation_reason' => $request->reason,
                'cancelled_by' => 'provider',
            ]);

            // Refund held payment fully when provider cancels
            if ($appointment->escrow_status === 'held' && $appointment->escrow_amount > 0) {
                $clientWallet = Wallet::firstOrCreate(['user_id' => $appointment->client_id]);
                $clientWallet->refundEscrow($appointment->escrow_amount, $appointment, 'Full refund - provider cancelled appointment');
                $appointment->update(['escrow_status' => 'refunded']);
            }

            DB::commit();

            DeleteGoogleCalendarEventJob::dispatch($appointment->id);

            $appointment->client->notify(new \App\Notifications\AppointmentCancelledNotification($appointment, 'provider'));

            return back()->with('success-toast', 'Appointment cancelled successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error-toast', 'Failed to cancel appointment: '.$e->getMessage());
        }
    }

    public function completeAppointment($id)
    {
        $appointment = Appointment::where('provider_id', auth()->id())
            ->whereIn('status', ['confirmed', 'pending', 'pending_completion'])
            ->findOrFail($id);
        
        try {
            DB::beginTransaction();

            // Mark provider approval
            $appointment->update([
                'provider_approved' => true,
                'provider_approved_at' => now(),
            ]);

            // Refresh to get latest values
            $appointment->refresh();

            // If client has already approved, mark as completed, but do not handle payment here.
            // Payment is either released immediately when the client completes,
            // or automatically by the scheduled job after the grace period.
            if ($appointment->client_approved) {
                $appointment->update(['status' => 'completed']);
            } else {
                $appointment->update(['status' => 'pending_completion']);
                $appointment->client->notify(new AwaitingClientConfirmation($appointment));
            }

            DB::commit();

            if ($appointment->client_approved && $appointment->provider_approved) {
                return back()->with('success-toast', 'Appointment completed. Payment will be or has been released automatically.');
            }

            return back()->with('success-toast', 'Your approval recorded. Waiting for client approval or automatic release after the grace period.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error-toast', 'Failed to complete appointment: '.$e->getMessage());
        }
    }

    public function showAppointment($id)
    {
        $appointment = Appointment::where('provider_id', auth()->id())
            ->with(['client', 'services', 'provider.businessProfile', 'teamMember.user'])
            ->findOrFail($id);

        $provider = $appointment->provider;
        $bp = $provider?->businessProfile;

        $canCancel = $appointment->start_time->isFuture() && ! in_array($appointment->status, ['cancelled', 'completed']);
        $canComplete = ! in_array($appointment->status, ['cancelled', 'completed']) && $appointment->start_time->isPast();
        $canReportClient = $appointment->start_time->isPast();

        $waitingForClientApproval = ($appointment->status === AppointmentStatusEnum::PENDING_COMPLETION->value) && is_null($appointment->client_approved);

        // dd($appointment->toArray());

        return Inertia::render('provider/schedule/appointment-details', [
            'appointment' => [
                'id' => $appointment->id,
                'client_name' => $appointment->client?->name  ?? 'Guest',
                'email' => $appointment->client?->email ?? $appointment->client_email ?? null,
                'services' => $appointment->services->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'price' => '₦'.number_format($s->price, 0),
                    'duration_minutes' => $s->duration_minutes,
                ]),
                'start_time' => $appointment->start_time->format('M d, Y g:i A'),
                'end_time' => $appointment->end_time->format('M d, Y g:i A'),
                'total_duration_minutes' => $appointment->services->sum('duration_minutes'),
                'status' => $appointment->status,
                'price' => '₦'.number_format($appointment->price, 2),
                'payment_method' => $appointment->payment_method,
                'notes' => $appointment->notes,
                'team_member' => $appointment->teamMember?->user ? [
                    'id' => $appointment->teamMember->id,
                    'name' => $appointment->teamMember->user->name,
                    'email' => $appointment->teamMember->user->email,
                    'role' => $appointment->teamMember->role,
                ] : null,
                'created_at' => $appointment->created_at->format('M d, Y'),
                'escrow_status' => $appointment->escrow_status,
                'escrow_amount' => $appointment->escrow_amount,
                'payment_released_at' => $appointment->payment_released_at?->format('M d, Y g:i A'),
                'platform_fee_percent' => $appointment->platform_fee_percent,
                'platform_fee_amount' => $appointment->platform_fee_amount,
                'provider_payout_amount' => $appointment->provider_payout_amount,
                'cancelled_by' => $appointment->cancelled_by,
                'cancellation_reason' => $appointment->cancellation_reason,
                'location' => $bp?->address ? trim("{$bp->address}, {$bp->city}, {$bp->state} {$bp->zip_code}") : null,
                'location_phone' => $bp?->phone,
            ],
            'canCancel' => $canCancel,
            'canComplete' => $canComplete,
            'canReportClient' => $canReportClient,
            'waitingForClientApproval' => $waitingForClientApproval,
        ]);
    }

    public function reportClient(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
            'description' => 'required|string|min:20|max:1000',
        ], [
            'description.required' => 'Please provide details about the issue.',
            'description.min' => 'Please provide at least 20 characters of detail.',
        ]);

        $appointment = Appointment::where('provider_id', auth()->id())->findOrFail($id);

        Report::create([
            'appointment_id' => $appointment->id,
            'user_id' => auth()->id(),
            'reason' => $request->reason,
            'description' => $request->description,
        ]);

        return back()->with('success-toast', 'Report submitted successfully. Our team will look into it.');
    }
}
