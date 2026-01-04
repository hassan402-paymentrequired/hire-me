@extends('emails.layout.app')

@section('title', 'Welcome to ' . config('app.name'))

@section('preheader', 'Your journey to finding the perfect professional starts now')

@section('heading', 'Welcome to ' . config('app.name') . '!')

@section('content')
    <p style="margin: 0 0 20px 0;">Hello {{ $user->name }},</p>
    
    <p style="margin: 0 0 20px 0;">
        We're thrilled to welcome you to the {{ config('app.name') }} community! You've just joined thousands of clients who trust us to connect them with exceptional professionals.
    </p>
    
    <p style="margin: 0 0 20px 0;">
        Whether you're looking for a reliable handyman, a skilled tutor, or any professional service, you'll find top-rated experts ready to help you achieve your goals.
    </p>

    <div style="background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-left: 4px solid #2563EB; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #1E293B; font-size: 15px;">✨ What's Next?</p>
        <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;">Browse our marketplace and explore services in your area</li>
            <li style="margin-bottom: 8px;">Read reviews from verified clients to find the perfect match</li>
            <li style="margin-bottom: 8px;">Book your first service with confidence - all professionals are vetted</li>
            <li style="margin-bottom: 0;">Enjoy secure payments and dedicated customer support</li>
        </ul>
    </div>

    <p style="margin: 25px 0 0 0;">
        Ready to get started? Explore our marketplace and discover professionals who can bring your projects to life.
    </p>
@endsection

@section('cta_url', route('home'))
@section('cta_text', 'Explore Marketplace')