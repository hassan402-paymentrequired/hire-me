@extends('emails.layout.app')

@section('title', 'Appointment Cancelled — ' . config('app.name'))

@section('heading', 'Your appointment was cancelled 😔')

@section('body')
    <div class="email-content">
        <p>
            Hi <strong>{{ $recipientName }}</strong>, we're sorry to let you know that your appointment
            @if ($appointment->services->count() === 1)
                for <strong>{{ $appointment->services->first()->name }}</strong>
            @else
                ({{ $appointment->services->count() }} services)
            @endif
            on <strong>{{ \Carbon\Carbon::parse($appointment->start_time)->format('F j, Y') }}</strong>
            has been {{ $appointment->status === 'rejected' ? 'declined' : 'cancelled' }}
            by the <strong>{{ $cancelledBy }}</strong>.
        </p>
    </div>

    {{-- Cancelled appointment card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 24px 0; border: 1px solid #fce4e4; border-radius: 8px; overflow: hidden;">

        {{-- Card header --}}
        <tr>
            <td colspan="2" style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 14px 20px;">
                <p
                    style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Cancelled Appointment
                </p>
            </td>
        </tr>

        {{-- Services --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; width: 40%; background: #fffafa; vertical-align: top;">
                <p
                    style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->services->count() > 1 ? 'Services' : 'Service' }}
                </p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                @foreach ($appointment->services as $service)
                    <p
                        style="margin: 0 0 {{ !$loop->last ? '8px' : '0' }} 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; text-decoration: line-through; opacity: 0.6;">
                        {{ $service->name }}
                        @if ($service->pivot->price ?? null)
                            <span style="font-weight: 400; font-size: 13px;">—
                                ₦{{ number_format($service->pivot->price, 2) }}</span>
                        @endif
                    </p>
                @endforeach
            </td>
        </tr>

        {{-- Date --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; background: #fffafa;">
                <p
                    style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    Original Date</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p
                    style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; opacity: 0.6;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('l, F j, Y') }}
                </p>
            </td>
        </tr>

        {{-- Time --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; background: #fffafa;">
                <p
                    style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    Original Time</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p
                    style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; opacity: 0.6;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('g:i A') }}
                    &mdash;
                    {{ \Carbon\Carbon::parse($appointment->end_time)->format('g:i A') }}
                </p>
            </td>
        </tr>

        {{-- Total amount --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; background: #fffafa;">
                <p
                    style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    Total Amount</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p
                    style="margin: 0; font-size: 16px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; opacity: 0.6; text-decoration: line-through;">
                    ₦{{ number_format($appointment->price, 2) }}
                    @if ($appointment->discount_percent > 0)
                        <br>
                        <span style="font-size: 12px; font-weight: 400;">{{ $appointment->discount_percent }}% discount was
                            applied</span>
                    @endif
                </p>
            </td>
        </tr>

        {{-- Cancelled by --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; background: #fffafa;">
                <p
                    style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    Cancelled By</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p
                    style="margin: 0; font-size: 14px; font-weight: 600; color: #dc2626; font-family: 'Roboto Flex', sans-serif; text-transform: capitalize;">
                    {{ $cancelledBy }}
                </p>
            </td>
        </tr>

        {{-- Cancellation reason --}}
        @if ($appointment->cancellation_reason)
            <tr style="border-bottom: 1px solid #fef2f2;">
                <td style="padding: 12px 20px; background: #fffafa;">
                    <p
                        style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                        Reason</p>
                </td>
                <td style="padding: 12px 20px; background: #ffffff;">
                    <p
                        style="margin: 0; font-size: 13px; color: #4d5643; font-style: italic; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">
                        "{{ $appointment->cancellation_reason }}"
                    </p>
                </td>
            </tr>
        @endif

        {{-- Escrow / refund --}}
        @if ($appointment->escrow_status)
            <tr>
                <td style="padding: 12px 20px; background: #fffafa;">
                    <p
                        style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                        Payment</p>
                </td>
                <td style="padding: 12px 20px; background: #ffffff;">
                    @php
                        $escrowColor = match (strtolower($appointment->escrow_status)) {
                            'refunded' => '#16a34a',
                            'held' => '#d97706',
                            default => '#808f70',
                        };
                        $escrowLabel =
                            strtolower($appointment->escrow_status) === 'refunded'
                                ? 'Refund initiated — funds will return to your account within 3–5 Minutes of canceliation.'
                                : 'Payment status: ' . ucfirst($appointment->escrow_status);
                    @endphp
                    <p
                        style="margin: 0; font-size: 13px; font-weight: 600; color: {{ $escrowColor }}; font-family: 'Roboto Flex', sans-serif;">
                        ● {{ $escrowLabel }}
                    </p>
                </td>
            </tr>
        @endif

    </table>

    {{-- ── Similar providers section (only when provider cancelled) ── --}}
    @if ($cancelledBy === 'provider' && $similarProviders->isNotEmpty())

        <div class="email-divider"></div>

        <p
            style="font-size: 16px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; margin: 0 0 4px 0;">
            Looking for an alternative? ✨
        </p>
        <p
            style="font-size: 14px; color: #66725a; font-family: 'Roboto Flex', sans-serif; margin: 0 0 16px 0; line-height: 1.6;">
            Here are {{ $similarProviders->count() }} providers offering similar services — ready to book right now.
        </p>

        {{-- Provider cards --}}
        @foreach ($similarProviders as $business)
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                style="margin-bottom: 12px; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">
                <tr>
                    {{-- Left accent bar --}}
                    <td style="width: 4px; background: #808f70;"></td>

                    {{-- Provider info --}}
                    <td style="padding: 14px 16px; background: #ffffff; vertical-align: top;">
                        <p
                            style="margin: 0 0 2px 0; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                            {{ $business->businessProfile->business_name }}
                        </p>

                        @if ($business->businessProfile->address)
                            <p
                                style="margin: 0 0 6px 0; font-size: 12px; color: #808f70; font-family: 'Roboto Flex', sans-serif;">
                                📍 {{ $business->businessProfile->address }}
                            </p>
                        @endif

                        {{-- Matching services --}}
                        <p
                            style="margin: 0; font-size: 12px; color: #4d5643; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">
                            @foreach ($business->services as $s)
                                <span
                                    style="display: inline-block; background: #f2f4f1; border-radius: 3px; padding: 2px 8px; margin: 2px 2px 2px 0; font-size: 11px;">
                                    {{ $s->name }}
                                    @if ($s->price)
                                        · ₦{{ number_format($s->price, 0) }}
                                    @endif
                                </span>
                            @endforeach
                        </p>
                    </td>

                    {{-- CTA --}}
                    <td
                        style="padding: 14px 16px; background: #ffffff; vertical-align: middle; text-align: right; white-space: nowrap;">
                        <a href="{{ config('app.url') }}/provider/{{ $business->businessProfile->slug }}"
                            style="display: inline-block; background-color: #100C08; color: #ffffff; font-size: 12px; font-weight: 600; font-family: 'Roboto Flex', sans-serif; letter-spacing: 0.5px; padding: 8px 14px; border-radius: 3px; text-decoration: none;">
                            Book Now
                        </a>
                    </td>
                </tr>
            </table>
        @endforeach

        <p
            style="font-size: 13px; color: #808f70; font-family: 'Roboto Flex', sans-serif; margin: 8px 0 0 0; text-align: center;">
            <a href="{{ config('app.url') }}" style="color: #1a1d16; text-decoration: underline; font-weight: 500;">
                Browse all providers →
            </a>
        </p>
    @else
        {{-- Generic nudge when client cancelled --}}
        <div class="info-box">
            <p>
                🔄 &nbsp;Changed your mind? You can browse our marketplace and rebook at any time.
            </p>
        </div>

    @endif

    <div class="email-content" style="margin-top: 24px;">
        <p>
            If you have any concerns about this cancellation, our support team is here to help.
        </p>
    </div>
@endsection

@section('cta_label', 'Browse Marketplace →')
@section('cta_url', config('app.url'))

@section('unsubscribe_url', '#'))

@section('footer_note', 'You\'re receiving this because you had an appointment booked on ' . config('app.name') . '.')
