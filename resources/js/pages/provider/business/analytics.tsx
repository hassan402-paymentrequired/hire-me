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
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Business',
        href: '/business',
    },
    {
        title: 'Analytics',
        href: '/business/analytics',
    },
];

const revenueData = [
    { month: 'Jan', value: 35000 },
    { month: 'Feb', value: 42000 },
    { month: 'Mar', value: 38000 },
    { month: 'Apr', value: 55000 },
    { month: 'May', value: 62000 },
    { month: 'Jun', value: 58000 },
    { month: 'Jul', value: 75000 },
    { month: 'Aug', value: 82000 },
    { month: 'Sep', value: 80000 },
    { month: 'Oct', value: 95000 },
    { month: 'Nov', value: 90000 },
    { month: 'Dec', value: 110000 },
];

const maxRevenue = Math.max(...revenueData.map((d) => d.value));

const topServices = [
    { name: 'Full Body Massage', bookings: 145, revenue: '₦3,625,000' },
    { name: 'Facial Treatment', bookings: 98, revenue: '₦1,470,000' },
    { name: 'Haircut & Shave', bookings: 210, revenue: '₦1,050,000' },
    { name: 'Manicure & Pedicure', bookings: 85, revenue: '₦1,020,000' },
];

export default function Analytics() {
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
                            <div className="text-2xl font-bold">₦8.4M</div>
                            <p className="flex items-center text-xs text-green-500">
                                <ArrowUpRight className="mr-1 h-3 w-3" />
                                +20.1% from last month
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
                            <div className="text-2xl font-bold">538</div>
                            <p className="flex items-center text-xs text-green-500">
                                <ArrowUpRight className="mr-1 h-3 w-3" />
                                +12% from last month
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
                            <div className="text-2xl font-bold">4.2%</div>
                            <p className="flex items-center text-xs text-red-500">
                                <ArrowDownRight className="mr-1 h-3 w-3" />
                                +1.2% from last month
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
