import axios from 'axios';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import slots from '@/routes/slots';

import type { DayAvailability, NextAvailability, ServiceTeamMembers } from '../types';
import { teamMembersForServices } from './use-booking-slots';

interface UseWeekAvailabilityArgs {
    providerId: string;
    serviceIds: string[];
    serviceTeamMembers: ServiceTeamMembers;
    weekStart: Date;
    rescheduleId: string | null;
}

/** Slot counts per day for the visible week, keyed by yyyy-MM-dd. */
export function useWeekAvailability({
    providerId,
    serviceIds,
    serviceTeamMembers,
    weekStart,
    rescheduleId,
}: UseWeekAvailabilityArgs): Record<string, DayAvailability> {
    const [days, setDays] = useState<Record<string, DayAvailability>>({});
    const start = format(weekStart, 'yyyy-MM-dd');
    const pros = teamMembersForServices(serviceIds, serviceTeamMembers);
    const requestKey = JSON.stringify([serviceIds, pros]);

    useEffect(() => {
        if (!serviceIds.length) {
            setDays({});
            return;
        }
        const ctrl = new AbortController();
        axios
            .get(slots.week().url, {
                signal: ctrl.signal,
                params: {
                    provider_id: providerId,
                    service_ids: serviceIds,
                    service_team_members: pros,
                    start,
                    reschedule_id: rescheduleId,
                },
            })
            .then((response) => {
                const summary = (response.data.days ?? []) as DayAvailability[];
                setDays(Object.fromEntries(summary.map((day) => [day.date, day])));
            })
            .catch((error: unknown) => {
                if (!axios.isCancel(error)) {
                    setDays({});
                }
            });
        return () => ctrl.abort();
        // requestKey is a stable string derived from serviceIds and pros.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providerId, requestKey, start, rescheduleId]);

    return days;
}

/** Next open time per selected service, for anyone and for each pro. Fetched once per service. */
export function useNextAvailability(
    providerId: string,
    serviceIds: string[],
    enabled: boolean,
): Record<string, NextAvailability> {
    const [byService, setByService] = useState<Record<string, NextAvailability>>({});

    useEffect(() => {
        if (!enabled) {
            return;
        }
        const missing = serviceIds.filter((id) => !(id in byService));
        if (!missing.length) {
            return;
        }

        missing.forEach((serviceId) => {
            setByService((previous) => ({ ...previous, [serviceId]: previous[serviceId] ?? {} }));
            axios
                .get(slots.nextAvailable().url, { params: { provider_id: providerId, service_id: serviceId } })
                .then((response) => {
                    setByService((previous) => ({ ...previous, [serviceId]: response.data.next ?? {} }));
                })
                .catch(() => {
                    setByService((previous) => ({ ...previous, [serviceId]: {} }));
                });
        });
        // byService is read only to skip services already requested.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providerId, serviceIds.join(','), enabled]);

    return byService;
}
