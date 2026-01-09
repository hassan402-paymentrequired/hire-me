<?php

namespace App\Http\Controllers\Provider\Schedule;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use App\Mail\AppointmentConfirmedMail;
use App\Mail\AppointmentCancelledMail;

class ScheduleController extends Controller
{
    public function calender()
    {
        $user = auth()->user();
        $appointments = $user->appointmentsAsProvider()
            ->with(['service'])
            ->get()
            ->map(function ($apt) {
                return [
                    'id' => $apt->id,
                    'service' => $apt->service->name,
                    'client' => $apt->client_name ?? 'Guest',
                    'start_time' => $apt->start_time,
                    'end_time' => $apt->end_time,
                    'duration' => $apt->start_time->diffInHours($apt->end_time),
                    'day' => $apt->start_time->format('D'), // Mon, Tue...
                    'hour' => (int) $apt->start_time->format('H'),
                    'color' => 'bg-blue-100 border-blue-200 text-blue-700', // Dynamic coloring later
                ];
            });

        return Inertia::render('provider/schedule/calendar', [
            'appointments' => $appointments
        ]);
    }

    public function appointments(Request $request)
    {
        $user = auth()->user();
        $query = $user->appointmentsAsProvider()->with(['services', 'client']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('client_name', 'like', "%{$search}%");
        }

        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        $appointments = $query->latest()->paginate(10)->withQueryString()->through(function ($apt) {
            return [
                'id' => $apt->id,
                'client' => $apt->client_name ?? 'Guest',
                'email' => $apt->client_email,
                'services' => $apt->services,
                'description' => $apt->services->pluck('name')->join(', '),
                'amount' => '₦' . number_format($apt->price),
                'date' => $apt->start_time->format('M d, Y'),
                'time' => $apt->start_time->format('h:i A'),
                'end_time' => $apt->end_time->format('h:i A'),
                'status' => ucfirst($apt->status),
                'notes' => $apt->notes,
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($apt->client_name ?? 'User'),
                'paymentStatus' => 'Paid', // Mock for now
            ];
        });

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

            // Payment was already processed upfront when booking was created
            // Provider already has the payment in their wallet and can withdraw anytime

            DB::commit();

            // Send email to client
            Mail::to($appointment->client->email)->send(new AppointmentConfirmedMail($appointment));

            return to_route('provider.appointments.show', ['id' => $appointment->id])->with('success-toast', 'Appointment confirmed successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to confirm appointment: ' . $e->getMessage());
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

        try {
            DB::beginTransaction();

            $appointment->update([
                'status' => 'cancelled',
                'cancellation_reason' => $request->reason,
                'cancelled_by' => 'provider',
            ]);

            // Refund escrow fully when provider cancels
            if ($appointment->escrow_status === 'held' && $appointment->escrow_amount > 0) {
                $clientWallet = Wallet::firstOrCreate(['user_id' => $appointment->client_id]);
                $clientWallet->refundEscrow($appointment->escrow_amount, $appointment, "Full refund - provider cancelled appointment");
                $appointment->update(['escrow_status' => 'refunded']);
            }

            DB::commit();

            // Send email to client
            Mail::to($appointment->client->email)->send(new AppointmentCancelledMail($appointment, 'provider'));

            return back()->with('success', 'Appointment cancelled successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to cancel appointment: ' . $e->getMessage());
        }
    }

    public function completeAppointment($id)
    {
        $appointment = Appointment::where('provider_id', auth()->id())
            ->whereIn('status', ['confirmed', 'pending'])
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            $appointment->update(['status' => 'completed']);

            // Release escrow if not already released
            if ($appointment->escrow_status === 'held' && $appointment->escrow_amount > 0) {
                $clientWallet = Wallet::firstOrCreate(['user_id' => $appointment->client_id]);
                $clientWallet->releaseEscrow($appointment->escrow_amount, $appointment, "Payment released after provider marked appointment as completed");
                $appointment->update([
                    'escrow_status' => 'released',
                    'payment_released_at' => now(),
                ]);
            }

            DB::commit();

            return back()->with('success-toast', 'Appointment marked as completed and payment released.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to complete appointment: ' . $e->getMessage());
        }
    }

    public function showAppointment($id)
    {
        $appointment = Appointment::where('provider_id', auth()->id())
            ->with(['client', 'services'])
            ->findOrFail($id);

        return Inertia::render('provider/schedule/appointment-details', [
            'appointment' => [
                'id' => $appointment->id,
                'client_name' => $appointment->client->name,
                'email' => $appointment->client->email,
                'services' => $appointment->services->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'price' => $s->price,
                ]),
                'start_time' => $appointment->start_time->format('M d, Y g:i A'),
                'end_time' => $appointment->end_time->format('g:i A'),
                'status' => $appointment->status,
                'price' => '₦' . number_format($appointment->price, 2),
                'notes' => $appointment->notes,
                'created_at' => $appointment->created_at->format('M d, Y'),
                'escrow_status' => $appointment->escrow_status,
                'escrow_amount' => $appointment->escrow_amount,
                'payment_released_at' => $appointment->payment_released_at?->format('M d, Y g:i A'),
            ],
        ]);
    }
}
