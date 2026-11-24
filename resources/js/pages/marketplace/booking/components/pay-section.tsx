import { formatNaira } from '@/components/site/provider-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import wallet from '@/routes/wallet';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

import type { AppliedPromo, PaymentOption } from '../types';
import { RadioDot } from './location-choice';

interface PaySectionProps {
    total: number;
    paymentOption: PaymentOption;
    onPaymentOptionChange: (option: PaymentOption) => void;
    supportsOnlinePayment: boolean;
    supportsOfflineBooking: boolean;
    walletBalance: number | null;
    businessName: string;
    promo: AppliedPromo | null;
    promoDiscount: number;
    checkingPromo: boolean;
    promoError: string | null;
    onApplyPromo: (code: string) => void;
    onRemovePromo: () => void;
    showPayment?: boolean;
    noteLabel: string;
    notes: string;
    onNotesChange: (notes: string) => void;
    notesDisabled?: boolean;
}

/** Split bar of what's paid today vs at the visit, the payment method, and an optional promo code. */
export function PaySection({
    total,
    paymentOption,
    onPaymentOptionChange,
    supportsOnlinePayment,
    supportsOfflineBooking,
    walletBalance,
    businessName,
    promo,
    promoDiscount,
    checkingPromo,
    promoError,
    onApplyPromo,
    onRemovePromo,
    showPayment = true,
    noteLabel,
    notes,
    onNotesChange,
    notesDisabled = false,
}: PaySectionProps) {
    const [promoOpen, setPromoOpen] = useState(false);
    const [promoInput, setPromoInput] = useState('');
    const paidToday = paymentOption === 'offline' ? 0 : total;
    const todayShare = total > 0 ? Math.max(22, Math.round((paidToday / total) * 100)) : 22;
    const balance = walletBalance ?? 0;
    const walletShort = paymentOption === 'online' && balance < total;

    const methods: { id: PaymentOption; label: string; hint: string }[] = [
        ...(supportsOnlinePayment
            ? [
                  {
                      id: 'online' as const,
                      label: 'Proxideck wallet',
                      hint: `Balance ${formatNaira(balance)} · ${balance >= total ? 'held safely until your visit' : 'not enough for this booking'}`,
                  },
                  { id: 'card' as const, label: 'Card or bank transfer', hint: 'Visa, Mastercard, Verve or transfer' },
              ]
            : []),
        ...(supportsOfflineBooking ? [{ id: 'offline' as const, label: 'Pay at the visit', hint: `Pay ${businessName} on the day` }] : []),
    ];

    const footnote =
        paymentOption === 'online'
            ? walletShort
                ? null
                : `Wallet after this: ${formatNaira(balance - total)}`
            : paymentOption === 'card'
              ? 'You’ll be sent to a secure payment page'
              : 'Nothing to pay now';

    return (
        <section className="flex flex-col gap-4 rounded-[22px] border border-line p-5 sm:p-5.5">
            {showPayment ? (
                <>
            <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-bold">How you’ll pay</h2>
                <span className="text-sm text-moss">Total {formatNaira(total)}</span>
            </div>

            <div className="flex h-16 gap-[3px] overflow-hidden rounded-2xl">
                <div className="flex min-w-[120px] flex-col justify-center bg-lime px-3.5 py-2.5 text-forest sm:min-w-[150px]" style={{ flex: `0 0 ${todayShare}%` }}>
                    <span className="text-xs font-bold">Today</span>
                    <span className="text-[17px] font-bold">{formatNaira(paidToday)}</span>
                </div>
                <div className="flex min-w-[110px] flex-1 flex-col justify-center bg-mint px-3.5 py-2.5 text-forest">
                    <span className="text-xs font-bold">At the visit</span>
                    <span className="text-[17px] font-bold">{formatNaira(total - paidToday)}</span>
                </div>
            </div>

            <div role="radiogroup" aria-label="Payment method" className="flex flex-wrap gap-2.5">
                {methods.map((method) => {
                    const active = method.id === paymentOption;

                    return (
                        <button
                            key={method.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => onPaymentOptionChange(method.id)}
                            className={cn(
                                'flex flex-[1_1_220px] items-center gap-3 rounded-2xl p-3.5 text-left text-ink',
                                active ? 'border-2 border-forest bg-paper' : 'border border-line bg-white hover:bg-paper',
                            )}
                        >
                            <RadioDot active={active} />
                            <span className="flex-1">
                                <span className="block text-[15px] font-bold">{method.label}</span>
                                <span className="block text-xs text-moss">{method.hint}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-2.5 text-[13px] text-moss">
                <span>
                    {walletShort ? (
                        <>
                            You need {formatNaira(total - balance)} more.{' '}
                            <Link href={wallet.index()} className="font-bold text-forest">
                                Top up wallet
                            </Link>{' '}
                            or pay by card
                        </>
                    ) : (
                        footnote
                    )}
                    {!promo && !promoOpen && (
                        <>
                            {' · '}
                            <button type="button" onClick={() => setPromoOpen(true)} className="font-bold text-forest hover:underline">
                                Have a promo code?
                            </button>
                        </>
                    )}
                </span>

                {promo && (
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-mint px-2.5 py-1 font-bold text-leaf">{promo.code}</span>
                        <span>−{formatNaira(promoDiscount)} off this visit</span>
                        <button type="button" onClick={onRemovePromo} className="font-bold text-forest hover:underline">
                            Remove
                        </button>
                    </span>
                )}

                {!promo && promoOpen && (
                    <form
                        className="flex flex-col gap-1.5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (promoInput.trim()) {
                                onApplyPromo(promoInput.trim());
                            }
                        }}
                    >
                        <div className="flex gap-2">
                            <label className="sr-only" htmlFor="promo-code">
                                Promo code
                            </label>
                            <Input
                                id="promo-code"
                                value={promoInput}
                                onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                                placeholder="Enter code"
                                autoComplete="off"
                                autoFocus
                                className="h-10.5 min-w-0 flex-1 rounded-full border-[#DDE3DE] px-4 text-sm font-semibold tracking-wide text-ink uppercase shadow-none"
                            />
                            <Button
                                type="submit"
                                disabled={checkingPromo || !promoInput.trim()}
                                className="h-10.5 rounded-full bg-forest px-4.5 text-sm font-bold text-white hover:bg-ink disabled:bg-forest/40"
                            >
                                {checkingPromo ? 'Checking…' : 'Apply'}
                            </Button>
                        </div>
                        {promoError && (
                            <span role="alert" className="text-destructive">
                                {promoError}
                            </span>
                        )}
                    </form>
                )}
            </div>
                </>
            ) : (
                <h2 className="text-lg font-bold">Before you confirm</h2>
            )}

            <label
                className={cn(
                    'flex flex-col gap-2 text-[15px] font-bold',
                    showPayment && 'border-t border-[#EEF2EF] pt-4',
                )}
            >
                {noteLabel}
                <Textarea
                    rows={3}
                    maxLength={500}
                    value={notes}
                    disabled={notesDisabled}
                    onChange={(event) => onNotesChange(event.target.value)}
                    placeholder="Hair type, length, allergies…"
                    className="rounded-xl border-0 bg-paper text-sm font-normal shadow-none focus-visible:ring-0"
                />
            </label>
        </section>
    );
}
