import axios from 'axios';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { TimeSlot } from '../types';

interface UseBookingSlotsArgs {
    providerId: string;
    serviceIds: string[];
    selectedDate: Date;
    teamMemberId: string;
    rescheduleId: string | null;
}

interface UseBookingSlotsResult {
    availableSlots: TimeSlot[];
    categorizedSlots: {
        morning: TimeSlot[];
        afternoon: TimeSlot[];
        evening: TimeSlot[];
    };
    loading: boolean;
    apiMessage: string | null;
    refetch: () => void;
}

export function useBookingSlots({
    providerId,
    serviceIds,
    selectedDate,
    teamMemberId,
    rescheduleId,
}: UseBookingSlotsArgs): UseBookingSlotsResult {
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState<string | null>(null);

    const serializedServiceIds = serviceIds.join(',');
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const fetchSlots = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            setApiMessage(null);
            try {
                const response = await axios.get('/appointments/slots', {
                    signal,
                    params: {
                        provider_id: providerId,
                        service_ids: serviceIds,
                        date: formattedDate,
                        team_member_id: teamMemberId || undefined,
                        reschedule_id: rescheduleId,
                    },
                });
                setAvailableSlots(response.data.slots || []);
                setApiMessage(response.data.message || null);
            } catch (error: unknown) {
                if (axios.isCancel(error)) {
                    return;
                }
                console.error('Failed to fetch slots:', error);
                setAvailableSlots([]);
                const msg =
                    (error as { response?: { data?: { message?: string } } })
                        ?.response?.data?.message;
                setApiMessage(
                    msg ||
                        'We could not load available slots. Please check your connection and try again, or select a different date.',
                );
            } finally {
                setLoading(false);
            }
        },
        // serializedServiceIds is a stable string derived from serviceIds.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [providerId, serializedServiceIds, formattedDate, teamMemberId, rescheduleId],
    );

    useEffect(() => {
        if (!serviceIds.length) {
            setAvailableSlots([]);
            return;
        }
        const ctrl = new AbortController();
        fetchSlots(ctrl.signal);
        return () => ctrl.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providerId, serializedServiceIds, formattedDate, teamMemberId, rescheduleId]);

    const categorizedSlots = useMemo(() => {
        const categories = {
            morning: [] as TimeSlot[],
            afternoon: [] as TimeSlot[],
            evening: [] as TimeSlot[],
        };

        availableSlots.forEach((slot) => {
            const hour = parseInt(slot.start.split(':')[0]);
            if (hour < 12) categories.morning.push(slot);
            else if (hour < 17) categories.afternoon.push(slot);
            else categories.evening.push(slot);
        });

        return categories;
    }, [availableSlots]);

    return {
        availableSlots,
        categorizedSlots,
        loading,
        apiMessage,
        refetch: () => fetchSlots(),
    };
}
