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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Briefcase,
    Calendar,
} from 'lucide-react';
import business from '@/routes/business';

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

interface AnalyticsProps {
    revenueData: Array<{ month: string; value: number }>;
    topServices: Array<{ name: string; bookings: number; revenue: string }>;
    metrics: {
        totalRevenue: string;
        revenueChange: string;
        totalBookings: number;
        bookingsChange: string;
        cancelRate: string;
        cancelChange: string;
    };
}

export default function Analytics({ revenueData, topServices, metrics }: AnalyticsProps) {

    const maxRevenue = Math.max(...revenueData.map((d) => d.value));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Business Analytics
                        </h1>
                        <p className="text-muted-foreground">
                            Track your performance and growth.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select defaultValue="this_year">
                            <SelectTrigger className="w-[180px]">
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
                        <Button variant="outline">Download Report</Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <span className="text-muted-foreground">$</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalRevenue}</div>
                            <p className="flex items-center text-xs text-green-500">
                                <ArrowUpRight className="mr-1 h-3 w-3" />
                                {metrics.revenueChange} from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Bookings
                            </CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalBookings}</div>
                            <p className="flex items-center text-xs text-green-500">
                                <ArrowUpRight className="mr-1 h-3 w-3" />
                                {metrics.bookingsChange} from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Cancel Rate
                            </CardTitle>
                            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.cancelRate}</div>
                            <p className="flex items-center text-xs text-red-500">
                                <ArrowDownRight className="mr-1 h-3 w-3" />
                                {metrics.cancelChange} from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Charts Area */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Revenue Overview</CardTitle>
                            <CardDescription>
                                Monthly revenue performance for 2025.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="flex h-[300px] items-end gap-2 sm:gap-4 px-4 pb-4">
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
                                        <span className="text-xs text-muted-foreground">
                                            {data.month}
                                        </span>
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 whitespace-nowrap z-10">
                                            ₦{data.value.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Services */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Top Performing Services</CardTitle>
                            <CardDescription>
                                Services contributing most to revenue.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {topServices.map((service, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary font-bold">
                                                {i + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {service.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {service.bookings} bookings
                                                </p>
                                            </div>
                                        </div>
                                        <div className="font-semibold text-sm">
                                            {service.revenue}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

function ActivityIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  )
}
