import KeenIcon from '@/components/keen-icon';
import { EmptyStateInset } from '@/components/site/empty-state';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import business from '@/routes/business';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { PeakHoursChart, RevenueChart } from './components/analytics-charts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: business.dashboard().url,
    },
    {
        title: 'Business',
        href: '/business',
    },
    {
        title: 'Analytics',
        href: '',
    },
];

interface RevenueData {
    label: string;
    value: number;
}

interface TopService {
    name: string;
    bookings: number;
    revenue: number;
    revenue_formatted: string;
    avg_price: number;
}

interface PeakHour {
    hour: number;
    display: string;
    bookings: number;
}

interface GeographicData {
    location: string;
    bookings: number;
    revenue: number;
}

interface AnalyticsProps {
    range: string;
    revenueData: RevenueData[];
    topServices: TopService[];
    peakHours: PeakHour[];
    conversionMetrics: {
        conversion_rate: number;
        confirmation_rate: number;
        total_views: number;
        total_bookings: number;
    };
    retentionMetrics: {
        unique_clients: number;
        returning_clients: number;
        retention_rate: number;
        repeat_bookings: number;
    };
    sentimentData: {
        total: number;
        positive: number;
        neutral: number;
        negative: number;
        average_rating: number;
    };
    geographicData: GeographicData[];
    metrics: {
        totalRevenue: string;
        revenueChange: string;
        totalBookings: number;
        bookingsChange: string;
        cancelRate: string;
        cancelChange: string;
    };
}

export default function Analytics({
    range,
    revenueData,
    topServices,
    peakHours,
    conversionMetrics,
    retentionMetrics,
    sentimentData,
    geographicData,
    metrics,
}: AnalyticsProps) {
    const [selectedRange, setSelectedRange] = useState(range);

    const handleRangeChange = (newRange: string) => {
        setSelectedRange(newRange);
        router.get(
            '/business/analytics',
            { range: newRange },
            { preserveState: true, preserveScroll: true },
        );
    };

    const card =
        'rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10';
    const toNumber = (value: string) =>
        parseFloat(String(value).replace('%', '')) || 0;
    const totalServiceRevenue =
        topServices.reduce((sum, service) => sum + service.revenue, 0) || 1;
    const busiest = peakHours.reduce<PeakHour | null>(
        (top, hour) => (!top || hour.bookings > top.bookings ? hour : top),
        null,
    );
    const maxGeo = Math.max(...geographicData.map((item) => item.bookings), 1);

    const kpis = [
        {
            icon: 'receipt-square',
            label: 'Revenue',
            value: metrics.totalRevenue,
            change: toNumber(metrics.revenueChange),
            goodWhenUp: true,
            note: 'vs previous period',
        },
        {
            icon: 'electronic-clock',
            label: 'Bookings',
            value: metrics.totalBookings.toLocaleString(),
            change: toNumber(metrics.bookingsChange),
            goodWhenUp: true,
            note: 'confirmed and completed',
        },
        {
            icon: 'cross-circle',
            label: 'Cancellation rate',
            value: metrics.cancelRate,
            change: toNumber(metrics.cancelChange),
            goodWhenUp: false,
            note: 'lower is better',
        },
        {
            icon: 'star',
            label: 'Average rating',
            value: sentimentData.average_rating
                ? sentimentData.average_rating.toFixed(1)
                : 'N/A',
            change: null,
            goodWhenUp: true,
            note: `from ${sentimentData.total} review${sentimentData.total === 1 ? '' : 's'}`,
        },
    ];

    const funnel = [
        {
            label: 'Profile views',
            value: conversionMetrics.total_views,
            note: '100%',
            width: 100,
            color: 'bg-[#C9E2D3] dark:bg-white/15',
        },
        {
            label: 'Bookings',
            value: conversionMetrics.total_bookings,
            note: `${conversionMetrics.conversion_rate}% conversion`,
            width: conversionMetrics.total_views
                ? Math.max(
                      (conversionMetrics.total_bookings /
                          conversionMetrics.total_views) *
                          100,
                      4,
                  )
                : 4,
            color: 'bg-[#9BC63A]',
        },
        {
            label: 'Confirmed',
            value: Math.round(
                (conversionMetrics.total_bookings *
                    conversionMetrics.confirmation_rate) /
                    100,
            ),
            note: `${conversionMetrics.confirmation_rate}% confirmed`,
            width: conversionMetrics.total_views
                ? Math.max(
                      ((conversionMetrics.total_bookings *
                          conversionMetrics.confirmation_rate) /
                          100 /
                          conversionMetrics.total_views) *
                          100,
                      3,
                  )
                : 3,
            color: 'bg-[#0E3B2E] dark:bg-[#C8F169]',
        },
    ];

    const sentimentTotal =
        sentimentData.positive +
            sentimentData.neutral +
            sentimentData.negative || 1;
    const sentiment = [
        {
            label: 'Positive',
            value: sentimentData.positive,
            color: 'bg-[#0E3B2E] dark:bg-[#C8F169]',
        },
        {
            label: 'Neutral',
            value: sentimentData.neutral,
            color: 'bg-[#C8F169] dark:bg-[#9BC63A]',
        },
        {
            label: 'Negative',
            value: sentimentData.negative,
            color: 'bg-[#E5928A]',
        },
    ];

    const ringRadius = 48;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const retention = Math.min(
        Math.max(retentionMetrics.retention_rate, 0),
        100,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />

            <div className="flex flex-col gap-[22px] p-4 md:p-6">
                <header className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-[1_1_300px] flex-col gap-1">
                        <span className="text-[13px] text-muted-foreground">
                            Business
                        </span>
                        <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                            Analytics
                        </h1>
                        <span className="text-sm text-muted-foreground">
                            How your business is doing, and where to grow next.
                        </span>
                    </div>
                    <div
                        role="tablist"
                        aria-label="Date range"
                        className="flex gap-1 rounded-xl border border-[#0E3B2E]/10 bg-card p-1 dark:border-white/10"
                    >
                        {[
                            { value: 'this_week', label: 'This week' },
                            { value: 'this_month', label: 'This month' },
                            { value: 'this_year', label: 'This year' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                role="tab"
                                aria-selected={selectedRange === option.value}
                                onClick={() => handleRangeChange(option.value)}
                                className={cn(
                                    'h-10 rounded-[9px] px-3.5 text-sm font-bold transition-colors',
                                    selectedRange === option.value
                                        ? 'bg-[#0E3B2E] text-white dark:bg-[#C8F169] dark:text-[#0E3B2E]'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* KPIs */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                    {kpis.map((kpi) => {
                        const isGood =
                            kpi.change === null ||
                            (kpi.goodWhenUp
                                ? kpi.change >= 0
                                : kpi.change <= 0);

                        return (
                            <div
                                key={kpi.label}
                                className={cn(
                                    card,
                                    'flex flex-col gap-3.5 p-5',
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                        <KeenIcon
                                            name={kpi.icon}
                                            className="text-xl"
                                        />
                                    </div>
                                    {kpi.change !== null && (
                                        <span
                                            className={cn(
                                                'rounded-full px-2.5 py-1 text-xs font-bold',
                                                isGood
                                                    ? 'bg-[#E6F4EC] text-[#2F7D4F] dark:bg-[#0E3B2E] dark:text-[#C8F169]'
                                                    : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
                                            )}
                                        >
                                            {kpi.change >= 0 ? '↑' : '↓'}{' '}
                                            {Math.abs(kpi.change)}%
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[13px] text-muted-foreground">
                                        {kpi.label}
                                    </span>
                                    <span className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                                        {kpi.value}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {kpi.note}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Revenue + funnel */}
                <div className="flex flex-wrap items-stretch gap-6">
                    <section
                        className={cn(
                            card,
                            'flex min-w-0 flex-[999_1_560px] flex-col gap-4 px-6 py-[22px]',
                        )}
                    >
                        <div className="flex flex-col gap-1">
                            <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                                Revenue over time
                            </h2>
                            <span className="font-[Sora] text-[26px] font-bold text-[#0E3B2E] dark:text-[#C8F169]">
                                {metrics.totalRevenue}{' '}
                                <span
                                    className={cn(
                                        'font-sans text-[13px] font-bold',
                                        toNumber(metrics.revenueChange) >= 0
                                            ? 'text-[#2F7D4F] dark:text-[#C8F169]'
                                            : 'text-red-700',
                                    )}
                                >
                                    {toNumber(metrics.revenueChange) >= 0
                                        ? '↑'
                                        : '↓'}{' '}
                                    {Math.abs(toNumber(metrics.revenueChange))}%
                                </span>
                            </span>
                        </div>
                        {revenueData.length === 0 ? (
                            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                                No revenue in this period yet.
                            </div>
                        ) : (
                            <RevenueChart data={revenueData} />
                        )}
                    </section>

                    <section
                        className={cn(
                            card,
                            'flex flex-[1_1_300px] flex-col gap-3.5 p-[22px]',
                        )}
                    >
                        <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                            From view to booking
                        </h2>
                        {funnel.map((step) => (
                            <div
                                key={step.label}
                                className="flex flex-col gap-1.5"
                            >
                                <div className="flex justify-between text-[13px]">
                                    <span className="font-bold text-foreground">
                                        {step.label}
                                    </span>
                                    <span className="text-muted-foreground">
                                        <b className="text-foreground">
                                            {step.value.toLocaleString()}
                                        </b>{' '}
                                        · {step.note}
                                    </span>
                                </div>
                                <div className="h-[30px] overflow-hidden rounded-[10px] bg-muted">
                                    <div
                                        className={cn(
                                            'h-full rounded-[10px]',
                                            step.color,
                                        )}
                                        style={{
                                            width: `${Math.min(step.width, 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="mt-auto flex gap-2.5 rounded-[14px] bg-muted/60 px-3.5 py-3 text-[13px] leading-normal text-muted-foreground">
                            <KeenIcon
                                name="information-2"
                                className="mt-0.5 text-lg text-[#0E3B2E] dark:text-[#C8F169]"
                            />
                            Share your booking link to turn more views into
                            bookings.
                        </div>
                    </section>
                </div>

                {/* Top services + peak hours */}
                <div className="flex flex-wrap items-stretch gap-6">
                    <section
                        className={cn(
                            card,
                            'flex flex-[1_1_320px] flex-col gap-1 p-[22px]',
                        )}
                    >
                        <div className="flex items-center justify-between pb-1.5">
                            <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                                Top services
                            </h2>
                            <Link
                                href={business.services()}
                                className="text-[13px] font-bold text-[#0E3B2E] dark:text-[#C8F169]"
                                prefetch
                            >
                                All services →
                            </Link>
                        </div>
                        {topServices.length === 0 ? (
                            <EmptyStateInset
                                borderTop
                                illustration="reviews"
                                className="min-h-[200px] justify-center"
                                title="No service data yet"
                                description="When clients book you in this period, your best-performing services show up here."
                            />
                        ) : (
                            topServices.map((service) => {
                            const share = Math.round(
                                (service.revenue / totalServiceRevenue) * 100,
                            );

                            return (
                                <div
                                    key={service.name}
                                    className="flex flex-col gap-1.5 border-t border-[#0E3B2E]/[0.07] py-2.5 dark:border-white/10"
                                >
                                    <div className="flex justify-between gap-2.5">
                                        <span className="truncate text-sm font-bold text-foreground capitalize">
                                            {service.name}
                                        </span>
                                        <span className="font-[Sora] text-sm font-bold text-[#0E3B2E] dark:text-[#C8F169]">
                                            {service.revenue_formatted}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-[#0E3B2E] dark:bg-[#C8F169]"
                                                style={{ width: `${share}%` }}
                                            />
                                        </div>
                                        <span className="w-[120px] text-right text-xs text-muted-foreground">
                                            {service.bookings} bookings ·{' '}
                                            {share}%
                                        </span>
                                    </div>
                                </div>
                            );
                            })
                        )}
                    </section>

                    <section
                        className={cn(
                            card,
                            'flex flex-[1_1_320px] flex-col gap-3.5 p-[22px]',
                        )}
                    >
                        <div className="flex flex-col gap-0.5">
                            <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                                Busiest hours
                            </h2>
                            {busiest && busiest.bookings > 0 && (
                                <span className="text-[13px] text-muted-foreground">
                                    Most bookings start at{' '}
                                    <b className="text-foreground">
                                        {busiest.display}
                                    </b>
                                </span>
                            )}
                        </div>
                        {peakHours.length === 0 ? (
                            <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
                                No bookings in this period yet.
                            </div>
                        ) : (
                            <PeakHoursChart
                                data={peakHours}
                                busiestHour={
                                    busiest && busiest.bookings > 0
                                        ? busiest.hour
                                        : null
                                }
                            />
                        )}
                    </section>
                </div>

                {/* Loyalty, sentiment, geography */}
                <div className="flex flex-wrap items-stretch gap-6">
                    <section
                        className={cn(
                            card,
                            'flex flex-[1_1_300px] flex-col gap-3.5 p-[22px]',
                        )}
                    >
                        <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                            Client loyalty
                        </h2>
                        <div className="flex items-center gap-5">
                            <svg
                                width="128"
                                height="128"
                                viewBox="0 0 128 128"
                                role="img"
                                aria-label={`${retention}% of clients come back`}
                                className="shrink-0"
                            >
                                <circle
                                    cx="64"
                                    cy="64"
                                    r={ringRadius}
                                    fill="none"
                                    strokeWidth="16"
                                    className="stroke-muted"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r={ringRadius}
                                    fill="none"
                                    strokeWidth="16"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(ringCircumference * retention) / 100} ${ringCircumference}`}
                                    transform="rotate(-90 64 64)"
                                    className="stroke-[#0E3B2E] dark:stroke-[#C8F169]"
                                />
                                <text
                                    x="64"
                                    y="62"
                                    textAnchor="middle"
                                    className="fill-foreground font-[Sora] text-2xl font-bold"
                                >
                                    {Math.round(retention)}%
                                </text>
                                <text
                                    x="64"
                                    y="80"
                                    textAnchor="middle"
                                    className="fill-muted-foreground text-[11px]"
                                >
                                    come back
                                </text>
                            </svg>
                            <div className="flex flex-col gap-3">
                                {[
                                    {
                                        value: retentionMetrics.unique_clients,
                                        label: 'unique clients',
                                    },
                                    {
                                        value: retentionMetrics.returning_clients,
                                        label: 'returning clients',
                                    },
                                    {
                                        value: retentionMetrics.repeat_bookings,
                                        label: 'repeat bookings',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex flex-col"
                                    >
                                        <span className="font-[Sora] text-[22px] font-bold text-foreground">
                                            {item.value.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        className={cn(
                            card,
                            'flex flex-[1_1_300px] flex-col gap-3.5 p-[22px]',
                        )}
                    >
                        <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                            What clients say
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="font-[Sora] text-[40px] font-bold text-[#0E3B2E] dark:text-[#C8F169]">
                                {sentimentData.average_rating
                                    ? sentimentData.average_rating.toFixed(1)
                                    : '–'}
                            </span>
                            <div className="flex flex-col gap-1">
                                <div className="flex gap-0.5 text-[#E8A317]">
                                    {Array.from({ length: 5 }).map(
                                        (_, index) => (
                                            <KeenIcon
                                                key={index}
                                                name="star"
                                                className={cn(
                                                    'text-base',
                                                    index >=
                                                        Math.round(
                                                            sentimentData.average_rating,
                                                        ) && 'opacity-30',
                                                )}
                                            />
                                        ),
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {sentimentData.total} review
                                    {sentimentData.total === 1 ? '' : 's'}
                                </span>
                            </div>
                        </div>
                        <div className="flex h-3 gap-[3px] overflow-hidden rounded-full bg-muted">
                            {sentiment.map((item) =>
                                item.value > 0 ? (
                                    <div
                                        key={item.label}
                                        className={item.color}
                                        style={{
                                            width: `${(item.value / sentimentTotal) * 100}%`,
                                        }}
                                    />
                                ) : null,
                            )}
                        </div>
                        <div className="flex flex-col gap-2 text-[13px]">
                            {sentiment.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex justify-between text-foreground"
                                >
                                    <span className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                'size-2.5 rounded-[3px]',
                                                item.color,
                                            )}
                                        />
                                        {item.label}
                                    </span>
                                    <b>{item.value}</b>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section
                        className={cn(
                            card,
                            'flex flex-[1_1_300px] flex-col gap-1 p-[22px]',
                        )}
                    >
                        <h2 className="mb-1.5 font-[Sora] text-lg font-semibold text-foreground">
                            Where clients come from
                        </h2>
                        {geographicData.length === 0 ? (
                            <EmptyStateInset
                                borderTop
                                illustration="search"
                                className="min-h-[200px] justify-center"
                                title="No location data yet"
                                description="Areas show up here once clients book and share where they’re coming from."
                            />
                        ) : (
                            geographicData.slice(0, 5).map((item) => (
                            <div
                                key={item.location}
                                className="flex items-center gap-3 border-t border-[#0E3B2E]/[0.07] py-2.5 dark:border-white/10"
                            >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                    <KeenIcon
                                        name="geolocation"
                                        className="text-lg"
                                    />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                    <div className="flex justify-between gap-2">
                                        <span className="truncate text-sm font-bold text-foreground">
                                            {item.location}
                                        </span>
                                        <span className="text-[13px] whitespace-nowrap text-muted-foreground">
                                            {item.bookings} bookings
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-[#9BC63A]"
                                            style={{
                                                width: `${(item.bookings / maxGeo) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            ))
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
