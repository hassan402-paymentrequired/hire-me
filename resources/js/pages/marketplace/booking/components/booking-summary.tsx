import VerifiedProviderBadge from '@/components/verified-provider-badge';
import { Button } from '@/components/ui/button';
import {
    getLocationSummaryLabel,
    normalizeDeliveryMode,
    requiresClientServiceAddress,
    type ServiceDeliveryMode,
    VISIT_PROVIDER_CHOICE,
} from '@/lib/service-delivery-mode';
import { format } from 'date-fns';
import { CalendarDays, Clock, MapPin, Plus, ShieldCheck, User } from 'lucide-react';

import type { AddressSummary, Provider, ProviderSettings, Service } from '../types';

interface BookingSummaryProps {
    provider: Provider;
    settings?: ProviderSettings;
    selectedServices: Service[];
    selectedDate: Date;
    selectedSlot: string;
    selectedAddressChoice: string;
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
    settings,
    selectedServices,
    selectedDate,
    selectedSlot,
    selectedAddressChoice,
    selectedAddressSummary,
    onAddAddress,
    onChangeAddress,
    hasAnyAddressOption,
}: BookingSummaryProps) {
    const deliveryMode: ServiceDeliveryMode = normalizeDeliveryMode(
        settings?.service_delivery_mode,
        settings?.offers_home_service,
    );
    const locationLabel = getLocationSummaryLabel(deliveryMode);
    const needsClientAddress = requiresClientServiceAddress(deliveryMode);
    const visitingProvider =
        selectedAddressChoice === VISIT_PROVIDER_CHOICE ||
        (deliveryMode === 'client_visits_provider' && !selectedAddressSummary);

    const locationDetail = visitingProvider
        ? provider.address || 'Provider business location'
        : selectedAddressSummary
          ? selectedAddressSummary.meta
              ? `${selectedAddressSummary.address}, ${selectedAddressSummary.meta}`
              : selectedAddressSummary.address
          : needsClientAddress
            ? 'Add your service address before booking'
            : 'Choose where the service happens';

    const locationTitle = visitingProvider
        ? 'Visit provider'
        : selectedAddressSummary?.label || (needsClientAddress ? 'Required' : 'Not set');

    return (
        <div className="space-y-4 p-5">
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-3 py-2.5 text-emerald-950">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                <p className="text-xs leading-relaxed">
                    Payment is held securely until you confirm the service is
                    complete. That&apos;s how Proxideck protects you compared to
                    hiring on Jiji or WhatsApp alone.
                </p>
            </div>

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
                        {locationLabel}
                    </span>
                    <div className="flex max-w-[60%] flex-col items-end gap-1.5 text-right">
                        <span className="block text-sm font-medium text-foreground">
                            {locationTitle}
                        </span>
                        <span className="block text-xs leading-5 text-muted-foreground">
                            {locationDetail}
                        </span>
                        {(needsClientAddress || deliveryMode === 'both') && (
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
                                    {needsClientAddress
                                        ? 'Add address'
                                        : 'Set location'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
