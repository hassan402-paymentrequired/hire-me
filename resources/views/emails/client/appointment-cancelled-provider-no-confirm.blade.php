@extends('emails.layout.app')

@section('title', 'Appointment Cancelled')

@section('heading', 'Your Appointment Was Cancelled')

@section('content')
    <p>Hi {{ $appointment->client->name ?? $appointment->client_name ?? 'there' }},</p>

    <p>We're sorry to inform you that your appointment with <strong>{{ $appointment->provider->businessProfile->business_name ?? $appointment->provider->name }}</strong> has been cancelled because the provider did not confirm it before the scheduled time.</p>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 5px 0;"><strong>Service:</strong> {{ $appointment->services->first()?->name ?? $appointment->service?->name ?? 'Service' }}</p>
        <p style="margin: 5px 0;"><strong>Was scheduled for:</strong> {{ $appointment->start_time->format('M j, Y \a\t g:i A') }}</p>
        <p style="margin: 5px 0;"><strong>Amount:</strong> ₦{{ number_format($appointment->price, 0) }}</p>
    </div>

    <p><strong>Good news:</strong> Your payment has been fully refunded to your wallet. You can use it to book with another provider.</p>

    @if(count($similarProviders) > 0)
        <p style="margin-top: 24px;"><strong>Here are {{ count($similarProviders) }} similar service{{ count($similarProviders) > 1 ? 's' : '' }} you might be interested in:</strong></p>
        <ul style="margin: 16px 0; padding-left: 24px;">
            @foreach($similarProviders as $provider)
                <li style="margin: 8px 0;">
                    <a href="{{ $provider['url'] }}" style="color: #2563eb; text-decoration: none; font-weight: 600;">{{ $provider['name'] }}</a>
                    – {{ $provider['services_count'] }} service{{ $provider['services_count'] > 1 ? 's' : '' }}
                    @if($provider['min_price'])
                        from ₦{{ $provider['min_price'] }}
                    @endif
                </li>
            @endforeach
        </ul>
        <p>Click any provider above to view their profile and book a new appointment.</p>
    @else
        <p>Browse our marketplace to find another provider that suits your needs.</p>
    @endif
@endsection

@section('cta_url', url('/'))
@section('cta_text', 'Browse Marketplace')
