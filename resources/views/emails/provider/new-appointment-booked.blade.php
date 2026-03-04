@extends('emails.layout.app')

@section('title', 'New Booking Request — ' . config('app.name'))

@section('heading', 'You have a new booking! 🎉')

@section('body')
    <div class="email-content">
        <p>
            Great news! <strong>{{ ucwords($appointment->client->name) }}</strong> has just requested an appointment with
            you.
            Review the details below and confirm or decline from your dashboard.
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
                    Appointment Details
                </p>
            </td>
        </tr>

        {{-- Service --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 40%; background: #fafaf9;">
                <p
                    style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    Service</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p
                    style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->service->name }}
                </p>
            </td>
        </tr>

        {{-- Client --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p
                    style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    Client</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p
                    style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ ucwords($appointment->client->name) }}
                    @if ($appointment->client->email)
                        <br>
                        <span
                            style="font-weight: 400; color: #66725a; font-size: 13px;">{{ $appointment->client_email }}</span>
                    @endif
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

        {{-- Price --}}
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

        {{-- Escrow status --}}
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
                        style="margin: 0; font-size: 13px; font-weight: 600; color: {{ $escrowColor }}; font-family: 'Roboto Flex', sans-serif; text-transform: capitalize;">
                        ● {{ ucfirst($appointment->escrow_status) }}
                        <span style="font-weight: 400; color: #808f70;">(escrow)</span>
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
                        Notes</p>
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
            ⏱ &nbsp;Please respond promptly — clients appreciate a quick confirmation.
            Once you accept, <strong>{{ $appointment->client->name }}</strong> will be notified right away.
        </p>
    </div>

    <div class="email-content">
        <p>
            Head to your dashboard to <strong>accept or decline</strong> this request.
            If you have any questions about this booking, you can also reach out to the client directly.
        </p>
    </div>
@endsection

@section('cta_label', 'View Appointment →')
@section('cta_url', route('provider.appointments.show', $appointment->id))

@section('unsubscribe_url', '#')

@section('footer_note',
    'You\'re receiving this because a client booked a service on your ' .
    config('app.name') .
    '
    profile.')
