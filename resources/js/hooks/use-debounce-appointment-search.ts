import { router } from "@inertiajs/react";
import { debounce } from "lodash";
import { useEffect, useMemo } from "react";


 export function useDebouncedAppointmentSearch(statusFilter: string) {
        const debouncedSearch = useMemo(() => {
            const fn = debounce((query, status) => {
                router.get(
                    '/schedule/appointments',
                    {
                        search: query,
                        status: status !== 'all' ? status : undefined,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                        only: ['appointments'],
                    },
                );
            }, 300);

            return fn;
        }, []);

        useEffect(() => {
            return () => {
                debouncedSearch.cancel();
            };
        }, [debouncedSearch]);

        const handleSearch = (value: string) => {
            debouncedSearch(value, statusFilter);
        };

        return handleSearch;
    }