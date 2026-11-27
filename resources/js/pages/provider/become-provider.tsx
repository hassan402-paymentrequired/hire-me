import { SiteNav } from '@/components/site/site-nav';
import GuestLayout from '@/layouts/guest-layout';
import becomeProviderRoute from '@/routes/become-provider';
import { Head, router } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    CalendarCheck,
    Check,
    Clock,
    Loader2,
    Scissors,
    Star,
    Store,
    Users,
    Wallet,
    type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    hasStartedOnboarding?: boolean;
}

interface Benefit {
    icon: LucideIcon;
    title: string;
    text: string;
    className: string;
}

const benefits: Benefit[] = [
    {
        icon: CalendarCheck,
        title: 'Bookings, without the DMs',
        text: 'Clients see your live availability and book a slot themselves. No back-and-forth to agree a time.',
        className: 'bg-forest text-white md:col-span-2',
    },
    {
        icon: Wallet,
        title: 'Deposits upfront',
        text: 'Clients pay a deposit from their wallet before they arrive, so no-shows stop costing you.',
        className: 'bg-lime text-forest',
    },
    {
        icon: Star,
        title: 'Reviews that count',
        text: 'Only clients who completed a booking can review you, so your rating is earned.',
        className: 'bg-mint text-ink',
    },
    {
        icon: Users,
        title: 'Your team, one calendar',
        text: 'Add staff, give them their own hours and let clients book whoever they prefer.',
        className: 'bg-ink text-white md:col-span-2',
    },
];

const setupSteps = [
    {
        icon: Store,
        title: 'Business profile',
        text: 'Name, location, photos and a short description of what you do.',
    },
    {
        icon: Clock,
        title: 'Work hours',
        text: 'The days and times you take bookings. Change them any time.',
    },
    {
        icon: Scissors,
        title: 'Services',
        text: 'What you offer, how long it takes and what it costs.',
    },
    {
        icon: BadgeCheck,
        title: 'Get verified',
        text: 'A quick ID check earns you the verified badge clients look for.',
    },
];

const reassurances = [
    'Free to join',
    'Set up in a few minutes',
    'Change anything later',
];

function StartButton({
    label,
    onStart,
    processing,
}: {
    label: string;
    onStart: () => void;
    processing: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onStart}
            disabled={processing}
            className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-lime px-7 text-base font-bold text-forest transition hover:brightness-95 disabled:opacity-70"
        >
            {processing ? <Loader2 className="size-5 animate-spin" /> : null}
            {label}
            {!processing && <ArrowRight className="size-5" />}
        </button>
    );
}

function BookingPreview() {
    return (
        <div className="relative mx-auto w-full max-w-105" aria-hidden>
            <div className="rounded-[28px] bg-white p-6 text-ink shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[13px] font-semibold text-moss">
                            Today
                        </div>
                        <div className="text-xl font-bold">3 bookings</div>
                    </div>
                    <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-forest">
                        ₦42,000 held
                    </span>
                </div>
                <div className="mt-5 flex flex-col gap-2.5">
                    {[
                        {
                            time: '10:00',
                            name: 'Knotless braids',
                            client: 'Tolu A.',
                        },
                        {
                            time: '13:30',
                            name: 'Silk press',
                            client: 'Chioma E.',
                        },
                        {
                            time: '16:00',
                            name: 'Wig install',
                            client: 'Zainab M.',
                        },
                    ].map((booking) => (
                        <div
                            key={booking.time}
                            className="flex items-center gap-3.5 rounded-2xl border border-line p-3.5"
                        >
                            <span className="w-12 text-sm font-bold text-forest">
                                {booking.time}
                            </span>
                            <div className="flex-1">
                                <div className="text-[15px] font-semibold">
                                    {booking.name}
                                </div>
                                <div className="text-[13px] text-moss">
                                    {booking.client}
                                </div>
                            </div>
                            <span className="grid size-6 place-items-center rounded-full bg-lime text-forest">
                                <Check className="size-3.5" strokeWidth={3} />
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="absolute -bottom-6 -left-4 flex items-center gap-2.5 rounded-2xl bg-ink px-4 py-3 text-white shadow-xl sm:-left-10">
                <span className="grid size-8 place-items-center rounded-full bg-lime text-forest">
                    <Wallet className="size-4" />
                </span>
                <div>
                    <div className="text-[13px] font-bold">
                        Deposit received
                    </div>
                    <div className="text-xs text-sage">₦5,000 · Silk press</div>
                </div>
            </div>
        </div>
    );
}

export default function BecomeProvider({
    hasStartedOnboarding = false,
}: Props) {
    const [processing, setProcessing] = useState(false);

    const startSetup = () => {
        router.post(
            becomeProviderRoute.store().url,
            {},
            {
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
            },
        );
    };

    const startLabel = hasStartedOnboarding ? 'Continue setup' : 'Start setup';

    return (
        <GuestLayout nav="none">
            <Head title="List your business" />

            {/* Hero */}
            <section className="relative overflow-hidden bg-forest">
                <SiteNav variant="dark" />
                <div className="relative mx-auto grid max-w-[1240px] items-center gap-16 px-4 pt-14 pb-24 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
                    <div className="flex flex-col items-start gap-6">
                        <span className="rounded-full bg-lime px-3 py-1.5 text-[13px] font-bold text-forest">
                            For business
                        </span>
                        <h1 className="text-5xl leading-[0.98] font-bold tracking-[-0.035em] text-white sm:text-6xl lg:text-[68px]">
                            Fill your calendar.{' '}
                            <span className="text-lime">Get paid upfront.</span>
                        </h1>
                        <p className="max-w-130 text-lg leading-relaxed text-[#C9E2D3]">
                            List your salon, studio or home service on
                            Proxideck. Clients find you, book a time and pay a
                            deposit before they show up.
                        </p>
                        <StartButton
                            label={startLabel}
                            onStart={startSetup}
                            processing={processing}
                        />
                        <ul className="flex flex-wrap gap-x-5 gap-y-2">
                            {reassurances.map((item) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-2 text-[15px] text-sage"
                                >
                                    <Check
                                        className="size-4 text-lime"
                                        strokeWidth={3}
                                    />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <BookingPreview />
                </div>
            </section>

            {/* Benefits */}
            <section className="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 pt-22 sm:px-6">
                <div className="flex max-w-160 flex-col gap-2.5">
                    <span className="text-[15px] font-bold text-leaf">
                        Why pros use Proxideck
                    </span>
                    <h2 className="text-4xl leading-tight font-bold tracking-tight">
                        Spend your time on clients, not on admin.
                    </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {benefits.map(({ icon: Icon, title, text, className }) => (
                        <div
                            key={title}
                            className={`relative flex min-h-55 flex-col justify-end overflow-hidden rounded-[28px] p-7 ${className}`}
                        >
                            <Icon
                                aria-hidden
                                strokeWidth={0.7}
                                className="absolute -top-8 -right-8 size-44 opacity-20"
                            />
                            <div className="relative text-2xl font-bold tracking-tight">
                                {title}
                            </div>
                            <p className="relative mt-2 max-w-110 leading-relaxed opacity-80">
                                {text}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Setup steps */}
            <section className="mx-auto flex max-w-[1240px] flex-col gap-9 px-4 pt-26 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div className="flex max-w-160 flex-col gap-2.5">
                        <span className="text-[15px] font-bold text-leaf">
                            How setup works
                        </span>
                        <h2 className="text-4xl leading-tight font-bold tracking-tight">
                            Four short steps and you are taking bookings.
                        </h2>
                    </div>
                    <p className="max-w-95 leading-relaxed text-moss">
                        Everything you add can be changed later from your
                        dashboard.
                    </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {setupSteps.map(({ icon: Icon, title, text }, index) => (
                        <div
                            key={title}
                            className="flex flex-col gap-4 rounded-3xl border border-line p-7"
                        >
                            <div className="flex items-center justify-between">
                                <span className="grid size-13 place-items-center rounded-2xl bg-forest text-[22px] font-bold text-lime">
                                    {index + 1}
                                </span>
                                <Icon
                                    className="size-6 text-moss"
                                    aria-hidden
                                />
                            </div>
                            <div className="text-[22px] font-bold">{title}</div>
                            <p className="leading-relaxed text-moss">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-[1240px] px-4 py-26 sm:px-6">
                <div className="flex flex-col items-start justify-between gap-8 rounded-[32px] bg-ink p-10 sm:p-14 lg:flex-row lg:items-center">
                    <div className="flex flex-col gap-4">
                        <h2 className="max-w-140 text-4xl leading-tight font-bold tracking-tight text-white sm:text-[44px]">
                            Ready to take your first booking?
                        </h2>
                        <p className="max-w-110 text-[17px] leading-relaxed text-sage">
                            It is free to set up. You only need your business
                            details, your hours and a few services.
                        </p>
                    </div>
                    <StartButton
                        label={startLabel}
                        onStart={startSetup}
                        processing={processing}
                    />
                </div>
            </section>
        </GuestLayout>
    );
}
