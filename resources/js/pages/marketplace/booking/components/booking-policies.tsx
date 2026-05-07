import KeenIcon from '@/components/keen-icon';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import type { ProviderSettings } from '../types';

interface BookingPoliciesProps {
    settings: ProviderSettings;
    supportsOfflineBooking: boolean;
}

interface PolicyChip {
    label: string;
    explanation: string;
}

function buildPolicies(
    settings: ProviderSettings,
    supportsOfflineBooking: boolean,
): PolicyChip[] {
    const policies: PolicyChip[] = [];

    if (settings.minNotice) {
        policies.push({
            label: `Minimum ${settings.minNotice} hour notice`,
            explanation:
                'You need to book at least this many hours ahead of the start time.',
        });
    }

    if (!settings.allowSameDay) {
        policies.push({
            label: 'No same-day bookings',
            explanation:
                'This provider does not accept bookings for today. Pick another date.',
        });
    } else {
        policies.push({
            label: 'Same-day bookings available',
            explanation:
                'You can book this provider for today as long as a slot is open.',
        });
    }

    if (settings.allowOffHoursRequests) {
        policies.push({
            label: 'Off-hours requests allowed',
            explanation:
                'You can request a custom time outside working hours; the provider has to confirm it.',
        });
    }

    if (settings.max_bookings_per_week) {
        const value = Number(settings.max_bookings_per_week);
        policies.push({
            label: `Up to ${value} booking${value > 1 ? 's' : ''} weekly`,
            explanation:
                'You cannot exceed this many bookings with this provider in a single week.',
        });
    }

    if (settings.max_bookings_per_month) {
        const value = Number(settings.max_bookings_per_month);
        policies.push({
            label: `Up to ${value} booking${value > 1 ? 's' : ''} monthly`,
            explanation:
                'You cannot exceed this many bookings with this provider in a single month.',
        });
    }

    if (supportsOfflineBooking) {
        policies.push({
            label: 'Pay later option available',
            explanation:
                'You can send an unpaid booking request and pay only after the provider accepts it.',
        });
    }

    return policies;
}

export function BookingPolicies({
    settings,
    supportsOfflineBooking,
}: BookingPoliciesProps) {
    const policies = buildPolicies(settings, supportsOfflineBooking);

    if (policies.length === 0) {
        return null;
    }

    return (
        <div className="mb-8 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <KeenIcon
                    name="information"
                    className="text-sm text-muted-foreground"
                />
                Booking policies
            </div>
            <div className="flex flex-wrap gap-2">
                {policies.map((policy) => (
                    <Tooltip key={policy.label}>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            >
                                <KeenIcon
                                    name="status"
                                    className="text-[11px]"
                                />
                                {policy.label}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>{policy.explanation}</TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
}
