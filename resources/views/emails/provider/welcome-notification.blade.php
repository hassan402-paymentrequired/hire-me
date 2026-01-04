@extends('emails.layout.app')

@section('title', 'Welcome to ' . config('app.name'))

@section('preheader', 'Start growing your business and connecting with new clients today')

@section('heading', 'Welcome to Your New Business Platform!')

@section('content')
    <p style="margin: 0 0 20px 0;">Hello {{ $user->name }},</p>
    
    <p style="margin: 0 0 20px 0;">
        Congratulations on taking the first step toward growing your business! We're excited to have you join {{ config('app.name') }} as a Service Provider, where thousands of clients are actively searching for talented professionals like you.
    </p>
    
    <p style="margin: 0 0 20px 0;">
        You're now part of a thriving marketplace that connects skilled professionals with clients who value quality work. Let's get you set up so you can start receiving bookings right away!
    </p>

    <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border-left: 4px solid #10B981; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #1E293B; font-size: 15px;">🚀 Your Next Steps:</p>
        <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 10px;"><strong>Complete your profile</strong> - Showcase your skills, experience, and what makes you unique</li>
            <li style="margin-bottom: 10px;"><strong>Add your services</strong> - List what you offer with clear pricing and descriptions</li>
            <li style="margin-bottom: 10px;"><strong>Upload portfolio images</strong> - Help clients visualize the quality of your work</li>
            <li style="margin-bottom: 10px;"><strong>Set your availability</strong> - Let clients know when you're ready to take bookings</li>
            <li style="margin-bottom: 0;"><strong>Go live</strong> - Start receiving inquiries and booking requests!</li>
        </ul>
    </div>

    <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 18px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0; color: #92400E; font-size: 14px;">
            💡 <strong>Pro Tip:</strong> Providers with complete profiles and portfolio images receive up to 3x more booking requests. Take a few minutes to make your profile stand out!
        </p>
    </div>

    <p style="margin: 0 0 16px 0; font-weight: 600; color: #1E293B;">
        Why Service Providers Choose {{ config('app.name') }}:
    </p>
    <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #475569;">
        <li style="margin-bottom: 8px;">Access to a growing client base actively looking for your services</li>
        <li style="margin-bottom: 8px;">Secure, hassle-free payments processed directly through the platform</li>
        <li style="margin-bottom: 8px;">Build your reputation with verified client reviews</li>
        <li style="margin-bottom: 8px;">Manage your bookings, schedule, and earnings all in one place</li>
        <li style="margin-bottom: 0;">Dedicated support team here to help you succeed</li>
    </ul>

    <p style="margin: 25px 0 0 0;">
        Ready to unlock new opportunities? Complete your profile now and start connecting with clients who need your expertise!
    </p>
@endsection

@section('cta_url', route('onboarding.index'))
@section('cta_text', 'Complete Your Profile')