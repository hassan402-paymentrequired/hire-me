import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

import type { PaymentOption } from '../types';

interface StickyMobileCtaProps {
    totalPrice: number;
    paymentOption: PaymentOption;
    onBook: () => void;
    disabled: boolean;
    submitting: boolean;
    insufficientBalance: boolean;
    canBookProvider: boolean;
}

export function StickyMobileCta({
    totalPrice,
    paymentOption,
    onBook,
    disabled,
    submitting,
    insufficientBalance,
    canBookProvider,
}: StickyMobileCtaProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
                <div className="flex flex-1 flex-col">
                    <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                        Total
                    </span>
                    <span className="text-lg font-semibold text-primary">
                        ₦{totalPrice.toLocaleString()}
                    </span>
                </div>
                <Button
                    className="h-11 flex-1 gap-2"
                    disabled={disabled}
                    onClick={onBook}
                >
                    {submitting
                        ? 'Submitting...'
                        : !canBookProvider
                          ? 'Unavailable'
                          : paymentOption === 'online'
                            ? insufficientBalance
                                ? 'Top up wallet'
                                : 'Book & Pay'
                            : 'Send request'}
                    <CheckCircle2 className="size-4" />
                </Button>
            </div>
        </div>
    );
}
