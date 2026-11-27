<?php

namespace App\Services;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Cache;

/**
 * Card and bank transfer bookings are paid into the client's wallet first,
 * then held from it like any wallet booking.
 */
class BookingCheckoutService
{
    public const METADATA_TYPE = 'booking_checkout';

    /**
     * Credit a verified checkout payment once, no matter how many times Paystack or the browser reports it.
     */
    public function creditWallet(string $userId, string $reference, float $amount): void
    {
        Cache::lock('booking-checkout-credit:'.$reference, 10)->block(5, function () use ($userId, $reference, $amount): void {
            if (WalletTransaction::where('reference', $reference)->where('type', 'deposit')->exists()) {
                return;
            }

            Wallet::firstOrCreate(['user_id' => $userId])->deposit(
                $amount,
                $reference,
                'Card payment for booking',
                ['paystack_reference' => $reference, 'source' => self::METADATA_TYPE],
            );
        });
    }

    public function isCredited(string $reference): bool
    {
        return WalletTransaction::where('reference', $reference)->where('type', 'deposit')->exists();
    }
}
