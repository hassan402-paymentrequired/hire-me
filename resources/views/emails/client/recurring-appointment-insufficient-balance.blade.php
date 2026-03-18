@extends('emails.layout.app')

@section('title', 'Top up needed — recurring appointment skipped')

@section('heading', 'Your recurring appointment was skipped 🔄')

@section('body')

    @php
        $clientName  = $parentAppointment->client->name ?? $parentAppointment->client_name ?? 'there';
        $shortfall   = $requiredAmount - $availableBalance;
        $serviceNames = $parentAppointment->services->pluck('name')->join(', ');
    @endphp

    <div class="email-content">
        <p>
            Hi <strong>{{ $clientName }}</strong>, your next recurring appointment with
            <strong>{{ $providerName }}</strong> was not created because your
            {{ config('app.name') }} wallet doesn't have enough balance to cover the booking.
        </p>
        <p>
            Top up <strong>₦{{ number_format($shortfall, 2) }}</strong> or more and your next
            occurrence will be automatically scheduled the next time our system runs.
        </p>
    </div>

    {{-- Balance breakdown card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 20px 0; border: 2px solid #d97706; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #92400e 0%, #b45309 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    ⚠️ Insufficient Balance
                </p>
            </td>
        </tr>

        {{-- Service --}}
        <tr style="border-bottom: 1px solid #fef3c7;">
            <td style="padding: 12px 20px; width: 50%; background: #fffbeb;">
                <p style="margin: 0; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    {{ $parentAppointment->services->count() > 1 ? 'Services' : 'Service' }}
                </p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $serviceNames }}
                </p>
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

        {{-- Amount required --}}
        <tr style="border-bottom: 1px solid #fef3c7;">
            <td style="padding: 12px 20px; background: #fffbeb;">
                <p style="margin: 0; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Amount Required</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    ₦{{ number_format($requiredAmount, 2) }}
                </p>
            </td>
        </tr>

        {{-- Current balance --}}
        <tr style="border-bottom: 1px solid #fef3c7;">
            <td style="padding: 12px 20px; background: #fffbeb;">
                <p style="margin: 0; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Your Balance</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #dc2626; font-family: 'Roboto Flex', sans-serif;">
                    ₦{{ number_format($availableBalance, 2) }}
                </p>
            </td>
        </tr>

        {{-- Shortfall --}}
        <tr>
            <td style="padding: 12px 20px; background: #fffbeb;">
                <p style="margin: 0; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Top Up Needed</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #d97706; font-family: 'Roboto Flex', sans-serif;">
                    ₦{{ number_format($shortfall, 2) }}
                </p>
            </td>
        </tr>

    </table>

    {{-- How it works --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 0 0 24px; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    What happens after you top up
                </p>
            </td>
        </tr>

        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 10%; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">💳</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Top up your wallet</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Add at least ₦{{ number_format($shortfall, 2) }} to your {{ config('app.name') }} wallet</p>
            </td>
        </tr>

        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">⚙️</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">System automatically retries</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">The next occurrence will be created automatically when our scheduler runs</p>
            </td>
        </tr>

        <tr>
            <td style="padding: 12px 20px; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">📅</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Your recurring schedule resumes</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Future occurrences will continue as normal with <strong>{{ $providerName }}</strong></p>
            </td>
        </tr>

    </table>

    {{-- Info box --}}
    <div class="info-box">
        <p>
            💡 &nbsp;To avoid this happening again, consider keeping a balance of at least
            <strong>₦{{ number_format($requiredAmount, 2) }}</strong> in your wallet — enough to
            cover one full occurrence of this recurring appointment.
        </p>
    </div>

    <div class="email-content">
        <p>
            If you'd prefer to cancel the recurring appointment instead, you can manage it
            from your bookings page. If you have any questions, our support team is happy to help.
        </p>
    </div>

@endsection

@section('cta_label', 'Top Up Wallet →')
@section('cta_url', url('/wallet'))
