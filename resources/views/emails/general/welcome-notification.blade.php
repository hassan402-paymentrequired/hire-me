@extends('emails.layout.app')

@section('title', 'Welcome to ' . config('app.name'))

@section('heading', 'Hi, ' . $user->name . ' 👋')

@section('body')
    <div class="email-content">

        <p>
            {{ config('app.name') }} makes booking and managing appointments simple, organized, and stress-free.
            Whether you're here to book a service or offer one, everything you need is now in one place.
        </p>

        <p style="margin: 0 0 20px 0;">
            Whether you're looking for a reliable handyman, a skilled tutor, or any professional
            service, you'll find top-rated experts ready to help you achieve your goals.
        </p>

    </div>

    <ul style="margin: 20px 0; padding-left: 20px; font-size: 15px">
        <li><strong>Explore:</strong> Browse our marketplace and explore services in your area</li>
        <li><strong>Easy Scheduling:</strong> Book or manage appointments in seconds</li>
        <li><strong>Smart Reminders:</strong> Stay updated and never miss a booking.</li>
        <li><strong>Seamless Experience:</strong> Everything organized in one place.</li>
        <li><strong>Help:</strong> Enjoy secure payments and dedicated customer support.</li>
    </ul>

    <div class="email-content">
        <p>
            Ready to get started? Explore our marketplace and discover professionals who can
            bring your projects to life.
        </p>
    </div>
@endsection

@section('cta_label', 'Browse Marketplace')
@section('cta_url', route('home'))

