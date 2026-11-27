<?php

use App\Models\Appointment;
use App\Models\BookingWaitlistEntry;
use App\Models\BusinessProfile;
use App\Models\ClientAddress;
use App\Models\PromoCode;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\WorkHour;
use App\Notifications\AppointmentReminderNotification;
use App\Notifications\WaitlistSlotOpenedNotification;
use App\Support\ProviderSettings;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    // Monday morning, so "Tuesday" below is always tomorrow.
    $this->travelTo(Carbon::parse('2026-11-23 08:00:00'));
    Notification::fake();
    Queue::fake();
    config([
        'services.paystack.secret_key' => 'sk_test_booking',
        'services.paystack.public_key' => 'pk_test_booking',
        'booking.recurring_discount_percent' => 10,
    ]);
});

/**
 * @return array{provider: User, profile: BusinessProfile, silk: Service, gel: Service, amara: TeamMember, kemi: TeamMember}
 */
function bookingFlowProvider(array $settings = []): array
{
    $provider = User::factory()->create(['role' => 'provider', 'is_verified' => true]);
    $profile = BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'slug' => 'glow-house-'.$provider->id,
        'business_name' => 'Glow House',
        'address' => '1 Admiralty Way',
        'has_onboarded' => true,
        'settings' => ProviderSettings::sanitize([
            'allowSameDay' => true,
            'autoConfirm' => false,
            'advanceBooking' => '30',
            'service_delivery_mode' => 'both',
            'offers_home_service' => true,
            'home_service_fee' => 5000,
            ...$settings,
        ]),
    ]);

    foreach (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as $day) {
        WorkHour::create(['provider_id' => $provider->id, 'day_of_week' => $day, 'start_time' => '09:00', 'end_time' => '17:00', 'is_closed' => false]);
    }
    WorkHour::create(['provider_id' => $provider->id, 'day_of_week' => 'Sunday', 'is_closed' => true]);

    $member = fn (string $name) => TeamMember::create([
        'provider_id' => $provider->id,
        'user_id' => User::factory()->create(['name' => $name])->id,
        'role' => 'staff',
        'is_active' => true,
        'accepted_at' => now(),
    ]);

    return [
        'provider' => $provider,
        'profile' => $profile,
        'silk' => Service::factory()->create(['provider_id' => $provider->id, 'name' => 'Silk press & trim', 'duration_minutes' => 90, 'price' => 25000, 'buffer_time_minutes' => 0]),
        'gel' => Service::factory()->create(['provider_id' => $provider->id, 'name' => 'Gel manicure', 'duration_minutes' => 45, 'price' => 12000, 'buffer_time_minutes' => 0]),
        'amara' => $member('Amara'),
        'kemi' => $member('Kemi'),
    ];
}

function bookingFlowClient(float $walletBalance = 100000): User
{
    $client = User::factory()->create(['role' => 'client']);
    Wallet::updateOrCreate(['user_id' => $client->id], ['balance' => $walletBalance]);

    return $client;
}

function bookedAppointment(array $setup, string $start, int $minutes, ?TeamMember $member, array $attributes = []): Appointment
{
    $appointment = Appointment::create([
        'provider_id' => $setup['provider']->id,
        'client_id' => User::factory()->create()->id,
        'service_id' => $setup['silk']->id,
        'start_time' => Carbon::parse($start),
        'end_time' => Carbon::parse($start)->addMinutes($minutes),
        'buffer_time_minutes' => 0,
        'status' => 'confirmed',
        'price' => 25000,
        'team_member_id' => $member?->id,
        ...$attributes,
    ]);
    $appointment->services()->attach($setup['silk']->id);

    return $appointment;
}

it('when each service gets its own professional then both are stored on the booking', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient();

    $response = $this->actingAs($client)->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id, $setup['gel']->id],
        'service_team_members' => [$setup['silk']->id => $setup['amara']->id, $setup['gel']->id => $setup['kemi']->id],
        'start_time' => '2026-11-24T11:30:00',
        'payment_option' => 'online',
    ]);

    $appointment = Appointment::sole();
    $response->assertRedirect(route('client.bookings.booked', $appointment->id));

    expect($appointment->team_member_id)->toBeNull()
        ->and($appointment->reference)->toMatch('/^PDX-\d{5}$/')
        ->and((float) $appointment->price)->toBe(37000.0)
        ->and((float) $appointment->escrow_amount)->toBe(37000.0)
        ->and($appointment->end_time->format('H:i'))->toBe('13:45')
        ->and($appointment->services->map(fn ($service) => [$service->name, $service->pivot->team_member_id])->all())
        ->toBe([['Silk press & trim', $setup['amara']->id], ['Gel manicure', $setup['kemi']->id]]);
});

it('when every service has the same professional then the booking is assigned to them', function () {
    $setup = bookingFlowProvider();

    $this->actingAs(bookingFlowClient())->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id, $setup['gel']->id],
        'service_team_members' => [$setup['silk']->id => $setup['amara']->id, $setup['gel']->id => $setup['amara']->id],
        'start_time' => '2026-11-24T11:30:00',
    ]);

    expect(Appointment::sole()->team_member_id)->toBe($setup['amara']->id);
});

it('when the chosen professional is already busy then the booking is refused but another professional can take it', function () {
    $setup = bookingFlowProvider();
    bookedAppointment($setup, '2026-11-24 10:00:00', 90, $setup['amara']);
    $client = bookingFlowClient();
    $payload = [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-24T10:30:00',
    ];

    $this->actingAs($client)
        ->post(route('appointments.store'), [...$payload, 'service_team_members' => [$setup['silk']->id => $setup['amara']->id]])
        ->assertSessionHas('error-toast', 'This time slot was just booked. Please select another time.');
    expect(Appointment::where('client_id', $client->id)->count())->toBe(0);

    $this->actingAs($client)
        ->post(route('appointments.store'), [...$payload, 'service_team_members' => [$setup['silk']->id => $setup['kemi']->id]])
        ->assertSessionHasNoErrors();
    expect(Appointment::where('client_id', $client->id)->sole()->team_member_id)->toBe($setup['kemi']->id);
});

it('when a professional from another business is chosen then the booking is rejected', function () {
    $setup = bookingFlowProvider();
    $other = bookingFlowProvider();

    $this->actingAs(bookingFlowClient())
        ->post(route('appointments.store'), [
            'provider_id' => $setup['provider']->id,
            'service_ids' => [$setup['silk']->id],
            'service_team_members' => [$setup['silk']->id => $other['amara']->id],
            'start_time' => '2026-11-24T10:30:00',
        ])
        ->assertSessionHasErrors('team_member_id');

    expect(Appointment::count())->toBe(0);
});

it('when a service belongs to another business then the booking is rejected', function () {
    $setup = bookingFlowProvider();
    $other = bookingFlowProvider();

    $this->actingAs(bookingFlowClient())
        ->post(route('appointments.store'), [
            'provider_id' => $setup['provider']->id,
            'service_ids' => [$other['silk']->id],
            'start_time' => '2026-11-24T10:30:00',
        ])
        ->assertSessionHasErrors('service_ids');

    expect(Appointment::count())->toBe(0);
});

it('when a professional is busy then their slots skip the busy window while others stay open', function () {
    $setup = bookingFlowProvider();
    bookedAppointment($setup, '2026-11-24 10:00:00', 90, $setup['amara']);
    $client = bookingFlowClient();
    $slotsFor = fn (TeamMember $member) => collect($this->actingAs($client)->getJson(route('slots', [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'service_team_members' => [$setup['silk']->id => $member->id],
        'date' => '2026-11-24',
    ]))->assertOk()->json('slots'))->pluck('start')->all();

    $amaraSlots = $slotsFor($setup['amara']);
    $kemiSlots = $slotsFor($setup['kemi']);

    expect($amaraSlots)->not->toContain('09:00', '10:00', '10:30', '11:00')
        ->and($amaraSlots)->toContain('11:30')
        ->and($kemiSlots)->toContain('09:00', '10:00', '10:30', '15:30')
        ->and($kemiSlots)->not->toContain('16:00');
});

it('when the week is requested then each day reports its open slot count and closed days are flagged', function () {
    $setup = bookingFlowProvider();

    $days = $this->actingAs(bookingFlowClient())->getJson(route('slots.week', [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['gel']->id],
        'start' => '2026-11-23',
    ]))->assertOk()->json('days');

    expect($days)->toHaveCount(7)
        ->and($days[1])->toBe(['date' => '2026-11-24', 'slots' => 15, 'closed' => false])
        ->and($days[6])->toBe(['date' => '2026-11-29', 'slots' => 0, 'closed' => true]);
});

it('when next availability is requested then anyone and each professional get their soonest time', function () {
    $setup = bookingFlowProvider();
    bookedAppointment($setup, '2026-11-23 09:00:00', 120, $setup['amara']);

    $next = $this->actingAs(bookingFlowClient())->getJson(route('slots.next-available', [
        'provider_id' => $setup['provider']->id,
        'service_id' => $setup['gel']->id,
    ]))->assertOk()->json('next');

    expect(Carbon::parse($next['any'])->format('Y-m-d H:i'))->toBe('2026-11-23 09:00')
        ->and(Carbon::parse($next[$setup['amara']->id])->format('Y-m-d H:i'))->toBe('2026-11-23 11:00')
        ->and(Carbon::parse($next[$setup['kemi']->id])->format('Y-m-d H:i'))->toBe('2026-11-23 09:00');
});

it('when the client picks home service then the provider home fee is added to the price', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient();
    $address = ClientAddress::create(['user_id' => $client->id, 'label' => 'Home', 'address' => '14 Admiralty Way']);

    $this->actingAs($client)->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'client_address_id' => $address->id,
        'start_time' => '2026-11-24T11:30:00',
    ])->assertSessionHasNoErrors();

    $appointment = Appointment::sole();
    expect((float) $appointment->home_service_fee)->toBe(5000.0)
        ->and((float) $appointment->price)->toBe(30000.0)
        ->and($appointment->service_address)->toBe('14 Admiralty Way');
});

it('when the client comes to the studio then no home fee is charged', function () {
    $setup = bookingFlowProvider();

    $this->actingAs(bookingFlowClient())->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-24T11:30:00',
    ])->assertSessionHasNoErrors();

    expect((float) Appointment::sole()->home_service_fee)->toBe(0.0)
        ->and((float) Appointment::sole()->price)->toBe(25000.0);
});

it('when a valid promo code is used then the discount is applied and the use is counted', function () {
    $setup = bookingFlowProvider();
    $promo = PromoCode::factory()->create(['provider_id' => $setup['provider']->id, 'code' => 'GLOW10', 'discount_value' => 10]);

    $this->actingAs(bookingFlowClient())->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-24T11:30:00',
        'promo_code' => ' glow10 ',
    ])->assertSessionHasNoErrors();

    $appointment = Appointment::sole();
    expect((float) $appointment->price)->toBe(22500.0)
        ->and((float) $appointment->promo_discount_amount)->toBe(2500.0)
        ->and($appointment->promo_code_id)->toBe($promo->id)
        ->and($promo->fresh()->times_used)->toBe(1);
});

it('when a promo code is expired, used up, paused or from another business then the booking is refused', function (Closure $makePromo, string $message) {
    $setup = bookingFlowProvider();
    $makePromo($setup['provider']);

    $this->actingAs(bookingFlowClient())->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-24T11:30:00',
        'promo_code' => 'SAVE',
    ])->assertSessionHasErrors(['promo_code' => $message]);

    expect(Appointment::count())->toBe(0);
})->with([
    'expired' => [fn (User $provider) => PromoCode::factory()->expired()->create(['provider_id' => $provider->id, 'code' => 'SAVE']), 'That promo code has expired.'],
    'used up' => [fn (User $provider) => PromoCode::factory()->create(['provider_id' => $provider->id, 'code' => 'SAVE', 'max_uses' => 2, 'times_used' => 2]), 'That promo code has already been fully used.'],
    'paused' => [fn (User $provider) => PromoCode::factory()->inactive()->create(['provider_id' => $provider->id, 'code' => 'SAVE']), 'That promo code isn’t valid for this provider.'],
    'other business' => [fn () => PromoCode::factory()->create(['code' => 'SAVE']), 'That promo code isn’t valid for this provider.'],
]);

it('when a fixed promo code is worth more than the booking then the price never goes below zero', function () {
    $setup = bookingFlowProvider();
    PromoCode::factory()->fixed(100000)->create(['provider_id' => $setup['provider']->id, 'code' => 'FREE']);

    $this->actingAs(bookingFlowClient())->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['gel']->id],
        'start_time' => '2026-11-24T11:30:00',
        'promo_code' => 'FREE',
    ])->assertSessionHasNoErrors();

    expect((float) Appointment::sole()->price)->toBe(0.0);
});

it('when a promo code is checked then valid codes return their discount and invalid ones fail', function () {
    $setup = bookingFlowProvider();
    PromoCode::factory()->fixed(2000)->create(['provider_id' => $setup['provider']->id, 'code' => 'TAKE2K']);
    $client = bookingFlowClient();

    $this->actingAs($client)
        ->postJson(route('promo-codes.check'), ['provider_id' => $setup['provider']->id, 'code' => 'take2k'])
        ->assertOk()
        ->assertExactJson(['code' => 'TAKE2K', 'discountType' => 'fixed', 'discountValue' => 2000]);

    $this->actingAs($client)
        ->postJson(route('promo-codes.check'), ['provider_id' => $setup['provider']->id, 'code' => 'NOPE'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['promo_code' => 'That promo code isn’t valid for this provider.']);
});

it('when the client pays by card then they are sent to Paystack and nothing is booked yet', function () {
    $setup = bookingFlowProvider();
    Http::fake([
        'api.paystack.co/transaction/initialize' => Http::response(['status' => true, 'data' => ['authorization_url' => 'https://checkout.paystack.com/abc', 'access_code' => 'abc']]),
    ]);

    $this->actingAs(bookingFlowClient(0))->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-24T11:30:00',
        'payment_option' => 'card',
    ])->assertRedirect('https://checkout.paystack.com/abc');

    Http::assertSent(fn ($request) => (int) $request['amount'] === 2500000 && $request['metadata']['type'] === 'booking_checkout');
    expect(Appointment::count())->toBe(0);
});

it('when Paystack confirms the card payment then the wallet is credited once and the booking is placed', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient(0);
    Http::fake([
        'api.paystack.co/transaction/initialize' => Http::response(['status' => true, 'data' => ['authorization_url' => 'https://checkout.paystack.com/abc', 'access_code' => 'abc']]),
        'api.paystack.co/transaction/verify/*' => Http::response(['status' => true, 'data' => ['status' => 'success', 'amount' => 2500000, 'reference' => 'ref', 'gateway_response' => 'Approved']]),
    ]);

    $this->actingAs($client)->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'service_team_members' => [$setup['silk']->id => $setup['amara']->id],
        'start_time' => '2026-11-24T11:30:00',
        'payment_option' => 'card',
        'notes' => 'Shoulder length',
    ]);
    $reference = Http::recorded()[0][0]['reference'];

    $response = $this->actingAs($client)->get(route('appointments.checkout.callback', ['reference' => $reference]));

    $appointment = Appointment::sole();
    $response->assertRedirect(route('client.bookings.booked', $appointment->id));
    expect($appointment->payment_method)->toBe('online')
        ->and($appointment->escrow_status)->toBe('held')
        ->and($appointment->notes)->toBe('Shoulder length')
        ->and($appointment->team_member_id)->toBe($setup['amara']->id)
        ->and(WalletTransaction::where('reference', $reference)->where('type', 'deposit')->count())->toBe(1);

    $this->actingAs($client)->get(route('appointments.checkout.callback', ['reference' => $reference]))
        ->assertRedirect(route('client.bookings.index'));
    expect(Appointment::count())->toBe(1)
        ->and(WalletTransaction::where('reference', $reference)->where('type', 'deposit')->count())->toBe(1);
});

it('when the card payment fails then nothing is credited or booked', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient(0);
    Http::fake([
        'api.paystack.co/transaction/initialize' => Http::response(['status' => true, 'data' => ['authorization_url' => 'https://checkout.paystack.com/abc', 'access_code' => 'abc']]),
        'api.paystack.co/transaction/verify/*' => Http::response(['status' => true, 'data' => ['status' => 'failed', 'amount' => 2500000, 'reference' => 'ref', 'gateway_response' => 'Declined']]),
    ]);

    $this->actingAs($client)->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-24T11:30:00',
        'payment_option' => 'card',
    ]);
    $reference = Http::recorded()[0][0]['reference'];

    $this->actingAs($client)->get(route('appointments.checkout.callback', ['reference' => $reference]))
        ->assertRedirect(route('marketplace.booking', $setup['profile']->slug))
        ->assertSessionHas('error-toast', 'Your payment didn’t go through, so nothing was booked. Please try again.');

    expect(Appointment::count())->toBe(0)
        ->and(WalletTransaction::where('reference', $reference)->exists())->toBeFalse();
});

it('when another client opens the card callback then nothing is booked for them', function () {
    $setup = bookingFlowProvider();
    Http::fake([
        'api.paystack.co/transaction/initialize' => Http::response(['status' => true, 'data' => ['authorization_url' => 'https://checkout.paystack.com/abc', 'access_code' => 'abc']]),
    ]);
    $this->actingAs(bookingFlowClient(0))->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-24T11:30:00',
        'payment_option' => 'card',
    ]);
    $reference = Http::recorded()[0][0]['reference'];

    $this->actingAs(bookingFlowClient())->get(route('appointments.checkout.callback', ['reference' => $reference]))
        ->assertRedirect(route('client.bookings.index'));

    expect(Appointment::count())->toBe(0);
});

it('when a client joins the waitlist and a booking that day is cancelled then they are told once', function () {
    $setup = bookingFlowProvider();
    $waiting = bookingFlowClient();
    $appointment = bookedAppointment($setup, '2026-11-25 10:00:00', 90, null);

    $this->actingAs($waiting)->post(route('booking-waitlist.store'), [
        'provider_id' => $setup['provider']->id,
        'date' => '2026-11-25',
        'service_ids' => [$setup['silk']->id],
    ])->assertSessionHas('success-toast');

    $appointment->update(['status' => 'cancelled']);
    $appointment->update(['status' => 'confirmed']);
    $appointment->update(['status' => 'cancelled']);

    Notification::assertSentToTimes($waiting, WaitlistSlotOpenedNotification::class, 1);
    expect(BookingWaitlistEntry::sole()->notified_at)->not->toBeNull();
});

it('when a waitlist date is in the past then joining is rejected', function () {
    $setup = bookingFlowProvider();

    $this->actingAs(bookingFlowClient())
        ->post(route('booking-waitlist.store'), ['provider_id' => $setup['provider']->id, 'date' => '2026-11-20'])
        ->assertSessionHasErrors('date');

    expect(BookingWaitlistEntry::count())->toBe(0);
});

it('when the booking page loads then it carries the redesign data', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient();
    BookingWaitlistEntry::create(['client_id' => $client->id, 'provider_id' => $setup['provider']->id, 'date' => '2026-11-26']);
    foreach (range(1, 3) as $day) {
        bookedAppointment($setup, "2026-11-0{$day} 10:00:00", 60, null);
    }

    $this->actingAs($client)
        ->get(route('marketplace.booking', $setup['profile']->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('marketplace/booking')
            ->where('settings.home_service_fee', 5000)
            ->where('waitlistDates', ['2026-11-26'])
            ->where('cancellationCutoffHours', 12)
            ->where('provider.businessName', 'Glow House')
            ->where('services', fn ($services) => collect($services)->firstWhere('name', 'Silk press & trim')['isMostBooked'] === true
                && collect($services)->firstWhere('name', 'Gel manicure')['isMostBooked'] === false)
            ->has('teamMembers', 2));
});

it('when the client opens their confirmation then it shows the reference, services and who does each', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient();
    $this->actingAs($client)->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id, $setup['gel']->id],
        'service_team_members' => [$setup['silk']->id => $setup['amara']->id, $setup['gel']->id => $setup['kemi']->id],
        'start_time' => '2026-11-26T11:30:00',
    ]);
    $appointment = Appointment::sole();

    $this->actingAs($client)
        ->get(route('client.bookings.booked', $appointment->id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('marketplace/booking-done')
            ->where('booking.reference', $appointment->reference)
            ->where('booking.businessName', 'Glow House')
            ->where('booking.services', [
                ['name' => 'Silk press & trim', 'proName' => 'Amara'],
                ['name' => 'Gel manicure', 'proName' => 'Kemi'],
            ])
            ->where('booking.amountHeld', 37000)
            ->where('booking.atClientLocation', false));

    $this->actingAs(bookingFlowClient())->get(route('client.bookings.booked', $appointment->id))->assertNotFound();
});

it('when the calendar file is downloaded then it describes the visit in UTC', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient();
    $appointment = bookedAppointment($setup, '2026-11-26 11:30:00', 90, null, ['client_id' => $client->id, 'reference' => 'PDX-48213']);

    $response = $this->actingAs($client)->get(route('client.bookings.calendar', $appointment->id));

    $response->assertOk()->assertHeader('Content-Type', 'text/calendar; charset=utf-8');
    expect($response->getContent())
        ->toContain('DTSTART:'.Carbon::parse('2026-11-26 11:30:00')->utc()->format('Ymd\THis\Z'))
        ->toContain('SUMMARY:Silk press & trim at Glow House')
        ->toContain('Booking ref PDX-48213');
});

it('when reminders run then clients hear about tomorrow and in-two-hours visits exactly once', function () {
    $setup = bookingFlowProvider();
    $tomorrow = bookedAppointment($setup, '2026-11-24 07:00:00', 60, null, ['created_at' => now()->subDays(3)]);
    $soon = bookedAppointment($setup, '2026-11-23 09:30:00', 60, null);
    $justBooked = bookedAppointment($setup, '2026-11-24 06:00:00', 60, null);

    $this->artisan('app:send-client-appointment-reminders')->assertSuccessful();
    $this->artisan('app:send-client-appointment-reminders')->assertSuccessful();

    Notification::assertSentToTimes($tomorrow->client, AppointmentReminderNotification::class, 1);
    Notification::assertSentTo($tomorrow->client, AppointmentReminderNotification::class, fn ($notification) => $notification->isDayBefore);
    Notification::assertSentToTimes($soon->client, AppointmentReminderNotification::class, 1);
    Notification::assertSentTo($soon->client, AppointmentReminderNotification::class, fn ($notification) => ! $notification->isDayBefore);
    Notification::assertNotSentTo($justBooked->client, AppointmentReminderNotification::class);
});

it('when the client starts a recurring series then the first visit is full price and the discount applies from visit two', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient();

    $this->actingAs($client)
        ->post(route('appointments.store'), [
            'provider_id' => $setup['provider']->id,
            'service_ids' => [$setup['silk']->id],
            'start_time' => '2026-11-24T11:30:00',
            'payment_option' => 'online',
            'recurrence_pattern' => 'weekly',
        ])
        ->assertRedirect();

    $appointment = Appointment::sole();
    expect($appointment->recurrence_pattern)->toBe('weekly')
        ->and((float) $appointment->discount_percent)->toBe(10.0)
        ->and((float) $appointment->original_price)->toBe(25000.0)
        ->and((float) $appointment->price)->toBe(25000.0)
        ->and((float) $appointment->escrow_amount)->toBe(25000.0);
});

it('when the provider sets a home service fee then only positive amounts are kept', function (mixed $input, ?float $expected) {
    expect(ProviderSettings::sanitize(['home_service_fee' => $input])['home_service_fee'])->toBe($expected);
})->with([
    'number string' => ['5000', 5000.0],
    'decimal' => [2500.5, 2500.5],
    'empty' => ['', null],
    'negative' => ['-5', null],
    'text' => ['free', null],
]);

it('when the client hits the reschedule link then they land on booking details ready to pick a new time', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient();

    $this->actingAs($client)->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-25T11:30:00',
        'payment_option' => 'online',
    ])->assertRedirect();

    $appointment = Appointment::sole();

    $this->actingAs($client)
        ->get(route('appointments.reschedule', $appointment->id))
        ->assertRedirect(route('client.bookings.show', $appointment->id))
        ->assertSessionHas('openReschedule', true);
});

it('when the client reschedules then only the appointment time changes', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient();

    $this->actingAs($client)->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-25T11:30:00',
        'payment_option' => 'online',
    ])->assertRedirect();

    $appointment = Appointment::sole();
    $originalPrice = (float) $appointment->price;

    $this->actingAs($client)
        ->put(route('appointments.update', $appointment->id), [
            'service_ids' => [$setup['silk']->id],
            'start_time' => '2026-11-26T14:00:00',
            'notes' => $appointment->notes,
            'team_member_id' => $appointment->team_member_id,
        ])
        ->assertRedirect(route('client.bookings.show', $appointment->id));

    $appointment->refresh();

    expect($appointment->start_time->format('Y-m-d H:i'))->toBe('2026-11-26 14:00')
        ->and((float) $appointment->price)->toBe($originalPrice)
        ->and($appointment->services->sole()->id)->toBe($setup['silk']->id);
});

it('when the client edits services without changing the time then the booking updates', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient();

    $this->actingAs($client)->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-25T11:30:00',
        'payment_option' => 'online',
        'notes' => 'Keep the length',
    ])->assertRedirect();

    $appointment = Appointment::sole();

    $this->actingAs($client)
        ->put(route('appointments.update', $appointment->id), [
            'service_ids' => [$setup['silk']->id, $setup['gel']->id],
            'start_time' => $appointment->start_time->toIso8601String(),
            'notes' => 'Keep the length and shape',
            'service_team_members' => [
                $setup['silk']->id => $setup['amara']->id,
                $setup['gel']->id => $setup['kemi']->id,
            ],
        ])
        ->assertRedirect(route('client.bookings.show', $appointment->id));

    $appointment->refresh();

    expect($appointment->notes)->toBe('Keep the length and shape')
        ->and($appointment->services->pluck('id')->sort()->values()->all())
        ->toBe(collect([$setup['silk']->id, $setup['gel']->id])->sort()->values()->all())
        ->and($appointment->start_time->format('Y-m-d H:i'))->toBe('2026-11-25 11:30')
        ->and($appointment->team_member_id)->toBeNull();
});

it('when the client opens the edit screen then it uses the redesigned booking form', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient();

    $this->actingAs($client)->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-25T11:30:00',
        'payment_option' => 'online',
    ])->assertRedirect();

    $appointment = Appointment::sole();

    $this->actingAs($client)
        ->get(route('appointments.edit', $appointment->id))
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/bookings/edit')
            ->has('serviceTeamMembers')
            ->has('policy.changeCutoffHours'));
});

it('when the client opens booking details then reschedule slot data is available', function () {
    $setup = bookingFlowProvider();
    $client = bookingFlowClient();

    $this->actingAs($client)->post(route('appointments.store'), [
        'provider_id' => $setup['provider']->id,
        'service_ids' => [$setup['silk']->id],
        'start_time' => '2026-11-25T11:30:00',
        'payment_option' => 'online',
    ])->assertRedirect();

    $appointment = Appointment::sole();

    $this->actingAs($client)
        ->get(route('client.bookings.show', $appointment->id))
        ->assertInertia(fn (Assert $page) => $page
            ->has('rescheduleOptions.serviceTeamMembers')
            ->has('rescheduleOptions.settings')
            ->has('rescheduleOptions.closedDays')
            ->has('rescheduleOptions.popularHours'));
});
