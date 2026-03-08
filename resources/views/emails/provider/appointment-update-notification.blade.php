@extends('emails.layout.app')

@section('title', 'Appointment Updated — ' . config('app.name'))

@section('heading', 'A client updated their booking ✏️')

@section('body')
    <div class="email-content">
        <p>
            Hi <strong>{{ $notifiable->name ?? $appointment->provider->name }}</strong>,
            <strong>{{ $appointment->client?->name ?? 'A client' }}</strong> has made changes to their
            upcoming appointment with you. Please review the updates below.
        </p>
    </div>

    {{-- Changes summary banner --}}
    @if (!empty($changesSummary))
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
            style="margin: 4px 0 24px; border: 1px solid #dbeafe; border-radius: 8px; overflow: hidden; background: #eff6ff;">
            <tr>
                <td style="width: 4px; background: #3b82f6;"></td>
                <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #1e40af; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase; letter-spacing: 1px;">
                        What changed
                    </p>
                    @foreach ($changesSummary as $change)
                        <p style="margin: 0 0 4px; font-size: 13px; color: #1d4ed8; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">
                            • {{ $change }}
                        </p>
                    @endforeach
                </td>
            </tr>
        </table>
    @endif

    {{-- Updated appointment card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 0 0 24px; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        {{-- Card header --}}
        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Updated Appointment
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
                    {{ $appointment->client?->name ?? 'Guest Client' }}
                </p>
                @if ($appointment->client->email)
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
                    @php
                        $totalMins = $appointment->services->sum('duration_minutes');
                        $durationLabel = $totalMins >= 60
                            ? floor($totalMins / 60) . 'h' . ($totalMins % 60 > 0 ? ' ' . ($totalMins % 60) . 'm' : '')
                            : $totalMins . ' min';
                    @endphp
                    <br>
                    <span style="font-weight: 400; color: #808f70; font-size: 13px;">{{ $durationLabel }}</span>
                </p>
            </td>
        </tr>

        {{-- Price --}}
        <tr style="border-bottom: {{ $appointment->notes ? '1px solid #f0f2ee' : 'none' }};">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Total Price</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    ₦{{ number_format($appointment->price, 2) }}
                    @if ($appointment->discount_percent > 0)
                        <br>
                        <span style="font-size: 12px; font-weight: 400; color: #808f70;">
                            {{ $appointment->discount_percent }}% discount applied
                        </span>
                    @endif
                </p>
            </td>
        </tr>

        {{-- Notes --}}
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
            📋 &nbsp;If these changes don't work for you, you can reach out to the client or
            manage the appointment directly from your dashboard. Changes made by the client
            may require your re-confirmation.
        </p>
    </div>

    <div class="email-content">
        <p>
            Please review the updated details and take any action needed from your dashboard.
        </p>
    </div>

@endsection

@section('cta_label', 'View Updated Appointment →')
@section('cta_url', url('/provider/appointments/' . $appointment->id))

@section('footer_note', 'You\'re receiving this because a client updated a booking on your ' . config('app.name') . ' profile.')