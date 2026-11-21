<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

/**
 * Fills the demo provider's dashboard with appointments across last month,
 * this week, today and upcoming days, plus client reviews.
 */
class ProviderDashboardSeeder extends Seeder
{
    public const PROVIDER_EMAIL = 'provider1@proxideck.test';

    private const SEED_MARKER = '[demo-seed]';

    private const CLIENT_COUNT = 6;

    private const REVIEW_COMMENTS = [
        'Amazing service, will definitely book again!',
        'Very professional and on time.',
        'Great experience from start to finish.',
        'Friendly staff and excellent results.',
        'Good value for money.',
        'Exactly what I asked for. Highly recommend.',
    ];

    public function run(): void
    {
        $provider = User::where('email', self::PROVIDER_EMAIL)->first();

        if (! $provider) {
            $this->command?->warn('Run ProviderSeeder first. Skipping ProviderDashboardSeeder.');

            return;
        }

        $services = Service::where('provider_id', $provider->id)->where('status', 'active')->get();

        if ($services->isEmpty()) {
            $this->command?->warn('Provider has no active services. Skipping ProviderDashboardSeeder.');

            return;
        }

        $this->clearPreviousSeed($provider);

        $clients = $this->seedClients();
        $now = now();

        // Last month: completed work so month-over-month changes have a baseline.
        foreach (range(1, 8) as $i) {
            $start = $now->copy()->subMonthNoOverflow()->startOfMonth()->addDays($i * 3)->setTime(10 + ($i % 6), 0);
            $appointment = $this->createAppointment($provider, $services, $clients, $start, 'completed');
            $this->createReview($appointment, $start->copy()->addDay());
        }

        // Earlier this month (and this week): completed or confirmed bookings.
        foreach (range(1, 10) as $i) {
            $start = $now->copy()->subHours($i * 14)->minute(0)->second(0);
            if ($start->lt($now->copy()->startOfMonth())) {
                $start = $now->copy()->startOfMonth()->addHours(9 + $i);
            }
            $appointment = $this->createAppointment($provider, $services, $clients, $start, $i % 3 === 0 ? 'confirmed' : 'completed');

            if ($appointment->status === 'completed' && $i % 2 === 0) {
                $this->createReview($appointment, $start->copy()->addHours(5));
            }
        }

        // Completed by the provider, waiting on the client to confirm.
        foreach (range(1, 2) as $i) {
            $this->createAppointment($provider, $services, $clients, $now->copy()->subDays($i)->setTime(14, 0), 'pending_completion', [
                'provider_approved' => true,
                'provider_approved_at' => $now->copy()->subDays($i)->setTime(16, 0),
            ]);
        }

        // Today: a mix of confirmed and one urgent pending booking.
        $this->createAppointment($provider, $services, $clients, $now->copy()->addHour()->minute(0)->second(0), 'pending');
        $this->createAppointment($provider, $services, $clients, $now->copy()->addHours(2)->minute(30)->second(0), 'confirmed');
        $this->createAppointment($provider, $services, $clients, $now->copy()->addHours(4)->minute(0)->second(0), 'confirmed');

        // Upcoming: confirmed schedule plus bookings awaiting confirmation.
        foreach (range(1, 6) as $i) {
            $this->createAppointment($provider, $services, $clients, $now->copy()->addDays($i)->setTime(9 + $i, 0), 'confirmed');
        }
        foreach (range(1, 3) as $i) {
            $this->createAppointment($provider, $services, $clients, $now->copy()->addDays($i + 1)->setTime(15, 0), 'pending');
        }

        // A cancellation for realism.
        $this->createAppointment($provider, $services, $clients, $now->copy()->addDays(3)->setTime(11, 0), 'cancelled', [
            'cancelled_by' => 'client',
            'cancellation_reason' => 'Schedule conflict.',
        ]);

        $this->command?->info('Seeded dashboard data for '.self::PROVIDER_EMAIL);
    }

    private function clearPreviousSeed(User $provider): void
    {
        $appointmentIds = Appointment::where('provider_id', $provider->id)
            ->where('notes', 'like', self::SEED_MARKER.'%')
            ->pluck('id');

        Review::whereIn('appointment_id', $appointmentIds)->delete();
        Appointment::whereIn('id', $appointmentIds)->delete();
    }

    /**
     * @return Collection<int, User>
     */
    private function seedClients(): Collection
    {
        return collect(range(1, self::CLIENT_COUNT))->map(fn (int $i): User => User::firstOrCreate(
            ['email' => "client{$i}@proxideck.test"],
            [
                'name' => fake()->name(),
                'password' => Hash::make('password'),
                'role' => 'client',
                'email_verified_at' => now(),
            ],
        ));
    }

    /**
     * @param  Collection<int, Service>  $services
     * @param  Collection<int, User>  $clients
     * @param  array<string, mixed>  $attributes
     */
    private function createAppointment(User $provider, Collection $services, Collection $clients, CarbonInterface $start, string $status, array $attributes = []): Appointment
    {
        $service = $services->random();
        $client = $clients->random();
        $isCompleted = $status === 'completed';

        return Appointment::create(array_merge([
            'provider_id' => $provider->id,
            'client_id' => $client->id,
            'service_id' => $service->id,
            'start_time' => $start,
            'end_time' => $start->copy()->addMinutes($service->duration_minutes ?: 60),
            'status' => $status,
            'price' => $service->price,
            'payment_method' => 'online',
            'client_name' => $client->name,
            'client_email' => $client->email,
            'client_approved' => $isCompleted,
            'provider_approved' => $isCompleted,
            'client_approved_at' => $isCompleted ? $start->copy()->addHours(2) : null,
            'provider_approved_at' => $isCompleted ? $start->copy()->addHours(2) : null,
            'notes' => self::SEED_MARKER.' '.fake()->sentence(),
        ], $attributes));
    }

    private function createReview(Appointment $appointment, CarbonInterface $createdAt): void
    {
        $review = new Review([
            'appointment_id' => $appointment->id,
            'user_id' => $appointment->client_id,
            'provider_id' => $appointment->provider_id,
            'rating' => fake()->randomElement([4, 4, 5, 5, 5]),
            'comment' => fake()->randomElement(self::REVIEW_COMMENTS),
        ]);
        $review->created_at = $createdAt;
        $review->updated_at = $createdAt;
        $review->save();
    }
}
