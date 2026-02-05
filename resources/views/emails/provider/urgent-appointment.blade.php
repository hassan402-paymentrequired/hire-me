@extends('emails.layout.app')

@section('title', '🚨 URGENT: Appointment Starting Soon')

@section('heading', '🚨 Immediate Action Required!')

@section('content')
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #374151;">
        Hi <strong>{{ $appointment->provider->name }}</strong>,
    </p>

    <p style="margin: 0 0 20px; font-size: 18px; line-height: 1.5; color: #111827; font-weight: 600;">
        <span style="color: #DC2626;">⚠️ URGENT:</span> You have an appointment starting in
        <strong style="color: #DC2626;">
            {{ \Carbon\Carbon::parse($appointment->start_time)->diffForHumans(['parts' => 2, 'syntax' => \Carbon\CarbonInterface::DIFF_ABSOLUTE]) }}
        </strong>
        that requires immediate confirmation!
    </p>

    <!-- Urgent Alert Banner -->
    <div style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); color: white; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">⏰</div>
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">
            {{ \Carbon\Carbon::parse($appointment->start_time)->format('g:i A') }}
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
            {{ \Carbon\Carbon::parse($appointment->start_time)->format('l, F j, Y') }}
        </div>
    </div>

    <!-- Appointment Details Card -->
    <div style="background: #FEF2F2; border: 2px solid #DC2626; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">
                    <strong>Client:</strong>
                </td>
                <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">
                    {{ $appointment->client_name ?? $appointment->client_email ?? 'Guest Client' }}
                </td>
            </tr>
            @if($appointment->client_email && $appointment->client_name)
                <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">
                        <strong>Email:</strong>
                    </td>
                    <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">
                        {{ $appointment->client_email }}
                    </td>
                </tr>
            @endif
            <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">
                    <strong>Service{{ $appointment->services->count() > 1 ? 's' : '' }}:</strong>
                </td>
                <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">
                    @if($appointment->services->count() > 1)
                        {{ $appointment->services->pluck('name')->join(', ', ' & ') }}
                    @else
                        {{ $appointment->services->first()->name ?? 'Service' }}
                    @endif
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">
                    <strong>Duration:</strong>
                </td>
                <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">
                    {{ $appointment->services->sum('duration_minutes') }} minutes
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">
                    <strong>Total Price:</strong>
                </td>
                <td style="padding: 8px 0; font-size: 16px; font-weight: bold; color: #059669; text-align: right;">
                    ₦{{ number_format($appointment->price, 2) }}
                </td>
            </tr>
            @if($appointment->notes)
                <tr>
                    <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #FECACA; margin-top: 8px;">
                        <p style="margin: 0; font-size: 14px; color: #6B7280;">
                            <strong>Client Note:</strong><br>
                            <span style="color: #374151; font-style: italic;">"{{ $appointment->notes }}"</span>
                        </p>
                    </td>
                </tr>
            @endif
        </table>
    </div>

    <!-- Critical Warning -->
    <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0 0 12px; font-size: 16px; color: #991B1B; font-weight: 600;">
            ⚠️ Your client is expecting this appointment soon!
        </p>
        <p style="margin: 0; font-size: 14px; color: #7F1D1D; line-height: 1.6;">
            Please confirm or cancel this booking immediately to avoid disappointing your client and potentially receiving negative feedback.
        </p>
    </div>

    <p style="margin: 24px 0 16px; font-size: 16px; line-height: 1.5; color: #374151;">
        <strong>What happens next?</strong>
    </p>

    <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;">
        <li><strong>Confirm:</strong> Client will be notified and appointment details finalized</li>
        <li><strong>Cancel:</strong> Client will be notified and can rebook for another time</li>
        <li><strong>No action:</strong> Appointment may be auto-cancelled, affecting your reputation</li>
    </ul>

    @php
        $minutesUntilStart = \Carbon\Carbon::parse($appointment->start_time)->diffInMinutes(now(), false);
    @endphp

    @if($minutesUntilStart <= 60)
        <div style="background: #7C2D12; color: white; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">
                🔥 Less than 1 hour remaining! Act now!
            </p>
        </div>
    @elseif($minutesUntilStart <= 120)
        <div style="background: #92400E; color: white; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">
                ⚡ Less than 2 hours remaining! Please respond soon!
            </p>
        </div>
    @else
        <div style="background: #B45309; color: white; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">
                ⏳ Time is running out! Confirm or cancel now!
            </p>
        </div>
    @endif

    <p style="margin: 24px 0 8px; font-size: 14px; color: #6B7280;">
        <strong>Urgent Reminder #{{ $appointment->reminder_count ?? 1 }}</strong> •
        Booked {{ \Carbon\Carbon::parse($appointment->created_at)->diffForHumans() }}
    </p>

    <p style="margin: 8px 0 0; font-size: 13px; color: #9CA3AF; font-style: italic;">
        You're receiving urgent reminders because this appointment is starting soon.
        Click below to take immediate action.
    </p>
@endsection

@section('cta_url', route('provider.appointments.show', $appointment->id))
@section('cta_text', '⚡ Confirm or Cancel Now')
