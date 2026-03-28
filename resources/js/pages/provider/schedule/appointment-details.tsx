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
import KeenIcon from '@/components/keen-icon';
import AppLayout from '@/layouts/app-layout';
import { formatStatus, getStatusVariant } from '@/lib/utils';
import business from '@/routes/business';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
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
    const paymentStateTone =
        appointment.payment_method === 'offline'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : appointment.escrow_status === 'released'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : appointment.escrow_status === 'held'
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : appointment.escrow_status === 'refunded'
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-muted text-muted-foreground border-border';

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
    const showConfirmAction = appointment.status === 'pending';
    const showWaitingForClientState = canComplete && waitingForClientApproval;
    const showCompleteAction = canComplete && !waitingForClientApproval;
    const showCancelAction =
        appointment.status !== 'cancelled' &&
        appointment.status !== 'completed';
    const showReportAction =
        appointment.status !== 'cancelled' &&
        appointment.status !== 'completed' &&
        canReportClient;
    const hasAnyAction =
        showConfirmAction ||
        showWaitingForClientState ||
        showCompleteAction ||
        showCancelAction ||
        showReportAction;

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

            <div className="space-y-6 p-4">
                <section className="overflow-hidden rounded-3xl border border-border/70 bg-background">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.06),_transparent_24%),radial-gradient(circle_at_left,_rgba(16,185,129,0.06),_transparent_24%)]" />
                        <div className="relative space-y-5 px-6 py-6 lg:px-8 lg:py-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="border-border bg-muted px-3 py-1 text-[11px] font-medium tracking-[0.18em] uppercase text-foreground/70 hover:bg-muted">
                                    Appointment details
                                </Badge>
                                <Badge variant={getStatusVariant(appointment.status)}>
                                    {formatStatus(appointment.status)}
                                </Badge>
                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${paymentStateTone}`}>
                                    {paymentStateLabel}
                                </span>
                            </div>

                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex min-w-0 items-center gap-4">
                                    <Avatar className="h-16 w-16 rounded-2xl border border-border/70">
                                        <AvatarFallback className="rounded-2xl text-base font-semibold">
                                            {appointment.client_name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <h1 className="truncate text-3xl font-semibold tracking-tight text-foreground">
                                            {appointment.client_name}
                                        </h1>
                                        {appointment.email && (
                                            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                <KeenIcon name="text-circle" className="text-sm" />
                                                <a
                                                    href={`mailto:${appointment.email}`}
                                                    className="truncate hover:text-primary"
                                                >
                                                    {appointment.email}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                                    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                        <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                                            <KeenIcon name="electronic-clock" className="text-sm text-sky-600 dark:text-sky-300" />
                                            Schedule
                                        </div>
                                        <p className="mt-3 text-sm font-semibold text-foreground">
                                            {appointment.start_time}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                        <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                                            <KeenIcon name="receipt-square" className="text-sm text-emerald-600 dark:text-emerald-300" />
                                            Amount
                                        </div>
                                        <p className="mt-3 text-lg font-semibold text-foreground">
                                            {appointment.price}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                        <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                                            <KeenIcon name="people" className="text-sm text-violet-600 dark:text-violet-300" />
                                            Services
                                        </div>
                                        <p className="mt-3 text-lg font-semibold text-foreground">
                                            {appointment.services.length}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            booked for this appointment
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Details */}
                    <Card className="overflow-hidden rounded-3xl border border-border/70 shadow-none md:col-span-2">
                        <CardHeader className="border-b border-border/60 bg-muted/20 pb-5">
                            <CardTitle className="text-lg font-bold">
                                Appointment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            {/* Time, Date and Duration */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                        Date & Time
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <KeenIcon name="electronic-clock" className="text-base text-primary" />
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
                                        <KeenIcon name="electronic-clock" className="text-base text-primary" />
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
                                            <KeenIcon name="electronic-clock" className="text-base text-primary" />
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
                                            <KeenIcon name="people" className="text-base text-primary" />
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

                            {(appointment.escrow_status || appointment.payment_method === 'offline' || feePercent !== null || feeAmount !== null || payoutAmount !== null) && (
                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                                            Payment & Payout
                                        </p>
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${paymentStateTone}`}>
                                            {paymentStateLabel}
                                        </span>
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

                                    <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                                        {appointment.payment_method === 'offline' ? (
                                            <p>
                                                This appointment was booked without upfront payment. You can confirm it only when you are ready to take the booking.
                                            </p>
                                        ) : appointment.escrow_amount != null ? (
                                            <p>
                                                Amount in escrow: ₦{Number(appointment.escrow_amount).toLocaleString()}
                                            </p>
                                        ) : null}
                                        {appointment.payment_method !== 'offline' && appointment.payment_released_at && (
                                            <p>Released at: {appointment.payment_released_at}</p>
                                        )}
                                        {appointment.payment_method !== 'offline' && isEscrowHeld && (
                                            <p>
                                                Funds are currently held in escrow and will be released when the client completes the appointment, or automatically 15 minutes after the end time if the client does not respond.
                                            </p>
                                        )}
                                        {appointment.payment_method !== 'offline' && isPaymentReleased && (
                                            <p>Payment has already been released to your wallet.</p>
                                        )}
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
                                                <KeenIcon name="geolocation" className="mt-0.5 shrink-0 text-sm text-primary" />
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
                                                <KeenIcon name="phone" className="shrink-0 text-sm" />
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
                                                    <KeenIcon name="book-square" className="text-sm" />
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

                        </CardContent>
                    </Card>

                    {/* Actions and Sidebar */}
                    <div className="space-y-6">
                        {hasAnyAction && (
                            <Card className="overflow-hidden rounded-3xl border border-border/70 shadow-none">
                                <CardHeader className="border-b border-border/60 bg-muted/20 pb-5">
                                    <CardTitle className="text-sm font-bold tracking-widest uppercase">
                                        Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-6">
                                    {showConfirmAction && (
                                        <Button
                                            className="w-full"
                                            onClick={handleConfirm}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <KeenIcon name="verify" className="mr-2 text-sm" />
                                            )}
                                            Accept Booking
                                        </Button>
                                    )}
                                    {showWaitingForClientState && (
                                        <div className="flex gap-2 rounded-md border border-muted bg-muted/40 p-3 text-xs text-muted-foreground">
                                            <KeenIcon name="information" className="mt-0.5 shrink-0 text-sm text-amber-500" />
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
                                    {showCompleteAction && (
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            onClick={handleComplete}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <KeenIcon name="verify" className="mr-2 text-sm" />
                                            )}
                                            Mark as Completed
                                        </Button>
                                    )}
                                    {showCancelAction && (
                                        <Button
                                            variant="destructive"
                                            className="w-full"
                                            onClick={handleCancel}
                                            disabled={
                                                isProcessing || !canCancel
                                            }
                                        >
                                            <KeenIcon name="trash-square" className="mr-2 text-sm" />
                                            {appointment.status === 'pending'
                                                ? 'Reject Booking'
                                                : 'Cancel Appointment'}
                                        </Button>
                                    )}

                                    {showReportAction && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-muted-foreground hover:text-foreground"
                                            onClick={() =>
                                                setReportDialogOpen(true)
                                            }
                                            disabled={isProcessing}
                                        >
                                            <KeenIcon name="information" className="mr-2 text-sm" />
                                            Report Client
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="overflow-hidden rounded-3xl border border-border/70 shadow-none">
                            <CardHeader className="border-b border-border/60 bg-muted/20 pb-5">
                                <CardTitle className="text-sm font-bold tracking-widest uppercase">
                                    Booking Metadata
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-6 text-sm">
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        Reference
                                    </p>
                                    <p className="mt-1 font-mono text-foreground">{appointment.id}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        Received
                                    </p>
                                    <p className="mt-1 text-foreground">{appointment.created_at}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirm Appointment Dialog */}
            <CustomAlertDialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
                icon={<KeenIcon name="verify" className="text-5xl text-green-500" />}
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
                icon={<KeenIcon name="verify" className="text-5xl text-green-500" />}
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
                                <KeenIcon name="information" className="text-base text-amber-500" />
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
                            <KeenIcon name="trash-square" className="text-base text-destructive" />
                            {appointment.status === 'pending'
                                ? 'Reject Booking'
                                : 'Cancel Appointment'}
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for cancellation. The client
                            will be notified
                            {appointment.payment_method === 'offline'
                                ? '.'
                                : ' and their payment will be refunded.'}
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
