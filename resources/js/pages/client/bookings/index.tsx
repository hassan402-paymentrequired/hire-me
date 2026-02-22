import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import BookingCard, { type BookingCardBooking } from '@/pages/client/components/booking-card';
import { CalendarIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'all', label: 'All' },
] as const;

interface Props {
    bookings?: BookingCardBooking[];
    statusFilter?: string;
}

export default function BookingList({ bookings = [], statusFilter = 'active' }: Props) {
    return (
        <GuestLayout>
            <Head title="My Appointments" />

            <div className="p-4 sm:max-w-7xl mx-auto w-full ">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and track your appointments in one place.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {STATUS_FILTERS.map((filter) => (
                            <Link
                                key={filter.value}
                                href={`/my-bookings?status=${filter.value}`}
                                preserveState
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                    statusFilter === filter.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {filter.label}
                            </Link>
                        ))}
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
                            {/* <div className="p-3 bg-muted rounded-full">
                                <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                            </div> */}
                            <img src='/assets/gifs/empty.svg' alt='Empty icon' />
                        </div>
                        <h3 className="text-lg font-semibold">
                            {statusFilter === 'active' ? 'No active bookings' : `No ${statusFilter} bookings`}
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                            {statusFilter === 'active'
                                ? 'You have no pending or confirmed appointments. Explore our marketplace to book a service.'
                                : statusFilter === 'all'
                                    ? "You haven't booked any services yet. Explore our marketplace to find professionals."
                                    : `You don't have any ${statusFilter} appointments.`}
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
