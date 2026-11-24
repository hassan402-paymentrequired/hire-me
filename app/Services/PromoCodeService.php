<?php

namespace App\Services;

use App\Models\PromoCode;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PromoCodeService
{
    public static function normalize(string $code): string
    {
        return Str::upper(trim($code));
    }

    /**
     * The usable promo code for this provider, or null when no code was given.
     *
     * @throws ValidationException
     */
    public function resolve(string $providerId, ?string $code): ?PromoCode
    {
        if (blank($code)) {
            return null;
        }

        $promoCode = PromoCode::query()
            ->where('provider_id', $providerId)
            ->where('code', self::normalize($code))
            ->first();

        $this->ensureUsable($promoCode);

        return $promoCode;
    }

    /**
     * Count one use of the code. Call inside the booking transaction.
     *
     * @throws ValidationException
     */
    public function redeem(PromoCode $promoCode): void
    {
        $locked = PromoCode::query()->lockForUpdate()->findOrFail($promoCode->id);

        $this->ensureUsable($locked);

        $locked->increment('times_used');
    }

    /**
     * @throws ValidationException
     */
    private function ensureUsable(?PromoCode $promoCode): void
    {
        $message = match (true) {
            ! $promoCode || ! $promoCode->is_active => 'That promo code isn’t valid for this provider.',
            $promoCode->isExpired() => 'That promo code has expired.',
            $promoCode->isUsedUp() => 'That promo code has already been fully used.',
            default => null,
        };

        if ($message) {
            throw ValidationException::withMessages(['promo_code' => $message]);
        }
    }
}
