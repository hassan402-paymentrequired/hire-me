@extends('emails.layout.app')

@section('title', '🚨 Urgent: Appointment Needs Your Approval — ' . config('app.name'))

@section('heading', 'Action needed — appointment coming up! ⏰')

@section('body')

    @php
        $minutesUntilStart = \Carbon\Carbon::parse($appointment->start_time)->diffInMinutes(now(), false);
        $timeLabel = \Carbon\Carbon::parse($appointment->start_time)->diffForHumans([
            'parts'  => 2,
            'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE,
        ]);

        $urgencyBg = match(true) {
            $minutesUntilStart <= 60  => '#7C2D12',
            $minutesUntilStart <= 120 => '#92400E',
            default                   => '#B45309',
        };

        $urgencyEmoji = match(true) {
            $minutesUntilStart <= 60  => '🔥',
            $minutesUntilStart <= 120 => '⚡',
            default                   => '⏳',
        };

        $urgencyText = match(true) {
            $minutesUntilStart <= 60  => 'Less than 1 hour remaining — act now!',
            $minutesUntilStart <= 120 => 'Less than 2 hours remaining — please respond soon!',
            default                   => 'Time is running out — confirm or cancel now!',
        };
    @endphp

    {{-- Urgency banner --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 16px 0 24px; border-radius: 8px; overflow: hidden; background: {{ $urgencyBg }};">
        <tr>
            <td style="padding: 16px 20px; text-align: center;">
                <p style="margin: 0; color: #ffffff; font-size: 15px; font-weight: 700; font-family: 'Roboto Flex', sans-serif; letter-spacing: 0.3px;">
                    {{ $urgencyEmoji }} {{ $urgencyText }}
                </p>
            </td>
        </tr>
    </table>

    <div class="email-content">
        <p>
            Hi <strong>{{ $appointment->provider->name }}</strong>, you have an unconfirmed appointment
            starting in <strong>{{ $timeLabel }}</strong>. Your client
            <strong>{{ $appointment->client->name ?? $appointment->client->email ?? 'Guest Client' }}</strong>
            is expecting you — please confirm or cancel right away.
        </p>
    </div>

    {{-- Appointment detail card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 20px 0; border: 2px solid #DC2626; border-radius: 8px; overflow: hidden;">

        {{-- Card header --}}
        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Appointment Details — Reminder #{{ $appointment->reminder_count ?? 1 }}
                </p>
            </td>
        </tr>

        {{-- Start time --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; width: 40%; background: #fff5f5;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Starts At</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #DC2626; font-family: 'Roboto Flex', sans-serif;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('g:i A') }}
                </p>
                <p style="margin: 2px 0 0; font-size: 13px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('l, F j, Y') }}
                </p>
            </td>
        </tr>

        {{-- Client --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; background: #fff5f5;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Client</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->client->name ?? 'Guest Client' }}
                </p>
                @if ($appointment->client->email && $appointment->client->name)
                    <p style="margin: 2px 0 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">
                        {{ $appointment->client_email }}
                    </p>
                @endif
            </td>
        </tr>

        {{-- Services --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; background: #fff5f5; vertical-align: top;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
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

        {{-- Total duration --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; background: #fff5f5;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Total Duration</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                @php
                    $totalMins = $appointment->services->sum('duration_minutes');
                    $durationLabel = $totalMins >= 60
                        ? floor($totalMins / 60) . 'h' . ($totalMins % 60 > 0 ? ' ' . ($totalMins % 60) . 'm' : '')
                        : $totalMins . ' min';
                @endphp
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $durationLabel }}
                </p>
            </td>
        </tr>

        {{-- Price --}}
        <tr style="border-bottom: {{ $appointment->notes ? '1px solid #fef2f2' : 'none' }};">
            <td style="padding: 12px 20px; background: #fff5f5;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Total Price</p>
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
                <td style="padding: 12px 20px; background: #fff5f5; vertical-align: top;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Client Note</p>
                </td>
                <td style="padding: 12px 20px; background: #ffffff;">
                    <p style="margin: 0; font-size: 13px; color: #4d5643; font-style: italic; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">
                        "{{ $appointment->notes }}"
                    </p>
                </td>
            </tr>
        @endif

    </table>

    {{-- What happens next --}}
    <div class="info-box" style="border-left-color: #DC2626; background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);">
        <p style="margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #991B1B;">
            What happens if you don't respond?
        </p>
        <p style="margin: 0; font-size: 13px; color: #7F1D1D; line-height: 1.7;">
            <strong>Confirm</strong> — your client is notified and the appointment is locked in.<br>
            <strong>Cancel</strong> — your client is notified and can rebook with another provider.<br>
            <strong>No action</strong> — the appointment may be auto-cancelled, which can impact your rating.
        </p>
    </div>

    <p style="font-size: 12px; color: #9ca3af; text-align: center; font-family: 'Roboto Flex', sans-serif; margin: 24px 0 0;">
        Reminder #{{ $appointment->reminder_count ?? 1 }} &nbsp;·&nbsp;
        Booked {{ \Carbon\Carbon::parse($appointment->created_at)->diffForHumans() }}
    </p>

@endsection

@section('cta_label', '⚡ Confirm or Cancel Now')
@section('cta_url', route('provider.appointments.show', $appointment->id))

@section('footer_note', 'You\'re receiving urgent reminders because this appointment is starting soon and needs your response.')