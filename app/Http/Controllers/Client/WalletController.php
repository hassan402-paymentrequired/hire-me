<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ClientBankAccount;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

        // Get withdrawals history
        $withdrawals = WalletTransaction::where('user_id', $user->id)
            ->where('type', 'withdrawal')
            ->latest()
            ->paginate(10);

        // Get banks list for withdrawal
        $banksResponse = $this->paystack->getBanks();
        $banks = $banksResponse['success'] ? $banksResponse['data'] : [];

        // Get user's saved bank account (one per user)
        $bankAccount = $user->clientBankAccount;

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
            'withdrawals' => $withdrawals->through(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'amount' => abs($transaction->amount),
                    'status' => $transaction->status,
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at->format('M d, Y g:i A'),
                    'reference' => $transaction->reference,
                    'metadata' => $transaction->metadata,
                ];
            }),
            'banks' => $banks,
            'bankAccount' => $bankAccount ? [
                'recipient_code' => $bankAccount->recipient_code,
                'bank_name' => $bankAccount->bank_name,
                'account_name' => $bankAccount->account_name,
                'account_number_masked' => substr($bankAccount->account_number, -4),
            ] : null,
            'paystackPublicKey' => $this->paystack->getPublicKey(),
        ]);
    }

    public function initializeTopUp(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100|max:1000000',
        ]);
        Log::info('Initializing wallet top-up', ['user_id' => auth()->id(), 'amount' => $request->amount]);

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
                'amount' => (int) round($request->amount * 100),
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


            return Inertia::location($paystackResponse['data']['authorization_url']);

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

    public function createRecipient(Request $request)
    {
        $request->validate([
            'account_number' => 'required|string|size:10',
            'bank_code' => 'required|string',
            'account_name' => 'required|string|max:255',
            'bank_name' => 'required|string|max:255',
        ]);

        $user = auth()->user();

        try {
            $response = $this->paystack->createTransferRecipient([
                'type' => 'nuban',
                'name' => $request->account_name,
                'account_number' => $request->account_number,
                'bank_code' => $request->bank_code,
                'currency' => 'NGN',
            ]);

            if (!$response['success']) {
                return back()->with('error-toast', $response['message'] ?? 'Failed to create recipient');
            }

            $recipientCode = $response['data']['recipient_code'];

            // Create or update - one bank per user
            ClientBankAccount::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'recipient_code' => $recipientCode,
                    'bank_code' => $request->bank_code,
                    'bank_name' => $request->bank_name,
                    'account_number' => $request->account_number,
                    'account_name' => $request->account_name,
                ]
            );

            return redirect()->route('wallet.index')->with('success-toast', 'Bank account saved successfully');
        } catch (\Exception $e) {
            return back()->with('error-toast', 'Failed to add bank account: ' . $e->getMessage());
        }
    }

    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100|max:10000000',
            'recipient_code' => 'required|string',
            'account_name' => 'required|string',
            'bank_name' => 'required|string',
        ]);

        $user = auth()->user();
        $wallet = Wallet::firstOrCreate(['user_id' => $user->id]);

        // Check if user has sufficient available balance (balance - escrow)
        if ($wallet->available_balance < $request->amount) {
            return back()->with('error-toast', 'Insufficient available balance. You have funds held in escrow for active appointments.');
        }

        try {
            DB::beginTransaction();

            // Deduct from wallet
            $balanceBefore = $wallet->balance;
            $wallet->balance -= $request->amount;
            $wallet->save();

            // Create withdrawal transaction
            $reference = 'WDR_' . now()->timestamp . '_' . $user->id;
            $transaction = WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'user_id' => $user->id,
                'type' => 'withdrawal',
                'amount' => -$request->amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $wallet->balance,
                'status' => 'pending',
                'description' => "Withdrawal to {$request->bank_name} - {$request->account_name}",
                'reference' => $reference,
                'metadata' => [
                    'recipient_code' => $request->recipient_code,
                    'account_name' => $request->account_name,
                    'bank_name' => $request->bank_name,
                ],
            ]);

            // Initiate Paystack transfer
            $transferResponse = $this->paystack->initiateTransfer([
                'amount' => $request->amount,
                'recipient_code' => $request->recipient_code,
                'reason' => "Withdrawal to {$request->bank_name}",
                'reference' => $reference,
            ]);

            if (!$transferResponse['success']) {
                // Refund the amount
                $wallet->balance += $request->amount;
                $wallet->save();
                $transaction->update(['status' => 'failed']);

                DB::commit();
                return back()->with('error-toast', $transferResponse['message'] ?? 'Failed to initiate withdrawal');
            }

            // Update transaction with transfer code
            $transaction->update([
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'paystack_transfer_code' => $transferResponse['data']['transfer_code'] ?? null,
                ]),
            ]);

            DB::commit();

            return back()->with('success-toast', 'Withdrawal initiated successfully. It will be processed shortly.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error-toast', 'Failed to process withdrawal: ' . $e->getMessage());
        }
    }
}
