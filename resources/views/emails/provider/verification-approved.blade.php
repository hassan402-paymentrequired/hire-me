@extends('emails.layout.app')

@section('title', 'Verification Approved')

@section('heading', '🎉 Your Business Verification Has Been Approved!')

@section('content')
    <p>Hello {{ $user->name }},</p>
    
    <p>Great news! Your business verification for <strong>{{ $businessName }}</strong> has been reviewed and <strong>approved</strong> by our team.</p>
    
    <p>This means:</p>
    <ul style="margin: 20px 0; padding-left: 20px;">
        <li>Your business profile is now <strong>visible</strong> to potential clients</li>
        <li>You can start receiving bookings from customers</li>
        <li>Your business is now <strong>verified</strong> and trusted on our platform</li>
    </ul>
    
    <p>You can now log in to your dashboard and start managing your business.</p>
    
    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
    
    <p>Thank you for being part of {{ config('app.name') }}!</p>
@endsection

@section('cta_url', route('business.dashboard'))
@section('cta_text', 'Go to Dashboard')
laramicclockra.2