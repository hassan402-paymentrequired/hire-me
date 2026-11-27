<?php

use App\Models\BusinessProfile;
use App\Models\PromoCode;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function promoCodeProvider(): User
{
    $provider = User::factory()->create(['role' => 'provider', 'is_verified' => true]);
    BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'slug' => 'promo-'.$provider->id,
        'has_onboarded' => true,
        'has_setup_business_policy' => true,
    ]);

    return $provider;
}

it('when a provider creates a promo code then it is saved in upper case and listed on advanced settings', function () {
    $provider = promoCodeProvider();

    $this->actingAs($provider)
        ->post(route('business.promo-codes.store'), [
            'code' => ' glow-10 ',
            'discount_type' => 'percent',
            'discount_value' => 10,
            'max_uses' => 50,
            'expires_at' => now()->addMonth()->toDateString(),
        ])
        ->assertSessionHasNoErrors()
        ->assertSessionHas('success-toast', 'Promo code GLOW-10 is live.');

    expect(PromoCode::sole())
        ->provider_id->toBe($provider->id)
        ->code->toBe('GLOW-10')
        ->max_uses->toBe(50);

    $this->actingAs($provider)
        ->get(route('business.settings.advanced'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('promoCodes', 1)
            ->where('promoCodes.0.code', 'GLOW-10')
            ->where('promoCodes.0.isActive', true));
});

it('when a promo code is invalid then it is rejected', function (array $input, string $field) {
    $provider = promoCodeProvider();
    PromoCode::factory()->create(['provider_id' => $provider->id, 'code' => 'TAKEN']);

    $this->actingAs($provider)
        ->post(route('business.promo-codes.store'), [
            'code' => 'NEWCODE',
            'discount_type' => 'percent',
            'discount_value' => 10,
            ...$input,
        ])
        ->assertSessionHasErrors($field);

    expect(PromoCode::count())->toBe(1);
})->with([
    'duplicate code' => [['code' => 'taken'], 'code'],
    'spaces in code' => [['code' => 'TWO WORDS'], 'code'],
    'too short' => [['code' => 'AB'], 'code'],
    'percent over 100' => [['discount_value' => 120], 'discount_value'],
    'zero discount' => [['discount_value' => 0], 'discount_value'],
    'unknown type' => [['discount_type' => 'bogof'], 'discount_type'],
    'already expired' => [['expires_at' => now()->subDay()->toDateString()], 'expires_at'],
]);

it('when another provider already uses a code then this provider can still create it', function () {
    PromoCode::factory()->create(['code' => 'WELCOME']);

    $this->actingAs(promoCodeProvider())
        ->post(route('business.promo-codes.store'), ['code' => 'WELCOME', 'discount_type' => 'fixed', 'discount_value' => 2000])
        ->assertSessionHasNoErrors();

    expect(PromoCode::where('code', 'WELCOME')->count())->toBe(2);
});

it('when a provider pauses and deletes their code then it changes, but other providers codes are off limits', function () {
    $provider = promoCodeProvider();
    $own = PromoCode::factory()->create(['provider_id' => $provider->id, 'code' => 'MINE']);
    $someoneElses = PromoCode::factory()->create(['code' => 'THEIRS']);

    $this->actingAs($provider)->patch(route('business.promo-codes.update', $own->id), ['is_active' => false])
        ->assertSessionHas('success-toast', 'MINE is paused.');
    expect($own->fresh()->is_active)->toBeFalse();

    $this->actingAs($provider)->patch(route('business.promo-codes.update', $someoneElses->id), ['is_active' => false])->assertNotFound();
    $this->actingAs($provider)->delete(route('business.promo-codes.destroy', $someoneElses->id))->assertNotFound();

    $this->actingAs($provider)->delete(route('business.promo-codes.destroy', $own->id))->assertSessionHas('success-toast');
    expect(PromoCode::pluck('code')->all())->toBe(['THEIRS']);
});

it('when a provider saves a home service fee on advanced settings then it is stored, and clearing it removes the fee', function () {
    $provider = promoCodeProvider();

    $this->actingAs($provider)
        ->post(route('business.settings.advanced.update'), ['settings' => ['service_delivery_mode' => 'both', 'home_service_fee' => '4500']])
        ->assertSessionHasNoErrors();

    expect($provider->businessProfile->fresh()->settings['home_service_fee'])->toEqual(4500);

    $this->actingAs($provider)
        ->post(route('business.settings.advanced.update'), ['settings' => ['home_service_fee' => null]])
        ->assertSessionHasNoErrors();

    expect($provider->businessProfile->fresh()->settings['home_service_fee'])->toBeNull();
});
