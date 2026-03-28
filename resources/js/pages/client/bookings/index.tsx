import { Head, Link } from '@inertiajs/react';
import KeenIcon from '@/components/keen-icon';
import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import BookingCard, { type BookingCardBooking } from '@/pages/client/components/booking-card';
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

            <div className="mx-auto w-full max-w-7xl p-4">
                <div className="relative mb-8 overflow-hidden rounded-3xl border border-border/70 bg-background px-5 py-5 sm:px-7 sm:py-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%)]" />
                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                <KeenIcon name="book-square" className="text-sm" />
                                Appointment history
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    My Bookings
                                </h1>
                                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Manage upcoming appointments, revisit completed visits, and keep an eye on cancellations in one place.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
                            <div className="rounded-2xl border border-border/70 bg-background/90 p-4 backdrop-blur-sm">
                                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                    Showing
                                </div>
                                <div className="mt-2 text-2xl font-semibold text-foreground">
                                    {bookings.length}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {STATUS_FILTERS.find((filter) => filter.value === statusFilter)?.label ?? 'Active'} bookings
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background/90 p-4 backdrop-blur-sm">
                                <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                    Filter
                                </div>
                                <div className="mt-2 text-base font-semibold text-foreground">
                                    {STATUS_FILTERS.find((filter) => filter.value === statusFilter)?.label ?? 'Active'}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Switch tabs to review the rest
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 flex flex-wrap gap-2">
                        {STATUS_FILTERS.map((filter) => (
                            <Link
                                key={filter.value}
                                href={`/my-bookings?status=${filter.value}`}
                                preserveState
                                className={cn(
                                    'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                                    statusFilter === filter.value
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border/70 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40 hover:text-foreground'
                                )}
                            >
                                {filter.label}
                            </Link>
                        ))}
                </div>

                {bookings.length > 0 ? (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking) => (
                           <BookingCard booking={booking} key={booking.id} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 px-6 py-20 text-center">
                        <div className="flex justify-center mb-4">
                            <img src='/assets/gifs/empty.svg' alt='Empty icon' className="max-h-48 w-auto" />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight">
                            {statusFilter === 'active' ? 'No active bookings' : `No ${statusFilter} bookings`}
                        </h3>
                        <p className="mx-auto mb-6 mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
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
