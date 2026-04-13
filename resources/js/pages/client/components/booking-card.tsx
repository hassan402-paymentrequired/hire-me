import KeenIcon from '@/components/keen-icon';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    formatDate,
    formatPrice,
    formatStatus,
    formatTime,
    getStatusVariant,
} from '@/lib/utils';
import client from '@/routes/client';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    CalendarClock,
    ChevronRight,
    Clock,
    Coins,
    ImageIcon,
    Layers,
    MapPin,
} from 'lucide-react';

interface BusinessProfile {
    id: string;
    business_name: string;
    slug: string;
    description?: string;
    logo_path?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    phone?: string;
}

interface Provider {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    location?: string;
    business_profile?: BusinessProfile;
}

interface Service {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: string;
    provider_id: string;
    status: string;
}

export interface BookingCardBooking {
    id: string;
    provider_id: string;
    service_id: string;
    client_id: string;
    client_name: string | null;
    client_email: string | null;
    start_time: string;
    end_time: string;
    status:
        | 'pending'
        | 'confirmed'
        | 'cancelled'
        | 'completed'
        | 'pending_completion'
        | 'no_show';
    price: string;
    notes: string | null;
    payment_status?: 'pending' | 'paid' | 'refunded';
    provider: Provider;
    services: Service[];
    service?: Service;
    created_at: string;
    updated_at: string;
    provider_logo_url?: string | null;
    service_address?: string | null;
    service_address_label?: string | null;
    service_address_source?: string | null;
}

const BookingCard = ({ booking }: { booking: BookingCardBooking }) => {
    const services =
        booking.services || (booking.service ? [booking.service] : []);
    const hasMultipleServices = services.length > 1;
    const totalDuration = services.reduce(
        (sum, service) => sum + (service.duration_minutes || 0),
        0,
    );
    const primaryService = services[0];

    // Prefer provider_logo_url from backend, fallback to business_profile logo
    const businessImage =
        booking.provider_logo_url ??
        (booking.provider?.business_profile?.logo_path
            ? `/storage/${booking.provider.business_profile.logo_path}`
            : null);
    const businessName =
        booking.provider?.business_profile?.business_name || 'Business';

    const startTime = new Date(booking.start_time);
    const now = new Date();
    const isToday = startTime.toDateString() === now.toDateString();

    return (
        <Link href={client.bookings.show(booking.id)} prefetch>
            <Card className="group cursor-pointer overflow-hidden border-border/70 p-0 transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:shadow-black/5">
                {/* Business Banner/Logo Section */}
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                    {businessImage ? (
                        <img
                            src={businessImage}
                            alt={businessName}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                // Fallback if image fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement
                                    ?.querySelector('.fallback-icon')
                                    ?.classList.remove('hidden');
                            }}
                        />
                    ) : null}

                    {/* Fallback Icon */}
                    <div
                        className={`${businessImage ? 'hidden' : ''} fallback-icon flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5`}
                    >
                        <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                    </div>

                    {/* Status Badge Overlay - z-10 above gradient, solid bg for visibility */}
                    <div className="absolute top-3 right-3 z-10">
                        <Badge variant={getStatusVariant(booking.status)}>
                            {' '}
                            {formatStatus(booking.status)}
                        </Badge>
                    </div>

                    {/* Today/Upcoming Indicator */}
                    {isToday &&
                        !['cancelled', 'completed'].includes(
                            booking.status,
                        ) && (
                            <div className="absolute top-3 left-3 z-10">
                                <span className="inline-flex items-center rounded-lg bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                                    Today
                                </span>
                            </div>
                        )}

                    {/* Gradient Overlay - below badges */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Business Name Overlay */}
                    <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2">
                        <h4 className="line-clamp-1 flex-1 text-lg font-bold text-white drop-shadow-lg">
                            {businessName}
                        </h4>
                        <ChevronRight className="h-5 w-5 flex-shrink-0 text-white/80 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>

                <CardContent className="p-5">
                    {/* Service Header */}
                    <div className="mb-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                            <h3 className="line-clamp-2 flex-1 text-lg leading-tight font-bold capitalize transition-colors group-hover:text-primary">
                                {primaryService?.name || 'Service'}
                            </h3>

                            {hasMultipleServices && (
                                <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
                                    <Layers className="h-3.5 w-3.5" />
                                    <span className="text-xs font-semibold">
                                        {services.length}
                                    </span>
                                </div>
                            )}
                        </div>

                        {booking.service_address && (
                            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.16em] text-emerald-700 uppercase">
                                Address attached
                            </span>
                        )}
                    </div>

                    {/* Date & Time Section */}
                    <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
                        {/* Date & Time Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                        Date
                                    </p>
                                    <p className="truncate text-sm font-bold">
                                        {formatDate(booking.start_time)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Clock className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                        Time
                                    </p>
                                    <p className="truncate text-sm font-bold">
                                        {formatTime(booking.start_time)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Amount & Booked Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Coins className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                        Amount
                                    </p>
                                    <p className="truncate text-sm font-bold text-primary">
                                        {formatPrice(booking.price)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <CalendarClock className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                                        Booked
                                    </p>
                                    <p className="truncate text-sm font-bold">
                                        {formatDate(booking.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Address Row - Full Width */}
                        {booking.provider?.business_profile?.address && (
                            <div className="flex items-start gap-2 border-t border-muted pt-2">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="mb-1 text-[10px] tracking-wide text-muted-foreground uppercase">
                                        Location
                                    </p>
                                    <p className="line-clamp-2 text-xs leading-relaxed font-medium">
                                        {
                                            booking.provider.business_profile
                                                .address
                                        }
                                        {booking.provider.business_profile
                                            .city && (
                                            <>
                                                ,{' '}
                                                {
                                                    booking.provider
                                                        .business_profile.city
                                                }
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="inline-flex items-center gap-2">
                            <KeenIcon name="status" className="text-sm" />
                            <span>
                                {hasMultipleServices
                                    ? `${services.length} services booked`
                                    : 'Single-service booking'}
                            </span>
                        </div>
                        <span className="font-medium">
                            {totalDuration} mins
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default BookingCard;
