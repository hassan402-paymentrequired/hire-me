<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaystackWebhookController extends Controller
{
    protected PaystackService $paystack;

    public function __construct(PaystackService $paystack)
    {
        $this->paystack = $paystack;
    }

    /**
     * Handle Paystack webhook
     */
    public function handleWebhook(Request $request)
    {
        // Verify webhook signature
        $signature = $request->header('X-Paystack-Signature');
        $payload = $request->getContent();
        
        if (!$this->verifySignature($signature, $payload)) {
            Log::warning('Invalid Paystack webhook signature');
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        $data = $request->input('data');

        try {
            switch ($event) {
                case 'charge.success':
                    $this->handleChargeSuccess($data);
                    break;
                case 'transfer.success':
                    $this->handleTransferSuccess($data);
                    break;
                case 'transfer.failed':
                    $this->handleTransferFailed($data);
                    break;
                default:
                    Log::info('Unhandled Paystack webhook event', ['event' => $event]);
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Paystack webhook error', [
                'event' => $event,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Handle successful charge (top-up)
     */
    protected function handleChargeSuccess(array $data)
    {
        $reference = $data['reference'];
        $metadata = $data['metadata'] ?? [];

        // Only process wallet top-ups
        if (($metadata['type'] ?? null) !== 'wallet_topup') {
            return;
        }

        $transaction = WalletTransaction::where('reference', $reference)
            ->where('type', 'deposit')
            ->where('status', 'pending')
            ->first();

        if (!$transaction) {
            Log::warning('Transaction not found for Paystack webhook', ['reference' => $reference]);
            return;
        }

        DB::beginTransaction();
        try {
            $wallet = $transaction->wallet;
            $amount = $data['amount'] / 100; // Convert from kobo

            $wallet->deposit(
                $amount,
                $reference,
                "Wallet top-up via Paystack",
                ['paystack_reference' => $reference, 'webhook' => true]
            );

            $transaction->update([
                'status' => 'completed',
                'balance_after' => $wallet->balance,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Handle successful transfer (withdrawal)
     */
    protected function handleTransferSuccess(array $data)
    {
        $reference = $data['reference'];
        
        $transaction = WalletTransaction::where('reference', $reference)
            ->where('type', 'withdrawal')
            ->where('status', 'pending')
            ->first();

        if (!$transaction) {
            Log::warning('Withdrawal transaction not found', ['reference' => $reference]);
            return;
        }

        $transaction->update([
            'status' => 'completed',
            'metadata' => array_merge($transaction->metadata ?? [], [
                'paystack_transfer_code' => $data['transfer_code'] ?? null,
                'completed_at' => now()->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Handle failed transfer (withdrawal)
     */
    protected function handleTransferFailed(array $data)
    {
        $reference = $data['reference'];
        
        $transaction = WalletTransaction::where('reference', $reference)
            ->where('type', 'withdrawal')
            ->where('status', 'pending')
            ->first();

        if (!$transaction) {
            return;
        }

        DB::beginTransaction();
        try {
            // Refund the amount back to wallet
            $wallet = $transaction->wallet;
            $wallet->balance += abs($transaction->amount);
            $wallet->save();

            $transaction->update([
                'status' => 'failed',
                'balance_after' => $wallet->balance,
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'failure_reason' => $data['gateway_response'] ?? 'Transfer failed',
                    'failed_at' => now()->toIso8601String(),
                ]),
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Handle Paystack callback (redirect after payment)
     */
    public function handleCallback(Request $request)
    {
        $reference = $request->query('reference');

        if (!$reference) {
            return redirect()->route('wallet.index')
                ->with('error-toast', 'Invalid payment reference');
        }

        // Verify transaction
        $verification = $this->paystack->verifyTransaction($reference);

        if ($verification['success'] && $verification['status'] === 'success') {
            return redirect()->route('wallet.index')
                ->with('success-toast', 'Payment successful! Your wallet has been topped up.');
        }

        return redirect()->route('wallet.index')
            ->with('error-toast', 'Payment verification failed. Please contact support if payment was deducted.');
    }

    /**
     * Verify webhook signature
     */
    protected function verifySignature(string $signature, string $payload): bool
    {
        $secretKey = config('services.paystack.secret_key');
        $expectedSignature = hash_hmac('sha512', $payload, $secretKey);

        return hash_equals($expectedSignature, $signature);
    }
}
