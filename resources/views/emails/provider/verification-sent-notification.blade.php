@extends('emails.layout.app')

@section('title', 'Verification documents received — ' . config('app.name'))

@section('heading', 'We\'ve received your documents! 📄')

@section('body')
    <div class="email-content">
        <p>
            Hi <strong>{{ $user->name }}</strong>, thank you for submitting your verification
            documents for <strong>{{ $businessName }}</strong>. Our team has received your
            submission and will begin reviewing it shortly.
        </p>
    </div>

    {{-- Submission confirmation card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 20px 0; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Submission Details
                </p>
            </td>
        </tr>

        {{-- Business --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 40%; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Business</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $businessName }}
                </p>
            </td>
        </tr>

        {{-- Submitted on --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Submitted On</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ now()->format('l, F j, Y \a\t g:i A') }}
                </p>
            </td>
        </tr>

        {{-- Status --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Status</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #d97706; font-family: 'Roboto Flex', sans-serif;">
                    ● Under Review
                </p>
            </td>
        </tr>

        {{-- Review timeline --}}
        <tr>
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Review Time</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    1–2 business days
                </p>
            </td>
        </tr>

    </table>

    {{-- What happens next timeline --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 0 0 24px; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    What happens next
                </p>
            </td>
        </tr>

        {{-- Step 1 --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 10%; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">🔍</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Document review</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Our team carefully reviews your submitted documents for authenticity and completeness</p>
            </td>
        </tr>

        {{-- Step 2 --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">📧</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">You'll be notified</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">We'll email you with the outcome — approved or if we need additional information</p>
            </td>
        </tr>

        {{-- Step 3 --}}
        <tr>
            <td style="padding: 12px 20px; background: #fafaf9; text-align: center; vertical-align: middle;">
                <p style="margin: 0; font-size: 18px;">🚀</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">Go live as a Verified Provider</p>
                <p style="margin: 0; font-size: 12px; color: #66725a; font-family: 'Roboto Flex', sans-serif;">Once approved, your verified badge goes live and you'll appear higher in search results</p>
            </td>
        </tr>

    </table>

    {{-- Use the wait time productively --}}
    <div class="info-box">
        <p style="margin: 0 0 10px; font-weight: 700; color: #33392d;">
            💡 Make the most of the review period:
        </p>
        <p style="margin: 0; color: #33392d; line-height: 1.8;">
            • Complete your business profile — add a photo, description, and contact details<br>
            • Double-check your services and pricing are accurate<br>
            • Set your working hours and availability<br>
            • Prepare your welcome message for incoming clients
        </p>
    </div>

    <div class="email-content">
        <p>
            Your profile is currently visible but will display as <strong>unverified</strong> until
            the review is complete. We'll be in touch within 1–2 business days.
            If you have any questions in the meantime, don't hesitate to reach out.
        </p>
    </div>
@endsection

@section('cta_label', 'Explore Dashboard →')
@section('cta_url', route('business.dashboard'))