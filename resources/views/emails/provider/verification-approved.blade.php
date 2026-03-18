@extends('emails.layout.app')

@section('title', 'Verification Approved — ' . config('app.name'))

@section('heading', 'You\'re officially verified! 🎉')

@section('body')
    <div class="email-content">
        <p>
            Congratulations <strong>{{ $user->name }}</strong>! Your verification documents for
            <strong>{{ $businessName }}</strong> have been reviewed and approved by our team.
            You are now a <strong>Verified Provider</strong> on {{ config('app.name') }}.
        </p>
    </div>

    {{-- Verified badge card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 20px 0 24px; border: 2px solid #16a34a; border-radius: 8px; overflow: hidden;">

        <tr>
            <td style="background: linear-gradient(135deg, #14532d 0%, #166534 100%); padding: 24px 20px; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 32px; line-height: 1;">✓</p>
                <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px; font-weight: 700; font-family: 'Roboto Flex', sans-serif; letter-spacing: 0.5px;">
                    Verified Provider
                </p>
                <p style="margin: 0; color: #bbf7d0; font-size: 13px; font-family: 'Roboto Flex', sans-serif;">
                    {{ $businessName }}
                </p>
            </td>
        </tr>

        <tr>
            <td style="padding: 16px 20px; background: #f0fdf4;">
                <p style="margin: 0; font-size: 13px; color: #166534; font-family: 'Roboto Flex', sans-serif; text-align: center; line-height: 1.6;">
                    Verified on {{ now()->format('F j, Y') }} &nbsp;·&nbsp; {{ config('app.name') }}
                </p>
            </td>
        </tr>

    </table>

    {{-- What verification unlocks --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 0 0 24px; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    What's unlocked for you
                </p>
            </td>
        </tr>

        {{-- Badge --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 10%; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">✅</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Verified badge on your profile</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Clients can see your business is trusted and verified</p>
            </td>
        </tr>

        {{-- Search priority --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">🔍</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Priority in search results</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Your business ranks higher when clients search for services</p>
            </td>
        </tr>

        {{-- Client trust --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">🤝</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Higher client trust & conversion</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Verified providers receive significantly more booking requests</p>
            </td>
        </tr>

        {{-- Faster payouts --}}
        <tr>
            <td style="padding: 12px 20px; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">💸</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Faster payout processing</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Enjoy quicker access to your earnings after appointments complete</p>
            </td>
        </tr>

    </table>

    {{-- Tips to get first bookings --}}
    <div class="info-box">
        <p style="margin: 0 0 10px; font-weight: 700; color: #33392d;">
            💡 Tips to attract your first clients:
        </p>
        <p style="margin: 0; color: #33392d; line-height: 1.8;">
            • Make sure your profile photo and business description are complete<br>
            • Add clear pricing to all your services<br>
            • Set your working hours so clients know your availability<br>
            • Share your profile link with existing contacts to kickstart your reviews
        </p>
    </div>

    <div class="email-content">
        <p>
            Head to your dashboard to review your profile, fine-tune your services, and get ready
            for your first bookings. Welcome to the verified community on {{ config('app.name') }}!
        </p>
    </div>
@endsection

@section('cta_label', 'Go to Dashboard →')
@section('cta_url', route('business.dashboard'))