@extends('emails.layout.app')

@section('title', 'Business Setup Complete')

@section('heading', 'Your Business is Live!')

@section('content')
    <p>Congratulations {{ $user->name }},</p>
    <p>You have successfully completed your business setup on <strong>{{ config('app.name') }}</strong>.</p>
    <p>Your profile is now visible to potential clients, and you're ready to start receiving bookings.</p>
@endsection

@section('cta_url', route('business.dashboard'))
@section('cta_text', 'Go to Dashboard')