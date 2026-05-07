import KeenIcon from '@/components/keen-icon';
import VerifiedProviderBadge from '@/components/verified-provider-badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

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
        <>
            <div className="border-b bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.06),transparent_28%)] p-5">
                <h2 className="text-center text-xl font-semibold tracking-tight sm:text-left sm:text-2xl">
                    Booking Summary
                </h2>
                <p className="mt-1 text-center text-sm text-muted-foreground sm:text-left">
                    Review the essentials before you confirm this booking.
                </p>
            </div>

            <div className="space-y-5 p-5">
                <div className="space-y-4 divide-y divide-dashed border-dashed border-muted">
                    {selectedServices.map((s) => (
                        <div
                            key={s.id}
                            className="flex items-center justify-between"
                        >
                            <div className="flex flex-col items-start">
                                <span className="line-clamp-2 text-sm text-muted-foreground/60 capitalize">
                                    {s.name}
                                </span>
                                <p className="mt-1 text-xs font-semibold tracking-widest text-muted-foreground/80 uppercase">
                                    {s.duration} mins
                                </p>
                            </div>
                            <span className="text-sm">
                                ₦{Number(s.price).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="border-t-2 border-dashed border-muted" />

                <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                            <KeenIcon
                                name="profile-circle"
                                className="text-sm text-primary"
                            />
                            Professional
                        </span>
                        <span className="text-sm font-semibold">
                            <span className="inline-flex items-center gap-2">
                                {provider.businessName}
                                {provider.isVerified && (
                                    <VerifiedProviderBadge />
                                )}
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                            <KeenIcon
                                name="book-square"
                                className="text-sm text-primary"
                            />
                            Date
                        </span>
                        <span className="text-sm font-semibold">
                            {format(selectedDate, 'MMM d, yyyy')}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                            <KeenIcon
                                name="status"
                                className="text-sm text-primary"
                            />
                            Time
                        </span>
                        <span className="text-sm font-semibold">
                            {selectedSlot
                                ? format(new Date(selectedSlot), 'h:mm a')
                                : '--:--'}
                        </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                        <span className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                            <KeenIcon
                                name="geolocation"
                                className="text-sm text-primary"
                            />
                            Address
                        </span>
                        <div className="flex max-w-[60%] flex-col items-end gap-1.5 text-right">
                            <span className="block text-sm font-semibold text-foreground">
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

                <div className="border-t-2 border-dashed border-muted" />
            </div>
        </>
    );
}
