import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    Timer,
    ChevronRight,
    User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import client from '@/routes/client';
import {
    formatDate,
    formatTime,
    formatStatus,
    formatPrice,
    getStatusVariant,
} from '@/lib/utils';

interface Provider {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    location?: string;
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
    service: Service;
    created_at: string;
    updated_at: string;
}

const BookingCard = ({ booking }: { booking: Booking }) => {
    return (
        <Link href={client.bookings.show(booking.id)}>
            <Card className="hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer group">
                <CardContent className="">

                    {/* Top Section: Avatar, Service Name, Provider */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Avatar with status dot */}
                            <div className="relative flex-shrink-0">
                                <Avatar className="size-10 border-2 rounded">
                                    <AvatarImage
                                        src={booking.provider?.avatar}
                                        alt={booking.provider?.name}
                                    />
                                    <AvatarFallback className="bg-muted rounded text-foreground font-bold text-sm">
                                        {booking.provider?.name
                                            ? booking.provider.name
                                                .split(' ')
                                                .map((n: string) => n[0])
                                                .slice(0, 2)
                                                .join('')
                                                .toUpperCase()
                                            : <User className="w-6 h-6" />
                                        }
                                    </AvatarFallback>
                                </Avatar>

                                {/* Status indicator dot */}
                                {booking.status === 'confirmed' && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-background rounded" />
                                )}
                                {booking.status === 'pending' && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-500 border-2 border-background rounded animate-pulse" />
                                )}
                            </div>

                            {/* Service name and "with" text */}
                            <div className="flex-1 min-w-0 pt-1">
                                <h3 className="font-bold text-xl leading-tight  truncate group-hover:text-primary transition-colors">
                                    {booking.service?.name || 'Service'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    <span className="text-xs">with {booking.provider.name}</span>
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Middle Section: Date, Time, Duration */}
                    <div className="space-y-2 mb-4 pb-4 border-b">
                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium">
                                {formatDate(booking.start_time)}
                            </span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium">
                                {formatTime(booking.start_time)}
                            </span>
                        </div>

                        {/* Duration */}
                        {booking.service?.duration_minutes && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Timer className="w-4 h-4 flex-shrink-0" />
                                <span>
                                    {booking.service.duration_minutes} min
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Bottom Section: Price and Status */}
                    <div className="flex items-center justify-between gap-3">
                        {/* Price */}
                        <div className="font-bold text-2xl">
                            {formatPrice(booking.price)}
                        </div>

                        {/* Status Badge */}
                        <Badge
                            variant={getStatusVariant(booking.status)}
                            className="font-semibold px-3 py-1"
                        >
                            {formatStatus(booking.status)}
                        </Badge>
                    </div>

                    {/* Notes (if exists) */}
                    {booking.notes && (
                        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground line-clamp-2">
                            <span className="font-medium">Note:</span> {booking.notes}
                        </div>
                    )}

                </CardContent>
            </Card>
        </Link>
    );
};

export default BookingCard;
