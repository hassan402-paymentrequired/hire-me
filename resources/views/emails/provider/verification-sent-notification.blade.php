@extends('emails.layout.app')

@section('title', 'Verification Received')

@section('heading', "We've received your documents!")

@section('content')
    <p>Hello {{ $user->name }},</p>
    
    <p>Thank you for submitting your verification documents for <strong>{{ $businessName }}</strong>.</p>

    <p>Our team is currently reviewing your submission. This typically takes <strong>1-2 business days</strong>, and we'll notify you as soon as your verification is complete.</p>
    
    <p><strong>What happens next?</strong></p>
    <ul style="margin: 16px 0; padding-left: 20px; line-height: 1.6;">
        <li>Our verification team will review your documents</li>
        <li>You'll receive an email once your business is approved</li>
        <li>After approval, you can start accepting bookings immediately</li>
    </ul>
    
    <p>In the meantime, you can explore your dashboard and familiarize yourself with the platform.</p>
    
    <p>If you have any questions or need assistance, our support team is here to help.</p>
    
    <p>Thank you for choosing {{ config('app.name') }}!</p>
@endsection

@section('cta_url', route('business.dashboard'))
@section('cta_text', 'Explore Dashboard')