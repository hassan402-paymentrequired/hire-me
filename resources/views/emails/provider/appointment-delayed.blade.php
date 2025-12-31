@extends('emails.layout.app')

@section('title', 'Pending Appointment Needs Your Attention')

@section('heading', 'Appointment Awaiting Confirmation!')

@section('content')
    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #374151;">
        Hi <strong>{{ $appointment->provider->name }}</strong>,
    </p>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #374151;">
        You have a pending appointment that requires your confirmation:
    </p>

    <!-- Appointment Details Card -->
    <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">
                    <strong>Client:</strong>
                </td>
                <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">
                    {{ $appointment->client_name ?? $appointment->client_email ?? 'Guest Client' }}
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">
                    <strong>Service:</strong>
                </td>
                <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">
                    @if($appointment->services->count() > 1)
                        {{ $appointment->services->first()->name }} <span style="color: #6B7280;">+{{ $appointment->services->count() - 1 }} more</span>
                    @else
                        {{ $appointment->services->first()->name ?? 'Service' }}
                    @endif
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">
                    <strong>Date & Time:</strong>
                </td>
                <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('M d, Y @ g:i A') }}
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
                    <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #E5E7EB; margin-top: 8px;">
                        <p style="margin: 0; font-size: 14px; color: #6B7280;">
                            <strong>Client Note:</strong><br>
                            <span style="color: #374151;">{{ $appointment->notes }}</span>
                        </p>
                    </td>
                </tr>
            @endif
        </table>
    </div>

    @php
        $hoursUntilStart = \Carbon\Carbon::parse($appointment->start_time)->diffInHours(now(), false);
        $isUrgent = $hoursUntilStart <= 3 && $hoursUntilStart > 0;
        $hasStarted = $hoursUntilStart <= 0;
    @endphp

    @if($hasStarted)
        <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #991B1B;">
                ⚠️ <strong>This appointment has already started!</strong> Please confirm or cancel immediately.
            </p>
        </div>
    @elseif($isUrgent)
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400E;">
                ⚠️ <strong>Urgent:</strong> This appointment starts in less than 3 hours. Please respond as soon as possible!
            </p>
        </div>
    @else
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400E;">
                This appointment has been pending for over 24 hours. Your client is waiting for your confirmation.
            </p>
        </div>
    @endif

    <p style="margin: 24px 0 16px; font-size: 16px; line-height: 1.5; color: #374151;">
        Please review and take action on this booking to provide a great experience for your client.
    </p>

    <p style="margin: 0 0 8px; font-size: 14px; color: #6B7280;">
        <strong>Reminder #{{ $appointment->reminder_count ?? 1 }}</strong> •
        Booked {{ \Carbon\Carbon::parse($appointment->created_at)->diffForHumans() }}
    </p>
@endsection

@section('cta_url', route('provider.appointments.show', $appointment->id))
@section('cta_text', 'Review Appointment')
