import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    Mail,
    FileText,
    CheckCircle2,
    XCircle,
    MapPin,
    Phone,
    Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BreadcrumbItem } from '@/types';
import business from '@/routes/business';
import { formatStatus, getStatusVariant } from '@/lib/utils';
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
import { Textarea } from '@/components/ui/textarea';

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
    notes: string | null;
    created_at: string;
    escrow_status?: string | null;
    escrow_amount?: string | number | null;
    payment_released_at?: string | null;
    cancelled_by?: string | null;
    cancellation_reason?: string | null;
    location?: string | null;
    location_phone?: string | null;
    total_duration_minutes?: number;
}



export default function AppointmentDetailsPage({ appointment }: { appointment: AppointmentDetails }) {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = React.useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
    const [cancelReason, setCancelReason] = React.useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: business.dashboard().url },
        { title: 'Schedule', href: '/schedule/appointments' },
        { title: appointment.client_name, href: '' },
    ];

    const totalDuration = appointment.total_duration_minutes ?? appointment.services?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) ?? 0;
    const hasPassed = new Date(appointment.end_time) < new Date();
    const canMarkComplete = ['confirmed', 'pending_completion'].includes(appointment.status) && hasPassed;

    const handleConfirm = () => {
        setConfirmDialogOpen(true);
    };

    const submitConfirm = () => {
        setIsProcessing(true);
        router.post(`/provider/appointments/${appointment.id}/confirm`, {}, { onFinish: () => setIsProcessing(false) });
    };

    const handleComplete = () => {
        setCompleteDialogOpen(true);
    };

    const submitComplete = () => {
        setIsProcessing(true);
        router.post(`/provider/appointments/${appointment.id}/complete`, {}, { onFinish: () => setIsProcessing(false) });
    };

    const handleCancel = () => {
        setCancelReason('');
        setCancelDialogOpen(true);
    };

    const submitCancel = () => {
        if (!cancelReason.trim()) return;
        setIsProcessing(true);
        router.post(`/provider/appointments/${appointment.id}/cancel`, { reason: cancelReason.trim() }, {
            onFinish: () => {
                setIsProcessing(false);
                setCancelDialogOpen(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Appointment - ${appointment.client_name}`} />

            <div className="p-4  space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 rounded">
                            <AvatarFallback className="rounded">
                                {appointment.client_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">{appointment.client_name}</h1>
                            {appointment.email && (
                                <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                                    <Mail className="h-3 w-3" />
                                    <a href={`mailto:${appointment.email}`} className="hover:text-primary">{appointment.email}</a>
                                </p>
                            )}
                        </div>
                    </div>
                    <Badge variant={getStatusVariant(appointment.status)}>
                        {formatStatus(appointment.status)}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Details */}
                    <Card className="md:col-span-2 rounded">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold">Appointment Information</CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6 space-y-8">
                            {/* Time, Date and Duration */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Date & Time</p>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <span className="font-bold text-lg">{appointment.start_time}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ends</p>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-primary" />
                                        <span className="font-bold text-lg">{appointment.end_time}</span>
                                    </div>
                                </div>
                                {totalDuration > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Duration</p>
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-primary" />
                                            <span className="font-bold text-lg">{totalDuration} minutes</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            {(appointment.location || appointment.location_phone) && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Location & Contact</p>
                                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-muted/30 border border-muted">
                                        {appointment.location && (
                                            <div className="flex items-start gap-3">
                                                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                <span className="text-sm font-medium">{appointment.location}</span>
                                            </div>
                                        )}
                                        {appointment.location_phone && (
                                            <a href={`tel:${appointment.location_phone}`} className="flex items-center gap-3 text-sm font-medium text-primary hover:underline">
                                                <Phone className="h-4 w-4 shrink-0" />
                                                {appointment.location_phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Services List */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Booked Services</p>
                                <div className="space-y-3">
                                    {appointment.services.map((service) => (
                                        <div key={service.id} className="flex items-center justify-between p-4 rounded bg-muted/30 border-2 border-muted transition-colors hover:border-primary/20">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <span className="font-bold capitalize block">{service.name}</span>
                                                    {service.duration_minutes && (
                                                        <span className="text-xs text-muted-foreground">{service.duration_minutes} mins</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="font-black text-lg">{service.price}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-2 px-4">
                                        <span className="font-bold text-muted-foreground">Total Price</span>
                                        <span className="text-2xl font-black text-primary">{appointment.price}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Client Notes</p>
                                <div className="p-4 rounded-xl bg-muted/50 border-2 border-dashed border-muted italic text-sm text-muted-foreground leading-relaxed">
                                    {appointment.notes || 'No additional notes provided for this booking.'}
                                </div>
                            </div>

                            {/* Cancellation Details */}
                            {appointment.status === 'cancelled' && (appointment.cancelled_by || appointment.cancellation_reason) && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-destructive uppercase tracking-widest">Cancellation Details</p>
                                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                                        {appointment.cancelled_by && (
                                            <p className="text-sm font-medium">
                                                Cancelled by: <span className="capitalize">{appointment.cancelled_by}</span>
                                            </p>
                                        )}
                                        {appointment.cancellation_reason && (
                                            <p className="text-sm text-muted-foreground mt-1">{appointment.cancellation_reason}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment Status */}
                            {appointment.escrow_status && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Payment Status</p>
                                    <div className="p-4 rounded-xl bg-muted/30 border border-muted">
                                        <p className="text-sm font-medium capitalize">{appointment.escrow_status.replace('_', ' ')}</p>
                                        {appointment.escrow_amount != null && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Amount held: ₦{Number(appointment.escrow_amount).toLocaleString()}
                                            </p>
                                        )}
                                        {appointment.payment_released_at && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Released: {appointment.payment_released_at}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions and Sidebar */}
                    <div className="space-y-6">
                        <Card >
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest">Actions</CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-6 space-y-3">
                                {appointment.status === 'pending' && (
                                    <Button className="w-full" onClick={handleConfirm} disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                        Accept Booking
                                    </Button>
                                )}
                                {canMarkComplete && (
                                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleComplete} disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                        Mark as Completed
                                    </Button>
                                )}
                                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                    <Button variant="destructive" className="w-full" onClick={handleCancel} disabled={isProcessing}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        {appointment.status === 'pending' ? 'Reject Booking' : 'Cancel Appointment'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <div className="px-4 text-center space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Booking Metadata</p>
                            <p className="text-xs font-medium text-muted-foreground">Reference: <span className="font-mono">{appointment.id}</span></p>
                            <p className="text-xs font-medium text-muted-foreground text-center">Received on {appointment.created_at}</p>
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
                description="Mark this appointment as completed? Payment will be released once the client also confirms."
                acceptLabel="Mark Complete"
                rejectLabel="Cancel"
                onAccept={submitComplete}
                acceptVariant="default"
            />

            {/* Cancel Appointment Dialog - requires reason */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-destructive" />
                            {appointment.status === 'pending' ? 'Reject Booking' : 'Cancel Appointment'}
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for cancellation. The client will be notified and their payment will be refunded.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cancel-reason">Reason *</Label>
                            <Textarea
                                id="cancel-reason"
                                placeholder="e.g. Unavailable at scheduled time, schedule conflict..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                            Keep Appointment
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={submitCancel}
                            disabled={!cancelReason.trim() || isProcessing}
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
