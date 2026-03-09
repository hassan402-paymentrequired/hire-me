@extends('emails.layout')

@section('title', 'You\'ve been invited to join ' . $businessName . ' — ' . config('app.name'))

@section('heading', 'You\'re invited to join the team! 🎉')

@section('body')
    <div class="email-content">
        <p>
            Hi <strong>{{ $user->name }}</strong>,
            <strong>{{ $inviterName }}</strong> has invited you to join
            <strong>{{ $businessName }}</strong> on {{ config('app.name') }} as a
            <strong>{{ $role }}</strong>.
        </p>
        <p>
            Your account has already been created — all you need to do is accept the invitation
            and you'll be ready to go.
        </p>
    </div>

    {{-- Role capabilities card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 20px 0; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Your Role — {{ $role }}
                </p>
            </td>
        </tr>

        {{-- Business --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 40%; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Business</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $businessName }}
                </p>
            </td>
        </tr>

        {{-- Invited by --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Invited By</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $inviterName }}
                </p>
            </td>
        </tr>

        {{-- Role --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Role</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $role }}
                </p>
            </td>
        </tr>

        {{-- Expires --}}
        <tr>
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Expires</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #d97706; font-family: 'Roboto Flex', sans-serif;">
                    7 days from now
                </p>
            </td>
        </tr>

    </table>

    {{-- What you can do section --}}
    <p style="font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif; margin: 0 0 10px;">
        As a {{ $role }}, you'll be able to:
    </p>

    <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 14px;">
        @if ($role === 'Admin')
            <li>Manage appointments and bookings</li>
            <li>Manage services and business settings</li>
            <li>View business analytics and reports</li>
            <li>Manage other team members</li>
        @else
            <li>View and manage your assigned appointments</li>
            <li>Update appointment statuses</li>
            <li>Communicate with clients</li>
        @endif
    </ul>

    {{-- Credentials box --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 0 0 24px; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        <tr>
            <td colspan="2" style="background: #f2f4f1; padding: 12px 20px; border-bottom: 1px solid #e2e5de;">
                <p style="margin: 0; font-size: 12px; font-weight: 700; color: #33392d; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    🔑 Your Login Credentials
                </p>
            </td>
        </tr>

        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 40%; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Email</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $user->email }}
                </p>
            </td>
        </tr>

        <tr>
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Password</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 700; color: #1a1d16; font-family: 'Courier New', Courier, monospace; letter-spacing: 1px;">
                    {{ $password }}
                </p>
            </td>
        </tr>

    </table>

    {{-- Security warning info box --}}
    <div class="info-box">
        <p>
            🔒 &nbsp;<strong>For your security</strong>, please change your password immediately after your
            first login. Never share your credentials with anyone — including {{ $inviterName }}.
        </p>
    </div>

    <div class="email-content">
        <p>
            If you weren't expecting this invitation or don't recognise <strong>{{ $businessName }}</strong>,
            you can safely ignore this email. The invitation will expire automatically in 7 days.
        </p>
    </div>
@endsection

@section('cta_label', 'Accept Invitation →')
@section('cta_url', route('business.team.invite.accept', ['link' => $teamMember->invitation_link]))

@section('footer_note', 'You\'re receiving this because ' . $inviterName . ' invited you to join their team on ' . config('app.name') . '.')