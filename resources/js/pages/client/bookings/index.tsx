import { formatNaira } from '@/components/site/provider-card';
import { EmptyState } from '@/components/site/empty-state';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import AccountLayout from '@/layouts/account-layout';
import { cn, formatStatus } from '@/lib/utils';
import { type BookingCardBooking } from '@/pages/client/components/booking-card';
import client from '@/routes/client';
import explore from '@/routes/explore';
import { booking as bookProvider } from '@/routes/marketplace';
import reviews from '@/routes/reviews';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Search, Star } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type Booking = BookingCardBooking & { has_review?: boolean };

const STATUS_FILTERS = [
    { value: 'active', label: 'Upcoming' },
    { value: 'completed', label: 'Past' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'all', label: 'All' },
] as const;

const STATUS_STYLES: Record<string, string> = {
    confirmed: 'bg-mint text-leaf',
    pending: 'bg-[#FFF4D6] text-[#7A5200]',
    pending_completion: 'bg-[#FFF4D6] text-[#7A5200]',
    completed: 'bg-paper text-moss',
    cancelled: 'bg-[#FFF1F0] text-[#B42318]',
    no_show: 'bg-[#FFF1F0] text-[#B42318]',
};

interface Props {
    bookings?: Booking[];
    statusFilter?: string;
    counts?: Record<string, number>;
}

const businessName = (booking: Booking) => booking.provider?.business_profile?.business_name ?? 'Provider';
const serviceNames = (booking: Booking) =>
    (booking.services?.length ? booking.services : booking.service ? [booking.service] : []).map((service) => service.name).join(', ');
const startDate = (booking: Booking) => new Date(booking.start_time);
const timeLabel = (booking: Booking) =>
    startDate(booking).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });

function NextUpCard({ booking, now }: { booking: Booking; now: number }) {
    const date = startDate(booking);
    const daysAway = Math.ceil((date.getTime() - now) / 86_400_000);

    return (
        <article className="flex flex-col overflow-hidden rounded-[28px] bg-forest text-white sm:flex-row">
            <div className="flex flex-col justify-between gap-4 bg-lime p-7 text-forest sm:w-45">
                <span className="text-sm font-bold">Next up</span>
                <div>
                    <div className="font-bold">{date.toLocaleDateString('en-NG', { weekday: 'short' })}</div>
                    <div className="text-[72px] leading-[0.9] font-bold tracking-tighter">{date.getDate()}</div>
                    <div className="font-bold">{date.toLocaleDateString('en-NG', { month: 'long' })}</div>
                </div>
                <span className="text-sm font-semibold">{daysAway <= 0 ? 'Today' : `In ${daysAway} day${daysAway === 1 ? '' : 's'}`}</span>
            </div>
            <div className="flex flex-1 flex-col gap-4.5 p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="text-[26px] font-bold tracking-tight capitalize">{serviceNames(booking)}</div>
                        <div className="mt-1 text-[15px] text-sage">{businessName(booking)}</div>
                    </div>
                    <span className="rounded-full bg-lime/15 px-3 py-1.5 text-[13px] font-bold text-lime">{formatStatus(booking.status)}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                    <Fact label="Time" value={timeLabel(booking)} />
                    <Fact label="Where" value={booking.service_address ?? booking.provider?.business_profile?.city ?? 'At the studio'} />
                    <Fact label="Price" value={formatNaira(booking.price)} />
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <Link href={client.bookings.show(booking.id)} className="flex h-11 items-center rounded-full bg-lime px-4.5 text-sm font-bold text-forest">
                        View details
                    </Link>
                    <Link
                        href={client.bookings.show(booking.id)}
                        className="flex h-11 items-center rounded-full border border-white/30 px-4.5 text-sm font-semibold text-white"
                    >
                        Reschedule or cancel
                    </Link>
                </div>
            </div>
        </article>
    );
}

function Fact({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-white/6 px-4 py-3.5">
            <div className="text-xs text-sage">{label}</div>
            <div className="mt-1 truncate font-bold">{value}</div>
        </div>
    );
}

function ReviewDialog({ booking, onClose }: { booking: Booking; onClose: () => void }) {
    const form = useForm({ appointment_id: booking.id, rating: 5, comment: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(reviews.store().url, { preserveScroll: true, onSuccess: onClose });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="font-heading sm:max-w-md">
                <DialogTitle className="text-xl font-bold">Rate {businessName(booking)}</DialogTitle>
                <form onSubmit={submit} className="flex flex-col gap-5">
                    <div className="flex gap-1.5" role="radiogroup" aria-label="Rating">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={form.data.rating === value}
                                aria-label={`${value} star${value > 1 ? 's' : ''}`}
                                onClick={() => form.setData('rating', value)}
                            >
                                <Star className={cn('size-8', value <= form.data.rating ? 'fill-forest text-forest' : 'text-sage')} />
                            </button>
                        ))}
                    </div>
                    <label className="flex flex-col gap-2 text-sm font-semibold">
                        Tell others how it went
                        <textarea
                            value={form.data.comment}
                            onChange={(event) => form.setData('comment', event.target.value)}
                            rows={4}
                            className="rounded-2xl border border-[#DDE3DE] px-4 py-3 text-[15px] font-normal outline-none focus:border-forest"
                        />
                    </label>
                    {form.errors.appointment_id && <p className="text-sm text-[#B42318]">{form.errors.appointment_id}</p>}
                    <button type="submit" disabled={form.processing} className="h-12 rounded-full bg-forest font-bold text-white disabled:opacity-50">
                        Post review
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const PAGE_SIZE = 6;

/** Group label for a booking: "This week", "Later in December", or "January 2027" / "October". */
function groupLabel(date: Date, now: Date, upcoming: boolean): string {
    const sameYear = date.getFullYear() === now.getFullYear();
    const month = date.toLocaleDateString('en-NG', sameYear ? { month: 'long' } : { month: 'long', year: 'numeric' });

    if (upcoming) {
        const daysAway = (date.getTime() - now.getTime()) / 86_400_000;

        if (daysAway < 7) {
            return 'This week';
        }

        return sameYear && date.getMonth() === now.getMonth() ? `Later in ${month}` : month;
    }

    return month;
}

function groupBookings(bookings: Booking[], now: Date, upcoming: boolean): { label: string; items: Booking[] }[] {
    const groups: { label: string; items: Booking[] }[] = [];

    bookings.forEach((booking) => {
        const label = groupLabel(startDate(booking), now, upcoming);
        const last = groups[groups.length - 1];

        if (last?.label === label) {
            last.items.push(booking);
        } else {
            groups.push({ label, items: [booking] });
        }
    });

    return groups;
}

export default function BookingList({ bookings = [], statusFilter = 'active', counts = {} }: Props) {
    const [reviewing, setReviewing] = useState<Booking | null>(null);
    const [now] = useState(() => Date.now());
    const [search, setSearch] = useState('');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const upcoming = statusFilter === 'active';

    const sorted = [...bookings].sort((a, b) =>
        upcoming ? startDate(a).getTime() - startDate(b).getTime() : startDate(b).getTime() - startDate(a).getTime(),
    );
    const nextUp = upcoming ? sorted.find((booking) => startDate(booking).getTime() >= now) : undefined;
    const term = search.trim().toLowerCase();
    const matching = sorted
        .filter((booking) => booking !== nextUp)
        .filter((booking) => !term || `${serviceNames(booking)} ${businessName(booking)}`.toLowerCase().includes(term));
    // Upcoming lists stay short enough to show in full; history pages in batches.
    const shown = upcoming ? matching : matching.slice(0, visibleCount);
    const groups = groupBookings(shown, new Date(now), upcoming);
    const awaitingReview = bookings.filter((booking) => booking.status === 'completed' && !booking.has_review).length;

    return (
        <AccountLayout
            active="bookings"
            title="My bookings"
            description="Everything you’ve booked, in one place."
            actions={
                <Link href={explore.index()} className="flex h-12 items-center gap-2 rounded-full bg-forest px-5.5 text-[15px] font-bold text-white">
                    <Plus className="size-4 text-lime" /> New booking
                </Link>
            }
        >
            <Head title="My bookings" />

            <div role="tablist" aria-label="Booking status" className="flex gap-1 overflow-x-auto border-b border-line">
                {STATUS_FILTERS.map((filter) => {
                    const isActive = statusFilter === filter.value;

                    return (
                        <Link
                            key={filter.value}
                            role="tab"
                            aria-selected={isActive}
                            href={client.bookings.index({ query: { status: filter.value } })}
                            className={cn(
                                '-mb-px flex h-12 shrink-0 items-center gap-2 border-b-2 px-4.5 text-[15px]',
                                isActive ? 'border-forest font-bold text-ink' : 'border-transparent text-moss',
                            )}
                        >
                            {filter.label}
                            <span className="rounded-full bg-[#F2F5F2] px-2 py-0.5 text-xs font-bold text-moss">{counts[filter.value] ?? 0}</span>
                        </Link>
                    );
                })}
            </div>

            {bookings.length === 0 ? (
                <EmptyState
                    illustration="bookings"
                    title={upcoming ? 'No upcoming bookings' : 'No bookings here yet'}
                    description="When you book a pro, your appointments show up here with directions and reminders."
                    actions={
                        <Link href={explore.index()} className="flex h-12 items-center rounded-full bg-forest px-6 text-[15px] font-bold text-white">
                            Find a pro
                        </Link>
                    }
                />
            ) : (
                <div className="flex flex-col gap-4">
                    {nextUp && <NextUpCard booking={nextUp} now={now} />}

                    {!upcoming && (
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm text-moss">
                                {bookings.length} {bookings.length === 1 ? 'visit' : 'visits'}
                                {awaitingReview > 0 && ` · ${awaitingReview} waiting for your review`}
                            </span>
                            <label className="ml-auto flex h-10 min-w-60 items-center gap-2 rounded-full border border-[#DDE3DE] px-3.5 focus-within:border-forest">
                                <Search className="size-4 text-moss" />
                                <span className="sr-only">Search bookings</span>
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by pro or service"
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-moss"
                                />
                            </label>
                        </div>
                    )}

                    {groups.map((group) => (
                        <section key={group.label} className="flex flex-col gap-2">
                            <h3 className="flex items-baseline justify-between text-[15px] font-bold">
                                {group.label}
                                <span className="text-[13px] font-medium text-moss">
                                    {group.items.length} {group.items.length === 1 ? 'booking' : 'bookings'}
                                </span>
                            </h3>
                            {group.items.map((booking) => (
                                <BookingRow key={booking.id} booking={booking} upcoming={upcoming} onReview={() => setReviewing(booking)} />
                            ))}
                        </section>
                    ))}

                    {term && matching.length === 0 && <p className="py-6 text-center text-moss">No bookings match “{search}”.</p>}

                    {shown.length < matching.length && (
                        <button
                            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                            className="h-11.5 self-center rounded-full border border-[#DDE3DE] px-6 text-[15px] font-bold"
                        >
                            Show {Math.min(PAGE_SIZE, matching.length - shown.length)} more
                        </button>
                    )}
                </div>
            )}

            {reviewing && <ReviewDialog booking={reviewing} onClose={() => setReviewing(null)} />}
        </AccountLayout>
    );
}

function BookingRow({ booking, upcoming, onReview }: { booking: Booking; upcoming: boolean; onReview: () => void }) {
    const date = startDate(booking);
    const isCancelled = booking.status === 'cancelled';
    const canReview = booking.status === 'completed' && !booking.has_review;
    const slug = booking.provider?.business_profile?.slug;

    return (
        <article className="flex flex-wrap items-center gap-4 rounded-[18px] border border-line px-4.5 py-3.5 hover:border-[#C9E2D3]">
            <div className={cn('flex size-13 shrink-0 flex-col items-center justify-center rounded-[14px]', upcoming ? 'bg-mint text-forest' : 'bg-[#F2F5F2] text-moss')}>
                <span className="text-[11px] font-bold uppercase">
                    {date.toLocaleDateString('en-NG', upcoming ? { weekday: 'short' } : { month: 'short' })}
                </span>
                <span className="text-xl leading-none font-bold">{date.getDate()}</span>
            </div>
            <Link href={client.bookings.show(booking.id)} className="min-w-55 flex-1">
                <div className={cn('font-bold capitalize', isCancelled && 'text-moss line-through')}>{serviceNames(booking)}</div>
                <div className="mt-0.5 text-sm text-moss">
                    {businessName(booking)} · {timeLabel(booking)} · {formatNaira(booking.price)}
                </div>
            </Link>
            {(upcoming || isCancelled) && (
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', STATUS_STYLES[booking.status] ?? 'bg-paper text-moss')}>
                    {formatStatus(booking.status)}
                </span>
            )}
            {booking.has_review && <span className="text-[13px] font-semibold text-moss">Reviewed</span>}
            {canReview && (
                <button onClick={onReview} className="h-9.5 rounded-full bg-lime px-3.5 text-[13px] font-bold text-forest">
                    Leave a review
                </button>
            )}
            {!upcoming && slug ? (
                <Link href={bookProvider(slug)} className="flex h-9.5 items-center rounded-full border border-[#DDE3DE] px-3.5 text-[13px] font-semibold">
                    Book again
                </Link>
            ) : (
                <Link href={client.bookings.show(booking.id)} className="text-sm font-bold text-forest">
                    Details
                </Link>
            )}
        </article>
    );
}
