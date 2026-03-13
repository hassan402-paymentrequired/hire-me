@extends('emails.layout.app')

@section('title', 'Verify your email — ' . config('app.name'))

@section('heading', 'Confirm your email address')

@section('body')
    <div class="email-content">
        <p>
            Hi <strong>{{ $user->name }}</strong>, use the code below to verify your email address.
        </p>
    </div>

    <div class="info-box" style="text-align:center;">
        <p style="margin:0 0 8px 0;">
            Your verification code:
        </p>
        <p style="margin:0; font-size:28px; letter-spacing:6px; font-weight:700;">
            {{ $code }}
        </p>
        <p style="margin:12px 0 0 0; font-size:13px;">
            Expires in <strong>{{ $expiresMinutes }} minutes</strong>.
        </p>
    </div>

    <div class="email-content">
        <p>
            Enter this code on the verification screen to complete your signup.
        </p>
    </div>
@endsection

@section('cta_label', 'Enter code')
@section('cta_url', $entryUrl)
