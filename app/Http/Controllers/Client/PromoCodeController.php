<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Services\PromoCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function __construct(private PromoCodeService $promoCodes) {}

    /**
     * Check a code before booking. The discount itself is recalculated when the booking is placed.
     */
    public function check(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:users,id',
            'code' => 'required|string|max:32',
        ]);

        $promoCode = $this->promoCodes->resolve($validated['provider_id'], $validated['code']);

        return response()->json([
            'code' => $promoCode->code,
            'discountType' => $promoCode->discount_type,
            'discountValue' => (float) $promoCode->discount_value,
        ]);
    }
}
