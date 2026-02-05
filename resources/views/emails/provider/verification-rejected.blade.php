@extends('emails.layout.app')

@section('title', 'Verification Update')

@section('heading', 'Business Verification Update')

@section('content')
    <p>Hello {{ $user->name }},</p>

    <p>We have reviewed your business verification request for <strong>{{ $businessName }}</strong>.</p>

    <p>Unfortunately, your verification request has been <strong>rejected</strong> at this time.</p>

    @if ($rejectionReason)
        <div
            style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #991b1b;">Reason for Rejection:</p>
            <p style="margin: 10px 0 0 0; color: #7f1d1d;">{{ $rejectionReason }}</p>
        </div>
    @endif

    <p><strong>What you can do next:</strong></p>
    <ul style="margin: 20px 0; padding-left: 20px;">
        <li>Review the reason for rejection above</li>
        <li>Make the necessary corrections to your verification documents</li>
        <li>Submit a new verification request from your dashboard</li>
    </ul>

    <p>Please note that your business profile will remain <strong>hidden</strong> from potential clients until your
        verification is approved.</p>

    <p>If you have any questions about the rejection or need assistance with resubmitting, please contact our support team.
    </p>

    <p>We're here to help you get verified and start receiving bookings!</p>

    <p>Best regards,<br>{{ config('app.name') }} Team</p>
@endsection

@section('cta_url', route('business.dashboard'))
@section('cta_text', 'Go to Dashboard')
