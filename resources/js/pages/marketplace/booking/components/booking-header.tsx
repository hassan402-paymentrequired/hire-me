import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import VerifiedProviderBadge from '@/components/verified-provider-badge';
import {
    getDeliveryModeBadge,
    normalizeDeliveryMode,
    type ServiceDeliveryMode,
} from '@/lib/service-delivery-mode';
import { MapPin, Navigation } from 'lucide-react';

import type { Provider, ProviderSettings } from '../types';

interface BookingHeaderProps {
    provider: Provider;
    settings?: ProviderSettings;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export function BookingHeader({ provider, settings }: BookingHeaderProps) {
    const deliveryMode: ServiceDeliveryMode = normalizeDeliveryMode(
        settings?.service_delivery_mode,
        settings?.offers_home_service,
    );
    const showProviderAddress =
        deliveryMode === 'client_visits_provider' ||
        deliveryMode === 'both';

    return (
        <div className="mb-6 flex items-center gap-3">
            <Avatar className="size-10 shrink-0">
                <AvatarImage
                    src={provider.logo || undefined}
                    alt={provider.businessName}
                />
                <AvatarFallback>
                    {getInitials(provider.businessName)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <h1 className="flex flex-wrap items-center gap-2 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    <span className="truncate">{provider.businessName}</span>
                    {provider.isVerified && <VerifiedProviderBadge />}
                    <Badge variant="secondary" className="text-[10px] font-semibold tracking-wide uppercase">
                        {deliveryMode === 'provider_visits_client' ? (
                            <Navigation className="mr-1 inline size-3" />
                        ) : (
                            <MapPin className="mr-1 inline size-3" />
                        )}
                        {getDeliveryModeBadge(deliveryMode)}
                    </Badge>
                </h1>
                {showProviderAddress && provider.address ? (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                        <MapPin className="size-3 shrink-0" />
                        <span className="truncate">
                            Visit us: {provider.address}
                        </span>
                    </p>
                ) : deliveryMode === 'provider_visits_client' ? (
                    <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                        You&apos;ll add your service address before confirming.
                    </p>
                ) : null}
            </div>
        </div>
    );
}
