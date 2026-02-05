<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentCancelledMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Appointment $appointment;
    public string $cancelledBy;

    /**
     * Create a new message instance.
     */
    public function __construct(Appointment $appointment, string $cancelledBy)
    {
        $this->appointment = $appointment->load(['client', 'provider.businessProfile', 'service']);
        $this->cancelledBy = $cancelledBy;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Appointment Cancelled - ' . config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-cancelled',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
