@extends('emails.layout.app')

@section('title', 'Welcome to ' . config('app.name'))

@section('heading', 'Welcome to ' . config('app.name') . '!')

@section('content')
    <p>Hello {{ $user->name }},</p>
    <p>Thank you for joining our community! We're excited to have you on board as a Service Provider.</p>
    <p>To get started, please log in to your account and complete your business profile so clients can find and book your
        services.</p>
@endsection

@section('cta_url', route('onboarding.index'))
@section('cta_text', 'Complete Your Profile')