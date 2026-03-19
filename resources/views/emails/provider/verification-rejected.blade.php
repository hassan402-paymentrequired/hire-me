@extends('emails.layout.app')

@section('title', 'Verification Update — ' . config('app.name'))

@section('heading', 'Your verification needs attention 📋')

@section('body')
    <div class="email-content">
        <p>
            Hi <strong>{{ $user->name }}</strong>, thank you for submitting your verification documents
            for <strong>{{ $businessName }}</strong>. After reviewing your submission, our team was
            unable to approve it at this time.
        </p>
        <p>
            This doesn't mean your application is closed — you can address the issue below and
            resubmit at any time.
        </p>
    </div>

    {{-- Rejection reason card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 20px 0; border: 2px solid #dc2626; border-radius: 8px; overflow: hidden;">

        <tr>
            <td style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Reason for Rejection
                </p>
            </td>
        </tr>

        <tr>
            <td style="padding: 20px; background: #fef2f2;">
                @if ($rejectionReason)
                    <p style="margin: 0; font-size: 14px; color: #7f1d1d; font-family: 'Roboto Flex', sans-serif; line-height: 1.7;">
                        {{ $rejectionReason }}
                    </p>
                @else
                    <p style="margin: 0; font-size: 14px; color: #7f1d1d; font-family: 'Roboto Flex', sans-serif; line-height: 1.7; font-style: italic;">
                        No specific reason was provided. Please contact our support team for more details.
                    </p>
                @endif
            </td>
        </tr>

    </table>

    {{-- What to do next --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 0 0 24px; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    How to resubmit successfully
                </p>
            </td>
        </tr>

        {{-- Step 1 --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 10%; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #808f70; font-family: 'Roboto Flex', sans-serif;">1</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Review the rejection reason above</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Understand exactly what was missing or incorrect</p>
            </td>
        </tr>

        {{-- Step 2 --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #808f70; font-family: 'Roboto Flex', sans-serif;">2</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Prepare the correct documents</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Ensure documents are clear, valid, and not expired</p>
            </td>
        </tr>

        {{-- Step 3 --}}
        <tr>
            <td style="padding: 12px 20px; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #808f70; font-family: 'Roboto Flex', sans-serif;">3</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Resubmit from your dashboard</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Go to Settings → Verification and upload your updated documents</p>
            </td>
        </tr>

    </table>

    {{-- Accepted documents reminder --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 0 0 24px; border: 1px solid #e2e5de; border-radius: 6px; overflow: hidden; background: #fafaf9;">
        <tr>
            <td style="width: 4px; background: #808f70;"></td>
            <td style="padding: 16px 18px;">
                <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #33392d; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">
                    Accepted documents
                </p>
                <p style="margin: 0; font-size: 13px; color: #4d5643; font-family: 'Roboto Flex', sans-serif; line-height: 1.8;">
                    • Government-issued ID (National ID, Passport)<br>
                    • Business registration certificate (CAC certificate) if registered<br>
                    • Proof of address (utility bill or bank statement — not older than 3 months)
                </p>
            </td>
        </tr>
    </table>

    <div class="email-content">
        <p>
            If you're unsure what went wrong or need guidance on which documents to submit,
            our support team is available to help — just reply to this email or reach out
            directly.
        </p>
        <p style="margin: 0;">
            We want to see {{ $businessName }} verified and thriving on {{ config('app.name') }}.
        </p>
    </div>
@endsection

@section('cta_label', 'Resubmit Verification →')
@section('cta_url', route('onboarding.verification'))
