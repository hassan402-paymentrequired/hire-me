@component('emails.layout.app')
@slot('title')
Your Account Has Been Created
@endslot

@slot('content')
<p>Hello {{ $user->name }},</p>

<p>An account has been created for you on {{ config('app.name') }}. You can use these credentials to log in anytime to view and manage your bookings.</p>

<div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Email:</strong> {{ $user->email }}</p>
    <p style="margin: 5px 0;"><strong>Password:</strong> {{ $password }}</p>
</div>

<p><strong>Important:</strong> For security reasons, we recommend changing your password after your first login.</p>

<div style="text-align: center; margin: 30px 0;">
    <a href="{{ $loginUrl }}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Log In to Your Account
    </a>
</div>

<p>If you have any questions or need assistance, please don't hesitate to contact us.</p>

<p>Best regards,<br>{{ config('app.name') }} Team</p>
@endslot
@endcomponent
