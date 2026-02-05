@extends('emails.layout.app')

@section('title', 'Appointment Confirmed')

@section('heading', 'Your Appointment is Confirmed!')

@section('content')
    <p>Hi {{ $appointment->client->name }},</p>
    <p>Great news! Your appointment with <strong>{{ $appointment->provider->businessProfile->name }}</strong> has been
        confirmed.</p>

    <div
        style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left; color: #563993;">
        <p style="margin: 5px 0;"><strong>Service:</strong> {{ $appointment->service->name }}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> {{ $appointment->start_time->format('F j, Y') }}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> {{ $appointment->start_time->format('g:i A') }}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> {{ $appointment->provider->businessProfile->address }}</p>
    </div>

    <p>We look forward to seeing you then!</p>
@endsection

@section('cta_url', route('client.bookings.show', $appointment->id))
@section('cta_text', 'View Booking Details')