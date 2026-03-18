@extends('emails.layout.app')

@section('title', 'Your business is live — ' . config('app.name'))

@section('heading', 'Your business is live! 🚀')

@section('body')
    <div class="email-content">
        <p>
            Congratulations <strong>{{ $user->name }}</strong>! You've successfully completed your
            business setup on {{ config('app.name') }}. Your profile is now visible to clients
            and you can start receiving booking requests right away.
        </p>
    </div>

    {{-- What's now active --}}
    <p style="font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; margin: 20px 0 10px;">
        Here's what's ready for you:
    </p>

    <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 14px;">
        <li><strong>Public profile</strong> — clients can discover and browse your business</li>
        <li><strong>Services listed</strong> — your services and pricing are visible on the marketplace</li>
        <li><strong>Booking system</strong> — clients can request appointments directly</li>
        <li><strong>Dashboard</strong> — manage bookings, schedule, and analytics in one place</li>
    </ul>

    {{-- Verification required banner ── MOST IMPORTANT SECTION ── --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 4px 0 24px; border: 2px solid #d97706; border-radius: 8px; overflow: hidden;">

        {{-- Banner header --}}
        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #92400e 0%, #b45309 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    ⚠️ Action Required — Complete Your Verification
                </p>
            </td>
        </tr>

        <tr>
            <td style="padding: 20px; background: #fffbeb;">
                <p style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #92400e; font-family: 'Roboto Flex', sans-serif;">
                    Your profile is live but not yet fully verified.
                </p>
                <p style="margin: 0 0 16px; font-size: 14px; color: #78350f; font-family: 'Roboto Flex', sans-serif; line-height: 1.7;">
                    To receive the <strong>Verified Provider</strong> badge and build trust with clients,
                    you need to submit a valid verification document. Verified providers appear higher
                    in search results and are significantly more likely to receive bookings.
                </p>

                <p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #92400e; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">
                    Accepted documents:
                </p>

                <ul style="margin: 0 0 16px; padding-left: 20px; font-size: 13px; color: #78350f; font-family: 'Roboto Flex', sans-serif; line-height: 1.8;">
                    <li>Government-issued ID (National ID, Driver's Licence)</li>
                    <li>Business registration certificate (CAC certificate)</li>
                    <li>Proof of address (utility bill or bank statement — not older than 3 months)</li>
                </ul>

                <p style="margin: 0; font-size: 13px; color: #92400e; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">
                    Documents are reviewed within <strong>1–2 business days</strong>. You will be notified
                    by email once your verification is approved or if we need additional information.
                </p>
            </td>
        </tr>

        {{-- Submit button inside card --}}
        <tr>
            <td style="padding: 0 20px 20px; background: #fffbeb;">
                <a href="{{ route('onboarding.verification') }}"
                    style="display: inline-block; background-color: #92400e; color: #ffffff; font-size: 13px; font-weight: 700; font-family: 'Roboto Flex', sans-serif; letter-spacing: 0.5px; padding: 10px 20px; border-radius: 3px; text-decoration: none;">
                    Submit Verification Document →
                </a>
            </td>
        </tr>

    </table>

    {{-- Verified vs Unverified comparison --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 0 0 24px; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Unverified vs Verified Provider
                </p>
            </td>
        </tr>

        <tr>
            {{-- Unverified --}}
            <td style="padding: 16px 20px; background: #fafaf9; width: 50%; vertical-align: top; border-right: 1px solid #e2e5de;">
                <p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #dc2626; font-family: 'Roboto Flex', sans-serif;">
                    ✗ &nbsp;Unverified
                </p>
                <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">No verification badge</p>
                <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">Lower in search results</p>
                <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">Limited client trust</p>
                <p style="margin: 0; font-size: 12px; color: #6b7280; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">Standard payout timeline</p>
            </td>

            {{-- Verified --}}
            <td style="padding: 16px 20px; background: #f0fdf4; width: 50%; vertical-align: top;">
                <p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #16a34a; font-family: 'Roboto Flex', sans-serif;">
                    ✓ &nbsp;Verified Provider
                </p>
                <p style="margin: 0 0 6px; font-size: 12px; color: #166534; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">Verified badge on profile</p>
                <p style="margin: 0 0 6px; font-size: 12px; color: #166534; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">Priority in search results</p>
                <p style="margin: 0 0 6px; font-size: 12px; color: #166534; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">Higher client conversion</p>
                <p style="margin: 0; font-size: 12px; color: #166534; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">Faster payout processing</p>
            </td>
        </tr>

    </table>

    {{-- Info box --}}
    <div class="info-box">
        <p>
            💡 &nbsp;While your verification is being reviewed, you can still receive and manage
            bookings. Submitting your documents today means you'll be fully verified before
            your first clients start arriving.
        </p>
    </div>

    <div class="email-content">
        <p>
            We're excited to have you on {{ config('app.name') }}. If you have any questions about
            the verification process or your account, our support team is always here to help.
        </p>
    </div>
@endsection

@section('cta_label', 'Go to Dashboard →')
@section('cta_url', route('business.dashboard'))
