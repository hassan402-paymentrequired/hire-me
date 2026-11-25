import BrandMark from '@/components/brand-mark';
import { ReviewSection } from '@/components/reviews/review-section';
import { formatNaira } from '@/components/site/provider-card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import GuestLayout from '@/layouts/guest-layout';
import { cn, formatStatus } from '@/lib/utils';
import client from '@/routes/client';
import { booking as bookProvider } from '@/routes/marketplace';
import { show as providerShow } from '@/routes/provider';
import wallet from '@/routes/wallet';
import { RescheduleDialog } from '@/pages/client/bookings/components/reschedule-dialog';
import type { ProviderSettings, ServiceTeamMembers } from '@/pages/marketplace/booking/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CalendarPlus, ChevronLeft, Lock, MapPin, Phone, ShieldCheck, Star } from 'lucide-react';
import { type ComponentProps, type FormEvent, type ReactNode, useEffect, useState } from 'react';

interface Service {
    id: string;
    name: string;
    duration_minutes: number;
    price: string;
}

type Review = ComponentProps<typeof ReviewSection>['reviews'][number];

interface Booking {
    id: string;
    start_time: string;
    end_time: string;
    created_at: string;
    status: string;
    price: string;
    payment_method?: 'online' | 'offline' | null;
    notes: string | null;
    cancelled_by: string | null;
    cancellation_reason: string | null;
    service_address?: string | null;
    service_address_city?: string | null;
    escrow_status?: string | null;
    escrow_amount?: number | string | null;
    provider: {
        id: string;
        name: string;
        business_profile: {
            business_name: string;
            slug: string;
            phone: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
        };
    };
    service?: Service;
    services: Service[];
    review?: Review | Review[] | null;
    team_member?: { user: { name: string } } | null;
    team_member_id?: string | null;
}

interface RescheduleOptions {
    serviceTeamMembers: ServiceTeamMembers;
    settings: ProviderSettings;
    closedDays: string[];
    popularHours: number[];
}

interface Props {
    booking: Booking;
    hasFutureRecurrences?: boolean;
    providerRating: { average: number; count: number };
    policy: { changeCutoffHours: number; latePenaltyPercent: number };
    rescheduleOptions: RescheduleOptions;
    openReschedule?: boolean;
}

const REPORT_REASONS = [
    { value: 'no-show', label: 'Provider did not show up' },
    { value: 'poor-service', label: 'Poor service quality' },
    { value: 'incorrect-price', label: 'Incorrect pricing charged' },
    { value: 'unprofessional', label: 'Unprofessional behaviour' },
    { value: 'safety-concern', label: 'Safety concern' },
    { value: 'other', label: 'Other' },
];

const HOUR = 3_600_000;

const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return [hours ? `${hours} hr` : '', rest ? `${rest} min` : ''].filter(Boolean).join(' ');
};

const formatCountdown = (ms: number) => {
    const hours = Math.floor(ms / HOUR);

    return hours >= 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h ${Math.floor((ms % HOUR) / 60_000)}m`;
};

const dateTime = (value: Date, options: Intl.DateTimeFormatOptions) => value.toLocaleString('en-NG', options);

export default function BookingDetails({
    booking,
    hasFutureRecurrences = false,
    providerRating,
    policy,
    rescheduleOptions,
    openReschedule = false,
}: Props) {
    const [now] = useState(() => Date.now());
    const [copied, setCopied] = useState(false);
    const [dialog, setDialog] = useState<'cancel' | 'complete' | 'report' | 'reschedule' | null>(null);

    useEffect(() => {
        if (openReschedule) {
            setDialog('reschedule');
        }
    }, [openReschedule]);

    const services = booking.services?.length ? booking.services : booking.service ? [booking.service] : [];
    const title = services.map((service) => service.name).join(', ') || 'Appointment';
    const business = booking.provider.business_profile;
    const pro = booking.team_member?.user.name ?? booking.provider.name;
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    const reference = `PDX-${booking.id.slice(-6).toUpperCase()}`;
    const address = booking.service_address ?? [business.address, business.city].filter(Boolean).join(', ');
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    const isCancelled = booking.status === 'cancelled';
    const isCompleted = booking.status === 'completed';
    const isActive = ['pending', 'confirmed', 'pending_completion'].includes(booking.status);
    const hasStarted = start.getTime() <= now;
    const freeUntil = start.getTime() - policy.changeCutoffHours * HOUR;
    const isFreeToChange = now < freeUntil;
    const canCancel = isActive && !hasStarted;
    const canReschedule = ['pending', 'confirmed'].includes(booking.status) && isFreeToChange;
    const canEdit = canReschedule;
    const canMarkComplete = ['confirmed', 'pending_completion'].includes(booking.status) && end.getTime() < now;
    const daysAway = Math.ceil((start.getTime() - now) / (24 * HOUR));
    const total = services.reduce((sum, service) => sum + Number(service.price), 0) || Number(booking.price);
    const held = Number(booking.escrow_amount ?? 0);
    const reviews = Array.isArray(booking.review) ? booking.review : booking.review ? [booking.review] : [];

    const steps = [
        { title: 'Booked', when: dateTime(new Date(booking.created_at), { weekday: 'short', day: 'numeric', month: 'short' }), done: true },
        { title: 'Confirmed', when: booking.status === 'pending' ? 'Waiting for the pro' : 'Accepted', done: booking.status !== 'pending' },
        isCancelled
            ? { title: 'Cancelled', when: booking.cancelled_by ? `By ${booking.cancelled_by}` : '', done: true }
            : { title: 'Appointment', when: dateTime(start, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }), done: hasStarted },
        { title: 'Completed', when: isCompleted ? 'All done' : 'Confirm after your visit', done: isCompleted },
    ];
    const progress = isCompleted ? 100 : isCancelled ? 66 : booking.status === 'pending_completion' ? 82 : booking.status === 'confirmed' ? 58 : 25;

    const next = isCancelled
        ? { label: 'Cancelled', text: booking.payment_method === 'online' ? 'Any refund due is back in your wallet. Book a new time whenever you like.' : 'This booking won’t go ahead. Book a new time whenever you like.' }
        : isCompleted
          ? { label: 'All done', text: reviews.length ? 'Thanks for your review. Ready for the next one?' : `How was it? A quick review helps others find ${business.business_name}.` }
          : canMarkComplete
            ? { label: 'Your turn', text: `Confirm your visit with ${pro} is done so the payment can be released.` }
            : booking.status === 'pending'
              ? { label: 'What happens next', text: `${business.business_name} will confirm your booking soon. We’ll let you know as soon as they do.` }
              : { label: 'What happens next', text: `You’ll get a reminder the day before. Please arrive 10 minutes early.` };

    const copyReference = async () => {
        await navigator.clipboard?.writeText(reference);
        setCopied(true);
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${title} at ${business.business_name}`)}&dates=${[start, end]
        .map((date) => date.toISOString().replace(/[-:]|\.\d{3}/g, ''))
        .join('/')}&location=${encodeURIComponent(address)}`;

    return (
        <GuestLayout>
            <Head title={`Booking · ${title}`} />

            <div className="mx-auto flex max-w-[1240px] flex-col gap-7 px-4 pt-8 pb-24 sm:px-6">
                <Link href={client.bookings.index()} className="flex items-center gap-2 self-start text-[15px] font-semibold text-moss">
                    <ChevronLeft className="size-4" /> My bookings
                </Link>

                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div className="flex flex-col gap-2.5">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-4xl font-bold tracking-tight capitalize">{title}</h1>
                            <StatusPill status={booking.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5 text-[15px] text-moss">
                            <span>
                                {dateTime(start, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
                                {dateTime(start, { hour: 'numeric', minute: '2-digit' })} – {dateTime(end, { hour: 'numeric', minute: '2-digit' })}
                            </span>
                            <span className="text-sage">•</span>
                            <span>
                                Booking ref <strong className="text-ink">{reference}</strong>
                            </span>
                            <button onClick={copyReference} className="h-7.5 rounded-full border border-[#DDE3DE] px-2.5 text-xs font-bold text-ink">
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    {isActive && (
                        <div className="flex flex-wrap gap-2.5">
                            <a href={calendarUrl} target="_blank" rel="noreferrer" className="flex h-12 items-center gap-2 rounded-full border border-[#DDE3DE] px-5 text-[15px] font-semibold">
                                <CalendarPlus className="size-4" /> Add to calendar
                            </a>
                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex h-12 items-center gap-2 rounded-full bg-forest px-5.5 text-[15px] font-bold text-white">
                                <MapPin className="size-4 text-lime" /> Get directions
                            </a>
                        </div>
                    )}
                </div>

                {/* Visit ticket */}
                <section
                    aria-label="Visit progress"
                    className={cn('relative flex flex-col overflow-hidden rounded-[28px] text-white sm:min-h-55 sm:flex-row', isCancelled ? 'bg-[#3A1F1C]' : 'bg-forest')}
                >
                    <div className={cn('flex shrink-0 flex-col justify-between gap-4 px-7 py-6.5 text-forest sm:w-55', isCancelled ? 'bg-[#FFB4AB]' : 'bg-lime')}>
                        <span className="text-[13px] font-bold">Your visit</span>
                        <div className="flex items-end gap-2.5">
                            <span className="text-[88px] leading-[0.82] font-bold tracking-[-0.05em]">{start.getDate()}</span>
                            <span className="flex flex-col pb-1 text-[15px] leading-tight font-bold">
                                {dateTime(start, { weekday: 'short' })}
                                <span>{dateTime(start, { month: 'short' })}</span>
                            </span>
                        </div>
                        <span className="text-[15px] font-bold">
                            {isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : hasStarted ? 'Today' : daysAway <= 1 ? 'Tomorrow' : `In ${daysAway} days`}
                        </span>
                    </div>

                    <div aria-hidden className="relative hidden border-l-2 border-dashed border-white/30 sm:block">
                        <span className="absolute -top-3.5 -left-3.75 size-7 rounded-full bg-white" />
                        <span className="absolute -bottom-3.5 -left-3.75 size-7 rounded-full bg-white" />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-6 px-6 py-6.5 sm:px-9">
                        <div className="flex flex-wrap items-start justify-between gap-5">
                            <div className="flex flex-col gap-1">
                                <span className={cn('text-[13px] font-bold', isCancelled ? 'text-[#FFB4AB]' : 'text-lime')}>{next.label}</span>
                                <span className="max-w-130 text-[22px] leading-snug font-bold tracking-tight">{next.text}</span>
                            </div>
                            {canCancel && isFreeToChange && (
                                <div className="flex flex-col items-end text-right">
                                    <span className="text-xs text-sage">Free cancellation ends in</span>
                                    <span className="text-xl font-bold tabular-nums">{formatCountdown(freeUntil - now)}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4.5">
                            <div className="relative mx-1.5 h-1.5 rounded-full bg-white/15">
                                <div className={cn('absolute inset-y-0 left-0 rounded-full', isCancelled ? 'bg-[#FFB4AB]' : 'bg-lime')} style={{ width: `${progress}%` }} />
                                <span
                                    aria-hidden
                                    className={cn(
                                        'absolute top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full',
                                        isCancelled ? 'bg-[#FFB4AB] shadow-[0_0_0_6px_rgba(255,180,171,0.18)]' : 'bg-lime shadow-[0_0_0_6px_rgba(200,241,105,0.18)]',
                                    )}
                                    style={{ left: `${progress}%` }}
                                >
                                    <BrandMark className="size-5.5 [&_path]:fill-forest [&_path]:stroke-forest" />
                                </span>
                            </div>
                            <ol className="mt-6 grid grid-cols-4 gap-2">
                                {steps.map((step, index) => (
                                    <li key={step.title} className={cn('flex flex-col gap-0.5', index === 0 ? 'text-left' : index === 3 ? 'text-right' : 'text-center')}>
                                        <span className={cn('text-sm font-bold', !step.done && 'text-sage', isCancelled && step.title === 'Cancelled' && 'text-[#FFB4AB]')}>
                                            {step.title}
                                        </span>
                                        <span className="text-xs text-sage">{step.when}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                    <div className="flex min-w-0 flex-1 flex-col gap-5">
                        {/* Provider */}
                        <section className="overflow-hidden rounded-3xl border border-line">
                            <div className="flex flex-wrap items-center gap-4 px-6 py-5.5">
                                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-forest text-xl font-bold text-lime">
                                    {business.business_name.charAt(0)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <Link href={providerShow(business.slug)} className="text-lg font-bold">
                                        {business.business_name}
                                    </Link>
                                    <div className="mt-0.5 text-sm text-moss">
                                        {providerRating.count > 0 && `${providerRating.average} ★ (${providerRating.count}) · `}
                                        {address}
                                    </div>
                                </div>
                                {business.phone && (
                                    <a href={`tel:${business.phone}`} className="flex h-10.5 items-center gap-2 rounded-full border border-[#DDE3DE] px-4 text-sm font-semibold">
                                        <Phone className="size-4" /> Call
                                    </a>
                                )}
                            </div>
                            <a href={mapsUrl} target="_blank" rel="noreferrer" className="relative block h-45 overflow-hidden border-t border-line bg-[#EAF1EC]">
                                <svg className="absolute inset-0 size-full" viewBox="0 0 800 180" preserveAspectRatio="xMidYMid slice" aria-hidden>
                                    <path d="M0 120 C 200 90, 340 160, 520 110 S 760 80, 800 90" stroke="#fff" strokeWidth="16" fill="none" />
                                    <path d="M150 0 L 190 180M520 0 L 480 180" stroke="#fff" strokeWidth="9" />
                                    <path d="M0 50 L 800 70" stroke="#fff" strokeWidth="6" />
                                </svg>
                                <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-[70%] place-items-center rounded-full border-4 border-white bg-forest font-bold text-lime shadow-lg">
                                    {business.business_name.charAt(0)}
                                </span>
                                <span className="absolute bottom-4 left-5 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold shadow-sm">
                                    {address} · Open in Maps
                                </span>
                            </a>
                        </section>

                        {/* Services */}
                        <section className="flex flex-col gap-3.5 rounded-3xl border border-line px-6 py-5.5">
                            <h2 className="text-xl font-bold">What you booked</h2>
                            {services.map((service) => (
                                <div key={service.id} className="flex items-center gap-3.5 border-b border-[#EEF2EF] py-3.5">
                                    <div className="flex-1">
                                        <div className="font-bold capitalize">{service.name}</div>
                                        <div className="mt-0.5 text-sm text-moss">
                                            {formatDuration(service.duration_minutes)} · with {pro}
                                        </div>
                                    </div>
                                    <strong>{formatNaira(service.price)}</strong>
                                </div>
                            ))}
                            {(booking.notes || canEdit) && (
                                <div className="flex flex-col gap-2 pt-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[13px] font-bold text-moss">Your note to {pro}</span>
                                        {canEdit && (
                                            <Link href={`/appointments/${booking.id}/edit`} className="text-sm font-semibold text-moss underline">
                                                Edit
                                            </Link>
                                        )}
                                    </div>
                                    {booking.notes ? (
                                        <p className="max-w-130 self-start rounded-[18px_18px_18px_6px] bg-mint px-4 py-3 text-[15px] leading-relaxed">{booking.notes}</p>
                                    ) : (
                                        canEdit && (
                                            <Link
                                                href={`/appointments/${booking.id}/edit`}
                                                className="text-sm font-semibold text-forest underline"
                                            >
                                                Add a note for your pro
                                            </Link>
                                        )
                                    )}
                                </div>
                            )}
                            {isCancelled && booking.cancellation_reason && (
                                <p className="text-sm text-moss">
                                    Cancellation reason: <span className="text-ink">{booking.cancellation_reason}</span>
                                </p>
                            )}
                        </section>

                        {/* Cancellation window */}
                        {canCancel && (
                            <section className="flex flex-col gap-4.5 rounded-3xl bg-paper p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-xl font-bold">Change of plans?</h2>
                                        <p className="max-w-115 text-sm leading-relaxed text-moss">
                                            {isFreeToChange ? (
                                                <>
                                                    You can cancel or reschedule for free for another <strong className="text-ink">{formatCountdown(freeUntil - now)}</strong>.
                                                </>
                                            ) : (
                                                <>Your appointment is less than {policy.changeCutoffHours} hours away, so cancelling now keeps {policy.latePenaltyPercent}% of your payment.</>
                                            )}
                                        </p>
                                    </div>
                                    <span className={cn('flex h-8.5 items-center rounded-full px-3 text-[13px] font-bold', isFreeToChange ? 'bg-lime text-forest' : 'bg-[#FFF4D6] text-[#7A5200]')}>
                                        {isFreeToChange ? 'Free to cancel now' : `${policy.latePenaltyPercent}% fee applies`}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <div className="relative flex h-3">
                                        <div className="flex-[0_0_80%] rounded-l-full bg-forest" />
                                        <div className="flex-1 rounded-r-full bg-[repeating-linear-gradient(135deg,#F3D9A4_0_6px,#FFF4D6_6px_12px)]" />
                                        <span
                                            aria-label="You are here"
                                            className="absolute top-1/2 size-5.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-lime shadow"
                                            style={{
                                                left: `${isFreeToChange ? Math.max(4, 80 - ((freeUntil - now) / (freeUntil - new Date(booking.created_at).getTime())) * 80) : 90}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex text-[13px]">
                                        <div className="flex flex-[0_0_80%] justify-between pr-3">
                                            <span>
                                                <strong>Booked</strong>
                                                <br />
                                                <span className="text-moss">Cancel free, full refund</span>
                                            </span>
                                            <span className="text-right">
                                                <strong>{dateTime(new Date(freeUntil), { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</strong>
                                                <br />
                                                <span className="text-moss">Free window closes</span>
                                            </span>
                                        </div>
                                        <div className="flex-1 text-right">
                                            <strong>{dateTime(start, { hour: 'numeric', minute: '2-digit' })}</strong>
                                            <br />
                                            <span className="text-[#7A5200]">{policy.latePenaltyPercent}% kept</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 border-t border-line pt-3.5 text-[13px] text-moss">
                                    <ShieldCheck className="size-4 text-leaf" />
                                    If {pro} cancels or doesn’t show, you always get everything back.
                                </div>
                            </section>
                        )}

                        {isCompleted && (
                            <section className="flex flex-col gap-4 rounded-3xl border border-line px-6 py-5.5">
                                <h2 className="text-xl font-bold">Your review</h2>
                                <ReviewSection reviews={reviews} canReview={reviews.length === 0} pendingAppointmentId={booking.id} />
                            </section>
                        )}
                    </div>

                    {/* Payment and actions */}
                    <aside className="flex flex-col gap-4 lg:w-100 lg:shrink-0">
                        <section className="flex flex-col gap-3.5 rounded-3xl bg-forest p-6 text-white">
                            <h2 className="text-lg font-bold">Payment</h2>
                            {services.map((service) => (
                                <PaymentLine key={service.id} label={service.name} value={formatNaira(service.price)} />
                            ))}
                            {booking.payment_method === 'online' ? (
                                <>
                                    <PaymentLine label="Paid from wallet" value={`−${formatNaira(held || total)}`} highlight />
                                    <div className="flex justify-between border-t border-white/15 pt-3.5 text-lg font-bold">
                                        <span>Left to pay</span>
                                        <span>{formatNaira(Math.max(total - (held || total), 0))}</span>
                                    </div>
                                    <InfoNote>
                                        {booking.escrow_status === 'held'
                                            ? 'Your payment is held by Proxideck until you confirm the appointment is done.'
                                            : `Payment status: ${formatStatus(booking.escrow_status ?? 'pending')}.`}
                                    </InfoNote>
                                    <Link href={wallet.index()} className="text-sm font-bold text-lime">
                                        View in wallet →
                                    </Link>
                                </>
                            ) : (
                                <div className="flex justify-between border-t border-white/15 pt-3.5 text-lg font-bold">
                                    <span>Pay at the appointment</span>
                                    <span>{formatNaira(total)}</span>
                                </div>
                            )}
                        </section>

                        {isActive && (
                            <section className="flex flex-col gap-2.5 rounded-3xl border border-line p-5">
                                {canMarkComplete && (
                                    <button onClick={() => setDialog('complete')} className="h-12.5 rounded-full bg-forest text-[15px] font-bold text-white">
                                        Confirm it’s done
                                    </button>
                                )}
                                {canReschedule && (
                                    <button
                                        type="button"
                                        onClick={() => setDialog('reschedule')}
                                        className="flex h-12.5 items-center justify-center rounded-full bg-lime text-[15px] font-bold text-forest"
                                    >
                                        Reschedule
                                    </button>
                                )}
                                {canEdit && (
                                    <Link
                                        href={`/appointments/${booking.id}/edit`}
                                        className="flex h-12.5 items-center justify-center rounded-full border border-[#DDE3DE] text-[15px] font-bold text-ink"
                                    >
                                        Edit booking
                                    </Link>
                                )}
                                {canCancel && (
                                    <button onClick={() => setDialog('cancel')} className="h-12.5 rounded-full border border-[#DDE3DE] text-[15px] font-bold text-[#B42318]">
                                        Cancel booking
                                    </button>
                                )}
                                {hasFutureRecurrences && (
                                    <button
                                        onClick={() =>
                                            confirm('Cancel all future appointments in this series?') &&
                                            router.post(`/appointments/${booking.id}/cancel-remaining-recurrences`, {}, { preserveScroll: true })
                                        }
                                        className="text-sm font-semibold text-moss"
                                    >
                                        Cancel the rest of this series
                                    </button>
                                )}
                                <button onClick={() => setDialog('report')} className="mt-1 text-sm font-semibold text-moss">
                                    Report a problem
                                </button>
                            </section>
                        )}

                        {(isCancelled || isCompleted) && (
                            <section className="flex flex-col gap-2.5 rounded-3xl border border-line p-5">
                                <div className="font-bold">{isCancelled ? 'Booking cancelled' : 'Want the same again?'}</div>
                                <div className="text-sm leading-relaxed text-moss">
                                    {isCancelled
                                        ? `This booking was cancelled${booking.cancelled_by ? ` by ${booking.cancelled_by}` : ''}.`
                                        : `Book ${business.business_name} again in a few taps.`}
                                </div>
                                <Link href={bookProvider(business.slug)} className="mt-1.5 flex h-12 items-center justify-center rounded-full bg-forest text-[15px] font-bold text-white">
                                    Book again
                                </Link>
                                {isCompleted && (
                                    <button onClick={() => setDialog('report')} className="mt-1 text-sm font-semibold text-moss">
                                        Report a problem
                                    </button>
                                )}
                            </section>
                        )}
                    </aside>
                </div>
            </div>

            {dialog === 'cancel' && <CancelDialog booking={booking} pro={pro} isFree={isFreeToChange} policy={policy} onClose={() => setDialog(null)} />}
            {dialog === 'complete' && <CompleteDialog bookingId={booking.id} pro={pro} onClose={() => setDialog(null)} />}
            {dialog === 'report' && <ReportDialog bookingId={booking.id} onClose={() => setDialog(null)} />}
            {dialog === 'reschedule' && (
                <RescheduleDialog
                    bookingId={booking.id}
                    providerId={booking.provider.id}
                    serviceIds={services.map((service) => service.id)}
                    serviceTeamMembers={rescheduleOptions.serviceTeamMembers}
                    teamMemberId={booking.team_member_id}
                    notes={booking.notes}
                    currentStartTime={booking.start_time}
                    settings={rescheduleOptions.settings}
                    closedDays={rescheduleOptions.closedDays}
                    popularHours={rescheduleOptions.popularHours}
                    onClose={() => setDialog(null)}
                />
            )}
        </GuestLayout>
    );
}

function StatusPill({ status }: { status: string }) {
    const tone =
        status === 'cancelled' || status === 'no_show'
            ? 'bg-[#FFF1F0] text-[#B42318]'
            : status === 'pending' || status === 'pending_completion'
              ? 'bg-[#FFF4D6] text-[#7A5200]'
              : 'bg-mint text-leaf';

    return (
        <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold', tone)}>
            <span className="size-1.75 rounded-full bg-current" />
            {formatStatus(status)}
        </span>
    );
}

function PaymentLine({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex justify-between gap-4 text-[15px]">
            <span className="text-[#C9E2D3] capitalize">{label}</span>
            <span className={cn(highlight && 'font-bold text-lime')}>{value}</span>
        </div>
    );
}

function InfoNote({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center gap-2.5 rounded-2xl bg-lime/12 px-3.5 py-3 text-[13px] leading-snug text-[#E3EFE8]">
            <Lock className="size-4.5 shrink-0 text-lime" />
            <span>{children}</span>
        </div>
    );
}

function ModalShell({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-3xl p-7 font-heading sm:max-w-110">
                <DialogTitle className="text-[22px] font-bold">{title}</DialogTitle>
                <DialogDescription className="text-[15px] leading-relaxed text-moss">{description}</DialogDescription>
                {children}
            </DialogContent>
        </Dialog>
    );
}

const fieldClass = 'rounded-2xl border border-[#DDE3DE] px-3.5 py-3 text-[15px] font-normal outline-none focus:border-forest';

function CancelDialog({
    booking,
    pro,
    isFree,
    policy,
    onClose,
}: {
    booking: Booking;
    pro: string;
    isFree: boolean;
    policy: Props['policy'];
    onClose: () => void;
}) {
    const form = useForm({ reason: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/appointments/${booking.id}/cancel`, { preserveScroll: true, onSuccess: onClose });
    };

    const description = isFree
        ? booking.payment_method === 'online'
            ? 'You’re inside the free window, so your payment goes straight back to your wallet.'
            : 'You’re inside the free window, so there’s no charge for cancelling.'
        : `Your appointment is less than ${policy.changeCutoffHours} hours away, so ${policy.latePenaltyPercent}% of your payment is kept and the rest is refunded.`;

    return (
        <ModalShell title="Cancel this booking?" description={description} onClose={onClose}>
            <form onSubmit={submit} className="flex flex-col gap-3.5">
                <label className="flex flex-col gap-2 text-sm font-semibold">
                    Reason (optional)
                    <textarea
                        rows={3}
                        value={form.data.reason}
                        onChange={(event) => form.setData('reason', event.target.value)}
                        placeholder={`Let ${pro} know why`}
                        className={cn(fieldClass, 'resize-none')}
                    />
                </label>
                <div className="mt-1.5 flex gap-2.5">
                    <button type="button" onClick={onClose} className="h-12 flex-1 rounded-full border border-[#DDE3DE] font-bold">
                        Keep booking
                    </button>
                    <button type="submit" disabled={form.processing} className="h-12 flex-1 rounded-full bg-[#B42318] font-bold text-white disabled:opacity-50">
                        Yes, cancel
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}

function CompleteDialog({ bookingId, pro, onClose }: { bookingId: string; pro: string; onClose: () => void }) {
    const form = useForm({ rating: 5, comment: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/appointments/${bookingId}/complete`, { preserveScroll: true, onSuccess: onClose });
    };

    return (
        <ModalShell title="Is your visit done?" description={`Confirming releases the payment to ${pro}. Add a quick review while it’s fresh.`} onClose={onClose}>
            <form onSubmit={submit} className="flex flex-col gap-4">
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
                <textarea
                    rows={3}
                    value={form.data.comment}
                    onChange={(event) => form.setData('comment', event.target.value)}
                    placeholder="How did it go? (optional)"
                    className={cn(fieldClass, 'resize-none')}
                />
                <button type="submit" disabled={form.processing} className="h-12 rounded-full bg-forest font-bold text-white disabled:opacity-50">
                    Confirm and post
                </button>
            </form>
        </ModalShell>
    );
}

function ReportDialog({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
    const form = useForm({ reason: REPORT_REASONS[0].value, description: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/appointments/${bookingId}/report`, { preserveScroll: true, onSuccess: onClose });
    };

    return (
        <ModalShell title="Report a problem" description="Tell us what went wrong. Our team reviews every report." onClose={onClose}>
            <form onSubmit={submit} className="flex flex-col gap-3.5">
                <label className="flex flex-col gap-2 text-sm font-semibold">
                    What happened?
                    <select value={form.data.reason} onChange={(event) => form.setData('reason', event.target.value)} className={cn(fieldClass, 'bg-white')}>
                        {REPORT_REASONS.map((reason) => (
                            <option key={reason.value} value={reason.value}>
                                {reason.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold">
                    Details
                    <textarea
                        rows={4}
                        value={form.data.description}
                        onChange={(event) => form.setData('description', event.target.value)}
                        className={cn(fieldClass, 'resize-none')}
                        required
                    />
                </label>
                {Object.values(form.errors)[0] && <p className="text-sm text-[#B42318]">{Object.values(form.errors)[0]}</p>}
                <button type="submit" disabled={form.processing} className="h-12 rounded-full bg-forest font-bold text-white disabled:opacity-50">
                    Send report
                </button>
            </form>
        </ModalShell>
    );
}
