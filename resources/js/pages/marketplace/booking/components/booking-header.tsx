import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VerifiedProviderBadge from '@/components/verified-provider-badge';
import { MapPin } from 'lucide-react';

import type { Provider } from '../types';

interface BookingHeaderProps {
    provider: Provider;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export function BookingHeader({ provider }: BookingHeaderProps) {
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
                </h1>
                {provider.address && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
                        <MapPin className="size-3 shrink-0" />
                        <span className="truncate">{provider.address}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
