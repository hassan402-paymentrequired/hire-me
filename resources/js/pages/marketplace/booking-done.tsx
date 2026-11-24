import { formatNaira } from '@/components/site/provider-card';
import bookings from '@/routes/client/bookings';
import { show as providerShow } from '@/routes/provider';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';

import { type BookingStep, StepHeader } from './booking/components/step-header';
import { formatClock } from './booking/format';

interface BookingDoneProps {
    booking: {
        id: string;
        reference: string | null;
        status: string;
        startTime: string;
        endTime: string | null;
        businessName: string;
        providerSlug: string | null;
        services: { name: string; proName: string | null }[];
        atClientLocation: boolean;
        paymentMethod: string | null;
        amountHeld: number;
        total: number;
        isRecurring: boolean;
    };
}

const STEPS: BookingStep[] = [
    { key: 'services', label: 'Services' },
    { key: 'time', label: 'Time' },
    { key: 'confirm', label: 'Confirm' },
];

export default function BookingDone({ booking }: BookingDoneProps) {
    const start = new Date(booking.startTime);
    const leave = () => router.visit(booking.providerSlug ? providerShow(booking.providerSlug).url : bookings.index().url);
    const confirmation = booking.status === 'confirmed' ? `${booking.businessName} has confirmed your visit.` : `${booking.businessName} will confirm shortly.`;
    const money =
        booking.amountHeld > 0
            ? `, and your ${formatNaira(booking.amountHeld)} payment stays protected until your visit.`
            : `, and you’ll pay ${formatNaira(booking.total)} at the visit.`;

    return (
        <div className="min-h-screen bg-white font-heading text-ink">
            <Head title="You’re booked" />
            <StepHeader steps={STEPS} current={null} onBack={leave} onClose={leave} />

            <main className="mx-auto flex max-w-[760px] flex-col items-center gap-5 px-4 pt-14 pb-24 text-center sm:px-6">
                <span className="grid size-22 place-items-center rounded-full bg-lime">
                    <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden>
                        <path d="M4 24a20 20 0 0 1 40 0z" fill="#0E3B2E" />
                        <path d="M10 30H38" stroke="#0E3B2E" strokeWidth="5" strokeLinecap="round" />
                        <path d="M16 38H32" stroke="#0E3B2E" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                </span>
                <h1 className="text-[40px] leading-tight font-bold tracking-[-0.03em] sm:text-5xl">You’re booked.</h1>
                <p className="max-w-[520px] text-[17px] leading-relaxed text-moss">
                    {confirmation} We’ll remind you the day before{money}
                    {booking.isRecurring && ' Your next visits are on the same schedule.'}
                </p>

                <div className="mt-2 flex w-full overflow-hidden rounded-3xl bg-forest text-left text-white">
                    <div className="flex w-[120px] shrink-0 flex-col justify-center bg-lime p-5 text-forest sm:w-40 sm:p-5.5">
                        <span className="text-5xl leading-[0.85] font-bold tracking-[-0.04em] sm:text-[64px]">{format(start, 'd')}</span>
                        <span className="mt-1.5 text-[15px] font-bold">{format(start, 'EEE · MMM')}</span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-5 py-5 sm:px-6.5 sm:py-5.5">
                        <span className="text-xl font-bold capitalize">{booking.services.map((service) => service.name).join(' + ') || 'Your booking'}</span>
                        <span className="text-[15px] text-[#C9E2D3]">
                            {formatClock(start)} · {booking.atClientLocation ? 'At your place' : 'At the studio'}
                        </span>
                        {booking.reference && <span className="mt-1.5 text-[13px] text-sage">Booking ref {booking.reference}</span>}
                    </div>
                </div>

                <div className="mt-2 flex flex-wrap justify-center gap-2.5">
                    <Link href={bookings.show(booking.id)} className="flex h-13 items-center rounded-full bg-forest px-6.5 text-base font-bold text-white hover:bg-ink">
                        View booking
                    </Link>
                    <a
                        href={bookings.calendar(booking.id).url}
                        download
                        className="flex h-13 items-center rounded-full border border-[#DDE3DE] px-6 text-base font-semibold text-ink hover:bg-paper"
                    >
                        Add to calendar
                    </a>
                </div>
            </main>
        </div>
    );
}
