@extends('emails.layout.app')

@section('title', 'Welcome to ' . config('app.name'))

@section('heading', 'Welcome to ' . config('app.name') . '!')

@section('content')
    <p>Hello {{ $user->name }},</p>
    <p>Thank you for joining our community! We're excited to have you on board as a client.</p>
    <p>You can now browse and book services from top-rated professionals in your area.</p>
@endsection

@section('cta_url', route('home'))
@section('cta_text', 'Browse Marketplace')
