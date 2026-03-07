@extends('emails.layout.app')

@section('title', 'Appointment Complete — ' . config('app.name'))

@section('heading', $isFirstAppointment ? 'How was your first experience? 🌟' : 'Your appointment is complete! 🎉')

@section('body')
    <div class="email-content">
        <p>
            Hi <strong>{{ $user->name }}</strong>,
            @if ($isFirstAppointment)
                welcome to {{ config('app.name') }}! We hope your first appointment with
            @else
                we hope your appointment with
            @endif
            <strong>{{ $appointment->provider->businessProfile->business_name }}</strong> went smoothly.
            Here's a summary of what was completed.
        </p>
    </div>

    {{-- Appointment summary card --}}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
        style="margin: 24px 0; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden;">

        {{-- Card header --}}
        <tr>
            <td colspan="2"
                style="background: linear-gradient(135deg, #1a1d16 0%, #33392d 100%); padding: 14px 20px;">
                <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 1.5px; font-family: 'Roboto Flex', sans-serif; text-transform: uppercase;">
                    Completed Appointment
                </p>
            </td>
        </tr>

        {{-- Services --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; width: 40%; background: #fafaf9; vertical-align: top;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->services->count() > 1 ? 'Services' : 'Service' }}
                </p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                @foreach ($appointment->services as $service)
                    <p style="margin: 0 0 {{ !$loop->last ? '6px' : '0' }} 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                        {{ $service->name }}
                        @if ($service->price ?? null)
                            <span style="font-weight: 400; font-size: 13px; color: #66725a;">
                                — ₦{{ number_format($service->price, 2) }}
                            </span>
                        @endif
                    </p>
                @endforeach
            </td>
        </tr>

        {{-- Provider --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Provider</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ $appointment->provider->businessProfile->business_name }}
                </p>
            </td>
        </tr>

        {{-- Date --}}
        <tr style="border-bottom: 1px solid #f0f2ee;">
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Date</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    {{ \Carbon\Carbon::parse($appointment->start_time)->format('l, F j, Y') }}
                </p>
            </td>
        </tr>

        {{-- Amount paid --}}
        <tr>
            <td style="padding: 12px 20px; background: #fafaf9;">
                <p style="margin: 0; font-size: 12px; color: #808f70; text-transform: uppercase; letter-spacing: 1px; font-family: 'Roboto Flex', sans-serif;">Amount Paid</p>
            </td>
            <td style="padding: 12px 20px; background: #ffffff;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                    ₦{{ number_format($appointment->price, 2) }}
                    @if ($appointment->escrow_status === 'released')
                        <br>
                        <span style="font-size: 12px; font-weight: 400; color: #16a34a;">
                            ● Payment released to provider
                        </span>
                    @endif
                </p>
            </td>
        </tr>

    </table>

    {{-- ── Review prompt — only shown when client has NOT reviewed yet ── --}}
    @if (!$hasReviewed)

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
            style="margin: 8px 0 24px; border: 1px solid #e2e5de; border-radius: 8px; overflow: hidden; background: #fafaf9;">
            <tr>
                {{-- Star accent bar --}}
                <td style="width: 4px; background: linear-gradient(180deg, #f59e0b, #d97706);"></td>
                <td style="padding: 20px 20px 20px 16px;">

                    <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1a1d16; font-family: 'Roboto Flex', sans-serif;">
                        How was your experience with {{ $appointment->provider->businessProfile->name }}?
                    </p>

                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #66725a; font-family: 'Roboto Flex', sans-serif; line-height: 1.6;">
                        Your review helps other clients find great providers — it only takes 30 seconds
                        and means a lot to the {{ config('app.name') }} community.
                    </p>

                    {{-- Star row (decorative — links to review page) --}}
                    <p style="margin: 0 0 16px 0; font-size: 22px; letter-spacing: 4px;">
                        <a href="{{ route('client.bookings.show', $appointment->id) }}#review"
                            style="text-decoration: none;">
                            ☆☆☆☆☆
                        </a>
                    </p>

                    <a href="{{ route('client.bookings.show', $appointment->id) }}#review"
                        style="display: inline-block; background-color: #100C08; color: #ffffff; font-size: 13px; font-weight: 600; font-family: 'Roboto Flex', sans-serif; letter-spacing: 0.5px; padding: 10px 20px; border-radius: 3px; text-decoration: none;">
                        Leave a Review →
                    </a>

                </td>
            </tr>
        </table>

    @else

        {{-- Already reviewed — thank them --}}
        <div class="info-box">
            <p>
                ⭐ &nbsp;Thanks for leaving a review for
                <strong>{{ $appointment->provider->businessProfile->name }}</strong> — your feedback
                helps the whole {{ config('app.name') }} community.
            </p>
        </div>

    @endif

    <div class="email-content">
        <p>
            Thank you for choosing {{ config('app.name') }}. We look forward to seeing you again!
        </p>
    </div>
@endsection

@section('cta_label', 'View Booking Details →')
@section('cta_url', route('client.bookings.show', $appointment->id))

@section('unsubscribe_url', '#')

@section('footer_note', 'You\'re receiving this because you completed an appointment on ' . config('app.name') . '.')