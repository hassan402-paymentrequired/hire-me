@extends('emails.layout.app')

@section('title', 'Appointment Awaiting Your Response — ' . config('app.name'))

@section('heading', 'A client is still waiting on you 👀')

@section('body')

    @php
        $hoursUntilStart  = \Carbon\Carbon::parse($appointment->start_time)->diffInHours(now(), false);
        $hoursBooked      = \Carbon\Carbon::parse($appointment->created_at)->diffInHours(now());
        $hasStarted       = $hoursUntilStart <= 0;
        $isUrgent         = $hoursUntilStart > 0 && $hoursUntilStart <= 3;

        $totalMins = $appointment->services->sum('duration_minutes');
        $durationLabel = $totalMins >= 60
            ? floor($totalMins / 60) . 'h' . ($totalMins % 60 > 0 ? ' ' . ($totalMins % 60) . 'm' : '')
            : $totalMins . ' min';
    @endphp

    {{-- Contextual alert --}}
    @if ($hasStarted)
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
            style="margin: 0 0 20px; border-radius: 6px; overflow: hidden; background: #fef2f2; border-left: 4px solid #DC2626;">
            <tr>
                <td style="padding: 14px 18px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #991B1B; font-family: 'Roboto Flex', sans-serif;">
                        ⚠️ This appointment has already started — confirm or cancel immediately.
                    </p>
                </td>
            </tr>
        </table>
    @elseif ($isUrgent)
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
            style="margin: 0 0 20px; border-radius: 6px; overflow: hidden; background: #fffbeb; border-left: 4px solid #F59E0B;">
            <tr>
                <td style="padding: 14px 18px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #92400E; font-family: 'Roboto Flex', sans-serif;">
                        ⏳ Starting in under 3 hours — please respond as soon as possible.
                    </p>
                </td>
            </tr>
        </table>
    @else
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
            style="margin: 0 0 20px; border-radius: 6px; overflow: hidden; background: #f0fdf4; border-left: 4px solid #16a34a;">
            <tr>
                <td style="padding: 14px 18px;">
                    <p style="margin: 0; font-size: 14px; color: #166534; font-family: 'Roboto Flex', sans-serif;">
                        This booking has been pending for
                        <strong>{{ $hoursBooked >= 24 ? floor($hoursBooked / 24) . ' day' . (floor($hoursBooked / 24) > 1 ? 's' : '') : $hoursBooked . ' hour' . ($hoursBooked !== 1 ? 's' : '') }}</strong>.
                        Your client is still waiting — a quick response goes a long way.
                    </p>
                </td>
            </tr>
        </table>
    @endif

    <div class="email-content">
        <p>
            Hi <strong>{{ $appointment->provider->name }}</strong>, you have a pending booking from
            <strong>{{ $appointment->client_name ?? $appointment->client_email ?? 'a client' }}</strong>
            that still needs your response. Please review the details below and confirm or decline.
        </p>
    </div>

    {{-- Appointment detail card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 20px 0; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        {{-- Card header --}}
        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Pending Appointment — Reminder #{{ $appointment->reminder_count ?? 1 }}
                </p>
            </td>
        </tr>

        {{-- Client --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 40%; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Client</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->client->name ?? 'Guest Client' }}
                </p>
                @if ($appointment->client->email && $appointment->client->name)
                    <p style="margin: 2px 0 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">
                        {{ $appointment->client->email }}
                    </p>
                @endif
            </td>
        </tr>

        {{-- Services --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9; vertical-align: top;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->services->count() > 1 ? 'Services' : 'Service' }}
                </p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                @foreach ($appointment->services as $service)
                    <p style="margin: 0 0 {{ !$loop->last ? '6px' : '0' }} 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                        {{ $service->name }}
                        @if ($service->duration_minutes)
                            <span style="font-weight: 400; font-size: 12px; color: #808f70;">
                                · {{ $service->duration_minutes }}m
                            </span>
                        @endif
                    </p>
                @endforeach
            </td>
        </tr>

        {{-- Date & time --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Date & Time</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('l, F j, Y') }}
                </p>
                <p style="margin: 2px 0 0; font-size: 13px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('g:i A') }}
                    &mdash;
                    {{ \Carbon\Carbon::parse($appointment->end_time)->format('g:i A') }}
                    <span style="color: #9ca3af;">({{ $durationLabel }})</span>
                </p>
            </td>
        </tr>

        {{-- Price --}}
        <tr style="border-bottom: {{ $appointment->notes ? '1px solid #f0f2ee' : 'none' }};">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Total Price</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #059669; font-family: 'Roboto Flex', sans-serif;">
                    ₦{{ number_format($appointment->price, 2) }}
                </p>
            </td>
        </tr>

        {{-- Client notes --}}
        @if ($appointment->notes)
            <tr>
                <td style="padding: 12px 20px; background: #fafaf9; vertical-align: top;">
                    <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Client Note</p>
                </td>
                <td style="padding: 12px 20px; background: #ffffff;">
                    <p style="margin: 0; font-size: 13px; color: #4d5643; font-style: italic; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">
                        "{{ $appointment->notes }}"
                    </p>
                </td>
            </tr>
        @endif

    </table>

    {{-- Info box --}}
    <div class="info-box">
        <p>
            💡 &nbsp;Responding promptly builds trust and improves your rating on {{ config('app.name') }}.
            Clients who receive timely confirmations are more likely to rebook and leave positive reviews.
        </p>
    </div>

    <p style="font-size: 12px; color: #9ca3af; text-align: center; font-family: 'Roboto Flex', sans-serif; margin: 24px 0 0;">
        Reminder #{{ $appointment->reminder_count ?? 1 }}
        &nbsp;·&nbsp;
        Booked {{ \Carbon\Carbon::parse($appointment->created_at)->diffForHumans() }}
    </p>

@endsection

@section('cta_label', 'Review Appointment →')
@section('cta_url', route('provider.appointments.show', $appointment->id))

@section('footer_note', 'You\'re receiving this as a reminder about a pending appointment on your ' . config('app.name') . ' profile.')