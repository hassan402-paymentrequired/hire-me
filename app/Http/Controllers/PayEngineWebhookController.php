<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PayEngineWebhookController extends Controller
{
    public function handle(Request $request, string $token): JsonResponse
    {
        $webhookToken = config('services.payengine.webhook_token');
        abort_unless(is_string($webhookToken) && $webhookToken !== '' && hash_equals($webhookToken, $token), 404);

        $payload = $request->validate([
            'event' => ['required', 'string'],
            'data' => ['required', 'array'],
            'data.amount' => ['required', 'numeric'],
            'data.account_number' => ['required', 'string'],
            'data.transaction_reference' => ['required', 'string'],
        ]);

        if ($payload['event'] !== 'events.credit.transaction') {
            return response()->json([
                'response_code' => '00',
                'status' => 'ignored',
                'message' => 'Event ignored',
            ]);
        }

        $data = $payload['data'];
        $reference = (string) $data['transaction_reference'];

        if (WalletTransaction::where('reference', $reference)->exists()) {
            return response()->json([
                'response_code' => '00',
                'status' => 'duplicate',
                'message' => 'Webhook event already processed',
            ]);
        }

        $wallet = Wallet::where('payengine_account_number', (string) $data['account_number'])->first();
        if (! $wallet) {
            Log::warning('PayEngine webhook has no matching virtual wallet', [
                'account_number' => $data['account_number'],
                'reference' => $reference,
            ]);

            return response()->json([
                'response_code' => '4415',
                'status' => 'failed',
                'message' => 'Recipient wallet not found',
            ], 400);
        }

        DB::transaction(function () use ($wallet, $data, $reference) {
            $amount = (float) $data['amount'];
            $balanceBefore = (float) $wallet->balance;

            $wallet->balance = $balanceBefore + $amount;
            $wallet->save();

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'user_id' => $wallet->user_id,
                'type' => WalletTransaction::TYPE_DEPOSIT,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->balance,
                'status' => WalletTransaction::STATUS_COMPLETED,
                'description' => 'Wallet top-up via PayEngine virtual account',
                'reference' => $reference,
                'metadata' => [
                    'provider' => 'payengine',
                    'session_id' => $data['session_id'] ?? null,
                    'sender_account_number' => $data['sender_account_number'] ?? null,
                    'sender_account_name' => $data['sender_account_name'] ?? null,
                    'sender_bank' => $data['sender_bank'] ?? null,
                ],
            ]);
        });

        return response()->json([
            'response_code' => '00',
            'status' => 'received',
            'message' => 'Webhook received and queued',
        ]);
    }
}
