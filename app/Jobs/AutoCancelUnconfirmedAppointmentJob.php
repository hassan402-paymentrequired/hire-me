<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\Wallet;
use App\Notifications\AppointmentCancelledProviderNoConfirmNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AutoCancelUnconfirmedAppointmentJob implements ShouldQueue
{
    use Queueable;

    /**
     * Threshold: cancel pending appointments that start within this many hours
     * and provider has not confirmed.
     */
    protected const HOURS_BEFORE_START = 1;

    /**
     * Minimum time (minutes) the provider must have had to respond before we auto-cancel.
     * Prevents cancelling appointments that were just booked (e.g. 1 hour before closing).
     */
    protected const MIN_GRACE_PERIOD_MINUTES = 60;

    public function handle(): void
    {
        $threshold = now()->addHours(self::HOURS_BEFORE_START);
        $graceCutoff = now()->subMinutes(self::MIN_GRACE_PERIOD_MINUTES);

        Appointment::query()
            ->with(['provider.businessProfile', 'client', 'services', 'service'])
            ->where('status', 'pending')
            ->where('start_time', '>', now())
            ->where('start_time', '<=', $threshold)
            ->where('created_at', '<=', $graceCutoff)
            ->chunk(100, function ($appointments) {
                $appointments->each(function (Appointment $appointment) {
                    try {
                        $this->cancelAndNotify($appointment);
                    } catch (\Exception $e) {
                        Log::error('Failed to auto-cancel unconfirmed appointment', [
                            'appointment_id' => $appointment->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString(),
                        ]);
                    }
                });
            });
    }

    protected function cancelAndNotify(Appointment $appointment): void
    {
        DB::beginTransaction();
        try {
            $appointment->update([
                'status' => 'cancelled',
                'cancelled_by' => 'system',
                'cancellation_reason' => 'Provider did not confirm appointment in time.',
            ]);

            if ($appointment->escrow_status === 'held' && $appointment->escrow_amount > 0) {
                $clientWallet = Wallet::firstOrCreate(['user_id' => $appointment->client_id]);
                $clientWallet->refundEscrow(
                    (float) $appointment->escrow_amount,
                    $appointment,
                    'Full refund - appointment cancelled (provider did not confirm in time)'
                );
                $appointment->update(['escrow_status' => 'refunded']);
            }

            $similarProviders = $this->findSimilarProviders($appointment, 5);

            $appointment->client->notify(new AppointmentCancelledProviderNoConfirmNotification(
                $appointment->fresh(['provider.businessProfile', 'services']),
                $similarProviders
            ));

            DB::commit();

            DeleteGoogleCalendarEventJob::dispatch($appointment->id);

            Log::info('Auto-cancelled unconfirmed appointment', [
                'appointment_id' => $appointment->id,
                'client_id' => $appointment->client_id,
                'provider_id' => $appointment->provider_id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Find up to $limit similar providers (same category) excluding the original provider.
     */
    protected function findSimilarProviders(Appointment $appointment, int $limit = 5): array
    {
        $serviceIds = $appointment->services->pluck('id')->merge([$appointment->service_id])->filter()->unique();
        $categoryIds = Service::whereIn('id', $serviceIds)->pluck('category_id')->filter()->unique()->values();

        if ($categoryIds->isEmpty()) {
            $categoryIds = Service::where('provider_id', $appointment->provider_id)
                ->pluck('category_id')
                ->filter()
                ->unique()
                ->values();
        }

        $providersQuery = \App\Models\User::whereHas('businessProfile')
            ->where('is_verified', true)
            ->where('id', '!=', $appointment->provider_id)
            ->with(['businessProfile', 'services' => fn ($q) => $q->where('status', 'active')]);

        if ($categoryIds->isNotEmpty()) {
            $providersQuery->whereHas('services', function ($q) use ($categoryIds) {
                $q->whereIn('category_id', $categoryIds)->where('status', 'active');
            });
        }

        $providers = $providersQuery->limit($limit)->get();

        return $providers->map(function ($provider) use ($categoryIds) {
            $bp = $provider->businessProfile;
            $services = $categoryIds->isNotEmpty()
                ? $provider->services->whereIn('category_id', $categoryIds)
                : $provider->services;
            $minPrice = $services->min('price');
            return [
                'id' => $provider->id,
                'name' => $bp->business_name ?? $provider->name,
                'slug' => $bp->slug,
                'services_count' => $provider->services->count(),
                'min_price' => $minPrice ? number_format((float) $minPrice, 0) : null,
                'url' => url("/provider/{$bp->slug}"),
            ];
        })->values()->toArray();
    }
}
