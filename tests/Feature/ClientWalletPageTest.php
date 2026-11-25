<?php

use App\Models\Appointment;
use App\Models\BusinessProfile;
use App\Models\Service;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config([
        'services.payengine.provider' => 'payengine',
        'services.payengine.partner_bank' => 'Wema Bank',
    ]);
});

it('when a deposit is held for an upcoming booking then the wallet lists it', function () {
    $client = User::factory()->create(['name' => 'Tolu Adeyemi']);
    $provider = User::factory()->create(['role' => 'provider']);
    BusinessProfile::factory()->create(['user_id' => $provider->id, 'business_name' => 'Glow House']);
    $service = Service::factory()->create(['provider_id' => $provider->id, 'name' => 'Silk press']);
    $wallet = Wallet::updateOrCreate(['user_id' => $client->id], ['balance' => 42500, 'escrow_balance' => 5000, 'payengine_account_number' => '0123456789', 'payengine_wallet_id' => 'w_1']);

    $appointment = Appointment::factory()->create([
        'provider_id' => $provider->id,
        'client_id' => $client->id,
        'service_id' => $service->id,
        'status' => 'confirmed',
        'escrow_amount' => 5000,
        'escrow_status' => 'held',
        'start_time' => now()->addDays(4)->setTime(10, 0),
        'end_time' => now()->addDays(4)->setTime(11, 0),
    ]);

    WalletTransaction::create([
        'wallet_id' => $wallet->id,
        'user_id' => $client->id,
        'appointment_id' => $appointment->id,
        'type' => 'payment_hold',
        'amount' => -5000,
        'balance_before' => 47500,
        'balance_after' => 42500,
        'status' => 'completed',
        'description' => 'Payment held',
    ]);

    $this->actingAs($client)
        ->get(route('wallet.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('client/wallet/index')
            ->where('wallet.balance', 47500)
            ->has('heldBookings', 1)
            ->where('heldBookings.0.service_name', 'Silk press')
            ->where('heldBookings.0.business_name', 'Glow House')
            ->where('heldBookings.0.amount', 5000)
            ->where('transactions.data.0.business_name', 'Glow House')
            ->where('transactions.data.0.is_held', true)
            ->where('payengineWallet.bank_name', 'Wema Bank')
            ->where('payengineWallet.account_name', 'Proxideck / Tolu Adeyemi'));
});

it('when a booking deposit has been released then it is no longer shown as held', function () {
    $client = User::factory()->create();
    $provider = User::factory()->create(['role' => 'provider']);
    $service = Service::factory()->create(['provider_id' => $provider->id]);

    Appointment::factory()->create([
        'provider_id' => $provider->id,
        'client_id' => $client->id,
        'service_id' => $service->id,
        'status' => 'completed',
        'escrow_amount' => 5000,
        'escrow_status' => 'released',
    ]);

    $this->actingAs($client)
        ->get(route('wallet.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('heldBookings', 0));
});
