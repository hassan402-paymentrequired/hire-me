@extends('emails.layout.app')

@section('title', 'Team Member Invitation')

@section('heading', 'You\'ve Been Invited!')

@section('content')
    <p>Hello {{ $user->name }},</p>
    
    <p><strong>{{ $inviterName }}</strong> has invited you to join <strong>{{ $businessName }}</strong> as a <strong>{{ $role }}</strong> team member.</p>
    
    <p>As a team member, you'll be able to:</p>
    <ul style="margin: 20px 0; padding-left: 20px;">
        @if($role === 'Admin')
            <li>Manage appointments and bookings</li>
            <li>Manage services and business settings</li>
            <li>View business analytics and reports</li>
            <li>Manage other team members</li>
        @else
            <li>View and manage assigned appointments</li>
            <li>Update appointment statuses</li>
            <li>Communicate with clients</li>
        @endif
    </ul>
    
    <p>Log in to your account to start collaborating with the team!</p>
    
    <p>If you have any questions, please contact {{ $inviterName }} or our support team.</p>
    
    <p>Welcome to the team!</p>
@endsection

@section('cta_url', route('business.dashboard'))
@section('cta_text', 'Go to Dashboard')
