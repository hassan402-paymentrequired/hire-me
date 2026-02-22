/* eslint-disable @typescript-eslint/no-explicit-any */
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
    Star,
    Users,
    AlertCircle,
    ShieldCheck,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from '@inertiajs/react';
import { dashboard } from '@/routes/business';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { formatDate } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
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
        id: string;
        action: string;
        description: string;
        created_at: string;
    }>;
    is_verified?: boolean;
    verification_status?: {
        status: string;
        rejection_reason?: string | null;
        created_at: string;
    } | null;
}
 
export default function Index({ stats, upcomingAppointments, recentActivity, is_verified, verification_status }: DashboardProps) {
    const page = usePage();
    const auth = (page.props as any).auth;
    const statCards = [
        {
            title: 'Total Revenue',
            value: `₦${stats.revenue.value.toLocaleString()}`,
            change: stats.revenue.change >= 0 
                ? `+${stats.revenue.change}% from last month`
                : `${stats.revenue.change}% from last month`,
            icon: CreditCard,
        },
        {
            title: 'Bookings',
            value: stats.bookings.value,
            change: stats.bookings.change >= 0
                ? `+${stats.bookings.change}% from last month`
                : `${stats.bookings.change}% from last month`,
            icon: Calendar,
        },
        {
            title: 'New Clients',
            value: stats.new_clients.value,
            change: stats.new_clients.change >= 0
                ? `+${stats.new_clients.change}% from last month`
                : `${stats.new_clients.change}% from last month`,
            icon: Users,
        },
        {
            title: 'Overall Rating',
            value: stats.rating.value > 0 ? stats.rating.value.toFixed(1) : 'N/A',
            change: stats.rating.value > 0
                ? (stats.rating.change >= 0 
                    ? `+${stats.rating.change} from last month`
                    : `${stats.rating.change} from last month`)
                : 'No reviews yet',
            icon: Star,
        },
    ];

    // console.log(recentActivity.pendingAttributes)

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

                {/* Verification Alert */}
                {!is_verified && (
                    <Alert className={
                        verification_status?.status === 'pending'
                            ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900'
                            : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900'
                    }>
                        <AlertCircle className={`h-4 w-4 ${
                            verification_status?.status === 'pending'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-yellow-600 dark:text-yellow-400'
                        }`} />
                        <AlertTitle className={
                            verification_status?.status === 'pending'
                                ? 'text-blue-800 dark:text-blue-200'
                                : 'text-yellow-800 dark:text-yellow-200'
                        }>
                            {verification_status?.status === 'pending' 
                                ? 'Verification Under Review'
                                : 'Verification Required'}
                        </AlertTitle>
                        <AlertDescription className={
                            verification_status?.status === 'pending'
                                ? 'text-blue-700 w-full dark:text-blue-300'
                                : 'text-yellow-700 w-full dark:text-yellow-300'
                        }>
                            <div className="flex items-center justify-between w-full">
                                <p>
                                    {verification_status?.status === 'pending' ? (
                                        <>
                                            <span className="block mt-1 text-sm">
                                                We'll notify you once it's processed. Your business profile will be visible to clients after approval (you can still receive appointments pending the time).
                                            </span>
                                        </>
                                    ) : verification_status?.status === 'rejected' ? (
                                        <>
                                            Your business profile is not visible to clients until you complete verification.
                                            <span className="block mt-1 text-sm">
                                                Your verification was rejected: {verification_status.rejection_reason || 'Please submit a new document.'}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            Your business profile is not visible to clients until you complete verification.
                                        </>
                                    )}
                                </p>
                                {verification_status?.status !== 'pending' && (
                                    <Link href="/onboarding/verification">
                                        <Button size="sm" variant="default" className="ml-4">
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            {verification_status?.status === 'rejected' ? 'Resubmit Verification' : 'Verify Now'}
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

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
                                                    {activity.action}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(activity.created_at)}
                                                </p>
                                            </div>
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
