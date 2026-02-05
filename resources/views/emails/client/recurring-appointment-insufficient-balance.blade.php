@extends('emails.layout.app')

@section('title', 'Top Up Wallet Required')

@section('heading', 'Recurring Appointment Skipped')

@section('content')
    <p>Hi {{ $parentAppointment->client->name ?? $parentAppointment->client_name ?? 'there' }},</p>

    <p>Your next recurring appointment could not be created because your wallet balance is insufficient.</p>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <p style="margin: 5px 0;"><strong>Provider:</strong> {{ $providerName }}</p>
        <p style="margin: 5px 0;"><strong>Required:</strong> ₦{{ number_format($requiredAmount, 2) }}</p>
        <p style="margin: 5px 0;"><strong>Your balance:</strong> ₦{{ number_format($availableBalance, 2) }}</p>
    </div>

    <p>After topping up, the next appointment will be created automatically when the job runs again.</p>
@endsection

@section('cta_url', url('/wallet'))
@section('cta_text', 'Top Up Wallet')
