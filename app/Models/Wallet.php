<?php

namespace App\Models;

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
        return $this->available_balance >= $amount;
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
        ]);

        // Credit provider's wallet
        $providerWallet = Wallet::firstOrCreate(['user_id' => $appointment->provider_id]);
        $providerBalanceBefore = $providerWallet->balance;
        $providerWallet->balance += $amount;
        $providerWallet->save();

        WalletTransaction::create([
            'wallet_id' => $providerWallet->id,
            'user_id' => $appointment->provider_id,
            'appointment_id' => $appointment->id,
            'type' => 'escrow_release',
            'amount' => $amount,
            'balance_before' => $providerBalanceBefore,
            'balance_after' => $providerWallet->balance,
            'status' => 'completed',
            'description' => $description ?? "Payment received for appointment #{$appointment->id}",
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

        $this->escrow_balance -= $amount;
        $this->save();

        return WalletTransaction::create([
            'wallet_id' => $this->id,
            'user_id' => $this->user_id,
            'appointment_id' => $appointment->id,
            'type' => 'escrow_refund',
            'amount' => $amount,
            'balance_before' => $this->balance,
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
     * Process upfront payment - transfer from client to provider immediately
     */
    public function payUpfront(float $amount, Appointment $appointment, string $description = null): WalletTransaction
    {
        if (!$this->hasSufficientBalance($amount)) {
            throw new \Exception('Insufficient balance');
        }

        $balanceBefore = $this->balance;
        $this->balance -= $amount;
        $this->save();

        // Create transaction for client (deduction)
        WalletTransaction::create([
            'wallet_id' => $this->id,
            'user_id' => $this->user_id,
            'appointment_id' => $appointment->id,
            'type' => 'payment',
            'amount' => -$amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
            'status' => 'completed',
            'description' => $description ?? "Upfront payment for appointment #{$appointment->id}",
        ]);

        // Credit provider's wallet immediately
        $providerWallet = Wallet::firstOrCreate(['user_id' => $appointment->provider_id]);
        $providerBalanceBefore = $providerWallet->balance;
        $providerWallet->balance += $amount;
        $providerWallet->save();

        WalletTransaction::create([
            'wallet_id' => $providerWallet->id,
            'user_id' => $appointment->provider_id,
            'appointment_id' => $appointment->id,
            'type' => 'payment',
            'amount' => $amount,
            'balance_before' => $providerBalanceBefore,
            'balance_after' => $providerWallet->balance,
            'status' => 'completed',
            'description' => $description ?? "Payment received for appointment #{$appointment->id}",
        ]);

        return $this->transactions()->latest()->first();
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
