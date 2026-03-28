<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\ProviderBankAccount;
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

        // Pending earnings = money held by clients for this provider's active appointments
        $pendingEarnings = (float) Appointment::where('provider_id', $user->id)
            ->whereIn('status', ['pending', 'confirmed', 'pending_completion'])
            ->where('escrow_status', 'held')
            ->sum('escrow_amount');

        $bankAccount = ProviderBankAccount::where('user_id', $user->id)->first();

        $withdrawals = WalletTransaction::where('user_id', $user->id)
            ->where('type', 'withdrawal')
            ->latest()
            ->paginate(20);

        // Get banks list
        $banksResponse = $this->paystack->getBanks();
        $banks = $banksResponse['success'] ? $banksResponse['data'] : [];

        return Inertia::render('provider/wallet/withdraw', [
            'wallet' => [
                'balance' => (float) $wallet->balance,
                'escrow_balance' => (float) $wallet->escrow_balance,
                'available_balance' => (float) $wallet->available_balance,
                'pending_earnings' => $pendingEarnings,
            ],
            'bankAccount' => $bankAccount ? [
                'recipient_code' => $bankAccount->recipient_code,
                'bank_name' => $bankAccount->bank_name,
                'account_name' => $bankAccount->account_name,
                'account_number_masked' => strlen($bankAccount->account_number) >= 4 ? '****' . substr($bankAccount->account_number, -4) : null,
            ] : null,
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

            ProviderBankAccount::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'recipient_code' => $recipientCode,
                    'bank_code' => $request->bank_code,
                    'bank_name' => $request->bank_name,
                    'account_number' => $request->account_number,
                    'account_name' => $request->account_name,
                ]
            );

            return redirect()->route('wallet.withdraw.index')
                ->with('success-toast', 'Bank account saved successfully');
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

        $user = auth_user();
        $wallet = Wallet::firstOrCreate(['user_id' => $user->id]);

        // Check if user has sufficient balance
        if ($wallet->available_balance < $request->amount) {
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

            $paystackStatus = strtolower((string) ($transferResponse['data']['status'] ?? ''));

            if ($paystackStatus === 'otp') {
                $wallet->balance += $request->amount;
                $wallet->save();

                $transaction->update([
                    'status' => 'failed',
                    'balance_after' => $wallet->balance,
                    'metadata' => array_merge($transaction->metadata ?? [], [
                        'paystack_transfer_code' => $transferResponse['data']['transfer_code'] ?? null,
                        'failure_reason' => 'Transfer requires Paystack OTP confirmation',
                        'failed_at' => now()->toIso8601String(),
                    ]),
                ]);

                DB::commit();

                return back()->with(
                    'error-toast',
                    'This transfer requires a Paystack OTP/PIN. Disable transfer OTP in your Paystack dashboard for automated withdrawals, then try again.'
                );
            }

            // Update transaction with transfer code
            $transaction->update([
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'paystack_transfer_code' => $transferResponse['data']['transfer_code'] ?? null,
                    'paystack_status' => $paystackStatus ?: 'pending',
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
