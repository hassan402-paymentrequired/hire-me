@extends('emails.layout.app')

@section('title', 'Appointment Cancelled — ' . config('app.name'))

@section('heading', 'Your appointment was cancelled 😔')

@section('body')

    @php
        $providerName = $appointment->provider->businessProfile->business_name
                        ?? $appointment->provider->name
                        ?? 'the provider';
        $clientName   = $appointment->client->name ?? $appointment->client_name ?? 'there';
    @endphp

    <div class="email-content">
        <p>
            Hi <strong>{{ $clientName }}</strong>, we're sorry to let you know that your appointment
            with <strong>{{ $providerName }}</strong>
            @if ($appointment->services->count() === 1)
                for <strong>{{ $appointment->services->first()->name }}</strong>
            @else
                ({{ $appointment->services->count() }} services)
            @endif
            on <strong>{{ \Carbon\Carbon::parse($appointment->start_time)->format('F j, Y') }}</strong>
            has been <strong>automatically cancelled</strong> because the provider did not confirm
            the booking before the scheduled start time.
        </p>
        <p>
            We apologise for the inconvenience — this is not the experience we want for you on
            {{ config('app.name') }}.
        </p>
    </div>

    {{-- Cancelled appointment card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 20px 0; border: 1px solid #fce4e4; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Cancelled Appointment
                </p>
            </td>
        </tr>

        {{-- Services --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; width: 40%; background: #fffafa; vertical-align: top;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->services->count() > 1 ? 'Services' : 'Service' }}
                </p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                @foreach ($appointment->services as $service)
                    <p style="margin: 0 0 {{ !$loop->last ? '6px' : '0' }} 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; text-decoration: line-through; opacity: 0.6;">
                        {{ $service->name }}
                    </p>
                @endforeach
            </td>
        </tr>

        {{-- Provider --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; background: #fffafa;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Provider</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; opacity: 0.6;">
                    {{ $providerName }}
                </p>
            </td>
        </tr>

        {{-- Date & time --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; background: #fffafa;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Was Scheduled For</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; opacity: 0.6;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('l, F j, Y') }}
                    <br>
                    <span style="font-size: 13px;">
                        {{ \Carbon\Carbon::parse($appointment->start_time)->format('g:i A') }}
                        &mdash;
                        {{ \Carbon\Carbon::parse($appointment->end_time)->format('g:i A') }}
                    </span>
                </p>
            </td>
        </tr>

        {{-- Cancelled by --}}
        <tr style="border-bottom: 1px solid #fef2f2;">
            <td style="padding: 12px 20px; background: #fffafa;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Cancelled By</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 13px; font-weight: 600; color: #dc2626; font-family: 'Roboto Flex', sans-serif;">
                    System (provider did not confirm in time)
                </p>
            </td>
        </tr>

        {{-- Refund status --}}
        <tr>
            <td style="padding: 12px 20px; background: #fffafa;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Refund</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #16a34a; font-family: 'Roboto Flex', sans-serif;">
                    ● ₦{{ number_format($appointment->price, 2) }} refunded to your wallet
                </p>
                <p style="margin: 4px 0 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">
                    Available immediately — use it to book with another provider
                </p>
            </td>
        </tr>

    </table>

    {{-- Similar providers section --}}
    @if (count($similarProviders) > 0)

        <div class="email-divider"></div>

        <p style="font-size: 16px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; margin: 0 0 4px 0;">
            Don't let this ruin your plans ✨
        </p>
        <p style="font-size: 14px; color: #66725a; font-family: 'Roboto Flex', sans-serif; margin: 0 0 16px 0; line-height: 1.6;">
            Here are {{ count($similarProviders) }} verified providers offering similar services —
            ready to book right now with your refunded balance.
        </p>

        @foreach ($similarProviders as $provider)
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                style="margin-bottom: 12px; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">
                <tr>
                    <td style="width: 4px; background: #808f70;"></td>
                    <td style="padding: 14px 16px; background: #ffffff; vertical-align: top;">
                        <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                            {{ $provider['name'] }}
                        </p>
                        <p style="margin: 0 0 8px; font-size: 12px; color: #808f70; font-family: 'Roboto Flex', sans-serif;">
                            {{ $provider['services_count'] }} service{{ $provider['services_count'] > 1 ? 's' : '' }}
                            @if ($provider['min_price'])
                                &nbsp;·&nbsp; from ₦{{ $provider['min_price'] }}
                            @endif
                        </p>
                    </td>
                    <td style="padding: 14px 16px; background: #ffffff; vertical-align: middle; text-align: right; white-space: nowrap;">
                        <a href="{{ $provider['url'] }}"
                            style="display: inline-block; background-color: #100C08; color: #ffffff; font-size: 12px; font-weight: 600; font-family: 'Roboto Flex', sans-serif; letter-spacing: 0.5px; padding: 8px 14px; border-radius: 3px; text-decoration: none;">
                            Book Now
                        </a>
                    </td>
                </tr>
            </table>
        @endforeach

        <p style="font-size: 13px; color: #808f70; font-family: 'Roboto Flex', sans-serif; margin: 8px 0 24px; text-align: center;">
            <a href="{{ config('app.url') }}" style="color: #1a1d16; text-decoration: underline; font-weight: 500;">
                Browse all providers →
            </a>
        </p>

    @else

        <div class="info-box">
            <p>
                🔄 &nbsp;Your refund is in your wallet and ready to use. Browse our marketplace
                to find another provider and get rebooked quickly.
            </p>
        </div>

    @endif

    <div class="email-content">
        <p>
            If you have concerns about this cancellation or need any help,
            our support team is here for you.
        </p>
    </div>

@endsection

@section('cta_label', 'Browse Marketplace →')
@section('cta_url', config('app.url'))
