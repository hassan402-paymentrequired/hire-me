import KeenIcon from '@/components/keen-icon';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    MapPin,
    Star,
    Download,
} from 'lucide-react';
import business from '@/routes/business';
import { useState } from 'react';

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

    const maxRevenue = Math.max(...revenueData.map((d) => d.value), 1);
    const maxBookings = Math.max(...peakHours.map((h) => h.bookings), 1);
    const totalServiceRevenue = topServices.reduce(
        (sum, service) => sum + service.revenue,
        0,
    );
    const revenueChangeValue = parseFloat(metrics.revenueChange.replace('%', ''));
    const bookingsChangeValue = parseFloat(metrics.bookingsChange.replace('%', ''));
    const cancelChangeValue = parseFloat(metrics.cancelChange.replace('%', ''));
    const overviewCards = [
        {
            title: 'Total Revenue',
            value: metrics.totalRevenue,
            change: metrics.revenueChange,
            changeValue: revenueChangeValue,
            positiveTone: true,
            icon: 'receipt-square',
            note: 'Revenue generated in the selected range',
        },
        {
            title: 'Bookings',
            value: metrics.totalBookings.toLocaleString(),
            change: metrics.bookingsChange,
            changeValue: bookingsChangeValue,
            positiveTone: true,
            icon: 'people',
            note: 'Confirmed and completed bookings combined',
        },
        {
            title: 'Cancel Rate',
            value: metrics.cancelRate,
            change: metrics.cancelChange,
            changeValue: cancelChangeValue,
            positiveTone: false,
            icon: 'status',
            note: 'Share of appointments that did not go through',
        },
    ];
    const handleRangeChange = (newRange: string) => {
        setSelectedRange(newRange);
        router.get('/business/analytics', { range: newRange }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDownloadReport = () => {
        return;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />
            <div className="flex flex-col gap-6 p-4">
                <section className="overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/30">
                    <div className="flex flex-col gap-5 px-5 py-6 lg:flex-row lg:items-start lg:justify-between lg:px-7">
                        <div className="space-y-4">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                                <KeenIcon name="status" className="text-sm text-primary" />
                                Performance snapshot
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Business analytics
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Track how bookings, revenue, services, and client retention are moving so you can make better business decisions.
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                            <Select
                                value={selectedRange}
                                onValueChange={handleRangeChange}
                            >
                                <SelectTrigger className="w-full min-w-[180px] bg-background sm:w-[190px]">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Select Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="this_week">
                                        This Week
                                    </SelectItem>
                                    <SelectItem value="this_month">
                                        This Month
                                    </SelectItem>
                                    <SelectItem value="this_year">
                                        This Year
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={handleDownloadReport}
                                disabled
                                className="w-full sm:w-auto"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export soon
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 md:grid-cols-3">
                    {overviewCards.map((card) => {
                        const isPositive = card.positiveTone
                            ? card.changeValue >= 0
                            : card.changeValue < 0;

                        return (
                            <Card key={card.title} className="border-border/70 shadow-none">
                                <CardHeader className="space-y-4 pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                {card.title}
                                            </CardTitle>
                                            <div className="text-2xl font-semibold tracking-tight">
                                                {card.value}
                                            </div>
                                        </div>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-foreground">
                                            <KeenIcon name={card.icon} className="text-base" />
                                        </div>
                                    </div>
                                    <CardDescription className="text-xs leading-5">
                                        {card.note}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                        isPositive
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-rose-50 text-rose-700'
                                    }`}>
                                        {isPositive ? (
                                            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                                        ) : (
                                            <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
                                        )}
                                        {card.change} from last period
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Tabs defaultValue="revenue" className="space-y-4">
                    <div className="overflow-x-auto pb-1">
                        <TabsList className="inline-flex h-auto min-w-max items-center gap-2 rounded-2xl border border-border/70 bg-muted/50 p-1">
                            <TabsTrigger value="revenue" className="rounded-xl px-4 py-2.5">
                                Revenue
                            </TabsTrigger>
                            <TabsTrigger value="bookings" className="rounded-xl px-4 py-2.5">
                                Bookings
                            </TabsTrigger>
                            <TabsTrigger value="services" className="rounded-xl px-4 py-2.5">
                                Services
                            </TabsTrigger>
                            <TabsTrigger value="customers" className="rounded-xl px-4 py-2.5">
                                Customers
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="rounded-xl px-4 py-2.5">
                                Reviews
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Revenue Tab */}
                    <TabsContent value="revenue" className="space-y-4">
                        <Card className="border-border/70 shadow-none">
                            <CardHeader className="space-y-1 pb-3">
                                <CardTitle>Revenue Overview</CardTitle>
                                <CardDescription>
                                    {selectedRange === 'this_week' ? 'Daily' : selectedRange === 'this_month' ? 'Weekly' : 'Monthly'} revenue performance.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 pb-5 pt-0 sm:px-6">
                                <div className="flex h-[300px] items-end gap-2 sm:gap-4">
                                    {revenueData.map((data, i) => (
                                        <div
                                            key={i}
                                            className="group relative flex flex-1 flex-col items-center justify-end gap-2 h-full"
                                        >
                                            <div
                                                className="w-full rounded-t-md bg-primary transition-all group-hover:bg-primary/80"
                                                style={{
                                                    height: `${(data.value / maxRevenue) * 100}%`,
                                                }}
                                            ></div>
                                            <span className="text-xs text-muted-foreground text-center">
                                                {data.label}
                                            </span>
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 whitespace-nowrap z-10">
                                                ₦{data.value.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Bookings Tab */}
                    <TabsContent value="bookings" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader className="space-y-1 pb-3">
                                    <CardTitle>Peak Hours</CardTitle>
                                    <CardDescription>
                                        Most popular booking times.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="overflow-x-auto pb-2">
                                        <div className="flex h-[300px] min-w-[680px] items-end gap-1 px-2 pb-4 sm:min-w-0 sm:px-4">
                                        {peakHours.map((hour, i) => (
                                            <div
                                                key={i}
                                                className="group relative flex flex-1 flex-col items-center justify-end gap-1 h-full"
                                            >
                                                <div
                                                    className="w-full rounded-t-md bg-blue-500 transition-all group-hover:bg-blue-600"
                                                    style={{
                                                        height: `${(hour.bookings / maxBookings) * 100}%`,
                                                    }}
                                                ></div>
                                                <span className="text-[9px] text-muted-foreground text-center rotate-90 origin-center whitespace-nowrap">
                                                    {hour.display}
                                                </span>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 whitespace-nowrap z-10">
                                                    {hour.bookings} bookings
                                                </div>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 shadow-none">
                                <CardHeader className="space-y-1 pb-3">
                                    <CardTitle>Booking Conversion</CardTitle>
                                    <CardDescription>
                                        Conversion and confirmation rates.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Profile Views</span>
                                            <span className="font-semibold">{conversionMetrics.total_views.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Total Bookings</span>
                                            <span className="font-semibold">{conversionMetrics.total_bookings.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Conversion Rate</span>
                                            <span className="font-semibold text-primary">{conversionMetrics.conversion_rate.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Confirmation Rate</span>
                                            <span className="font-semibold text-green-600">{conversionMetrics.confirmation_rate.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Services Tab */}
                    <TabsContent value="services" className="space-y-4">
                        <Card className="border-border/70 shadow-none">
                            <CardHeader className="space-y-1 pb-3">
                                <CardTitle>Top Performing Services</CardTitle>
                                <CardDescription>
                                    Services contributing most to revenue.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-6">
                                    {topServices.map((service, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col gap-3 rounded-lg border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex min-w-0 items-start gap-4">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary font-bold">
                                                    {i + 1}
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <p className="break-words text-sm font-medium leading-5 sm:leading-none">
                                                        {service.name}
                                                    </p>
                                                    <p className="break-words text-xs text-muted-foreground">
                                                        {service.bookings} bookings • Avg: ₦{service.avg_price.toLocaleString()}
                                                    </p>
                                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-primary transition-all"
                                                            style={{
                                                                width: `${totalServiceRevenue > 0 ? (service.revenue / totalServiceRevenue) * 100 : 0}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <div className="text-sm font-semibold">
                                                    {service.revenue_formatted}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {(totalServiceRevenue > 0
                                                        ? (service.revenue / totalServiceRevenue) * 100
                                                        : 0
                                                    ).toFixed(1)}
                                                    % of total
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Customers Tab */}
                    <TabsContent value="customers" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader className="space-y-1 pb-3">
                                    <CardTitle>Customer Retention</CardTitle>
                                    <CardDescription>
                                        Returning customer metrics.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Unique Clients</span>
                                            <span className="font-semibold">{retentionMetrics.unique_clients}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Returning Clients</span>
                                            <span className="font-semibold text-primary">{retentionMetrics.returning_clients}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Retention Rate</span>
                                            <span className="font-semibold text-green-600">{retentionMetrics.retention_rate.toFixed(2)}%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Repeat Bookings</span>
                                            <span className="font-semibold">{retentionMetrics.repeat_bookings}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 shadow-none">
                                <CardHeader className="space-y-1 pb-3">
                                    <CardTitle>Geographic Demand</CardTitle>
                                    <CardDescription>
                                        Top locations by bookings.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {geographicData.length > 0 ? (
                                            geographicData.map((geo, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm font-medium">{geo.location}</p>
                                                            <p className="text-xs text-muted-foreground">{geo.bookings} bookings</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold">₦{geo.revenue.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No geographic data available
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-4">
                        <Card className="border-border/70 shadow-none">
                            <CardHeader className="space-y-1 pb-3">
                                <CardTitle>Review Sentiment Analysis</CardTitle>
                                <CardDescription>
                                    Customer feedback breakdown.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-center gap-2">
                                    <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                                    <div>
                                        <div className="text-3xl font-bold">
                                            {sentimentData.average_rating.toFixed(1)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Average Rating ({sentimentData.total} reviews)
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-green-600">Positive (4-5 stars)</span>
                                            <span className="text-sm font-semibold">{sentimentData.positive.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{ width: `${sentimentData.positive}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-yellow-600">Neutral (3 stars)</span>
                                            <span className="text-sm font-semibold">{sentimentData.neutral.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-yellow-500 h-2 rounded-full"
                                                style={{ width: `${sentimentData.neutral}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-red-600">Negative (1-2 stars)</span>
                                            <span className="text-sm font-semibold">{sentimentData.negative.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-red-500 h-2 rounded-full"
                                                style={{ width: `${sentimentData.negative}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
