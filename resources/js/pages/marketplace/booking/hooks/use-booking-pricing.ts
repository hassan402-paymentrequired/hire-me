import { useMemo } from 'react';

import type { AppliedPromo, RecurrencePattern, Service } from '../types';

interface UseBookingPricingArgs {
    services: Service[];
    selectedServiceIds: string[];
    recurrencePattern: RecurrencePattern | null;
    recurringDiscountPercent: number;
    homeServiceFee: number;
    promo: AppliedPromo | null;
}

interface UseBookingPricingResult {
    selectedServices: Service[];
    originalPrice: number;
    /** Percent saved on repeat visits (not on this checkout). */
    discountPercent: number;
    /** Always zero at checkout — recurring discount applies from visit 2 onward. */
    discountAmount: number;
    promoDiscount: number;
    homeServiceFee: number;
    totalPrice: number;
}

/** Mirrors BookingQuoteService: subtotal, promo, home fee; recurring % is for later visits only. */
export function useBookingPricing({
    services,
    selectedServiceIds,
    recurrencePattern,
    recurringDiscountPercent,
    homeServiceFee,
    promo,
}: UseBookingPricingArgs): UseBookingPricingResult {
    return useMemo(() => {
        const selectedServices = selectedServiceIds
            .map((id) => services.find((service) => service.id === id))
            .filter((service): service is Service => Boolean(service));
        const originalPrice = selectedServices.reduce((sum, service) => sum + Number(service.price), 0);
        const discountPercent = recurrencePattern ? recurringDiscountPercent : 0;
        const discountAmount = 0;
        const promoDiscount = promo
            ? roundNaira(Math.min(originalPrice, promo.discountType === 'percent' ? originalPrice * (promo.discountValue / 100) : promo.discountValue))
            : 0;

        return {
            selectedServices,
            originalPrice,
            discountPercent,
            discountAmount,
            promoDiscount,
            homeServiceFee,
            totalPrice: roundNaira(originalPrice - promoDiscount + homeServiceFee),
        };
    }, [services, selectedServiceIds, recurrencePattern, recurringDiscountPercent, homeServiceFee, promo]);
}

const roundNaira = (amount: number) => Math.round(amount * 100) / 100;
