<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Review;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $appointment = Appointment::findOrFail($request->appointment_id);

        // Ensure the appointment is completed and belongs to the user
        if ($appointment->client_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }

        if ($appointment->status !== 'completed') {
            return back()->withErrors(['appointment_id' => 'You can only review completed appointments.']);
        }

        // Check if a review already exists
        if (Review::where('appointment_id', $appointment->id)->exists()) {
            return back()->withErrors(['appointment_id' => 'You have already reviewed this appointment.']);
        }

        Review::create([
            'appointment_id' => $appointment->id,
            'user_id' => auth()->id(),
            'provider_id' => $appointment->provider_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return back()->with('success', 'Thank you for your review!');
    }
}
