<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePayEngineWalletRequest;
use App\Models\Wallet;
use App\Services\PayEngineService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PayEngineWalletController extends Controller
{
    public function edit(): Response
    {
        abort_unless(config('services.payengine.provider') === 'payengine', 404);

        $wallet = Wallet::firstOrCreate(['user_id' => auth()->id()]);

        return Inertia::render('client/wallet/payengine-setup', [
            'wallet' => [
                'is_configured' => (bool) $wallet->payengine_wallet_id,
                'account_number' => $wallet->payengine_account_number,
                'status' => $wallet->payengine_status,
            ],
        ]);
    }

    public function store(
        StorePayEngineWalletRequest $request,
        PayEngineService $payEngine,
    ): RedirectResponse {
        abort_unless(config('services.payengine.provider') === 'payengine', 404);

        if (! $payEngine->credentialsConfigured()) {
            return back()->with('error-toast', 'PayEngine is not configured yet. Please contact support.');
        }

        $wallet = Wallet::firstOrCreate(['user_id' => $request->user()->id]);
        if ($wallet->payengine_wallet_id) {
            return redirect()->route('wallet.index')
                ->with('success-toast', 'Your PayEngine virtual account is already set up.');
        }

        $validated = $request->validated();
        $customerId = $wallet->payengine_customer_id;
        $providerWalletId = null;
        $accountNumber = null;

        if (! $customerId) {
            $customer = $payEngine->createCustomer(array_filter([
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'email' => $request->user()->email,
                'phone_number' => $validated['phone_number'],
                'gender' => $validated['gender'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'bvn' => $validated['bvn'],
                'nin' => $validated['nin'] ?? null,
            ], static fn (mixed $value): bool => $value !== null));

            if (! $customer['success']) {
                return back()->with('error-toast', $customer['message'] ?? 'Could not set up your PayEngine account.');
            }

            $data = $customer['data'];
            $customerId = $data['customer_id'] ?? null;
            $providerWalletId = $data['wallet_id'] ?? null;
            $accountNumber = $data['account_number'] ?? null;

            if ($customerId) {
                $wallet->forceFill(['payengine_customer_id' => $customerId])->save();
            }
        }

        if ($customerId && ! $providerWalletId && ! $accountNumber) {
            $providerWallet = $payEngine->createWallet([
                'customer_id' => $customerId,
                'account_name' => trim($validated['first_name'].' '.$validated['last_name']),
            ]);

            if ($providerWallet['success']) {
                $providerWalletId = $providerWallet['data']['wallet_id'] ?? null;
                $accountNumber = $providerWallet['data']['account_number'] ?? null;
            }
        }

        if (! $customerId || ! $providerWalletId || ! $accountNumber) {
            Log::error('PayEngine customer response did not contain wallet identifiers', [
                'customer_id_present' => (bool) $customerId,
                'wallet_id_present' => (bool) $providerWalletId,
                'account_number_present' => (bool) $accountNumber,
            ]);

            return back()->with(
                'error-toast',
                'PayEngine accepted the request but did not return all account details. Please contact support before trying again.',
            );
        }

        $wallet->forceFill([
            'payengine_customer_id' => $customerId,
            'payengine_wallet_id' => $providerWalletId,
            'payengine_account_number' => $accountNumber,
            'payengine_status' => 'active',
        ])->save();

        return redirect()->route('wallet.index')
            ->with('success-toast', 'Your PayEngine virtual account is ready.');
    }
}
