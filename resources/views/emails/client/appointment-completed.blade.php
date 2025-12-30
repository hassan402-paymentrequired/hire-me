@extends('emails.layout.app')

@section('title', 'Appointment Completed')

@section('heading', 'Service Completed!')

@section('content')
    <p>Hi {{ $appointment->client->name }},</p>
    <p>We hope you enjoyed your service <strong>{{ $appointment->service->name }}</strong> with
        <strong>{{ $appointment->provider->businessProfile->name }}</strong>.</p>

    <div
        style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; color: #563993;">
        <p style="margin: 5px 0;">Would you like to leave a review?</p>
        <p>Your feedback helps our community find the best providers!</p>
    </div>

    <p>Thank you for choosing {{ config('app.name') }}!</p>
@endsection

@section('cta_url', route('client.bookings.show', $appointment->id))
@section('cta_text', 'Leave a Review')