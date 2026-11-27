<?php

namespace App\Http\Controllers\Provider\Business;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Services\PromoCodeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PromoCodeController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $providerId = auth_user()->id;
        $request->merge(['code' => PromoCodeService::normalize((string) $request->input('code'))]);

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'min:3',
                'max:32',
                'regex:/^[A-Z0-9_-]+$/',
                Rule::unique('promo_codes', 'code')->where('provider_id', $providerId),
            ],
            'discount_type' => ['required', Rule::in([PromoCode::TYPE_PERCENT, PromoCode::TYPE_FIXED])],
            'discount_value' => [
                'required',
                'numeric',
                'gt:0',
                Rule::when($request->input('discount_type') === PromoCode::TYPE_PERCENT, ['max:100']),
            ],
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:today',
        ], [
            'code.regex' => 'Use letters, numbers, dashes or underscores only.',
            'code.unique' => 'You already have a promo code with this name.',
        ]);

        PromoCode::create([...$validated, 'provider_id' => $providerId]);

        return back()->with('success-toast', "Promo code {$validated['code']} is live.");
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate(['is_active' => 'required|boolean']);

        $promoCode = $this->ownedPromoCode($id);
        $promoCode->update($validated);

        return back()->with('success-toast', $promoCode->is_active ? "{$promoCode->code} is active again." : "{$promoCode->code} is paused.");
    }

    public function destroy(string $id): RedirectResponse
    {
        $promoCode = $this->ownedPromoCode($id);
        $promoCode->delete();

        return back()->with('success-toast', "{$promoCode->code} was deleted.");
    }

    private function ownedPromoCode(string $id): PromoCode
    {
        return PromoCode::where('provider_id', auth_user()->id)->findOrFail($id);
    }
}
