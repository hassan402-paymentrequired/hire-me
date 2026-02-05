import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    DollarSign,
    FileText,
    Shield,
    Users,
    XCircle,
} from 'lucide-react';

interface Stats {
    users: {
        total: number;
        new_this_month: number;
        new_this_week: number;
        providers: number;
        clients: number;
        verified_providers: number;
    };
    appointments: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        this_month: number;
        today: number;
    };
    financial: {
        total_revenue: number;
        revenue_this_month: number;
        escrow_held: number;
        wallet_balance: number;
        total_transactions: number;
        transactions_this_month: number;
    };
    verifications: {
        pending: number;
        approved: number;
        rejected: number;
    };
    moderation: {
        total_reports: number;
        unresolved_reports: number;
        total_reviews: number;
    };
}

interface RecentReport {
    id: number;
    reason: string;
    description: string;
    user_name: string;
    appointment_id: number | null;
    created_at: string;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    role: string;
    is_provider: boolean;
    created_at: string;
}

interface Props {
    stats: Stats;
    recentReports: RecentReport[];
    recentUsers: RecentUser[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '',
    },
];

export default function AdminDashboard({
    stats,
    recentReports,
    recentUsers,
}: Props) {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Overview of platform statistics and activity
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Users Stats */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.users.total.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.users.new_this_month} new this month
                            </p>
                        </CardContent>
                    </Card>

                    {/* Appointments Stats */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Appointments
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.appointments.total.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.appointments.pending} pending
                            </p>
                        </CardContent>
                    </Card>

                    {/* Revenue Stats */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₦
                                {stats.financial.total_revenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ₦
                                {stats.financial.revenue_this_month.toLocaleString()}{' '}
                                this month
                            </p>
                        </CardContent>
                    </Card>

                    {/* Pending Verifications */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Verifications
                            </CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.verifications.pending}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.verifications.approved} approved
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* User Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                User Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Providers
                                </span>
                                <span className="font-medium">
                                    {stats.users.providers}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Clients
                                </span>
                                <span className="font-medium">
                                    {stats.users.clients}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Verified Providers
                                </span>
                                <span className="font-medium">
                                    {stats.users.verified_providers}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appointment Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Appointment Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm text-muted-foreground">
                                        Pending
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {stats.appointments.pending}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm text-muted-foreground">
                                        Confirmed
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {stats.appointments.confirmed}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-muted-foreground">
                                        Completed
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {stats.appointments.completed}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-muted-foreground">
                                        Cancelled
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {stats.appointments.cancelled}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Financial Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Escrow Held
                                </span>
                                <span className="font-medium">
                                    ₦
                                    {stats.financial.escrow_held.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Wallet Balance
                                </span>
                                <span className="font-medium">
                                    ₦
                                    {stats.financial.wallet_balance.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Total Transactions
                                </span>
                                <span className="font-medium">
                                    {stats.financial.total_transactions.toLocaleString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Reports */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Recent Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentReports.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No recent reports
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentReports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="rounded-lg border p-3"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {report.reason}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {report.user_name}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        report.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Recent Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No recent users
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
