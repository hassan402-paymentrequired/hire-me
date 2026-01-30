import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    Layers,
    ImageIcon,
    MapPin,
    Coins,
    CalendarClock,
    ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import client from '@/routes/client';
import {
    formatDate,
    formatTime,
    formatStatus,
    formatPrice,
} from '@/lib/utils';
import { cn } from '@/lib/utils';

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
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'pending_completion' | 'no_show';
    price: string;
    notes: string | null;
    payment_status?: 'pending' | 'paid' | 'refunded';
    provider: Provider;
    services: Service[];
    service?: Service;
    created_at: string;
    updated_at: string;
    provider_logo_url?: string | null;
}

const BookingCard = ({ booking }: { booking: BookingCardBooking }) => {
    const services = booking.services || (booking.service ? [booking.service] : []);
    const hasMultipleServices = services.length > 1;
    const totalDuration = services.reduce((sum, service) => sum + (service.duration_minutes || 0), 0);
    const primaryService = services[0];

    // Prefer provider_logo_url from backend, fallback to business_profile logo
    const businessImage =
        booking.provider_logo_url ??
        (booking.provider?.business_profile?.logo_path
            ? `/storage/${booking.provider.business_profile.logo_path}`
            : null);
    const businessName = booking.provider?.business_profile?.business_name || 'Business';

    // Check if appointment is upcoming, past, or today
    const startTime = new Date(booking.start_time);
    const now = new Date();
    const isUpcoming = startTime > now;
    const isToday = startTime.toDateString() === now.toDateString();
    const isPast = startTime < now;

    return (
        <Link href={client.bookings.show(booking.id)} prefetch>
            <Card className="hover:shadow-xl p-0 hover:border-primary/50 transition-all duration-300 cursor-pointer group overflow-hidden">
                {/* Business Banner/Logo Section */}
                <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                    {businessImage ? (
                        <img
                            src={businessImage}
                            alt={businessName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                // Fallback if image fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                            }}
                        />
                    ) : null}

                    {/* Fallback Icon */}
                    <div className={`${businessImage ? 'hidden' : ''} fallback-icon w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5`}>
                        <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                    </div>

                    {/* Status Badge Overlay - z-10 above gradient, solid bg for visibility */}
                    <div className="absolute top-3 right-3 z-10">
                        <span
                            className={cn(
                                'inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold shadow-md',
                                booking.status === 'confirmed' && 'bg-green-600 text-white',
                                booking.status === 'pending' && 'bg-amber-500 text-white',
                                booking.status === 'cancelled' && 'bg-red-600 text-white',
                                booking.status === 'completed' && 'bg-slate-600 text-white',
                                booking.status === 'no_show' && 'bg-red-600 text-white',
                                !['confirmed', 'pending', 'cancelled', 'completed', 'pending_completion', 'no_show'].includes(booking.status) &&
                                    'bg-white/95 text-foreground',
                            )}
                        >
                            {formatStatus(booking.status)}
                        </span>
                    </div>

                    {/* Today/Upcoming Indicator */}
                    {isToday && !['cancelled', 'completed'].includes(booking.status) && (
                        <div className="absolute top-3 left-3 z-10">
                            <span className="inline-flex items-center rounded-lg bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
                                Today
                            </span>
                        </div>
                    )}

                    {/* Gradient Overlay - below badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

                    {/* Business Name Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                        <h4 className="font-bold text-white text-lg drop-shadow-lg line-clamp-1 flex-1">
                            {businessName}
                        </h4>
                        <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                </div>

                <CardContent className="p-5">
                    {/* Service Header */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <h3 className="font-bold text-lg capitalize leading-tight group-hover:text-primary transition-colors line-clamp-2 flex-1">
                            {primaryService?.name || 'Service'}
                        </h3>

                        {hasMultipleServices && (
                            <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-3 py-1 rounded-full flex-shrink-0">
                                <Layers className="w-3.5 h-3.5" />
                                <span className="font-semibold text-xs">
                                    {services.length}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Date & Time Section */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        {/* Date & Time Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Date</p>
                                    <p className="font-bold text-sm truncate">
                                        {formatDate(booking.start_time)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Time</p>
                                    <p className="font-bold text-sm truncate">
                                        {formatTime(booking.start_time)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Amount & Booked Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Coins className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Amount</p>
                                    <p className="font-bold text-sm truncate text-primary">
                                        {formatPrice(booking.price)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <CalendarClock className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Booked</p>
                                    <p className="font-bold text-sm truncate">
                                        {formatDate(booking.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Address Row - Full Width */}
                        {booking.provider?.business_profile?.address && (
                            <div className="flex items-start gap-2 pt-2 border-t border-muted">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Location</p>
                                    <p className="font-medium text-xs leading-relaxed line-clamp-2">
                                        {booking.provider.business_profile.address}
                                        {booking.provider.business_profile.city && (
                                            <>, {booking.provider.business_profile.city}</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>


                </CardContent>
            </Card>
        </Link>
    );
};

export default BookingCard;
