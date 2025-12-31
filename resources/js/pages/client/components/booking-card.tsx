import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    Timer,
    ChevronRight,
    Layers,
    ImageIcon,
    MapPin,
    Coins,
    LucideCalendarClock,
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

    // Get business logo or banner
    const businessImage = '/storage/' + booking.provider?.business_profile?.logo_path;
    const businessName = booking.provider?.business_profile?.business_name ;
console.log(businessImage)
    return (
        <Link href={client.bookings.show(booking.id)}>
            <Card className="hover:shadow-xl hover:border p-0 transition-all duration-300 cursor-pointer group overflow-hidden">
                {/* Business Banner/Logo Section */}
                <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                    {businessImage ? (
                        <img
                            src={businessImage}
                            alt={businessName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                    )}

                    {/* Status Badge Overlay */}
                    <div className="absolute -top-1 right-0">
                        <Badge
                            variant="default"
                            className={"rounded-none rounded-bl "}
                        >
                            {formatStatus(booking.status)}
                        </Badge>
                    </div>



                    {/* Gradient Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Business Name Overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                        <h4 className="font-bold text-white text-lg drop-shadow-lg line-clamp-1">
                            {businessName}
                        </h4>
                    </div>
                </div>

                <CardContent className="">
                    {/* Service Header */}
                    <div className="mb-4 flex items-center justify-between ">
                        <div className="flex items-start justify-between gap-2 ">
                            <h3 className="font-bold text-xl capitalize leading-tight group-hover:text-primary transition-colors line-clamp-2 flex-1">
                                {primaryService?.name || 'Service'}
                            </h3>
                        </div>


                            <div className="flex items-center gap-1.5 text-sm text-primary bg-primary/10 w-fit px-3 py-1 rounded-full">
                                <Layers className="w-4 h-4" />
                                <span className="font-medium text-xs">
                                    {services.length} services
                                </span>
                            </div>
                    </div>

                    {/* Date & Time Section */}
                    <div className="bg-muted/50 grid grid-cols-2 rounded p-4 mb-4 space-y-2.5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p className="font-semibold text-sm">
                                    {formatDate(booking.start_time)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Time</p>
                                <p className="font-semibold text-sm">
                                    {formatTime(booking.start_time)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Coins className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Amount</p>
                                <p className="font-semibold text-sm">
                                    {formatPrice(booking.price)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <LucideCalendarClock className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Booked</p>
                                <p className="font-semibold text-sm">
                                    {formatDate(booking.created_at)}
                                </p>
                            </div>
                        </div>

                            <div className="flex items-center gap-3 col-span-2">
                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Address</p>
                                    <p className="font-semibold text-sm">
                                       {booking.provider?.business_profile?.address}
                                    </p>
                                </div>
                            </div>
                    </div>


                </CardContent>
            </Card>
        </Link>
    );
};

export default BookingCard;
