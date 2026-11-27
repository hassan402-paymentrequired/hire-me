import KeenIcon from '@/components/keen-icon';
import { EmptyStateInset } from '@/components/site/empty-state';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes/business';
import schedule from '@/routes/schedule';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface StatValue {
    value: number;
    change: number;
}

interface UpcomingAppointment {
    id: number;
    client: string;
    service: string;
    time: string;
    date: string;
    status: string;
    avatar: string;
}

interface AttentionItem {
    type: string;
    count: number;
    label: string;
    description: string;
    href: string;
    action_label: string;
    tone: 'danger' | 'warning' | 'info';
}

interface RevenueDay {
    label: string;
    date: string;
    value: number;
    is_today: boolean;
}

interface DashboardProps {
    stats: {
        revenue: StatValue;
        bookings: StatValue;
        new_clients: StatValue;
        rating: StatValue;
    };
    upcomingAppointments: UpcomingAppointment[];
    needsAttention: AttentionItem[];
    is_verified?: boolean;
    verification_status?: {
        status: string;
        rejection_reason?: string | null;
        created_at: string;
    } | null;
    revenueThisWeek: RevenueDay[];
    today: { count: number; expected_revenue: number };
    booking_url: string | null;
}

const naira = (value: number) => `₦${Math.round(value).toLocaleString()}`;

const initials = (name: string) =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
        return 'Good morning';
    }

    return hour < 17 ? 'Good afternoon' : 'Good evening';
};

const attentionIcon: Record<string, string> = {
    urgent_bookings: 'timer',
    awaiting_confirmation: 'notification-on',
    pending_client_confirmation: 'time',
    payout_issues: 'credit-cart',
    verification_issue: 'shield-tick',
};

const toneStyles = {
    danger: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    warning:
        'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    info: 'bg-[#E6F4EC] text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]',
} as const;

const cardClass =
    'rounded-[20px] border border-[#0E3B2E]/10 bg-card  dark:border-white/10';

function VerificationCard({
    status,
    rejectionReason,
}: {
    status?: string;
    rejectionReason?: string | null;
}) {
    const isPending = status === 'pending';
    const isRejected = status === 'rejected';

    const steps = [
        { label: 'Account', state: 'done' },
        { label: 'ID document', state: isPending ? 'done' : 'now' },
        { label: 'Review', state: isPending ? 'now' : 'todo' },
    ] as const;

    return (
        <section
            className={cn(
                cardClass,
                'flex flex-wrap items-center gap-x-6 gap-y-4 px-5 py-[18px]',
            )}
        >
            <div className="flex min-w-0 flex-[1_1_320px] items-center gap-3.5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                    <KeenIcon name="shield-tick" className="text-2xl" />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-[Sora] text-base font-semibold text-foreground">
                            {isPending
                                ? 'Verification under review'
                                : isRejected
                                  ? 'Verification needs attention'
                                  : 'Verify your business'}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                            {isPending ? 'In review' : 'Profile limited'}
                        </span>
                    </div>
                    <span className="text-[13px] text-muted-foreground">
                        {isPending
                            ? "We'll notify you once it's processed. You can keep taking bookings meanwhile."
                            : isRejected
                              ? rejectionReason ||
                                'Your last submission was rejected. Please resubmit a valid document.'
                              : 'Verified pros get the badge and show up higher in search. Takes about 2 minutes.'}
                    </span>
                </div>
            </div>

            <ol className="flex flex-wrap items-center gap-3">
                {steps.map((step, index) => (
                    <li key={step.label} className="flex items-center gap-3">
                        {index > 0 && (
                            <span
                                className="h-0.5 w-[18px] bg-[#A9C7B8]"
                                aria-hidden="true"
                            />
                        )}
                        <span
                            className={cn(
                                'flex items-center gap-2 text-[13px] font-semibold',
                                step.state === 'todo'
                                    ? 'text-muted-foreground'
                                    : 'text-foreground',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-[22px] items-center justify-center rounded-full text-[11px] font-bold',
                                    step.state === 'done' &&
                                        'bg-[#0E3B2E] text-[#C8F169]',
                                    step.state === 'now' &&
                                        'bg-[#C8F169] text-[#0E3B2E]',
                                    step.state === 'todo' &&
                                        'border-[1.5px] border-[#A9C7B8] text-muted-foreground',
                                )}
                            >
                                {step.state === 'done' ? '✓' : ''}
                            </span>
                            {step.label}
                        </span>
                    </li>
                ))}
            </ol>

            {!isPending && (
                <Link
                    href="/onboarding/verification"
                    className="flex h-11 items-center gap-2 rounded-xl bg-[#0E3B2E] px-[18px] text-sm font-semibold text-white transition-colors hover:bg-[#0E3B2E]/90 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                >
                    {isRejected ? 'Resubmit' : 'Verify now'}
                    <KeenIcon name="arrow-right" className="text-base" />
                </Link>
            )}
        </section>
    );
}

function StatCard({
    icon,
    label,
    value,
    change,
    changeSuffix,
}: {
    icon: string;
    label: string;
    value: string;
    change: number;
    changeSuffix: string;
}) {
    const isUp = change >= 0;

    return (
        <div className={cn(cardClass, 'flex flex-col gap-3.5 p-5')}>
            <div className="flex flex-col gap-1">
                <div className='flex items-center justify-between'>
                    <span className="text-[13px] text-muted-foreground">
                        {label}
                    </span>
                    <span
                        className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-bold',
                            isUp
                                ? 'bg-[#E6F4EC] text-[#2F7D4F] dark:bg-[#0E3B2E] dark:text-[#C8F169]'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
                        )}
                    >
                        {isUp ? '↑' : '↓'} {Math.abs(change)}
                        {changeSuffix}
                    </span>
                </div>
                <span className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                    {value}
                </span>
            </div>
            <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
    );
}

export default function Index({
    stats,
    upcomingAppointments,
    needsAttention,
    is_verified,
    verification_status,
    revenueThisWeek = [],
    today = { count: 0, expected_revenue: 0 },
    booking_url,
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const [copied, setCopied] = useState(false);

    const firstName = auth.user.name.split(' ')[0];
    const todayLabel = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
    const nextAppointment = upcomingAppointments[0];
    const attentionItems = needsAttention.filter(
        (item) => item.type !== 'verification_issue',
    );
    const weekTotal = revenueThisWeek.reduce(
        (total, day) => total + day.value,
        0,
    );
    const weekMax = Math.max(...revenueThisWeek.map((day) => day.value), 1);

    const copyBookingLink = async () => {
        if (!booking_url) {
            return;
        }

        await navigator.clipboard.writeText(booking_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Provider Dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <header className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-[1_1_260px] flex-col gap-1">
                        <span className="text-[13px] text-muted-foreground">
                            {todayLabel}
                        </span>
                        <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                            {greeting()}, {firstName}
                        </h1>
                    </div>
                    <Link
                        href={schedule.calender.index()}
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#0E3B2E] px-[18px] text-sm font-semibold text-white transition-colors hover:bg-[#0E3B2E]/90 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                        prefetch
                    >
                        <KeenIcon name="calendar-tick" className="text-lg" />
                        Open calendar
                    </Link>
                </header>

                {!is_verified && (
                    <VerificationCard
                        status={verification_status?.status}
                        rejectionReason={verification_status?.rejection_reason}
                    />
                )}

                {/* Today hero */}
                <section className="relative flex min-h-[200px] flex-wrap items-end justify-between gap-6 overflow-hidden rounded-3xl bg-[#0E3B2E] p-7">
                    <img
                        src="/brand/banners/proxideck-banner-general-dark.svg"
                        alt=""
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
                    />
                    <div className="relative flex flex-[1_1_320px] flex-col gap-2.5">
                        <span className="self-start rounded-full border border-[#C8F169]/35 bg-[#C8F169]/15 px-3 py-1.5 text-xs font-bold text-[#C8F169]">
                            Today
                        </span>
                        <h2 className="font-[Sora] text-[32px] leading-[1.15] font-bold tracking-[-0.02em] text-white">
                            {today.count > 0 ? (
                                <>
                                    You have{' '}
                                    <span className="text-[#C8F169]">
                                        {today.count}{' '}
                                        {today.count === 1
                                            ? 'appointment'
                                            : 'appointments'}
                                    </span>{' '}
                                    today
                                </>
                            ) : (
                                <>
                                    No appointments{' '}
                                    <span className="text-[#C8F169]">
                                        today
                                    </span>
                                </>
                            )}
                        </h2>
                        <span className="text-sm text-white/80">
                            {today.count > 0
                                ? `${naira(today.expected_revenue)} expected from today's bookings`
                                : 'Share your booking link to fill your calendar.'}
                        </span>
                    </div>

                    {nextAppointment && (
                        <Link
                            href={schedule.appointments.index()}
                            className="relative flex flex-[0_1_360px] items-center gap-3.5 rounded-[18px] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                            prefetch
                        >
                            <div className="flex size-[58px] shrink-0 flex-col items-center justify-center rounded-[14px] bg-[#C8F169] text-[#0E3B2E]">
                                <span className="font-[Sora] text-base leading-none font-bold">
                                    {nextAppointment.time.split(' ')[0]}
                                </span>
                                <span className="text-[11px] font-bold">
                                    {nextAppointment.time.split(' ')[1]}
                                </span>
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="text-xs font-bold tracking-[0.06em] text-[#2F7D4F] uppercase">
                                    Up next · {nextAppointment.date}
                                </span>
                                <span className="truncate text-[15px] font-bold text-[#13201B]">
                                    {nextAppointment.client}
                                </span>
                                <span className="truncate text-[13px] text-[#4A5A52]">
                                    {nextAppointment.service}
                                </span>
                            </div>
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0E3B2E] text-white">
                                <KeenIcon
                                    name="arrow-right"
                                    className="text-lg"
                                />
                            </span>
                        </Link>
                    )}
                </section>

                {/* Stats */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                    <StatCard
                        icon="receipt-square"
                        label="Revenue"
                        value={naira(stats.revenue.value)}
                        change={stats.revenue.change}
                        changeSuffix="%"
                    />
                    <StatCard
                        icon="electronic-clock"
                        label="Bookings"
                        value={stats.bookings.value.toLocaleString()}
                        change={stats.bookings.change}
                        changeSuffix="%"
                    />
                    <StatCard
                        icon="people"
                        label="New clients"
                        value={stats.new_clients.value.toLocaleString()}
                        change={stats.new_clients.change}
                        changeSuffix="%"
                    />
                    <StatCard
                        icon="star"
                        label="Rating"
                        value={
                            stats.rating.value > 0
                                ? stats.rating.value.toFixed(1)
                                : 'N/A'
                        }
                        change={stats.rating.change}
                        changeSuffix=""
                    />
                </div>

                {/* Appointments + attention */}
                <div className="flex flex-wrap items-start gap-6">
                    <section
                        className={cn(
                            cardClass,
                            'min-w-0 flex-[999_1_460px] px-6 pt-[22px] pb-2.5',
                        )}
                    >
                        <div className="flex items-center justify-between gap-3 pb-2">
                            <h3 className="font-[Sora] text-lg font-semibold text-foreground">
                                Upcoming appointments
                            </h3>
                            <Link
                                href={schedule.appointments.index()}
                                className="text-[13px] font-bold text-[#0E3B2E] dark:text-[#C8F169]"
                                prefetch
                            >
                                View all →
                            </Link>
                        </div>

                        {upcomingAppointments.length === 0 ? (
                            <EmptyStateInset
                                borderTop
                                title="No upcoming appointments"
                                description="Confirmed bookings will show up here."
                            />
                        ) : (
                            <ul>
                                {upcomingAppointments.map(
                                    (appointment, index) => (
                                        <li
                                            key={appointment.id}
                                            className="flex items-center gap-4 border-t border-[#0E3B2E]/[0.07] py-3.5 dark:border-white/10"
                                        >
                                            <div className="flex w-[72px] shrink-0 flex-col">
                                                <span className="font-[Sora] text-base font-bold text-foreground">
                                                    {appointment.time}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {appointment.date}
                                                </span>
                                            </div>
                                            <span
                                                className={cn(
                                                    'w-[3px] self-stretch rounded-full',
                                                    index === 0
                                                        ? 'bg-[#C8F169]'
                                                        : 'bg-[#A9C7B8]',
                                                )}
                                                aria-hidden="true"
                                            />
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E6F4EC] text-[13px] font-bold text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                                {initials(appointment.client)}
                                            </div>
                                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                                <span className="truncate text-[15px] font-bold text-foreground">
                                                    {appointment.client}
                                                </span>
                                                <span className="truncate text-[13px] text-muted-foreground">
                                                    {appointment.service}
                                                </span>
                                            </div>
                                            <span className="rounded-full bg-[#E6F4EC] px-2.5 py-1 text-xs font-bold text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                                {appointment.status}
                                            </span>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </section>

                    <section
                        className={cn(
                            cardClass,
                            'flex flex-[1_1_300px] flex-col gap-3 p-[22px]',
                        )}
                    >
                        <h3 className="font-[Sora] text-lg font-semibold text-foreground">
                            Needs attention
                        </h3>

                        {attentionItems.length === 0 ? (
                            <EmptyStateInset
                                illustration="notifications"
                                className="flex-1 py-8"
                                title="You're all caught up"
                                description="Nothing needs your decision right now."
                            />
                        ) : (
                            attentionItems.map((item) => (
                                <div
                                    key={item.type}
                                    className="flex items-start gap-3 rounded-[14px] border border-[#0E3B2E]/[0.07] bg-[#F7FAF7] p-3.5 dark:border-white/10 dark:bg-white/[0.03]"
                                >
                                    <div
                                        className={cn(
                                            'flex size-9 shrink-0 items-center justify-center rounded-[10px]',
                                            toneStyles[item.tone],
                                        )}
                                    >
                                        <KeenIcon
                                            name={
                                                attentionIcon[item.type] ??
                                                'information-2'
                                            }
                                            className="text-lg"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-0.5">
                                        <span className="text-sm font-bold text-foreground">
                                            {item.count} · {item.label}
                                        </span>
                                        <span className="text-xs leading-[1.45] text-muted-foreground">
                                            {item.description}
                                        </span>
                                        <Link
                                            href={item.href}
                                            className="mt-1.5 text-[13px] font-bold text-[#0E3B2E] dark:text-[#C8F169]"
                                            prefetch
                                        >
                                            {item.action_label} →
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </div>

                {/* Revenue + booking link */}
                <div className="flex flex-wrap items-stretch gap-6">
                    <section
                        className={cn(
                            cardClass,
                            'flex min-w-0 flex-[999_1_460px] flex-col gap-[18px] px-6 py-[22px]',
                        )}
                    >
                        <div className="flex flex-col gap-1">
                            <h3 className="font-[Sora] text-lg font-semibold text-foreground">
                                Revenue this week
                            </h3>
                            <span className="font-[Sora] text-[26px] font-bold text-[#0E3B2E] dark:text-[#C8F169]">
                                {naira(weekTotal)}
                            </span>
                        </div>
                        <div className="flex h-[190px] items-end gap-3.5">
                            {revenueThisWeek.map((day) => (
                                <div
                                    key={day.date}
                                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                                    title={`${day.label}: ${naira(day.value)}`}
                                >
                                    <div
                                        className={cn(
                                            'w-full max-w-10 rounded-[10px]',
                                            day.is_today
                                                ? 'bg-[#0E3B2E] dark:bg-[#C8F169]'
                                                : 'bg-[#C9E2D3] dark:bg-white/15',
                                        )}
                                        style={{
                                            height: `${Math.max((day.value / weekMax) * 100, 4)}%`,
                                        }}
                                    />
                                    <span
                                        className={cn(
                                            'text-xs text-muted-foreground',
                                            day.is_today &&
                                                'font-bold text-foreground',
                                        )}
                                    >
                                        {day.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {booking_url && (
                        <section className="flex flex-[1_1_300px] flex-col gap-3 rounded-[20px] bg-[#C8F169] p-[22px]">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#0E3B2E] text-[#C8F169]">
                                <KeenIcon name="fasten" className="text-xl" />
                            </div>
                            <h3 className="font-[Sora] text-xl leading-tight font-bold text-[#0E3B2E]">
                                Share your booking link
                            </h3>
                            <p className="text-sm leading-normal text-[#23442F]">
                                Clients book you directly — on WhatsApp,
                                Instagram or your site.
                            </p>
                            <div className="mt-auto flex items-center gap-2 rounded-xl bg-white py-1.5 pr-1.5 pl-3.5">
                                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#13201B]">
                                    {booking_url.replace(/^https?:\/\//, '')}
                                </span>
                                <button
                                    type="button"
                                    onClick={copyBookingLink}
                                    className="flex h-9 items-center gap-1.5 rounded-[9px] bg-[#0E3B2E] px-3 text-[13px] font-bold text-white"
                                >
                                    <KeenIcon name="copy" className="text-sm" />
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
