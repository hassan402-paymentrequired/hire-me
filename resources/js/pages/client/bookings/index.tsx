import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import BookingCard from '@/pages/client/components/booking-card';

interface Booking {
    id: string;
    provider_name: string;
    service_name: string;
    start_time: string;
    status: string;
    price: string;
    avatar?: string;
}

export default function BookingList({ bookings = [] }: { bookings?: Booking[] }) {

    return (
        <GuestLayout>
            <Head title="My Appointments" />

            <div className="p-4 sm:max-w-7xl mx-auto w-full ">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and track your appointments in one place.
                        </p>
                    </div>
                </div>

                {bookings.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
                        {bookings.map((booking) => (
                           <BookingCard booking={booking} key={booking.id} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
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
