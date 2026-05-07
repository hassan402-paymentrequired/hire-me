import VerifiedProviderBadge from '@/components/verified-provider-badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarDays, Clock, MapPin, Plus, User } from 'lucide-react';

import type { AddressSummary, Provider, Service } from '../types';

interface BookingSummaryProps {
    provider: Provider;
    selectedServices: Service[];
    selectedDate: Date;
    selectedSlot: string;
    selectedAddressSummary: AddressSummary | null;
    onAddAddress: () => void;
    onChangeAddress: () => void;
    hasAnyAddressOption: boolean;
}

interface SummaryRowProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}

function SummaryRow({ icon, label, value }: SummaryRowProps) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="text-primary">{icon}</span>
                {label}
            </span>
            <span className="max-w-[60%] text-right text-sm font-medium text-foreground">
                {value}
            </span>
        </div>
    );
}

export function BookingSummary({
    provider,
    selectedServices,
    selectedDate,
    selectedSlot,
    selectedAddressSummary,
    onAddAddress,
    onChangeAddress,
    hasAnyAddressOption,
}: BookingSummaryProps) {
    return (
        <div className="space-y-4 p-5">
            {selectedServices.length > 0 && (
                <ul className="space-y-2 border-b border-border/60 pb-4">
                    {selectedServices.map((service) => (
                        <li
                            key={service.id}
                            className="flex items-center justify-between gap-3"
                        >
                            <div className="min-w-0">
                                <span className="line-clamp-1 text-sm capitalize text-foreground">
                                    {service.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {service.duration} mins
                                </span>
                            </div>
                            <span className="shrink-0 text-sm font-medium">
                                ₦{Number(service.price).toLocaleString()}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <div className="space-y-3">
                <SummaryRow
                    icon={<User className="size-3.5" />}
                    label="Professional"
                    value={
                        <span className="inline-flex items-center gap-2">
                            {provider.businessName}
                            {provider.isVerified && <VerifiedProviderBadge />}
                        </span>
                    }
                />
                <SummaryRow
                    icon={<CalendarDays className="size-3.5" />}
                    label="Date"
                    value={format(selectedDate, 'MMM d, yyyy')}
                />
                <SummaryRow
                    icon={<Clock className="size-3.5" />}
                    label="Time"
                    value={
                        selectedSlot
                            ? format(new Date(selectedSlot), 'h:mm a')
                            : '--:--'
                    }
                />
                <div className="flex items-start justify-between gap-4">
                    <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="text-primary">
                            <MapPin className="size-3.5" />
                        </span>
                        Address
                    </span>
                    <div className="flex max-w-[60%] flex-col items-end gap-1.5 text-right">
                        <span className="block text-sm font-medium text-foreground">
                            {selectedAddressSummary
                                ? selectedAddressSummary.label
                                : 'None selected'}
                        </span>
                        <span className="block text-xs leading-5 text-muted-foreground">
                            {selectedAddressSummary
                                ? selectedAddressSummary.meta
                                    ? `${selectedAddressSummary.address}, ${selectedAddressSummary.meta}`
                                    : selectedAddressSummary.address
                                : 'You can continue without adding an address.'}
                        </span>
                        <div className="flex items-center gap-2">
                            {hasAnyAddressOption && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={onChangeAddress}
                                    className="h-7 px-2.5 text-xs"
                                >
                                    Change
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onAddAddress}
                                className="h-7 gap-1 px-2.5 text-xs text-primary hover:text-primary"
                            >
                                <Plus className="size-3" />
                                Add address
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
