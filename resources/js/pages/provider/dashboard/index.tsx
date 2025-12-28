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
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    Calendar,
    Clock,
    CreditCard,
    MoreHorizontal,
    Plus,
    Star,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

// Mock Data
const stats = [
    {
        title: 'Total Revenue',
        value: '₦8,450,000',
        change: '+20.1% from last month',
        icon: CreditCard,
    },
    {
        title: 'Bookings',
        value: '+2350',
        change: '+180.1% from last month',
        icon: Calendar,
    },
    {
        title: 'New Clients',
        value: '+34',
        change: '+19% from last month',
        icon: Users,
    },
    {
        title: 'Overall Rating',
        value: '4.9',
        change: '+0.1 from last month',
        icon: Star,
    },
];

const upcomingAppointments = [
    {
        id: 1,
        client: 'Tunde Adebayo',
        service: 'Full Body Massage',
        time: '10:00 AM',
        date: 'Today',
        status: 'Confirmed',
        avatar: 'https://i.pravatar.cc/150?u=1',
    },
    {
        id: 2,
        client: 'Chioma Onu',
        service: 'Facial Treatment',
        time: '12:30 PM',
        date: 'Today',
        status: 'Confirmed',
        avatar: 'https://i.pravatar.cc/150?u=2',
    },
    {
        id: 3,
        client: 'Emeka Okafor',
        service: 'Haircut & Shave',
        time: '02:00 PM',
        date: 'Today',
        status: 'Pending',
        avatar: 'https://i.pravatar.cc/150?u=3',
    },
];

const recentActivity = [
    {
        id: 1,
        message: 'New booking from Sarah James',
        time: '2 mins ago',
        icon: Calendar,
    },
    {
        id: 2,
        message: 'Payment received from Tunde',
        time: '1 hour ago',
        icon: CreditCard,
    },
    {
        id: 3,
        message: 'New review (5 stars) from Ali',
        time: '3 hours ago',
        icon: Star,
    },
    {
        id: 4,
        message: 'Appointment completed: Emeka',
        time: '5 hours ago',
        icon: Activity,
    },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Provider Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                {/* Header & Quick Actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Welcome back, Provider!
                        </h1>
                        <p className="text-muted-foreground">
                            Here's what's happening with your business today.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Appointment
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
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
                                You have {upcomingAppointments.length} appointments left today.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingAppointments.map((apt) => (
                                    <div
                                        key={apt.id}
                                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
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
                                                <p className="text-sm font-medium leading-none">
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
                                ))}
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
                                {recentActivity.map((activity, i) => (
                                    <div key={i} className="flex items-start">
                                        <span className="relative flex h-2 w-2 translate-y-2 rounded-full bg-sky-500 mr-4 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
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
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
