<?php

namespace App\Observers;

use App\Models\Appointment;
use App\Services\BookingWaitlistService;
use Illuminate\Support\Str;

class AppointmentObserver
{
    public function __construct(private BookingWaitlistService $waitlist) {}

    public function creating(Appointment $appointment): void
    {
        if (! $appointment->reference) {
            $appointment->reference = self::uniqueReference();
        }
    }

    public function updated(Appointment $appointment): void
    {
        if ($appointment->wasChanged('status') && $appointment->status === 'cancelled') {
            $this->waitlist->notifySlotOpened($appointment);
        }
    }

    /**
     * Short, human-friendly booking reference, e.g. PDX-48213.
     */
    private static function uniqueReference(): string
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $reference = 'PDX-'.random_int(10000, 99999);

            if (! Appointment::where('reference', $reference)->exists()) {
                return $reference;
            }
        }

        return 'PDX-'.Str::upper(Str::random(8));
    }
}
