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
import { Check, MoreHorizontal, X, Eye } from 'lucide-react';
import { useState } from 'react';

interface AppointmentActionsProps {
    appointmentId: number;
    status: string;
}

export function AppointmentActions({ appointmentId, status }: AppointmentActionsProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const handleConfirm = () => {
        router.post(`/provider/appointments/${appointmentId}/confirm`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Success notification could go here
            },
        });
    };

    const handleCancelSubmit = () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        router.post(`/provider/appointments/${appointmentId}/cancel`, {
            reason: cancelReason
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCancelDialog(false);
                setCancelReason('');
            },
        });
    };

    const handleView = () => {
        router.visit(`/provider/appointments/${appointmentId}`);
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
                    <DropdownMenuItem onClick={handleView}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    {status === 'pending' && (
                        <DropdownMenuItem onClick={handleConfirm}>
                            <Check className="mr-2 h-4 w-4" />
                            Confirm
                        </DropdownMenuItem>
                    )}
                    {status !== 'cancelled' && (
                        <DropdownMenuItem 
                            onClick={() => setShowCancelDialog(true)} 
                            className="text-destructive"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for cancelling this appointment. This will be shared with the client.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium leading-none mb-2 block">
                                Cancellation Reason <span className="text-destructive">*</span>
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                                placeholder="Explain why you need to cancel..."
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
                            Cancel Appointment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
