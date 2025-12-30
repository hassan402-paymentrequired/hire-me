@extends('emails.layout.app')

@section('title', 'Appointment Cancelled')

@section('heading', 'Appointment Cancelled')

@section('content')
    <p>Hello,</p>
    <p>We are writing to inform you that the appointment for <strong>{{ $appointment->service->name }}</strong> on
        <strong>{{ $appointment->start_time->format('F j, Y \a\t g:i A') }}</strong> has been cancelled by the
        {{ $cancelledBy }}.</p>

    <div
        style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left; color: #563993;">
        <p style="margin: 5px 0;"><strong>Service:</strong> {{ $appointment->service->name }}</p>
        <p style="margin: 5px 0;"><strong>Original Time:</strong> {{ $appointment->start_time->format('F j, Y, g:i A') }}
        </p>
    </div>

    <p>If you have any questions, please contact our support team.</p>
@endsection

@section('cta_url', config('app.url'))
@section('cta_text', 'Visit Website')