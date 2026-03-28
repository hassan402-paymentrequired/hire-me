import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatStatus, getStatusVariant } from '@/lib/utils';
import business from '@/routes/business';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    Mail,
    MapPin,
    Phone,
    XCircle,
} from 'lucide-react';
import React from 'react';

interface Service {
    id: string;
    name: string;
    price: string;
    duration_minutes?: number;
}

interface AppointmentDetails {
    id: string;
    client_name: string;
    email: string;
    services: Service[];
    start_time: string;
    end_time: string;
    status: string;
    price: string;
    payment_method?: 'online' | 'offline' | null;
    notes: string | null;
    created_at: string;
    escrow_status?: string | null;
    escrow_amount?: string | number | null;
    payment_released_at?: string | null;
    platform_fee_percent?: string | number | null;
    platform_fee_amount?: string | number | null;
    provider_payout_amount?: string | number | null;
    cancelled_by?: string | null;
    cancellation_reason?: string | null;
    location?: string | null;
    location_phone?: string | null;
    total_duration_minutes?: number;
    team_member?: {
        id: string;
        name: string;
        email: string;
        role: 'admin' | 'staff';
    } | null;
}

export default function AppointmentDetailsPage({
    appointment,
    canCancel,
    canComplete,
    canReportClient,
    waitingForClientApproval,
}: {
    appointment: AppointmentDetails;
    canCancel: boolean;
    canComplete: boolean;
    canReportClient: boolean;
    waitingForClientApproval: boolean;
}) {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = React.useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
    const [cancelReason, setCancelReason] = React.useState('');
    const [reportDialogOpen, setReportDialogOpen] = React.useState(false);
    const [reportReason, setReportReason] = React.useState('');
    const [reportDescription, setReportDescription] = React.useState('');

    const isEscrowHeld = appointment.escrow_status === 'held';
    const isPaymentReleased = appointment.escrow_status === 'released';
    const paymentStateLabel =
        appointment.payment_method === 'offline'
            ? 'Unpaid'
            : appointment.escrow_status
              ? formatStatus(appointment.escrow_status)
              : 'Pending';

    const feePercent =
        appointment.platform_fee_percent !== undefined &&
        appointment.platform_fee_percent !== null
            ? Number(appointment.platform_fee_percent)
            : null;
    const feeAmount =
        appointment.platform_fee_amount !== undefined &&
        appointment.platform_fee_amount !== null
            ? Number(appointment.platform_fee_amount)
            : null;
    const payoutAmount =
        appointment.provider_payout_amount !== undefined &&
        appointment.provider_payout_amount !== null
            ? Number(appointment.provider_payout_amount)
            : null;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: business.dashboard().url },
        { title: 'Schedule', href: '/schedule/appointments' },
        { title: appointment.client_name, href: '' },
    ];

    const totalDuration =
        appointment.total_duration_minutes ??
        appointment.services?.reduce(
            (sum, s) => sum + (s.duration_minutes || 0),
            0,
        ) ??
        0;

    const handleConfirm = () => {
        setConfirmDialogOpen(true);
    };

    const submitConfirm = () => {
        setIsProcessing(true);
        router.post(
            `/provider/appointments/${appointment.id}/confirm`,
            {},
            { onFinish: () => setIsProcessing(false) },
        );
    };

    const handleComplete = () => {
        setCompleteDialogOpen(true);
    };

    const submitComplete = () => {
        setIsProcessing(true);
        router.post(
            `/provider/appointments/${appointment.id}/complete`,
            {},
            { onFinish: () => setIsProcessing(false) },
        );
    };

    const handleCancel = () => {
        setCancelReason('');
        setCancelDialogOpen(true);
    };

    const submitCancel = () => {
        if (!cancelReason.trim()) return;
        setIsProcessing(true);
        router.post(
            `/provider/appointments/${appointment.id}/cancel`,
            { reason: cancelReason.trim() },
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setCancelDialogOpen(false);
                },
            },
        );
    };

    const handleReport = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !reportReason ||
            !reportDescription.trim() ||
            reportDescription.trim().length < 20
        )
            return;
        setIsProcessing(true);
        router.post(
            `/provider/appointments/${appointment.id}/report`,
            {
                reason: reportReason,
                description: reportDescription.trim(),
            },
            {
                onSuccess: () => {
                    setReportDialogOpen(false);
                    setReportReason('');
                    setReportDescription('');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Appointment - ${appointment.client_name}`} />

            <div className="space-y-4 p-4">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 rounded border-2">
                            <AvatarFallback className="rounded">
                                {appointment.client_name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">
                                {appointment.client_name}
                            </h1>
                            {appointment.email && (
                                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <a
                                        href={`mailto:${appointment.email}`}
                                        className="hover:text-primary"
                                    >
                                        {appointment.email} 
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={appointment.payment_method === 'offline' ? 'secondary' : 'outline'}>
                            {paymentStateLabel}
                        </Badge>
                        <Badge variant={getStatusVariant(appointment.status)}>
                            {formatStatus(appointment.status)}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Details */}
                    <Card className="rounded md:col-span-2">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold">
                                Appointment Information
                            </CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="space-y-8 pt-6">
                            {/* Time, Date and Duration */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Date & Time
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <span className="text-lg font-bold">
                                            {appointment.start_time}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Ends
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-primary" />
                                        <span className="text-lg font-bold">
                                            {appointment.end_time}
                                        </span>
                                    </div>
                                </div>
                                {totalDuration > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                            Duration
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-primary" />
                                            <span className="text-lg font-bold">
                                                {totalDuration} minutes
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {appointment.team_member && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                            Assigned Team Member
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-primary" />
                                            <div>
                                                <span className="text-lg font-bold">
                                                    {appointment.team_member.name}
                                                </span>
                                                <p className="text-sm text-muted-foreground">
                                                    {appointment.team_member.role}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(feePercent !== null || feeAmount !== null || payoutAmount !== null) && (
                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                            Payout Breakdown
                                        </p>
                                        {isPaymentReleased && (
                                            <Badge variant="secondary">Released</Badge>
                                        )}
                                    </div>

                                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Gross</p>
                                            <p className="text-sm font-bold">{appointment.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Platform fee{feePercent !== null ? ` (${feePercent}%)` : ''}
                                            </p>
                                            <p className="text-sm font-bold">
                                                {feeAmount !== null ? `₦${feeAmount.toLocaleString()}` : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Net payout</p>
                                            <p className="text-sm font-bold">
                                                {payoutAmount !== null ? `₦${payoutAmount.toLocaleString()}` : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            {(appointment.location ||
                                appointment.location_phone) && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Location & Contact
                                    </p>
                                    <div className="flex flex-col gap-2 rounded-xl border border-muted bg-muted/30 p-4">
                                        {appointment.location && (
                                            <div className="flex items-start gap-3">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                <span className="text-sm font-medium">
                                                    {appointment.location}
                                                </span>
                                            </div>
                                        )}
                                        {appointment.location_phone && (
                                            <a
                                                href={`tel:${appointment.location_phone}`}
                                                className="flex items-center gap-3 text-sm font-medium text-primary hover:underline"
                                            >
                                                <Phone className="h-4 w-4 shrink-0" />
                                                {appointment.location_phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Services List */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Booked Services
                                </p>
                                <div className="space-y-3">
                                    {appointment.services.map((service) => (
                                        <div
                                            key={service.id}
                                            className="flex items-center justify-between rounded border-2 border-muted bg-muted/30 p-4 transition-colors hover:border-primary/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <span className="block font-bold capitalize">
                                                        {service.name}
                                                    </span>
                                                    {service.duration_minutes && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {
                                                                service.duration_minutes
                                                            }{' '}
                                                            mins
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-lg font-black">
                                                {service.price}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between px-4 pt-2">
                                        <span className="font-bold text-muted-foreground">
                                            Total Price
                                        </span>
                                        <span className="text-2xl font-black text-primary">
                                            {appointment.price}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                    Client Notes
                                </p>
                                <div className="rounded-xl border-2 border-dashed border-muted bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground italic">
                                    {appointment.notes ||
                                        'No additional notes provided for this booking.'}
                                </div>
                            </div>

                            {/* Cancellation Details */}
                            {appointment.status === 'cancelled' &&
                                (appointment.cancelled_by ||
                                    appointment.cancellation_reason) && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold tracking-widest text-destructive uppercase">
                                            Cancellation Details
                                        </p>
                                        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                                            {appointment.cancelled_by && (
                                                <p className="text-sm font-medium">
                                                    Cancelled by:{' '}
                                                    <span className="capitalize">
                                                        {
                                                            appointment.cancelled_by
                                                        }
                                                    </span>
                                                </p>
                                            )}
                                            {appointment.cancellation_reason && (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {
                                                        appointment.cancellation_reason
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Payment Status */}
                            {(appointment.escrow_status || appointment.payment_method === 'offline') && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Payment Status
                                    </p>
                                    <div className="rounded-xl border border-muted bg-muted/30 p-4 space-y-1">
                                        <p className="text-sm font-medium capitalize">
                                            {appointment.payment_method === 'offline'
                                                ? 'unpaid'
                                                : appointment.escrow_status?.replace('_', ' ')}
                                        </p>
                                        {appointment.payment_method === 'offline' ? (
                                            <p className="text-xs text-muted-foreground">
                                                This appointment was booked without upfront payment. Confirm only when you're ready to take the booking.
                                            </p>
                                        ) : appointment.escrow_amount != null && (
                                            <p className="text-xs text-muted-foreground">
                                                Amount in escrow: ₦
                                                {Number(
                                                    appointment.escrow_amount,
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                        {appointment.payment_method !== 'offline' && appointment.payment_released_at && (
                                            <p className="text-xs text-muted-foreground">
                                                Released at:{' '}
                                                {
                                                    appointment.payment_released_at
                                                }
                                            </p>
                                        )}
                                        {appointment.payment_method !== 'offline' && isEscrowHeld && (
                                            <p className="text-xs text-muted-foreground">
                                                Funds are currently held in escrow. They&apos;ll be released when the
                                                client marks this appointment as completed, or automatically 15 minutes
                                                after the appointment end time if the client doesn&apos;t respond.
                                            </p>
                                        )}
                                        {appointment.payment_method !== 'offline' && isPaymentReleased && (
                                            <p className="text-xs text-muted-foreground">
                                                Payment has been released to your wallet.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions and Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold tracking-widest uppercase">
                                    Actions
                                </CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="space-y-3 pt-6">
                                {appointment.status === 'pending' && (
                                    <Button
                                        className="w-full"
                                        onClick={handleConfirm}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                        )}
                                        Accept Booking
                                    </Button>
                                )}
                                {canComplete && waitingForClientApproval && (
                                    <div className="flex gap-2 rounded-md border border-muted bg-muted/40 p-3 text-xs text-muted-foreground">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Waiting for client confirmation
                                            </p>
                                            <p>
                                                Once the client marks this appointment as completed, payment will be
                                                released. If they don&apos;t respond, funds are automatically released
                                                15 minutes after the appointment end time.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {canComplete && !waitingForClientApproval && (
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={handleComplete}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                        )}
                                        Mark as Completed
                                    </Button>
                                )}
                                {appointment.status !== 'cancelled' &&
                                    appointment.status !== 'completed' && (
                                        <Button
                                            variant="destructive"
                                            className="w-full"
                                            onClick={handleCancel}
                                            disabled={
                                                isProcessing || !canCancel
                                            }
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            {appointment.status === 'pending'
                                                ? 'Reject Booking'
                                                : 'Cancel Appointment'}
                                        </Button>
                                    )}

                                {appointment.status !== 'cancelled' &&
                                    appointment.status !== 'completed' &&
                                    appointment.status !== 'pending' && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-muted-foreground hover:text-foreground"
                                            onClick={() =>
                                                setReportDialogOpen(true)
                                            }
                                            disabled={isProcessing}
                                        >
                                            <AlertCircle className="mr-2 h-4 w-4" />
                                            Report Client
                                        </Button>
                                    )}
                            </CardContent>
                        </Card>

                        <div className="space-y-2 px-4 text-center">
                            <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                Booking Metadata
                            </p>
                            <p className="text-xs font-medium text-muted-foreground">
                                Reference:{' '}
                                <span className="font-mono">
                                    {appointment.id}
                                </span>
                            </p>
                            <p className="text-center text-xs font-medium text-muted-foreground">
                                Received on {appointment.created_at}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Appointment Dialog */}
            <CustomAlertDialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
                icon={<CheckCircle2 className="size-12 text-green-500" />}
                title="Accept Booking"
                description="Are you sure you want to confirm this appointment? The client will be notified."
                acceptLabel="Accept"
                rejectLabel="Cancel"
                onAccept={submitConfirm}
                acceptVariant="default"
            />

            {/* Mark Complete Dialog */}
            <CustomAlertDialog
                open={completeDialogOpen}
                onOpenChange={setCompleteDialogOpen}
                icon={<CheckCircle2 className="size-12 text-green-500" />}
                title="Mark as Completed"
                description="Mark this appointment as completed? This records that you have delivered the service. Payment is released when the client marks it as completed or automatically 15 minutes after the appointment end time."
                acceptLabel="Mark Complete"
                rejectLabel="Cancel"
                onAccept={submitComplete}
                acceptVariant="default"
            />

            {/* Report Client Dialog */}
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleReport}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                Report Client
                            </DialogTitle>
                            <DialogDescription>
                                Report an issue with {appointment.client_name}.
                                Our team will review and take appropriate
                                action.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="report-reason">Reason *</Label>
                                <select
                                    id="report-reason"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                    value={reportReason}
                                    onChange={(e) =>
                                        setReportReason(e.target.value)
                                    }
                                    required
                                >
                                    <option value="">Select a reason</option>
                                    <option value="no-show">
                                        Client did not show up
                                    </option>
                                    <option value="abusive-behavior">
                                        Abusive or disrespectful behavior
                                    </option>
                                    <option value="false-claim">
                                        False claim or dispute
                                    </option>
                                    <option value="payment-dispute">
                                        Payment or refund dispute
                                    </option>
                                    <option value="unprofessional">
                                        Unprofessional conduct
                                    </option>
                                    <option value="safety-concern">
                                        Safety concern
                                    </option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="report-description">
                                    Details *
                                </Label>
                                <Textarea
                                    id="report-description"
                                    placeholder="Provide details about the issue (minimum 20 characters)..."
                                    value={reportDescription}
                                    onChange={(e) =>
                                        setReportDescription(e.target.value)
                                    }
                                    required
                                    rows={5}
                                    minLength={20}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minimum 20 characters
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setReportDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    !reportReason ||
                                    !reportDescription.trim() ||
                                    reportDescription.trim().length < 20 ||
                                    isProcessing
                                }
                            >
                                {isProcessing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Submit Report
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Cancel Appointment Dialog - requires reason */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-destructive" />
                            {appointment.status === 'pending'
                                ? 'Reject Booking'
                                : 'Cancel Appointment'}
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for cancellation. The client
                            will be notified and their payment will be refunded.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cancel-reason">Reason *</Label>
                            <Textarea
                                id="cancel-reason"
                                placeholder="e.g. Unavailable at scheduled time, schedule conflict..."
                                value={cancelReason}
                                onChange={(e) =>
                                    setCancelReason(e.target.value)
                                }
                                rows={4}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(false)}
                        >
                            Keep Appointment
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={submitCancel}
                            disabled={!cancelReason.trim() || isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
