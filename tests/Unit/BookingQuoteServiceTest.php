<?php

use App\Models\Service;
use App\Services\BookingQuoteService;

uses(Tests\TestCase::class);

beforeEach(function () {
    config(['booking.recurring_discount_percent' => 10]);
});

it('when the visit is recurring then the first checkout is full price but the series discount percent is recorded', function () {
    $service = Service::factory()->make(['price' => 25000]);

    $quote = (new BookingQuoteService)->quote(
        collect([$service]),
        ['home_service_fee' => 5000],
        isRecurring: true,
        atClientLocation: false,
    );

    expect($quote['subtotal'])->toBe(25000.0)
        ->and($quote['recurring_discount_percent'])->toBe(10.0)
        ->and($quote['recurring_discount'])->toBe(0.0)
        ->and($quote['total'])->toBe(25000.0);
});

it('when the visit is recurring and at the client location then home fee is added without a recurring discount on visit one', function () {
    $service = Service::factory()->make(['price' => 25000]);

    $quote = (new BookingQuoteService)->quote(
        collect([$service]),
        ['home_service_fee' => 5000],
        isRecurring: true,
        atClientLocation: true,
    );

    expect($quote['home_service_fee'])->toBe(5000.0)
        ->and($quote['recurring_discount'])->toBe(0.0)
        ->and($quote['total'])->toBe(30000.0);
});

it('when the visit is not recurring then there is no recurring discount percent', function () {
    $service = Service::factory()->make(['price' => 12000]);

    $quote = (new BookingQuoteService)->quote(
        collect([$service]),
        [],
        isRecurring: false,
        atClientLocation: false,
    );

    expect($quote['recurring_discount_percent'])->toBe(0.0)
        ->and($quote['recurring_discount'])->toBe(0.0)
        ->and($quote['total'])->toBe(12000.0);
});
