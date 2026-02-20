@extends('emails.layout.app')

@section('title', 'Team Member Invitation')

@section('heading', 'You\'ve Been Invited!')

@section('content')
    <p>Hello {{ $user->name }},</p>

    <p><strong>{{ $inviterName }}</strong> has invited you to join <strong>{{ $businessName }}</strong> as a
        <strong>{{ $role }}</strong> team member.
    </p>

    <p>As a team member, you'll be able to:</p>
    <ul style="margin: 20px 0; padding-left: 20px;">
        @if ($role === 'Admin')
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

    <p>Here are the login credentials created for you!</p>

    <p><strong>Email:</strong> {{ $user->email }}</p>
    <p><strong>Password:</strong> {{ $password }}</p>

    <p><strong>Important:</strong> For security reasons, we recommend changing your password after your first login.</p>

    <p>Please note: this invitation expires in 7 days.</p>

    <p>If you have any questions, please contact {{ $inviterName }} or our support team.</p>

    <p>Welcome to the team!</p>
@endsection

@section('cta_url', route('business.team.invite.accept', ['link' => $teamMember->invitation_link]))
@section('cta_text', 'Accept Invitation')
