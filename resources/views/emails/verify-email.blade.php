@extends('emails.layout.app')

@section('title', 'Verify your email — ' . config('app.name'))

@section('heading', 'Confirm your email address 📬')

@section('body')
    <div class="email-content">
        <p>
            Hi <strong>{{ $user->name }}</strong>, We're glad to have you!
            You're one step away from getting started — just confirm your email address
            and your account will be ready.
        </p>
    </div>

    <div class="info-box">
        <p>
            ⏱ &nbsp;This verification link expires in <strong>24 hours</strong>.
            If it expires.
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

