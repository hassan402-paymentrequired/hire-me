<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WithdrawalController extends Controller
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

        $withdrawals = WalletTransaction::where('user_id', $user->id)
            ->where('type', 'withdrawal')
            ->latest()
            ->paginate(20);

        // Get banks list
        $banksResponse = $this->paystack->getBanks();
        $banks = $banksResponse['success'] ? $banksResponse['data'] : [];

        return Inertia::render('provider/wallet/withdraw', [
            'wallet' => [
                'balance' => $wallet->balance,
                'escrow_balance' => $wallet->escrow_balance,
                'available_balance' => $wallet->available_balance, // Available for withdrawal (balance - escrow)
            ],
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
        ]);
    }

    public function createRecipient(Request $request)
    {
        $request->validate([
            'account_number' => 'required|string|size:10',
            'bank_code' => 'required|string',
            'account_name' => 'required|string|max:255',
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

            // Store recipient code in user metadata or create a separate table
            // For now, we'll store it in the user's metadata or create a bank_accounts table
            // This is a simplified version - you might want to create a BankAccount model

            return back()->with('success-toast', 'Bank account added successfully')
                ->with('recipient_code', $response['data']['recipient_code']);
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

        // Check if user has sufficient balance
        if ($wallet->balance < $request->amount) {
            return back()->with('error-toast', 'Insufficient balance');
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
