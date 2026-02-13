@extends('emails.layout.app')

@section('title', 'Verify Your Email Address')

@section('heading', 'Verify Your Email Address')

@section('content')
    <p>Hello {{ $user->name }},</p>
    <p>Thank you for registering with us! Please click the button below to verify your email address and complete your registration.</p>
    <p>If you did not create an account, no further action is required.</p>
@endsection

@section('cta_url', $url)
@section('cta_text', 'Verify Email Address')
