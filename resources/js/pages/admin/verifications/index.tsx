import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';
import {
    CheckCircle2,
    XCircle,
    FileText,
    Calendar,
    User,
    Mail,
    Eye,
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

interface Verification {
    id: number;
    status: string;
    document_type: string;
    document_path: string;
    rejection_reason: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        business_profile: {
            business_name: string;
        } | null;
    };
}

interface Props {
    verifications: {
        data: Verification[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Verifications',
        href: '',
    },
];

export default function VerificationsIndex({ verifications }: Props) {
    const [rejectingVerification, setRejectingVerification] =
        useState<Verification | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const { post, processing } = useForm();

    const handleApprove = (verificationId: number) => {
        post(`/admin/verifications/${verificationId}/approve`, {
            preserveScroll: true,
        });
    };

    const handleReject = () => {
        if (!rejectingVerification) return;

        post(
            `/admin/verifications/${rejectingVerification.id}/reject`,
            {
                data: {
                    rejection_reason: rejectionReason,
                },
                onSuccess: () => {
                    setRejectingVerification(null);
                    setRejectionReason('');
                },
            }
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge
                        variant="default"
                        className="flex items-center gap-1 w-fit"
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge
                        variant="destructive"
                        className="flex items-center gap-1 w-fit"
                    >
                        <XCircle className="h-3 w-3" />
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant="secondary"
                        className="flex items-center gap-1 w-fit"
                    >
                        Pending
                    </Badge>
                );
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Provider Verifications" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Provider Verifications
                    </h1>
                    <p className="text-muted-foreground">
                        Review and approve provider verification documents
                    </p>
                </div>

                {/* Verifications Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Pending Verifications ({verifications.total.toLocaleString()})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {verifications.data.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No pending verifications
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Business</TableHead>
                                            <TableHead>Document Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {verifications.data.map((verification) => (
                                            <TableRow key={verification.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {verification.user.name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {verification.user.email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {verification.user.business_profile
                                                        ?.business_name || (
                                                        <span className="text-muted-foreground">
                                                            N/A
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="h-3 w-3" />
                                                        {verification.document_type}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(
                                                        verification.status
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            verification.created_at
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/admin/verifications/${verification.id}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                        {verification.status ===
                                                            'pending' && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            verification.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setRejectingVerification(
                                                                            verification
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        {verification.document_path && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    window.open(
                                                                        `/storage/${verification.document_path}`,
                                                                        '_blank'
                                                                    );
                                                                }}
                                                            >
                                                                View Document
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="mt-4">
                                    <Pagination links={verifications.links} />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Reject Dialog */}
                <Dialog
                    open={!!rejectingVerification}
                    onOpenChange={(open) => {
                        if (!open) {
                            setRejectingVerification(null);
                            setRejectionReason('');
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Verification</DialogTitle>
                            <DialogDescription>
                                Provide a reason for rejecting this verification.
                                The provider will be notified of the rejection.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="rejection_reason">
                                    Rejection Reason *
                                </Label>
                                <Textarea
                                    id="rejection_reason"
                                    placeholder="Explain why this verification is being rejected..."
                                    value={rejectionReason}
                                    onChange={(e) =>
                                        setRejectionReason(e.target.value)
                                    }
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setRejectingVerification(null);
                                    setRejectionReason('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={!rejectionReason || processing}
                            >
                                Reject Verification
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
