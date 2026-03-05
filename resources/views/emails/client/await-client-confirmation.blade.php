@extends('emails.layout.app')

@section('title', 'Your confirmation is needed — ' . config('app.name'))

@section('heading', 'Did everything go well? 👋')

@section('body')
    <div class="email-content">
        <p>
            Hi <strong>{{ $user->name }}</strong>,
            <strong>{{ $appointment->provider->businessProfile->name }}</strong> has marked your appointment
            as completed on their end. We're just waiting on <strong>you</strong> to confirm before
            releasing the payment to the provider.
        </p>
    </div>

    {{-- Appointment summary card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 24px 0; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        {{-- Card header --}}
        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Appointment Summary
                </p>
            </td>
        </tr>

        {{-- Services --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 40%; background: #fafaf9; vertical-align: top;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->services->count() > 1 ? 'Services' : 'Service' }}
                </p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                @foreach ($appointment->services as $service)
                    <p style="margin: 0 0 {{ !$loop->last ? '6px' : '0' }} 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                        {{ $service->name }}
                        @if ($service->pivot->price ?? null)
                            <span style="font-weight: 400; font-size: 13px; color: #66725a;">
                                — ₦{{ number_format($service->pivot->price, 2) }}
                            </span>
                        @endif
                    </p>
                @endforeach
            </td>
        </tr>

        {{-- Provider --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Provider</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->provider->businessProfile->name }}
                </p>
            </td>
        </tr>

        {{-- Date --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Date</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('l, F j, Y') }}
                </p>
            </td>
        </tr>

        {{-- Time --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Time</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('g:i A') }}
                    &mdash;
                    {{ \Carbon\Carbon::parse($appointment->end_time)->format('g:i A') }}
                </p>
            </td>
        </tr>

        {{-- Amount to release --}}
        <tr>
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Amount</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    ₦{{ number_format($appointment->price, 2) }}
                    @if ($appointment->escrow_status === 'held')
                        <br>
                        <span style="font-size: 12px; font-weight: 400; color: #d97706;">
                            ● Held in escrow — released to provider upon your approval
                        </span>
                    @endif
                </p>
            </td>
        </tr>

    </table>

    {{-- Info box --}}
    <div class="info-box">
        <p>
            🔒 &nbsp;<strong>Your payment is protected.</strong> The ₦{{ number_format($appointment->price, 2) }}
            held in escrow will only be released to
            <strong>{{ $appointment->provider->businessProfile->name }}</strong> once you confirm
            the appointment is complete. If anything went wrong, you can raise a dispute instead.
        </p>
    </div>

    <div class="email-content">
        <p>
            Please confirm from your dashboard — it only takes a second and ensures the provider
            gets paid promptly for their work.
        </p>
        <p style="margin: 0;">
            If you experienced any issues with this appointment, please
            <a href="mailto:support@{{ parse_url(config('app.url'), PHP_URL_HOST) }}"
                style="color: #1a1d16; text-decoration: underline; font-weight: 600;">contact our support team</a>
            before approving.
        </p>
    </div>
@endsection

@section('cta_label', 'Confirm Appointment ✓')
@section('cta_url', route('client.bookings.show', $appointment->id))

@section('unsubscribe_url', '#')

@section('footer_note', 'You\'re receiving this because you have a pending appointment confirmation on ' . config('app.name') . '.')