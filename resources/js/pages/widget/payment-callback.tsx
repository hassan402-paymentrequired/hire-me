import { useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    success: boolean;
    error?: string;
    message?: string;
    appointment?: {
        id: string;
        status: string;
    };
    reference?: string;
}

export default function PaymentCallback({ success, error, message, appointment, reference }: Props) {
    useEffect(() => {
        // Send message to parent window (widget iframe)
        if (window.opener || window.parent !== window) {
            const messageData = {
                type: 'clockra-widget-payment',
                success: success,
                error: error,
                message: message,
                appointment: appointment,
                reference: reference,
            };

            // Try to send to opener first (popup), then parent (iframe)
            if (window.opener) {
                window.opener.postMessage(messageData, '*');
            } else if (window.parent !== window) {
                window.parent.postMessage(messageData, '*');
            }

            // Auto-close popup after 3 seconds if successful
            if (success && window.opener) {
                setTimeout(() => {
                    window.close();
                }, 3000);
            }
        }
    }, [success, error, message, appointment, reference]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-lg border bg-card p-6 text-center">
                {success ? (
                    <>
                        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
                        <h2 className="text-2xl font-bold mb-2 text-green-900">Payment Successful!</h2>
                        <p className="text-muted-foreground mb-4">
                            {message || 'Your appointment has been booked successfully. We will keep you updated on the status of your appointment.'}
                        </p>
                        {appointment && (
                            <div className="bg-muted rounded-lg p-3 mb-4 text-sm">
                                <p className="font-medium">Appointment ID: {appointment.id}</p>
                                <p className="text-muted-foreground">Status: {appointment.status}</p>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mb-4">
                            This window will close automatically. You can also close it manually.
                        </p>
                        {window.opener && (
                            <Button onClick={() => window.close()} variant="outline" className="w-full">
                                Close Window
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        <XCircle className="mx-auto mb-4 h-16 w-16 text-red-600" />
                        <h2 className="text-2xl font-bold mb-2 text-red-900">Payment Failed</h2>
                        <p className="text-muted-foreground mb-4">
                            {error || 'There was an error processing your payment.'}
                        </p>
                        {reference && (
                            <div className="bg-muted rounded-lg p-3 mb-4 text-xs">
                                <p className="font-mono">Reference: {reference}</p>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mb-4">
                            Please try again or contact support if the problem persists.
                        </p>
                        {window.opener && (
                            <Button onClick={() => window.close()} variant="outline" className="w-full">
                                Close Window
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
