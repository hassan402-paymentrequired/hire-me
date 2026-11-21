<?php

namespace App\Services;

use App\Contracts\PaymentGateway;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayEngineService implements PaymentGateway
{
    private string $baseUrl;

    private ?string $apiKey;

    private ?string $bearerToken;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.payengine.base_url'), '/');
        $this->apiKey = config('services.payengine.api_key');
        $this->bearerToken = config('services.payengine.bearer_token');
    }

    public function credentialsConfigured(): bool
    {
        return (bool) $this->apiKey && (bool) $this->bearerToken;
    }

    private function client(bool $withBearer = false): PendingRequest
    {
        if (! $this->apiKey || ($withBearer && ! $this->bearerToken)) {
            throw new \RuntimeException('PayEngine credentials are not configured.');
        }

        $headers = [
            'api-key' => $this->apiKey,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];

        if ($withBearer) {
            $headers['Authorization'] = 'Bearer '.$this->bearerToken;
        }

        return Http::withHeaders($headers)
            ->acceptJson()
            ->connectTimeout(10)
            ->timeout(30);
    }

    public function initializeCheckout(array $data): array
    {
        $response = $this->client(true)->post("{$this->baseUrl}/payment.initiate", [
            'initiation_reference' => $data['reference'],
            'wallet_id' => $data['wallet_id'],
            'amount' => (float) $data['amount'],
            'currency' => 'NGN',
            'narration' => $data['narration'] ?? 'Proxideck wallet top-up',
            'payment_type' => 'CHECKOUT',
        ]);

        if ($response->successful()) {
            $body = $response->json();
            $responseCode = (string) ($body['response_code'] ?? '');

            if ($responseCode === '00') {
                return [
                    'success' => true,
                    'data' => $body['data'] ?? $body,
                ];
            }
        }

        Log::error('PayEngine checkout initialization failed', [
            'status' => $response->status(),
            'body' => $response->json(),
        ]);

        return [
            'success' => false,
            'message' => $response->json('response_message') ?? 'Failed to initialize PayEngine checkout',
        ];
    }

    public function verifyPayment(string $reference): array
    {
        $response = $this->client(true)->post("{$this->baseUrl}/payment.verifyStatus", [
            'initiation_reference' => $reference,
        ]);
        $body = $response->json();

        if ($response->successful() && in_array((string) ($body['response_code'] ?? ''), ['00', '4000/00', '4414'], true)) {
            $data = $body['data'] ?? [];

            return [
                'success' => true,
                'status' => strtolower((string) ($data['status'] ?? 'successful')),
                'amount' => (float) ($data['amount'] ?? 0),
                'reference' => $reference,
            ];
        }

        return [
            'success' => false,
            'status' => 'pending',
            'message' => $body['response_message'] ?? 'Payment is pending',
        ];
    }

    public function getBanks(): array
    {
        $response = $this->client()->get("{$this->baseUrl}/lookup.bankList");
        $body = $response->json();

        if ($response->successful()) {
            return ['success' => true, 'data' => $body['data'] ?? []];
        }

        return ['success' => false, 'message' => 'Failed to fetch banks', 'data' => []];
    }

    public function initiateTransfer(array $data): array
    {
        $response = $this->client()->post("{$this->baseUrl}/payment.initiate", [
            'initiation_reference' => $data['reference'],
            'wallet_id' => $data['wallet_id'],
            'amount' => (float) $data['amount'],
            'currency' => 'NGN',
            'narration' => $data['reason'] ?? 'Proxideck withdrawal',
            'payment_type' => 'BANK_TRANSFER',
            'receiver_bank_code' => $data['bank_code'],
            'receiver_account_name' => $data['account_name'],
            'receiver_account_number' => $data['account_number'],
        ]);

        $body = $response->json();
        if ($response->successful() && (string) ($body['response_code'] ?? '') === '00') {
            return ['success' => true, 'data' => $body['data'] ?? []];
        }

        return [
            'success' => false,
            'message' => $body['response_message'] ?? 'Failed to initiate transfer',
        ];
    }

    public function verifyTransfer(string $reference): array
    {
        $response = $this->client(true)->post("{$this->baseUrl}/payment.verifyStatus", [
            'initiation_reference' => $reference,
        ]);
        $body = $response->json();

        return [
            'success' => $response->successful(),
            'status' => strtolower((string) ($body['data']['status'] ?? 'pending')),
            'reference' => $reference,
            'data' => $body['data'] ?? [],
        ];
    }

    public function createCustomer(array $data): array
    {
        $response = $this->client(true)->post(
            "{$this->baseUrl}/customer.create",
            array_filter($data, static fn (mixed $value): bool => $value !== null),
        );
        $body = $response->json();

        if ($response->successful() && (string) ($body['response_code'] ?? '') === '00') {
            return ['success' => true, 'data' => $body['data'] ?? []];
        }

        Log::warning('PayEngine customer provisioning failed', [
            'response_code' => $body['response_code'] ?? null,
            'response_type' => $body['response_type'] ?? null,
            'request_id' => $body['request_id'] ?? null,
        ]);

        return [
            'success' => false,
            'message' => $body['response_message'] ?? 'Failed to create PayEngine customer',
        ];
    }

    public function createWallet(array $data): array
    {
        $response = $this->client()->post("{$this->baseUrl}/wallet.create", $data);
        $body = $response->json();

        if ($response->successful() && (string) ($body['response_code'] ?? '') === '00') {
            return ['success' => true, 'data' => $body['data'] ?? []];
        }

        return [
            'success' => false,
            'message' => $body['response_message'] ?? 'Failed to create PayEngine wallet',
        ];
    }
}
