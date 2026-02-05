import AdminLayout from '@/layouts/admin-layout';
import { Head,  useForm } from '@inertiajs/react';
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
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';
import {
    CheckCircle2,
    AlertCircle,
    Calendar,
} from 'lucide-react';
import { Pagination } from '@/components/pagination';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface Report {
    id: number;
    reason: string;
    description: string;
    user_name: string;
    user_email: string;
    appointment_id: number | null;
    provider_name: string;
    resolved_at: string | null;
    resolved_by: number | null;
    created_at: string;
}

interface Props {
    reports: {
        data: Report[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
        reason?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Moderation',
        href: '',
    },
    {
        title: 'Reports',
        href: '',
    },
];

export default function ModerationReports({ reports, filters }: Props) {
    const [resolvingReport, setResolvingReport] = useState<Report | null>(null);
    const [actionTaken, setActionTaken] = useState('');
    const [penaltyApplied, setPenaltyApplied] = useState('');

    const { data, setData, get, post, processing } = useForm({
        status: filters.status || '',
        reason: filters.reason || '',
    });

    const handleFilter = () => {
        get('/admin/moderation/reports', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResolve = () => {
        if (!resolvingReport) return;

        post(`/admin/moderation/reports/${resolvingReport.id}/resolve`, {
            data: {
                action_taken: actionTaken,
                penalty_applied: penaltyApplied || null,
            },
            onSuccess: () => {
                setResolvingReport(null);
                setActionTaken('');
                setPenaltyApplied('');
            },
        });
    };

    const getReasonBadgeVariant = (reason: string) => {
        switch (reason.toLowerCase()) {
            case 'fraud':
            case 'scam':
                return 'destructive';
            case 'inappropriate':
            case 'harassment':
                return 'default';
            default:
                return 'secondary';
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Moderation - Reports" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        User Reports
                    </h1>
                    <p className="text-muted-foreground">
                        Review and resolve user reports
                    </p>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Status
                                </label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="unresolved">
                                            Unresolved
                                        </SelectItem>
                                        <SelectItem value="resolved">
                                            Resolved
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Reason
                                </label>
                                <Select
                                    value={data.reason}
                                    onValueChange={(value) =>
                                        setData('reason', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All reasons" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All reasons</SelectItem>
                                        <SelectItem value="fraud">Fraud</SelectItem>
                                        <SelectItem value="inappropriate">
                                            Inappropriate
                                        </SelectItem>
                                        <SelectItem value="harassment">
                                            Harassment
                                        </SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Button onClick={handleFilter}>Apply Filters</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Reports Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Reports ({reports.total.toLocaleString()})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {reports.data.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No reports found
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reports.data.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {report.user_name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {report.user_email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            getReasonBadgeVariant(
                                                                report.reason
                                                            ) as any
                                                        }
                                                    >
                                                        {report.reason}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {report.description}
                                                </TableCell>
                                                <TableCell>
                                                    {report.provider_name}
                                                </TableCell>
                                                <TableCell>
                                                    {report.resolved_at ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="flex items-center gap-1 w-fit"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Resolved
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="flex items-center gap-1 w-fit"
                                                        >
                                                            <AlertCircle className="h-3 w-3" />
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            report.created_at
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {!report.resolved_at && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setResolvingReport(
                                                                    report
                                                                )
                                                            }
                                                        >
                                                            Resolve
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="mt-4">
                                    <Pagination links={reports.links} />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Resolve Dialog */}
                <Dialog
                    open={!!resolvingReport}
                    onOpenChange={(open) => {
                        if (!open) {
                            setResolvingReport(null);
                            setActionTaken('');
                            setPenaltyApplied('');
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Resolve Report</DialogTitle>
                            <DialogDescription>
                                Provide details about the action taken to resolve
                                this report.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="action_taken">
                                    Action Taken *
                                </Label>
                                <Textarea
                                    id="action_taken"
                                    placeholder="Describe the action taken..."
                                    value={actionTaken}
                                    onChange={(e) =>
                                        setActionTaken(e.target.value)
                                    }
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="penalty_applied">
                                    Penalty Applied (Optional)
                                </Label>
                                <Select
                                    value={penaltyApplied}
                                    onValueChange={setPenaltyApplied}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select penalty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="warning">
                                            Warning
                                        </SelectItem>
                                        <SelectItem value="suspend">
                                            Suspend Account
                                        </SelectItem>
                                        <SelectItem value="ban">
                                            Ban Account
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setResolvingReport(null);
                                    setActionTaken('');
                                    setPenaltyApplied('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleResolve}
                                disabled={!actionTaken || processing}
                            >
                                Resolve Report
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
