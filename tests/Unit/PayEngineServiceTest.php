<?php

use App\Services\PayEngineService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

uses(Tests\TestCase::class);

it('sends customer identity data using the configured PayEngine credentials', function () {
    config([
        'services.payengine.base_url' => 'https://sandbox.bankingcomponent.com/payengine/v1',
        'services.payengine.api_key' => 'test-api-key',
        'services.payengine.bearer_token' => 'test-bearer-token',
    ]);

    Http::fake([
        'sandbox.bankingcomponent.com/*' => Http::response([
            'response_code' => '00',
            'data' => [
                'customer_id' => 'CUS-TEST',
                'wallet_id' => 'WAL-TEST',
                'account_number' => '1100061676',
            ],
        ]),
    ]);

    $result = app(PayEngineService::class)->createCustomer([
        'first_name' => 'Test',
        'last_name' => 'Customer',
        'email' => 'test@example.com',
        'phone_number' => '08012345678',
        'bvn' => '12345678901',
        'nin' => null,
    ]);

    expect($result['success'])->toBeTrue()
        ->and($result['data']['customer_id'])->toBe('CUS-TEST');

    Http::assertSent(fn (Request $request): bool => $request->url() === 'https://sandbox.bankingcomponent.com/payengine/v1/customer.create'
        && $request->hasHeader('api-key', 'test-api-key')
        && $request->hasHeader('Authorization', 'Bearer test-bearer-token')
        && $request['bvn'] === '12345678901'
        && ! array_key_exists('nin', $request->data())
    );
});
