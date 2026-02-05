@extends('emails.layout.app')

@section('title', 'Recurring Appointment Skipped')

@section('heading', 'No Alternative Slot Found')

@section('content')
    <p>Hi {{ $parentAppointment->client->name ?? $parentAppointment->client_name ?? 'there' }},</p>

    <p>Your next recurring appointment could not be created because the time slot was booked by another client, and we could not find any available alternative time within the next 30 days.</p>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 5px 0;"><strong>Provider:</strong> {{ $providerName }}</p>
        <p style="margin: 5px 0;"><strong>Originally scheduled for:</strong> {{ $proposedDateFormatted }}</p>
    </div>

    <p>Please log in and book a new appointment at a time that works for you.</p>
@endsection

@section('cta_url', route('client.bookings.index'))
@section('cta_text', 'View Bookings')
