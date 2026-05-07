import { useMemo } from 'react';

import type { RecurrencePattern, Service } from '../types';

interface UseBookingPricingArgs {
    services: Service[];
    selectedServiceIds: string[];
    recurrencePattern: RecurrencePattern | null;
    recurringDiscountPercent: number;
}

interface UseBookingPricingResult {
    selectedServices: Service[];
    originalPrice: number;
    discountPercent: number;
    discountAmount: number;
    totalPrice: number;
}

export function useBookingPricing({
    services,
    selectedServiceIds,
    recurrencePattern,
    recurringDiscountPercent,
}: UseBookingPricingArgs): UseBookingPricingResult {
    return useMemo(() => {
        const selectedServices = services.filter((s) =>
            selectedServiceIds.includes(s.id),
        );
        const originalPrice = selectedServices.reduce(
            (sum, s) => sum + Number(s.price),
            0,
        );
        const discountPercent = recurrencePattern ? recurringDiscountPercent : 0;
        const discountAmount = originalPrice * (discountPercent / 100);
        const totalPrice = originalPrice - discountAmount;

        return {
            selectedServices,
            originalPrice,
            discountPercent,
            discountAmount,
            totalPrice,
        };
    }, [services, selectedServiceIds, recurrencePattern, recurringDiscountPercent]);
}
