<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WalletController extends Controller
{
    protected PaystackService $paystack;

    public function __construct(PaystackService $paystack)
    {
        $this->paystack = $paystack;
    }

    public function index()
    {
        $user = auth()->user();
        $wallet = Wallet::firstOrCreate(['user_id' => $user->id]);

        $transactions = WalletTransaction::where('user_id', $user->id)
            ->with('appointment')
            ->latest()
            ->paginate(20);

        return Inertia::render('client/wallet/index', [
            'wallet' => [
                'balance' => $wallet->balance,
                'escrow_balance' => $wallet->escrow_balance,
                'available_balance' => $wallet->available_balance,
            ],
            'transactions' => $transactions->through(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'amount' => $transaction->amount,
                    'balance_before' => $transaction->balance_before,
                    'balance_after' => $transaction->balance_after,
                    'status' => $transaction->status,
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at->format('M d, Y g:i A'),
                    'appointment_id' => $transaction->appointment_id,
                    'reference' => $transaction->reference,
                ];
            }),
            'paystackPublicKey' => $this->paystack->getPublicKey(),
        ]);
    }

    public function initializeTopUp(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100|max:1000000',
        ]);

        $user = auth()->user();
        $wallet = Wallet::firstOrCreate(['user_id' => $user->id]);

        try {
            $reference = 'WLT_' . now()->timestamp . '_' . $user->id;

            // Create pending transaction
            $transaction = WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'user_id' => $user->id,
                'type' => 'deposit',
                'amount' => $request->amount,
                'balance_before' => $wallet->balance,
                'balance_after' => $wallet->balance,
                'status' => 'pending',
                'description' => "Wallet top-up",
                'reference' => $reference,
                'metadata' => [
                    'email' => $user->email,
                    'amount' => $request->amount,
                ],
            ]);

            // Initialize Paystack payment
            $paystackResponse = $this->paystack->initializeTransaction([
                'email' => $user->email,
                'amount' => $request->amount,
                'reference' => $reference,
                'callback_url' => route('paystack.callback'),
                'metadata' => [
                    'user_id' => $user->id,
                    'transaction_id' => $transaction->id,
                    'type' => 'wallet_topup',
                ],
            ]);

            if (!$paystackResponse['success']) {
                $transaction->update(['status' => 'failed']);
                return back()->with('error-toast', $paystackResponse['message'] ?? 'Failed to initialize payment');
            }

            return response()->json([
                'success' => true,
                'authorization_url' => $paystackResponse['data']['authorization_url'],
                'access_code' => $paystackResponse['data']['access_code'],
                'reference' => $reference,
            ]);
        } catch (\Exception $e) {
            return back()->with('error-toast', 'Failed to initialize payment: ' . $e->getMessage());
        }
    }

    public function verifyTopUp(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
        ]);

        try {
            $transaction = WalletTransaction::where('reference', $request->reference)
                ->where('type', 'deposit')
                ->where('status', 'pending')
                ->firstOrFail();

            // Verify with Paystack
            $verification = $this->paystack->verifyTransaction($request->reference);

            if ($verification['success'] && $verification['status'] === 'success') {
                DB::beginTransaction();

                $wallet = $transaction->wallet;
                $wallet->deposit(
                    $verification['amount'],
                    $request->reference,
                    "Wallet top-up via Paystack",
                    ['paystack_reference' => $request->reference]
                );

                $transaction->update([
                    'status' => 'completed',
                    'balance_after' => $wallet->balance,
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Payment verified successfully',
                ]);
            }

            $transaction->update(['status' => 'failed']);
            return response()->json([
                'success' => false,
                'message' => $verification['message'] ?? 'Payment verification failed',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify payment: ' . $e->getMessage(),
            ], 500);
        }
    }
}
