@extends('emails.layout.app')

@section('title', 'New Booking Request')

@section('heading', 'New Appointment Request!')

@section('content')
    <p>Hello,</p>
    <p>You have received a new booking request from <strong>{{ $appointment->client->name }}</strong>.</p>

    <div
        style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left; color: #563993;">
        <p style="margin: 5px 0;"><strong>Service:</strong> {{ $appointment->service->name }}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> {{ $appointment->start_time->format('F j, Y') }}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> {{ $appointment->start_time->format('g:i A') }}</p>
        <p style="margin: 5px 0;"><strong>Price:</strong> ${{ number_format($appointment->price, 2) }}</p>
    </div>

    <p>Please log in to your dashboard to accept or decline this request.</p>
@endsection

@section('cta_url', route('provider.appointments.index'))
@section('cta_text', 'View Appointment Details')