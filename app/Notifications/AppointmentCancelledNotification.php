<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Models\User;
use App\Notifications\Concerns\SendsWebPush;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;
use NotificationChannels\WebPush\WebPushChannel;

class AppointmentCancelledNotification extends Notification implements ShouldQueue
{
    use Queueable, SendsWebPush;

    public Appointment $appointment;

    public string $cancelledBy;

    public Collection $similarProviders;

    public function __construct(Appointment $appointment, string $cancelledBy)
    {
        $this->appointment = $appointment->load(['client', 'provider.businessProfile', 'services']);
        $this->cancelledBy = $cancelledBy;

        // Only suggest alternatives when the provider cancelled — not the client
        $this->similarProviders = $cancelledBy === 'provider'
            ? $this->findSimilarProviders()
            : collect();
    }

    /**
     * Find up to 5 active providers offering at least one of the same service categories,
     * excluding the provider who cancelled.
     */
    private function findSimilarProviders(): Collection
    {
        $categoryIds = $this->appointment->services
            ->pluck('category_id')
            ->filter()
            ->unique();

        if ($categoryIds->isEmpty()) {
            return collect();
        }

        return User::query()
            ->with([
                'services' => fn ($q) => $q->whereIn('category_id', $categoryIds)->limit(3),
                'businessProfile'
            ])
            ->whereHas('services', fn ($q) => $q->whereIn('category_id', $categoryIds))
            ->where('id', '!=', $this->appointment->provider_id)
            ->where('is_verified', true)
            ->inRandomOrder()
            ->limit(5)
            ->get()
            ->filter(fn ($b) => $b->services->isNotEmpty());
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', WebPushChannel::class];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Appointment Cancelled — '.config('app.name'))
            ->view('emails.appointment-cancelled', [
                'appointment' => $this->appointment,
                'recipientName' => $notifiable->name,
                'cancelledBy' => $this->cancelledBy,
                'similarProviders' => $this->similarProviders,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        $serviceNames = $this->appointment->services
            ->pluck('name')
            ->join(', ');

        return [
            'title' => 'Appointment Cancelled — '.config('app.name'),
            'message' => 'Your booking with '.$this->appointment->client->name
                          .' for '.$serviceNames
                          .' has been cancelled by the '.$this->cancelledBy.'.',
            'action_url' => '/my-bookings/'.$this->appointment->id,
            'type' => 'appointment_cancelled',
        ];
    }
}
