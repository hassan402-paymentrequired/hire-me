import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    ArchiveIcon,
    ArrowUpRight,
    Calendar,
    Clock,
    CreditCard,
    MoreHorizontal,
    Plus,
    Star,
    Users,
} from 'lucide-react';
import { dashboard } from '@/routes/business';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

interface DashboardProps {
    stats: {
        revenue: { value: number; change: number };
        bookings: { value: number; change: number };
        new_clients: { value: number; change: number };
        rating: { value: number; change: number };
    };
    upcomingAppointments: Array<{
        id: number;
        client: string;
        service: string;
        time: string;
        date: string;
        status: string;
        avatar: string;
    }>;
    recentActivity: Array<{
        id: number;
        message: string;
        time: string;
    }>;
}

export default function Index({ stats, upcomingAppointments, recentActivity }: DashboardProps) {
    const auth = usePage().props.auth;
    const statCards = [
        {
            title: 'Total Revenue',
            value: `₦${stats.revenue.value.toLocaleString()}`,
            change: `+${stats.revenue.change}% from last month`,
            icon: CreditCard,
        },
        {
            title: 'Bookings',
            value: stats.bookings.value,
            change: `+${stats.bookings.change}% from last month`,
            icon: Calendar,
        },
        {
            title: 'New Clients',
            value: stats.new_clients.value,
            change: `+${stats.new_clients.change}% from last month`,
            icon: Users,
        },
        {
            title: 'Overall Rating',
            value: stats.rating.value,
            change: `+${stats.rating.change} from last month`,
            icon: Star,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Provider Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                {/* Header & Quick Actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Welcome back, {auth.user.name}!
                        </h1>
                        <p className="text-muted-foreground">
                            Here's what's happening with your business today.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stat.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Upcoming Schedule (4 cols) */}
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Upcoming Schedule</CardTitle>
                            <CardDescription>
                                You have {upcomingAppointments.length}{' '}
                                appointments left today.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingAppointments.length === 0 ? (
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="default">
                                                <ArchiveIcon />
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                No Upcoming Appointment
                                            </EmptyTitle>
                                        </EmptyHeader>
                                    </Empty>
                                ) : (
                                    upcomingAppointments.map((apt) => (
                                        <div
                                            key={apt.id}
                                            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage
                                                        src={apt.avatar}
                                                        alt={apt.client}
                                                    />
                                                    <AvatarFallback>
                                                        {apt.client.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1">
                                                    <p className="text-sm leading-none font-medium">
                                                        {apt.client}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {apt.service}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="flex items-center text-sm font-medium">
                                                        <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                                                        {apt.time}
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            apt.status ===
                                                            'Confirmed'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="mt-1"
                                                    >
                                                        {apt.status}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity (3 cols) */}
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest improvements and updates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {recentActivity.length === 0 ? (
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="default">
                                                <ArchiveIcon />
                                            </EmptyMedia>
                                            <EmptyTitle>
                                                No Recent Activity
                                            </EmptyTitle>
                                        </EmptyHeader>
                                    </Empty>
                                ) : (
                                    recentActivity.map((activity, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start"
                                        >
                                            <span className="relative mr-4 flex h-2 w-2 shrink-0 translate-y-2 rounded-full bg-sky-500" />
                                            <div className="space-y-1">
                                                <p className="text-sm leading-none font-medium">
                                                    {activity.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.time}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="ml-auto h-6 w-6"
                                            >
                                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
