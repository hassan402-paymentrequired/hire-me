import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Clock, MapPin, ChevronRight, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import GuestLayout from '@/layouts/guest-layout';

interface Booking {
    id: string;
    provider_name: string;
    service_name: string;
    start_time: string;
    status: string;
    price: string;
    avatar?: string;
}

export default function BookingList({ bookings }: { bookings: Booking[] }) {
    
    // Helper to get color based on status
    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'default'; // primary
            case 'completed': return 'secondary';
            case 'cancelled': return 'destructive';
            case 'pending': return 'outline';
            default: return 'secondary';
        }
    };

    return (
        <GuestLayout>
            <Head title="My Appointments" />

            <div className="max-w-4xl mx-auto py-10 px-4 md:px-0">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and track your appointments in one place.
                        </p>
                    </div>
                </div>

                {bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <Link key={booking.id} href={route('client.bookings.show', booking.id)}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        
                                        {/* Left Side: Service & Provider Info */}
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 border">
                                                <AvatarImage src={booking.avatar} alt={booking.provider_name} />
                                                <AvatarFallback><User className="w-6 h-6 text-muted-foreground" /></AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-lg leading-none">{booking.service_name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1 text-blue-600 font-medium">
                                                    with {booking.provider_name}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {booking.start_time}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Price, Status & Chevron */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <div className="font-bold text-lg">{booking.price}</div>
                                                <Badge variant={getStatusVariant(booking.status)} className="mt-1">
                                                    {booking.status}
                                                </Badge>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                        </div>

                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border rounded-lg bg-muted/10 border-dashed">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-muted rounded-full">
                                <Calendar className="w-8 h-8 text-muted-foreground" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold">No bookings yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                            You haven't booked any services yet. Explore our marketplace to find professionals.
                        </p>
                        <Link href="/">
                            <Button>Browse Services</Button>
                        </Link>
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}
