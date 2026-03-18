@extends('emails.layout.app')

@section('title', 'Recurring appointment skipped — ' . config('app.name'))

@section('heading', 'Your recurring appointment was skipped ⚠️')

@section('body')

    @php
        $clientName   = $parentAppointment->client->name ?? $parentAppointment->client_name ?? 'there';
        $serviceNames = $parentAppointment->services->pluck('name')->join(', ');
    @endphp

    <div class="email-content">
        <p>
            Hi <strong>{{ $clientName }}</strong>, unfortunately your next recurring appointment
            with <strong>{{ $providerName }}</strong> for
            <strong>{{ $serviceNames }}</strong> could not be created.
        </p>
        <p>
            The original slot on <strong>{{ $proposedDateFormatted }}</strong> was taken by
            another client, and we were unable to find any available alternative time within
            the next 30 days. You'll need to manually book a new slot when you're ready.
        </p>
    </div>

    {{-- Skipped appointment card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 20px 0; border: 1px solid #fde68a; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #92400e 0%, #b45309 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Skipped Occurrence
                </p>
            </td>
        </tr>

        {{-- Services --}}
        <tr style="border-bottom: 1px solid #fef3c7;">
            <td style="padding: 12px 20px; width: 40%; background: #fffbeb; vertical-align: top;">
                <p style="margin: 0; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    {{ $parentAppointment->services->count() > 1 ? 'Services' : 'Service' }}
                </p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                @foreach ($parentAppointment->services as $service)
                    <p style="margin: 0 0 {{ !$loop->last ? '6px' : '0' }} 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; text-decoration: line-through; opacity: 0.6;">
                        {{ $service->name }}
                    </p>
                @endforeach
            </td>
        </tr>

        {{-- Provider --}}
        <tr style="border-bottom: 1px solid #fef3c7;">
            <td style="padding: 12px 20px; background: #fffbeb;">
                <p style="margin: 0; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Provider</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $providerName }}
                </p>
            </td>
        </tr>

        {{-- Proposed date --}}
        <tr style="border-bottom: 1px solid #fef3c7;">
            <td style="padding: 12px 20px; background: #fffbeb;">
                <p style="margin: 0; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Was Scheduled For</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; text-decoration: line-through; opacity: 0.6;">
                    {{ $proposedDateFormatted }}
                </p>
            </td>
        </tr>

        {{-- Reason --}}
        <tr>
            <td style="padding: 12px 20px; background: #fffbeb;">
                <p style="margin: 0; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Reason</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 13px; color: #b45309; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">
                    Original slot was taken and no alternative was available within 30 days
                </p>
            </td>
        </tr>

    </table>

    {{-- What you can do --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 0 0 24px; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Your options
                </p>
            </td>
        </tr>

        {{-- Option 1 --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 10%; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">📅</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Book a new slot with {{ $providerName }}</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Check their availability and pick a time that works for you</p>
            </td>
        </tr>

        {{-- Option 2 --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">🔄</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Your recurring schedule will continue</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Only this occurrence was skipped — future occurrences will still be auto-scheduled as normal</p>
            </td>
        </tr>

        {{-- Option 3 --}}
        <tr>
            <td style="padding: 12px 20px; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">🔍</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Try another provider</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Browse the marketplace to find other providers offering the same services</p>
            </td>
        </tr>

    </table>

    {{-- Info box --}}
    <div class="info-box">
        <p>
            💡 &nbsp;This was a one-time skip — your recurring appointment series is still active.
            Only this occurrence could not be scheduled. Future occurrences will continue
            to be auto-created based on your original schedule.
        </p>
    </div>

    <div class="email-content">
        <p>
            If you'd like to stop the recurring series entirely or make any changes, you can
            manage it from your bookings page. Our support team is also happy to help.
        </p>
    </div>

@endsection

@section('cta_label', 'Book a New Slot →')
@section('cta_url', route('client.bookings.index'))