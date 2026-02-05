<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackService
{
    private string $secretKey;
    private string $publicKey;
    private string $baseUrl = 'https://api.paystack.co';

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key');
        $this->publicKey = config('services.paystack.public_key');
    }

    /**
     * Initialize a payment transaction
     */
    public function initializeTransaction(array $data): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey,
            'Content-Type' => 'application/json',
        ])->post("{$this->baseUrl}/transaction/initialize", [
            'email' => $data['email'],
            'amount' => $data['amount'] * 100, // Convert to kobo
            'reference' => $data['reference'],
            'callback_url' => $data['callback_url'] ?? route('paystack.callback'),
            'metadata' => $data['metadata'] ?? [],
        ]);

        if ($response->successful()) {
            return [
                'success' => true,
                'data' => $response->json()['data'],
            ];
        }

        Log::error('Paystack initialization failed', [
            'response' => $response->json(),
            'data' => $data,
        ]);

        return [
            'success' => false,
            'message' => $response->json()['message'] ?? 'Failed to initialize payment',
        ];
    }

    /**
     * Verify a transaction
     */
    public function verifyTransaction(string $reference): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey,
            'Content-Type' => 'application/json',
        ])->get("{$this->baseUrl}/transaction/verify/{$reference}");

        if ($response->successful()) {
            $data = $response->json()['data'];
            return [
                'success' => true,
                'status' => $data['status'],
                'amount' => $data['amount'] / 100, // Convert from kobo
                'reference' => $data['reference'],
                'gateway_response' => $data['gateway_response'],
                'paid_at' => $data['paid_at'] ?? null,
                'customer' => $data['customer'] ?? null,
            ];
        }

        return [
            'success' => false,
            'message' => $response->json()['message'] ?? 'Failed to verify transaction',
        ];
    }

    /**
     * Create a transfer recipient (for withdrawals)
     */
    public function createTransferRecipient(array $data): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey,
            'Content-Type' => 'application/json',
        ])->post("{$this->baseUrl}/transferrecipient", [
            'type' => $data['type'], // 'nuban' for bank account
            'name' => $data['name'],
            'account_number' => $data['account_number'],
            'bank_code' => $data['bank_code'],
            'currency' => $data['currency'] ?? 'NGN',
        ]);

        if ($response->successful()) {
            return [
                'success' => true,
                'data' => $response->json()['data'],
            ];
        }

        Log::error('Paystack transfer recipient creation failed', [
            'response' => $response->json(),
            'data' => $data,
        ]);

        return [
            'success' => false,
            'message' => $response->json()['message'] ?? 'Failed to create transfer recipient',
        ];
    }

    /**
     * Initiate a transfer (withdrawal)
     */
    public function initiateTransfer(array $data): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey,
            'Content-Type' => 'application/json',
        ])->post("{$this->baseUrl}/transfer", [
            'source' => 'balance',
            'amount' => $data['amount'] * 100, // Convert to kobo
            'recipient' => $data['recipient_code'],
            'reason' => $data['reason'] ?? 'Withdrawal',
            'reference' => $data['reference'],
        ]);

        if ($response->successful()) {
            return [
                'success' => true,
                'data' => $response->json()['data'],
            ];
        }

        Log::error('Paystack transfer failed', [
            'response' => $response->json(),
            'data' => $data,
        ]);

        return [
            'success' => false,
            'message' => $response->json()['message'] ?? 'Failed to initiate transfer',
        ];
    }

    /**
     * Verify a transfer
     */
    public function verifyTransfer(string $reference): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey,
            'Content-Type' => 'application/json',
        ])->get("{$this->baseUrl}/transfer/{$reference}");

        if ($response->successful()) {
            $data = $response->json()['data'];
            return [
                'success' => true,
                'status' => $data['status'],
                'amount' => $data['amount'] / 100, // Convert from kobo
                'reference' => $data['reference'],
                'transfer_code' => $data['transfer_code'],
            ];
        }

        return [
            'success' => false,
            'message' => $response->json()['message'] ?? 'Failed to verify transfer',
        ];
    }

    /**
     * Get list of banks
     */
    public function getBanks(): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->secretKey,
            'Content-Type' => 'application/json',
        ])->get("{$this->baseUrl}/bank");

        if ($response->successful()) {
            return [
                'success' => true,
                'data' => $response->json()['data'],
            ];
        }

        return [
            'success' => false,
            'message' => 'Failed to fetch banks',
        ];
    }

    /**
     * Get public key
     */
    public function getPublicKey(): string
    {
        return $this->publicKey;
    }
}
