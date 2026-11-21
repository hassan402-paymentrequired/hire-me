<?php

use App\Models\Wallet;
use App\Models\WalletTransaction;

use function Pest\Laravel\postJson;

it('credits a matching PayEngine virtual wallet once', function () {
    config(['services.payengine.webhook_token' => 'test-webhook-token']);

    $user = \App\Models\User::factory()->create();
    $wallet = Wallet::updateOrCreate(['user_id' => $user->id], [
        'balance' => 100,
        'escrow_balance' => 0,
        'payengine_account_number' => '1100061676',
        'payengine_status' => 'active',
    ]);

    $payload = [
        'event' => 'events.credit.transaction',
        'data' => [
            'amount' => 250.50,
            'account_number' => '1100061676',
            'transaction_reference' => 'BC115910D009',
            'session_id' => 'SESSION-123',
        ],
    ];

    postJson(route('payengine.webhook', ['token' => 'test-webhook-token']), $payload)
        ->assertSuccessful()
        ->assertJson([
            'response_code' => '00',
            'status' => 'received',
        ]);

    expect((float) $wallet->fresh()->balance)->toBe(350.50);
    expect(WalletTransaction::where('reference', 'BC115910D009')->count())->toBe(1);

    postJson(route('payengine.webhook', ['token' => 'test-webhook-token']), $payload)
        ->assertSuccessful()
        ->assertJson([
            'response_code' => '00',
            'status' => 'duplicate',
        ]);

    expect((float) $wallet->fresh()->balance)->toBe(350.50);
    expect(WalletTransaction::where('reference', 'BC115910D009')->count())->toBe(1);
});
