import { gooeyToast as toast } from 'goey-toast';
import { router } from '@inertiajs/react';
import type { FormDataConvertible } from '@inertiajs/core';
import { useState } from 'react';
import appointments from '@/routes/appointments';

import type { BookingPayload } from '../types';

interface UseBookingSubmitArgs {
    rescheduleId: string | null;
}

interface UseBookingSubmitResult {
    submit: (payload: BookingPayload) => void;
    submitting: boolean;
}

// Inertia's router signature constrains the payload to a string-indexed
// record of form-data convertibles. Our typed BookingPayload satisfies that
// at runtime, but TS does not infer the index signature from a closed
// interface, so we coerce it once here.
function toRequestPayload(
    payload: BookingPayload,
): Record<string, FormDataConvertible> {
    return payload as unknown as Record<string, FormDataConvertible>;
}

export function useBookingSubmit({
    rescheduleId,
}: UseBookingSubmitArgs): UseBookingSubmitResult {
    const [submitting, setSubmitting] = useState(false);

    const submit = (payload: BookingPayload) => {
        setSubmitting(true);
        const onError = (errors: Record<string, string>) => {
            const firstError = Object.values(errors)[0];
            toast.error(
                typeof firstError === 'string'
                    ? firstError
                    : 'Please check your selection and try again.',
            );
        };
        const onFinish = () => setSubmitting(false);
        const data = toRequestPayload(payload);

        if (rescheduleId) {
            router.put(`/appointments/${rescheduleId}`, data, {
                onError,
                onFinish,
            });
        } else {
            router.post(appointments.store().url, data, {
                onError,
                onFinish,
            });
        }
    };

    return {
        submit,
        submitting,
    };
}
