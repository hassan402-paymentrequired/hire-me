<?php

namespace App\Services;

use App\Models\PromoCode;
use App\Models\Service;
use Illuminate\Support\Collection;

/**
 * Prices a booking. Order: services subtotal, promo (first visit only), then home fee.
 * The recurring discount is stored on the series for follow-up visits only — not on this checkout total.
 */
class BookingQuoteService
{
    /**
     * @param  Collection<int, Service>  $services
     * @param  array<string, mixed>  $settings
     * @return array{subtotal: float, recurring_discount_percent: float, recurring_discount: float, promo_discount: float, home_service_fee: float, total: float}
     */
    public function quote(
        Collection $services,
        array $settings,
        bool $isRecurring,
        bool $atClientLocation,
        ?PromoCode $promoCode = null,
    ): array {
        $subtotal = round((float) $services->sum('price'), 2);
        $recurringDiscountPercent = $isRecurring ? (float) config('booking.recurring_discount_percent', 10) : 0.0;
        $recurringDiscount = 0.0;
        $promoDiscount = $promoCode?->discountFor($subtotal) ?? 0.0;
        $homeServiceFee = $atClientLocation ? self::homeServiceFee($settings) : 0.0;

        return [
            'subtotal' => $subtotal,
            'recurring_discount_percent' => $recurringDiscountPercent,
            'recurring_discount' => $recurringDiscount,
            'promo_discount' => $promoDiscount,
            'home_service_fee' => $homeServiceFee,
            'total' => round($subtotal - $promoDiscount + $homeServiceFee, 2),
        ];
    }

    /**
     * @param  array<string, mixed>  $settings
     */
    public static function homeServiceFee(array $settings): float
    {
        return max(0.0, (float) ($settings['home_service_fee'] ?? 0));
    }
}
