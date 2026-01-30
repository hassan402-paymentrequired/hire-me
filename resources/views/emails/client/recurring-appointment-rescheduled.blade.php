@extends('emails.layout.app')

@section('title', 'Recurring Appointment Rescheduled')

@section('heading', 'Your Appointment Was Rescheduled')

@section('content')
    <p>Hi {{ $appointment->client->name ?? $appointment->client_name ?? 'there' }},</p>

    <p>Your originally scheduled recurring appointment time was no longer available because another client had already booked it.</p>

    <p>We found an alternative slot and created your appointment at the new time below.</p>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <p style="margin: 5px 0;"><strong>Provider:</strong> {{ $providerName }}</p>
        <p style="margin: 5px 0;"><strong>Original time:</strong> {{ $originalTime }}</p>
        <p style="margin: 5px 0;"><strong>New time:</strong> {{ $newTime }}</p>
    </div>

    <p>If this works for you, no action is needed. If you'd prefer a different time, use the button below to choose another slot.</p>
@endsection

@section('cta_url', route('appointments.reschedule', $appointment->id))
@section('cta_text', 'Change Time')
