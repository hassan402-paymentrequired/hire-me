<?php

namespace App\Models;

use App\Support\ProviderSettings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Wallet extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id',
        'balance',
        'escrow_balance',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'escrow_balance' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * Get available balance (total balance minus escrow)
     */
    public function getAvailableBalanceAttribute(): float
    {
        return max(0, $this->balance - $this->escrow_balance);
    }

    /**
     * Check if user has sufficient balance
     */
    public function hasSufficientBalance(float $amount): bool
    {
        return $this->balance >= $amount;
    }

    /**
     * Hold amount in escrow
     */
    public function holdEscrow(float $amount, Appointment $appointment, string $description = null): WalletTransaction
    {
        if (!$this->hasSufficientBalance($amount)) {
            throw new \Exception('Insufficient balance');
        }

        $this->escrow_balance += $amount;
        $this->save();

        return WalletTransaction::create([
            'wallet_id' => $this->id,
            'user_id' => $this->user_id,
            'appointment_id' => $appointment->id,
            'type' => 'escrow_hold',
            'amount' => $amount,
            'balance_before' => $this->balance,
            'balance_after' => $this->balance,
            'status' => 'completed',
            'description' => $description ?? "Escrow hold for appointment #{$appointment->id}",
        ]);
    }

    /**
     * Release escrow to provider
     */
    public function releaseEscrow(float $amount, Appointment $appointment, string $description = null): WalletTransaction
    {
        if ($this->escrow_balance < $amount) {
            throw new \Exception('Insufficient escrow balance');
        }

        ['fee_percent' => $feePercent, 'fee_amount' => $platformFeeAmount, 'provider_payout_amount' => $providerPayoutAmount] =
            $this->resolveAppointmentPayoutBreakdown($amount, $appointment);

        $balanceBefore = $this->balance;
        $this->escrow_balance -= $amount;
        $this->balance -= $amount;
        $this->save();

        // Create transaction for client (deduction)
        WalletTransaction::create([
            'wallet_id' => $this->id,
            'user_id' => $this->user_id,
            'appointment_id' => $appointment->id,
            'type' => 'escrow_release',
            'amount' => -$amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'status' => 'completed',
            'description' => $description ?? "Payment released to provider for appointment #{$appointment->id}",
            'metadata' => [
                'gross_amount' => $amount,
                'platform_fee_percent' => $feePercent,
                'platform_fee_amount' => $platformFeeAmount,
                'provider_payout_amount' => $providerPayoutAmount,
            ],
        ]);

        // Credit provider's wallet
        $providerWallet = Wallet::firstOrCreate(['user_id' => $appointment->provider_id]);
        $providerBalanceBefore = $providerWallet->balance;
        $providerWallet->balance += $providerPayoutAmount;
        $providerWallet->save();

        $appointment->forceFill([
            'platform_fee_percent' => $feePercent,
            'platform_fee_amount' => $platformFeeAmount,
            'provider_payout_amount' => $providerPayoutAmount,
        ])->save();

        WalletTransaction::create([
            'wallet_id' => $providerWallet->id,
            'user_id' => $appointment->provider_id,
            'appointment_id' => $appointment->id,
            'type' => 'escrow_release',
            'amount' => $providerPayoutAmount,
            'balance_before' => $providerBalanceBefore,
            'balance_after' => $providerWallet->balance,
            'status' => 'completed',
            'description' => $description ?? "Payment received for appointment #{$appointment->id}",
            'metadata' => [
                'gross_amount' => $amount,
                'platform_fee_percent' => $feePercent,
                'platform_fee_amount' => $platformFeeAmount,
                'provider_payout_amount' => $providerPayoutAmount,
            ],
        ]);

        return $this->transactions()->latest()->first();
    }

    /**
     * Refund escrow back to client
     */
    public function refundEscrow(float $amount, Appointment $appointment, string $description = null): WalletTransaction
    {
        if ($this->escrow_balance < $amount) {
            throw new \Exception('Insufficient escrow balance');
        }

        $balanceBefore = $this->balance;
        $this->escrow_balance -= $amount;
        $this->balance += $amount;
        $this->save();

        return WalletTransaction::create([
            'wallet_id' => $this->id,
            'user_id' => $this->user_id,
            'appointment_id' => $appointment->id,
            'type' => 'escrow_refund',
            'amount' => $amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'status' => 'completed',
            'description' => $description ?? "Escrow refunded for cancelled appointment #{$appointment->id}",
        ]);
    }

    /**
     * Forfeit escrow (late cancellation/no-show penalty)
     */
    public function forfeitEscrow(float $amount, Appointment $appointment, string $description = null): WalletTransaction
    {
        if ($this->escrow_balance < $amount) {
            throw new \Exception('Insufficient escrow balance');
        }

        $balanceBefore = $this->balance;
        $this->escrow_balance -= $amount;
        $this->balance -= $amount;
        $this->save();

        // Create transaction for client (deduction)
        WalletTransaction::create([
            'wallet_id' => $this->id,
            'user_id' => $this->user_id,
            'appointment_id' => $appointment->id,
            'type' => 'escrow_forfeit',
            'amount' => -$amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'status' => 'completed',
            'description' => $description ?? "Cancellation penalty for appointment #{$appointment->id}",
        ]);

        // Credit provider's wallet (penalty payment)
        $providerWallet = Wallet::firstOrCreate(['user_id' => $appointment->provider_id]);
        $providerBalanceBefore = $providerWallet->balance;
        $providerWallet->balance += $amount;
        $providerWallet->save();

        WalletTransaction::create([
            'wallet_id' => $providerWallet->id,
            'user_id' => $appointment->provider_id,
            'appointment_id' => $appointment->id,
            'type' => 'escrow_forfeit',
            'amount' => $amount,
            'balance_before' => $providerBalanceBefore,
            'balance_after' => $providerWallet->balance,
            'status' => 'completed',
            'description' => $description ?? "Cancellation penalty received for appointment #{$appointment->id}",
        ]);

        return $this->transactions()->latest()->first();
    }

    /**
     * Add deposit to wallet
     */
    public function deposit(float $amount, string $reference = null, string $description = null, array $metadata = []): WalletTransaction
    {
        $this->balance += $amount;
        $this->save();

        return WalletTransaction::create([
            'wallet_id' => $this->id,
            'user_id' => $this->user_id,
            'type' => 'deposit',
            'amount' => $amount,
            'balance_before' => $this->balance - $amount,
            'balance_after' => $this->balance,
            'status' => 'completed',
            'description' => $description ?? "Wallet deposit",
            'reference' => $reference,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Hold payment - charge client but hold in escrow until both parties approve completion
     */
    public function holdPayment(float $amount, Appointment $appointment, string $description = null): WalletTransaction
    {
        if (!$this->hasSufficientBalance($amount)) {
            throw new \Exception('Insufficient balance');
        }

        $balanceBefore = $this->balance;
        $this->balance -= $amount;
        $this->escrow_balance += $amount; // Hold in escrow until dual approval
        $this->save();

        // Create transaction for client (deduction, held in escrow)
        return WalletTransaction::create([
            'wallet_id' => $this->id,
            'user_id' => $this->user_id,
            'appointment_id' => $appointment->id,
            'type' => 'payment_hold',
            'amount' => -$amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'status' => 'completed',
            'description' => $description ?? "Payment held for appointment #{$appointment->id} (pending dual approval)",
        ]);
    }

    /**
     * Release held payment to provider after dual approval
     */
    public function releaseHeldPayment(float $amount, Appointment $appointment, string $description = null): WalletTransaction
    {
        if ($this->escrow_balance < $amount) {
            throw new \Exception('Insufficient escrow balance');
        }

        ['fee_percent' => $feePercent, 'fee_amount' => $platformFeeAmount, 'provider_payout_amount' => $providerPayoutAmount] =
            $this->resolveAppointmentPayoutBreakdown($amount, $appointment);

        $this->escrow_balance -= $amount;
        $this->save();

        // Persist fee details for reporting (single source of truth for what was charged at the time).
        $appointment->forceFill([
            'platform_fee_percent' => $feePercent,
            'platform_fee_amount' => $platformFeeAmount,
            'provider_payout_amount' => $providerPayoutAmount,
        ])->save();

        // Create transaction for client (escrow release)
        WalletTransaction::create([
            'wallet_id' => $this->id,
            'user_id' => $this->user_id,
            'appointment_id' => $appointment->id,
            'type' => 'payment_release',
            'amount' => -$amount,
            'balance_before' => $this->balance + $amount,
            'balance_after' => $this->balance,
            'status' => 'completed',
            'description' => $description ?? "Payment released to provider for appointment #{$appointment->id}",
            'metadata' => [
                'gross_amount' => $amount,
                'platform_fee_percent' => $feePercent,
                'platform_fee_amount' => $platformFeeAmount,
                'provider_payout_amount' => $providerPayoutAmount,
            ],
        ]);

        // Credit provider's wallet
        $providerWallet = Wallet::firstOrCreate(['user_id' => $appointment->provider_id]);
        $providerBalanceBefore = $providerWallet->balance;
        $providerWallet->balance += $providerPayoutAmount;
        $providerWallet->save();

        WalletTransaction::create([
            'wallet_id' => $providerWallet->id,
            'user_id' => $appointment->provider_id,
            'appointment_id' => $appointment->id,
            'type' => 'payment_release',
            'amount' => $providerPayoutAmount,
            'balance_before' => $providerBalanceBefore,
            'balance_after' => $providerWallet->balance,
            'status' => 'completed',
            'description' => $description ?? "Payment received for appointment #{$appointment->id} (dual approval completed)",
            'metadata' => [
                'gross_amount' => $amount,
                'platform_fee_percent' => $feePercent,
                'platform_fee_amount' => $platformFeeAmount,
                'provider_payout_amount' => $providerPayoutAmount,
            ],
        ]);

        return $this->transactions()->latest()->first();
    }

    protected function resolveAppointmentPayoutBreakdown(float $amount, Appointment $appointment): array
    {
        $providerSettings = ProviderSettings::resolve(
            $appointment->provider?->businessProfile?->settings ?? []
        );
        $billingModel = $providerSettings['billing_model'] ?? 'commission';
        $feePercent = $billingModel === 'subscription'
            && \App\Support\Subscriptions\SubscriptionFeature::providerHasActiveSubscription($appointment->provider)
            ? 0.0
            : (float) config('fees.booking_fee_percent', 10);
        $platformFeeAmount = round(($amount * $feePercent) / 100, 2);
        $providerPayoutAmount = max(0, round($amount - $platformFeeAmount, 2));

        return [
            'fee_percent' => $feePercent,
            'fee_amount' => $platformFeeAmount,
            'provider_payout_amount' => $providerPayoutAmount,
        ];
    }

    /**
     * Refund upfront payment to client (for cancellations)
     * This method should be called on the client's wallet
     */
    public function refundUpfrontPayment(float $amount, Appointment $appointment, string $description = null): WalletTransaction
    {
        // Deduct from provider's wallet (they already received the payment)
        $providerWallet = Wallet::firstOrCreate(['user_id' => $appointment->provider_id]);
        if ($providerWallet->balance < $amount) {
            throw new \Exception('Provider wallet has insufficient balance for refund');
        }

        $providerBalanceBefore = $providerWallet->balance;
        $providerWallet->balance -= $amount;
        $providerWallet->save();

        WalletTransaction::create([
            'wallet_id' => $providerWallet->id,
            'user_id' => $appointment->provider_id,
            'appointment_id' => $appointment->id,
            'type' => 'refund',
            'amount' => -$amount,
            'balance_before' => $providerBalanceBefore,
            'balance_after' => $providerWallet->balance,
            'status' => 'completed',
            'description' => $description ?? "Refund for cancelled appointment #{$appointment->id}",
        ]);

        // Credit client's wallet (this wallet)
        $clientBalanceBefore = $this->balance;
        $this->balance += $amount;
        $this->save();

        return WalletTransaction::create([
            'wallet_id' => $this->id,
            'user_id' => $this->user_id,
            'appointment_id' => $appointment->id,
            'type' => 'refund',
            'amount' => $amount,
            'balance_before' => $clientBalanceBefore,
            'balance_after' => $this->balance,
            'status' => 'completed',
            'description' => $description ?? "Refund for cancelled appointment #{$appointment->id}",
        ]);
    }

    /**
     * Process partial refund (for late cancellation penalties)
     * This method should be called on the client's wallet
     */
    public function processCancellationPenalty(float $totalAmount, float $penaltyPercent, Appointment $appointment, string $description = null): array
    {
        $penaltyAmount = ($totalAmount * $penaltyPercent) / 100;
        $refundAmount = $totalAmount - $penaltyAmount;

        // Provider keeps the penalty amount (already in their wallet)
        // Refund remaining amount to client
        if ($refundAmount > 0) {
            $providerWallet = Wallet::firstOrCreate(['user_id' => $appointment->provider_id]);
            if ($providerWallet->balance < $refundAmount) {
                throw new \Exception('Provider wallet has insufficient balance for refund');
            }

            $providerBalanceBefore = $providerWallet->balance;
            $providerWallet->balance -= $refundAmount;
            $providerWallet->save();

            WalletTransaction::create([
                'wallet_id' => $providerWallet->id,
                'user_id' => $appointment->provider_id,
                'appointment_id' => $appointment->id,
                'type' => 'refund',
                'amount' => -$refundAmount,
                'balance_before' => $providerBalanceBefore,
                'balance_after' => $providerWallet->balance,
                'status' => 'completed',
                'description' => $description ?? "Partial refund for late cancellation of appointment #{$appointment->id}",
            ]);

            // Credit client's wallet (this wallet)
            $clientBalanceBefore = $this->balance;
            $this->balance += $refundAmount;
            $this->save();

            WalletTransaction::create([
                'wallet_id' => $this->id,
                'user_id' => $this->user_id,
                'appointment_id' => $appointment->id,
                'type' => 'refund',
                'amount' => $refundAmount,
                'balance_before' => $clientBalanceBefore,
                'balance_after' => $this->balance,
                'status' => 'completed',
                'description' => $description ?? "Partial refund for late cancellation of appointment #{$appointment->id}",
            ]);
        }

        return [
            'penalty_amount' => $penaltyAmount,
            'refund_amount' => $refundAmount,
        ];
    }
}
