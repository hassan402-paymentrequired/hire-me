@extends('emails.layout.app')

@section('title', 'Recurring appointment rescheduled — ' . config('app.name'))

@section('heading', 'Your recurring appointment has a new time 🗓️')

@section('body')

    @php
        $clientName   = $appointment->client->name ?? $appointment->client_name ?? 'there';
        $serviceNames = $appointment->services->pluck('name')->join(', ');
    @endphp

    <div class="email-content">
        <p>
            Hi <strong>{{ $clientName }}</strong>, your recurring appointment with
            <strong>{{ $providerName }}</strong> was automatically rescheduled because
            your original preferred time was no longer available.
        </p>
        <p>
            We found the next best available slot and created your booking — no action needed
            unless the new time doesn't work for you.
        </p>
    </div>

    {{-- Time change card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 20px 0; border: 1px solid #dbeafe; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Time Change Summary
                </p>
            </td>
        </tr>

        {{-- Service --}}
        <tr style="border-bottom: 1px solid #eff6ff;">
            <td style="padding: 12px 20px; width: 40%; background: #f0f7ff; vertical-align: top;">
                <p style="margin: 0; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->services->count() > 1 ? 'Services' : 'Service' }}
                </p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $serviceNames }}
                </p>
            </td>
        </tr>

        {{-- Provider --}}
        <tr style="border-bottom: 1px solid #eff6ff;">
            <td style="padding: 12px 20px; background: #f0f7ff;">
                <p style="margin: 0; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Provider</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $providerName }}
                </p>
            </td>
        </tr>

        {{-- Original time --}}
        <tr style="border-bottom: 1px solid #eff6ff;">
            <td style="padding: 12px 20px; background: #f0f7ff;">
                <p style="margin: 0; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Original Time</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; text-decoration: line-through; opacity: 0.5;">
                    {{ $originalTime }}
                </p>
            </td>
        </tr>

        {{-- New time --}}
        <tr style="border-bottom: 1px solid #eff6ff;">
            <td style="padding: 12px 20px; background: #f0f7ff;">
                <p style="margin: 0; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">New Time</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1d4ed8; font-family: 'Roboto Flex', sans-serif;">
                    ✓ {{ $newTime }}
                </p>
            </td>
        </tr>

        {{-- Price --}}
        <tr>
            <td style="padding: 12px 20px; background: #f0f7ff;">
                <p style="margin: 0; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Amount</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    ₦{{ number_format($appointment->price, 2) }}
                </p>
            </td>
        </tr>

    </table>

    {{-- No action needed callout --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 0 0 24px; border: 1px solid #d1fae5; border-radius: 8px; overflow: hidden; background: #f0fdf4;">
        <tr>
            <td style="width: 4px; background: #16a34a;"></td>
            <td style="padding: 16px 18px;">
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #166534; font-family: 'Roboto Flex', sans-serif;">
                    ✓ Your appointment is confirmed at the new time
                </p>
                <p style="margin: 6px 0 0; font-size: 13px; color: #166534; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">
                    If the new time works for you, no action is needed — just show up and
                    {{ $providerName }} will be ready for you.
                </p>
            </td>
        </tr>
    </table>

    {{-- Info box --}}
    <div class="info-box">
        <p>
            📅 &nbsp;If this time doesn't work, you can reschedule or cancel from your bookings
            page. Your recurring schedule will continue as normal for future occurrences.
        </p>
    </div>

    <div class="email-content">
        <p>
            If you have any questions about this change, feel free to reach out to our support team.
        </p>
    </div>

@endsection

@section('cta_label', 'Change Time →')
@section('cta_url', route('appointments.reschedule', $appointment->id))

