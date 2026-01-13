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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    FileText,
    Calendar,
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    DollarSign,
    Clock,
    Star,
    Shield,
    Eye,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
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
    reviewed_at: string | null;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    is_verified: boolean;
    email_verified_at: string | null;
    created_at: string;
}

interface BusinessProfile {
    id: number;
    business_name: string;
    slug: string;
    description: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    phone: string;
    category: string;
    latitude: number | null;
    longitude: number | null;
    logo_path: string | null;
    settings: any;
}

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number;
    status: string;
}

interface WorkHour {
    id: number;
    day: string;
    start_time: string;
    end_time: string;
    is_closed: boolean;
}

interface Wallet {
    balance: number;
    escrow_balance: number;
    available_balance: number;
}

interface Statistics {
    appointments_count: number;
    completed_appointments: number;
    services_count: number;
    average_rating: number | null;
    reviews_count: number;
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    client_name: string;
    created_at: string;
}

interface Props {
    verification: Verification;
    user: User;
    business_profile: BusinessProfile | null;
    services: Service[];
    work_hours: WorkHour[];
    wallet: Wallet | null;
    statistics: Statistics;
    recent_reviews: Review[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Verifications',
        href: '/admin/verifications',
    },
    {
        title: 'Verification Details',
        href: '',
    },
];

export default function VerificationShow({
    verification,
    user,
    business_profile,
    services,
    work_hours,
    wallet,
    statistics,
    recent_reviews,
}: Props) {
    const [rejectingVerification, setRejectingVerification] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const { post, processing } = useForm();

    const handleApprove = () => {
        post(`/admin/verifications/${verification.id}/approve`, {
            preserveScroll: true,
        });
    };

    const handleReject = () => {
        post(`/admin/verifications/${verification.id}/reject`, {
            data: {
                rejection_reason: rejectionReason,
            },
            onSuccess: () => {
                setRejectingVerification(false);
                setRejectionReason('');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge
                        variant="default"
                        className="flex w-fit items-center gap-1"
                    >
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge
                        variant="destructive"
                        className="flex w-fit items-center gap-1"
                    >
                        <XCircle className="h-3 w-3" />
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant="secondary"
                        className="flex w-fit items-center gap-1"
                    >
                        Pending
                    </Badge>
                );
        }
    };

    const getDayName = (day: string) => {
        const days: { [key: string]: string } = {
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
            sunday: 'Sunday',
        };
        return days[day.toLowerCase()] || day;
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Verification: ${user.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/verifications">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Verification Details
                            </h1>
                            <p className="text-muted-foreground">
                                {user.name} - {business_profile?.business_name || 'No Business Name'}
                            </p>
                        </div>
                    </div>
                    {verification.status === 'pending' && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleApprove}
                                disabled={processing}
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setRejectingVerification(true)}
                                disabled={processing}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>

                {/* Verification Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Verification Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Status
                                </label>
                                <div className="mt-1">
                                    {getStatusBadge(verification.status)}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Document Type
                                </label>
                                <p className="text-sm mt-1 capitalize">
                                    {verification.document_type.replace('_', ' ')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Submitted
                                </label>
                                <p className="text-sm mt-1">
                                    {new Date(
                                        verification.created_at
                                    ).toLocaleString()}
                                </p>
                            </div>
                            {verification.reviewed_at && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Reviewed At
                                    </label>
                                    <p className="text-sm mt-1">
                                        {new Date(
                                            verification.reviewed_at
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                        {verification.document_path && (
                            <div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        window.open(
                                            `/storage/${verification.document_path}`,
                                            '_blank'
                                        );
                                    }}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Verification Document
                                </Button>
                            </div>
                        )}
                        {verification.rejection_reason && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-950/20">
                                <label className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Rejection Reason
                                </label>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                    {verification.rejection_reason}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* User Information */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                User Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Name
                                </label>
                                <p className="text-sm">{user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    Email
                                </label>
                                <p className="text-sm">{user.email}</p>
                            </div>
                            {user.phone && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        Phone
                                    </label>
                                    <p className="text-sm">{user.phone}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Account Status
                                </label>
                                <div className="mt-1">
                                    {user.email_verified_at ? (
                                        <Badge
                                            variant="outline"
                                            className="flex w-fit items-center gap-1"
                                        >
                                            <CheckCircle2 className="h-3 w-3" />
                                            Email Verified
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="flex w-fit items-center gap-1"
                                        >
                                            Email Not Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Joined
                                </label>
                                <p className="text-sm">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Business Profile */}
                    {business_profile ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Business Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Business Name
                                    </label>
                                    <p className="text-sm font-medium">
                                        {business_profile.business_name}
                                    </p>
                                </div>
                                {business_profile.description && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Description
                                        </label>
                                        <p className="text-sm">
                                            {business_profile.description}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        Address
                                    </label>
                                    <p className="text-sm">
                                        {business_profile.address}
                                        {business_profile.city && `, ${business_profile.city}`}
                                        {business_profile.state && `, ${business_profile.state}`}
                                        {business_profile.zip_code && ` ${business_profile.zip_code}`}
                                    </p>
                                </div>
                                {business_profile.phone && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            Business Phone
                                        </label>
                                        <p className="text-sm">
                                            {business_profile.phone}
                                        </p>
                                    </div>
                                )}
                                {business_profile.category && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Category
                                        </label>
                                        <p className="text-sm capitalize">
                                            {business_profile.category}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Business Profile</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    No business profile found
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Total Appointments
                                </label>
                                <p className="text-2xl font-bold">
                                    {statistics.appointments_count}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Completed
                                </label>
                                <p className="text-2xl font-bold">
                                    {statistics.completed_appointments}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Services
                                </label>
                                <p className="text-2xl font-bold">
                                    {statistics.services_count}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    Average Rating
                                </label>
                                <p className="text-2xl font-bold">
                                    {statistics.average_rating
                                        ? statistics.average_rating.toFixed(1)
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Reviews
                                </label>
                                <p className="text-2xl font-bold">
                                    {statistics.reviews_count}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Wallet Information */}
                {wallet && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Wallet Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Total Balance
                                    </label>
                                    <p className="text-2xl font-bold">
                                        ₦{wallet.balance.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Escrow Balance
                                    </label>
                                    <p className="text-2xl font-bold">
                                        ₦{wallet.escrow_balance.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Available Balance
                                    </label>
                                    <p className="text-2xl font-bold">
                                        ₦{wallet.available_balance.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Services */}
                {services.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Services ({services.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service Name</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-medium">
                                                {service.name}
                                            </TableCell>
                                            <TableCell>
                                                ₦{service.price.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {service.duration} minutes
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        service.status ===
                                                        'active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {service.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Work Hours */}
                {work_hours.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Work Hours
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Day</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {work_hours.map((workHour) => (
                                        <TableRow key={workHour.id}>
                                            <TableCell className="font-medium">
                                                {getDayName(workHour.day)}
                                            </TableCell>
                                            <TableCell>
                                                {workHour.is_closed ? (
                                                    <span className="text-muted-foreground">
                                                        Closed
                                                    </span>
                                                ) : (
                                                    `${workHour.start_time} - ${workHour.end_time}`
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        workHour.is_closed
                                                            ? 'secondary'
                                                            : 'default'
                                                    }
                                                >
                                                    {workHour.is_closed
                                                        ? 'Closed'
                                                        : 'Open'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Reviews */}
                {recent_reviews.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Recent Reviews ({statistics.reviews_count})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recent_reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex items-center">
                                                        {[
                                                            ...Array(5),
                                                        ].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${
                                                                    i <
                                                                    review.rating
                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                        : 'text-gray-300'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {review.client_name}
                                                    </span>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {review.comment}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(
                                                    review.created_at
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Reject Dialog */}
                <Dialog
                    open={rejectingVerification}
                    onOpenChange={setRejectingVerification}
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
                                    setRejectingVerification(false);
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
