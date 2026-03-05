@extends('emails.layout.app')

@section('title', 'Appointment Confirmed — ' . config('app.name'))

@section('heading', 'Your appointment is confirmed! ✅')

@section('body')
    <div class="email-content">
        <p>
            Hi <strong>{{ $appointment->client->name }}</strong>, you're all set!
            <strong>{{ $appointment->provider->businessProfile->business_name }}</strong> has accepted your booking.
            Here's everything you need to know before your appointment.
        </p>
    </div>

    {{-- Appointment detail card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 24px 0; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        {{-- Card header --}}
        <tr>
            <td colspan="2" style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p
                    style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Booking Summary
                </p>
            </td>
        </tr>

        {{-- Service --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 40%; background: #fafaf9;">
                <p
                    style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->services->count() > 1 ? 'Services' : 'Service' }}
                </p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                @foreach ($appointment->services as $service)
                    <p
                        style="margin: 0 0 {{ !$loop->last ? '8px' : '0' }} 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                        {{ $service->name }}
                        @if ($service->pivot->price ?? null)
                            <span style="font-weight: 400; font-size: 13px;">—
                                ₦{{ number_format($service->pivot->price, 2) }}</span>
                        @endif
                    </p>
                @endforeach
            </td>
        </tr>

        {{-- Provider --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p
                    style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    Provider</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p
                    style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->provider->businessProfile->business_name }}
                </p>
            </td>
        </tr>

        {{-- Date --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p
                    style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    Date</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p
                    style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('l, F j, Y') }}
                </p>
            </td>
        </tr>

        {{-- Time --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p
                    style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    Time</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p
                    style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('g:i A') }}
                    &mdash;
                    {{ \Carbon\Carbon::parse($appointment->end_time)->format('g:i A') }}
                    @php
                        $duration = \Carbon\Carbon::parse($appointment->start_time)->diffInMinutes(
                            \Carbon\Carbon::parse($appointment->end_time),
                        );
                        $durationLabel =
                            $duration >= 60
                                ? floor($duration / 60) . 'h' . ($duration % 60 > 0 ? ' ' . $duration % 60 . 'm' : '')
                                : $duration . 'm';
                    @endphp
                    <br>
                    <span style="font-weight: 400; color: #808f70; font-size: 13px;">{{ $durationLabel }}</span>
                </p>
            </td>
        </tr>

        {{-- Location --}}
        @if ($appointment->provider->businessProfile->address)
            <tr style="border-bottom: 1px solid #f0f2ee;">
                <td style="padding: 12px 20px; background: #fafaf9;">
                    <p
                        style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                        Location</p>
                </td>
                <td style="padding: 12px 20px; background: #ffffff;">
                    <p
                        style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                        {{ $appointment->provider->businessProfile->address }}
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query={{ urlencode($appointment->provider->businessProfile->address) }}"
                        target="_blank"
                        style="font-size: 12px; color: #808f70; text-decoration: underline; font-family: 'Roboto Flex', sans-serif;">
                        Open in Google Maps →
                    </a>
                </td>
            </tr>
        @endif

        {{-- Amount --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p
                    style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    Amount</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p
                    style="margin: 0; font-size: 16px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    ₦{{ number_format($appointment->price, 2) }}
                    @if ($appointment->discount_percent > 0)
                        <br>
                        <span style="font-size: 12px; font-weight: 400; color: #808f70;">
                            {{ $appointment->discount_percent }}% discount applied
                            &mdash; original ₦{{ number_format($appointment->original_price, 2) }}
                        </span>
                    @endif
                </p>
            </td>
        </tr>

        {{-- Escrow / payment status --}}
        @if ($appointment->escrow_status)
            <tr style="border-bottom: 1px solid #f0f2ee;">
                <td style="padding: 12px 20px; background: #fafaf9;">
                    <p
                        style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                        Payment</p>
                </td>
                <td style="padding: 12px 20px; background: #ffffff;">
                    @php
                        $escrowColor = match (strtolower($appointment->escrow_status)) {
                            'held' => '#d97706',
                            'released' => '#16a34a',
                            'refunded' => '#dc2626',
                            default => '#808f70',
                        };
                    @endphp
                    <p
                        style="margin: 0; font-size: 13px; font-weight: 600; color: {{ $escrowColor }}; font-family: 'Roboto Flex', sans-serif;">
                        ● {{ ucfirst($appointment->escrow_status) }}
                        <span style="font-weight: 400; color: #808f70;">(held in escrow until completion)</span>
                    </p>
                </td>
            </tr>
        @endif

        {{-- Notes --}}
        @if ($appointment->notes)
            <tr>
                <td style="padding: 12px 20px; background: #fafaf9;">
                    <p
                        style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                        Your Notes</p>
                </td>
                <td style="padding: 12px 20px; background: #ffffff;">
                    <p
                        style="margin: 0; font-size: 13px; color: #4d5643; font-style: italic; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">
                        "{{ $appointment->notes }}"
                    </p>
                </td>
            </tr>
        @endif

    </table>

    {{-- Info box --}}
    <div class="info-box">
        <p>
            📅 &nbsp;Add this to your calendar so you don't miss it.
            If anything changes, you can manage your booking from your dashboard at any time.
        </p>
    </div>

    <div class="email-content">
        <p>
            We look forward to seeing you on
            <strong>{{ \Carbon\Carbon::parse($appointment->start_time)->format('F j') }}</strong>.
            If you need to make any changes or have questions, reach out to us or contact the provider directly.
        </p>
    </div>
@endsection

@section('cta_label', 'View Booking Details →')
@section('cta_url', route('client.bookings.show', $appointment->id))

@section('unsubscribe_url', '')

@section('footer_note', 'You\'re receiving this because you booked an appointment on ' . config('app.name') . '.')
