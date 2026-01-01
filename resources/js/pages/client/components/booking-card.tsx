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
import { Badge } from '@/components/ui/badge';
import client from '@/routes/client';
import {
    formatDate,
    formatTime,
    formatStatus,
    formatPrice,
    getStatusVariant,
} from '@/lib/utils';

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

interface Booking {
    id: string;
    provider_id: string;
    service_id: string;
    client_id: string;
    client_name: string | null;
    client_email: string | null;
    start_time: string;
    end_time: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    price: string;
    notes: string | null;
    payment_status?: 'pending' | 'paid' | 'refunded';
    provider: Provider;
    services: Service[];
    service?: Service;
    created_at: string;
    updated_at: string;
}

const BookingCard = ({ booking }: { booking: Booking }) => {
    const services = booking.services || (booking.service ? [booking.service] : []);
    const hasMultipleServices = services.length > 1;
    const totalDuration = services.reduce((sum, service) => sum + (service.duration_minutes || 0), 0);
    const primaryService = services[0];

    // Fix: Check if logo_path exists before constructing URL
    const businessImage = booking.provider?.business_profile?.logo_path
        ? `/storage/${booking.provider.business_profile.logo_path}`
        : null;
    const businessName = booking.provider?.business_profile?.business_name || 'Business';

    // Check if appointment is upcoming, past, or today
    const startTime = new Date(booking.start_time);
    const now = new Date();
    const isUpcoming = startTime > now;
    const isToday = startTime.toDateString() === now.toDateString();
    const isPast = startTime < now;

    return (
        <Link href={client.bookings.show(booking.id)}>
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

                    {/* Status Badge Overlay */}
                    <div className="absolute -top-1 right-0">
                        <Badge
                            variant={getStatusVariant(booking.status)}
                            className="rounded-none rounded-bl-lg shadow-lg"
                        >
                            {formatStatus(booking.status)}
                        </Badge>
                    </div>

                    {/* Today/Upcoming Indicator */}
                    {isToday && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <div className="absolute top-3 left-3">
                            <Badge className="bg-orange-500 hover:bg-orange-600 shadow-lg animate-pulse">
                                Today
                            </Badge>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

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
