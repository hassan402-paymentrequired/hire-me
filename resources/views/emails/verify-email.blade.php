@extends('emails.layout.app')

@section('title', 'Verify your email — ' . config('app.name'))

@section('heading', 'Confirm your email address 📬')

@section('body')
    <div class="email-content">
        <p>
            Hi <strong>{{ $user->name }}</strong>, welcome to {{ config('app.name') }}!
            You're one step away from getting started — just confirm your email address
            and your account will be ready.
        </p>
    </div>

    {{-- Verification prompt card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 24px 0; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        <tr>
            <td style="width: 4px; background: linear-gradient(180deg, #1a1d16, #808f70);"></td>
            <td style="padding: 20px 20px 20px 18px; background: #fafaf9;">
                <p style="margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    Why verify?
                </p>
                <p style="margin: 0; font-size: 13px; color: #4d5643; font-family: 'Roboto Flex', sans-serif; line-height: 1.7;">
                    Verifying your email keeps your account secure, ensures you receive booking
                    confirmations and reminders, and lets providers and clients trust your identity
                    on {{ config('app.name') }}.
                </p>
            </td>
        </tr>
    </table>

    {{-- Info box --}}
    <div class="info-box">
        <p>
            ⏱ &nbsp;This verification link expires in <strong>60 minutes</strong>.
            If it expires, you can request a new one from your account settings.
        </p>
    </div>

    <div class="email-content">
        <p>
            If you didn't create an account on {{ config('app.name') }}, you can safely ignore
            this email — no account will be activated without verification.
        </p>
    </div>
@endsection

@section('cta_label', 'Verify Email Address →')
@section('cta_url', $url)

@section('footer_note', 'You\'re receiving this because an account was created with this email address on ' . config('app.name') . '.')