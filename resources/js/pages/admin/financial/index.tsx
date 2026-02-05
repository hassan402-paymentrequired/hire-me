import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BreadcrumbItem } from '@/types';
import {
    DollarSign,
    TrendingUp,
    AlertTriangle,
    ArrowUpDown,
    Calendar,
} from 'lucide-react';
import { Pagination } from '@/components/pagination';

interface Summary {
    total_revenue: number;
    total_deposits: number;
    total_withdrawals: number;
    total_refunds: number;
    escrow_held: number;
    wallet_balance: number;
}

interface TopProvider {
    provider_id: number;
    provider_name: string;
    appointments_count: number;
    total_revenue: number;
}

interface LargeTransaction {
    id: number;
    type: string;
    amount: number;
    status: string;
    user_name: string;
    user_email: string;
    created_at: string;
    description: string;
}

interface FraudIndicator {
    type: string;
    severity: string;
    user_id: number;
    user_name: string;
    count?: number;
    total_amount?: number;
    time_span_hours?: number;
    description: string;
}

interface Transaction {
    id: number;
    type: string;
    amount: number;
    status: string;
    user_name: string;
    description: string;
    created_at: string;
}

interface Props {
    summary: Summary;
    topProviders: TopProvider[];
    largeTransactions: LargeTransaction[];
    fraudIndicators: {
        multiple_failed: FraudIndicator[];
        rapid_deposits: FraudIndicator[];
        excessive_refunds: FraudIndicator[];
        excessive_withdrawals: FraudIndicator[];
        total_indicators: number;
    };
    dailyRevenue: Array<{
        date: string;
        revenue: number;
    }>;
    transactions: {
        data: Transaction[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        start_date: string;
        end_date: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Financial Reports',
        href: '',
    },
];

export default function FinancialReports({
    summary,
    topProviders,
    largeTransactions,
    fraudIndicators,
    dailyRevenue,
    transactions,
    filters,
}: Props) {
    const { data, setData, get } = useForm({
        start_date: filters.start_date,
        end_date: filters.end_date,
    });

    const handleFilter = () => {
        get('/admin/financial', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'default';
            case 'low':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Reports" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Financial Reports
                        </h1>
                        <p className="text-muted-foreground">
                            Monitor revenue, transactions, and detect fraud
                        </p>
                    </div>
                </div>

                {/* Date Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Date Range</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Start Date
                                </label>
                                <Input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) =>
                                        setData('start_date', e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    End Date
                                </label>
                                <Input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) =>
                                        setData('end_date', e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleFilter} className="w-full">
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₦{summary.total_revenue.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Deposits
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₦{summary.total_deposits.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Withdrawals
                            </CardTitle>
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₦{summary.total_withdrawals.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Refunds
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₦{summary.total_refunds.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Escrow Held
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₦{summary.escrow_held.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Wallet Balance
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₦{summary.wallet_balance.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Fraud Detection */}
                {fraudIndicators.total_indicators > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Fraud Detection Alerts ({fraudIndicators.total_indicators})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {fraudIndicators.rapid_deposits.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">
                                            Rapid Large Deposits
                                        </h4>
                                        <div className="space-y-2">
                                            {fraudIndicators.rapid_deposits.map(
                                                (indicator, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="rounded-lg border p-3"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">
                                                                    {
                                                                        indicator.user_name
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        indicator.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <Badge
                                                                variant={
                                                                    getSeverityColor(
                                                                        indicator.severity
                                                                    ) as any
                                                                }
                                                            >
                                                                {
                                                                    indicator.severity
                                                                }
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {fraudIndicators.multiple_failed.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">
                                            Multiple Failed Transactions
                                        </h4>
                                        <div className="space-y-2">
                                            {fraudIndicators.multiple_failed.map(
                                                (indicator, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="rounded-lg border p-3"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">
                                                                    {
                                                                        indicator.user_name
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        indicator.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <Badge
                                                                variant={
                                                                    getSeverityColor(
                                                                        indicator.severity
                                                                    ) as any
                                                                }
                                                            >
                                                                {
                                                                    indicator.severity
                                                                }
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {fraudIndicators.excessive_refunds.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">
                                            Excessive Refunds
                                        </h4>
                                        <div className="space-y-2">
                                            {fraudIndicators.excessive_refunds.map(
                                                (indicator, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="rounded-lg border p-3"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">
                                                                    {
                                                                        indicator.user_name
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        indicator.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <Badge
                                                                variant={
                                                                    getSeverityColor(
                                                                        indicator.severity
                                                                    ) as any
                                                                }
                                                            >
                                                                {
                                                                    indicator.severity
                                                                }
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Top Providers */}
                {topProviders.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Providers by Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Appointments</TableHead>
                                        <TableHead className="text-right">
                                            Revenue
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProviders.map((provider) => (
                                        <TableRow key={provider.provider_id}>
                                            <TableCell className="font-medium">
                                                {provider.provider_name}
                                            </TableCell>
                                            <TableCell>
                                                {provider.appointments_count}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ₦
                                                {provider.total_revenue.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Large Transactions */}
                {largeTransactions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Large Transactions (₦100,000+)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {largeTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {transaction.user_name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {transaction.user_email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {transaction.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                ₦
                                                {transaction.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        transaction.status ===
                                                        'completed'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {transaction.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    transaction.created_at
                                                ).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* All Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            All Transactions ({transactions.total.toLocaleString()})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No transactions found
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">
                                                    {transaction.user_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {transaction.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    ₦
                                                    {transaction.amount.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            transaction.status ===
                                                            'completed'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {transaction.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {transaction.description}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            transaction.created_at
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="mt-4">
                                    <Pagination links={transactions.links} />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
