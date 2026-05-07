import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

import type { PaymentOption, ProviderSettings } from '../types';

interface PaymentSectionProps {
    paymentOption: PaymentOption;
    onPaymentOptionChange: (next: PaymentOption) => void;
    supportsOnlinePayment: boolean;
    supportsOfflineBooking: boolean;
    walletBalance: number | null | undefined;
    totalPrice: number;
    originalPrice: number;
    discountAmount: number;
    discountPercent: number;
    providerSettings: ProviderSettings;
    canBookProvider: boolean;
    selectedSlot: string;
    selectedServiceCount: number;
    submitting: boolean;
    onBook: () => void;
}

export function PaymentSection({
    paymentOption,
    onPaymentOptionChange,
    supportsOnlinePayment,
    supportsOfflineBooking,
    walletBalance,
    totalPrice,
    originalPrice,
    discountAmount,
    discountPercent,
    providerSettings,
    canBookProvider,
    selectedSlot,
    selectedServiceCount,
    submitting,
    onBook,
}: PaymentSectionProps) {
    const insufficientBalance =
        paymentOption === 'online' &&
        walletBalance !== null &&
        walletBalance !== undefined &&
        walletBalance < totalPrice;

    const disabled =
        submitting ||
        !canBookProvider ||
        !selectedSlot ||
        selectedServiceCount === 0 ||
        insufficientBalance;

    return (
        <div className="space-y-5 border-t border-border/60 px-5 pt-5 pb-5">
            {(supportsOnlinePayment || supportsOfflineBooking) && (
                <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                            Payment option
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                            Choose how you want to secure this booking.
                        </p>
                    </div>
                    <div className="grid gap-3">
                        {supportsOnlinePayment && (
                            <button
                                type="button"
                                onClick={() => onPaymentOptionChange('online')}
                                className={cn(
                                    'rounded-lg border p-3 text-left transition',
                                    paymentOption === 'online'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/15'
                                        : 'border-border hover:border-primary/30',
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Pay online now
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Payment is held securely and
                                            released only after service
                                            completion is confirmed.
                                        </p>
                                    </div>
                                    <ShieldCheck
                                        className={cn(
                                            'size-4',
                                            paymentOption === 'online'
                                                ? 'text-primary'
                                                : 'text-muted-foreground/40',
                                        )}
                                    />
                                </div>
                            </button>
                        )}
                        {supportsOfflineBooking && (
                            <button
                                type="button"
                                onClick={() => onPaymentOptionChange('offline')}
                                className={cn(
                                    'rounded-lg border p-3 text-left transition',
                                    paymentOption === 'offline'
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/15'
                                        : 'border-border hover:border-primary/30',
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Book and pay later
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            This sends a pending request to the
                                            provider without charging your
                                            wallet now.
                                        </p>
                                    </div>
                                    <ShieldCheck
                                        className={cn(
                                            'size-4',
                                            paymentOption === 'offline'
                                                ? 'text-primary'
                                                : 'text-muted-foreground/40',
                                        )}
                                    />
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {paymentOption === 'online' &&
                walletBalance !== null &&
                walletBalance !== undefined && (
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                        <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Your Wallet Balance
                            </span>
                            <span
                                className={`font-bold ${walletBalance >= totalPrice ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                            >
                                ₦{walletBalance.toLocaleString()}
                            </span>
                        </div>
                        {walletBalance < totalPrice && (
                            <p className="mt-1 text-xs text-destructive">
                                Insufficient balance. Top up ₦
                                {(totalPrice - walletBalance).toLocaleString()}{' '}
                                more to complete booking.
                            </p>
                        )}
                        {walletBalance >= totalPrice && (
                            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                ✓ Sufficient balance for this booking
                            </p>
                        )}
                    </div>
                )}

            {discountAmount > 0 && (
                <>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-muted-foreground line-through">
                            ₦{originalPrice.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-green-600 dark:text-green-400">
                            Recurring Discount ({discountPercent}%)
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                            -₦{discountAmount.toLocaleString()}
                        </span>
                    </div>
                </>
            )}

            <div className="space-y-4 rounded-xl border border-border/70 bg-background p-4">
                <div className="flex items-center justify-between">
                    <span className="text-base">Total</span>
                    <div className="text-right">
                        <span className="block text-xl leading-none font-semibold text-primary">
                            ₦{totalPrice.toLocaleString()}
                        </span>
                    </div>
                </div>

                {providerSettings.autoConfirm && paymentOption === 'online' && (
                    <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400">
                        This provider auto-confirms bookings – no need to wait
                        for approval.
                    </p>
                )}
                {paymentOption === 'offline' && (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                        This request will stay pending until the provider
                        reviews it, even if auto-confirm is enabled.
                    </p>
                )}
                <Button
                    className="w-full"
                    disabled={disabled}
                    onClick={onBook}
                >
                    {submitting
                        ? 'Submitting...'
                        : !canBookProvider
                          ? 'Booking unavailable'
                          : paymentOption === 'online'
                            ? insufficientBalance
                                ? 'Insufficient Balance'
                                : 'Book & Pay Now'
                            : 'Send Booking Request'}
                    <CheckCircle2 className="size-6" />
                </Button>
                {paymentOption === 'online' &&
                    walletBalance !== null &&
                    walletBalance !== undefined &&
                    walletBalance >= totalPrice && (
                        <p className="text-center text-xs text-muted-foreground">
                            ₦{totalPrice.toLocaleString()} will be held until
                            both parties approve completion
                        </p>
                    )}
                {paymentOption === 'offline' && (
                    <p className="text-center text-xs text-muted-foreground">
                        No wallet charge will happen now. The provider will
                        decide whether to accept this unpaid request.
                    </p>
                )}
            </div>
        </div>
    );
}
