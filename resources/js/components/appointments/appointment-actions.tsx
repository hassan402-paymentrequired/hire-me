import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { Check, MoreHorizontal, X, Eye, Calendar, Clock, Mail, User, FileText, Banknote } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Appointment {
    id: number;
    client: string;
    email?: string;
    service: string;
    description?: string;
    amount: string;
    date: string;
    time: string;
    end_time: string;
    status: string;
    notes?: string;
    avatar: string;
    paymentStatus: string;
}

interface AppointmentActionsProps {
    appointment: Appointment;
}

export function AppointmentActions({ appointment }: AppointmentActionsProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const status = appointment.status.toLowerCase();

    const handleConfirm = () => {
        router.post(`/provider/appointments/${appointment.id}/confirm`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowDetailsDialog(false);
            },
        });
    };

    const handleCancelSubmit = () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        router.post(`/provider/appointments/${appointment.id}/cancel`, {
            reason: cancelReason
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCancelDialog(false);
                setShowDetailsDialog(false);
                setCancelReason('');
            },
        });
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    {status === 'pending' && (
                        <DropdownMenuItem onClick={handleConfirm}>
                            <Check className="mr-2 h-4 w-4" />
                            Confirm
                        </DropdownMenuItem>
                    )}
                    {status !== 'cancelled' && status !== 'completed' && (
                        <DropdownMenuItem
                            onClick={() => setShowCancelDialog(true)}
                            className="text-destructive"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Reject / Cancel
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* View Details Modal */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog} >
                <DialogContent className="max-w-5xl max-h-[90dvh] overflow-auto p-4 flex flex-col"
                               style={{ maxHeight: '90dvh' }}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            Appointment Details
                            <Badge variant={status === 'confirmed' ? 'default' : status === 'cancelled' ? 'destructive' : 'secondary'}>
                                {appointment.status}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            Scheduled for {appointment.date} at {appointment.time}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Client Info */}
                            <div className="flex-1 space-y-4">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <User className="size-4 text-muted-foreground" />
                                    Client Information
                                </h4>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">{appointment.client}</p>
                                    {appointment.email && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Mail className="size-3" />
                                            {appointment.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Service Info */}
                            <div className="flex-1 space-y-4">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <FileText className="size-4 text-muted-foreground" />
                                    Service & Payment
                                </h4>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">{appointment.service}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Banknote className="size-3" />
                                            Amount
                                        </span>
                                        <span className="font-bold">{appointment.amount}</span>
                                    </div>
                                    <p className="text-xs text-green-600 font-medium">Payment {appointment.paymentStatus}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Schedule Info */}
                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Calendar className="size-4 text-muted-foreground" />
                                    Schedule
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <p className="flex justify-between">
                                        <span className="text-muted-foreground">Date:</span>
                                        <span className="font-medium">{appointment.date}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-muted-foreground">Start:</span>
                                        <span className="font-medium">{appointment.time}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-muted-foreground">End (Estimated):</span>
                                        <span className="font-medium">{appointment.end_time}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <Clock className="size-4 text-muted-foreground" />
                                    Client Notes
                                </h4>
                                <div className="bg-muted p-3 rounded-md text-sm italic min-h-[60px]">
                                    {appointment.notes || "No notes provided by the client."}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <div className="flex flex-1 gap-2">
                            {status === 'pending' && (
                                <>
                                    <Button variant="default" className="flex-1 group" onClick={handleConfirm}>
                                        <Check className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
                                        Accept Appointment
                                    </Button>
                                    <Button variant="destructive" className="flex-1" onClick={() => setShowCancelDialog(true)}>
                                        <X className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                </>
                            )}
                            {status === 'confirmed' && (
                                <Button variant="destructive" className="flex-1" onClick={() => setShowCancelDialog(true)}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel Appointment
                                </Button>
                            )}
                        </div>
                        <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel/Reject Reason Modal */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{status === 'pending' ? 'Reject' : 'Cancel'} Appointment</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for {status === 'pending' ? 'rejecting' : 'cancelling'} this appointment. This will be shared with the client.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium leading-none mb-2 block">
                                Reason <span className="text-destructive">*</span>
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                                placeholder="Explain why..."
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            Back
                        </Button>
                        <Button variant="destructive" onClick={handleCancelSubmit}>
                            Confirm {status === 'pending' ? 'Rejection' : 'Cancellation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
