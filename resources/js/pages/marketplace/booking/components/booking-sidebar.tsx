import { formatNaira } from '@/components/site/provider-card';
import { getProviderDefaultBanner } from '@/lib/provider-banner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

import { formatClock, formatDuration } from '../format';
import type { Provider } from '../types';

export type BookingProvider = Provider & {
    city?: string | null;
    category?: string | null;
    cover?: string | null;
    rating?: number;
    reviewsCount?: number;
    latitude?: number | null;
    longitude?: number | null;
};

export interface SidebarLine {
    id: string;
    name: string;
    proName: string;
    price: number;
}

interface BookingSidebarProps {
    provider: BookingProvider;
    lines: SidebarLine[];
    durationMinutes: number;
    selectedSlot: string;
    whereLabel: string;
    originalPrice: number;
    discountAmount: number;
    discountPercent: number;
    promoCode: string | null;
    promoDiscount: number;
    homeServiceFee: number;
    totalPrice: number;
    paidToday: number;
    ctaLabel: string;
    ctaDisabled: boolean;
    ctaHint: string | null;
    onContinue: () => void;
}

export function BookingSidebar({
    provider,
    lines,
    durationMinutes,
    selectedSlot,
    whereLabel,
    discountAmount,
    discountPercent,
    promoCode,
    promoDiscount,
    homeServiceFee,
    totalPrice,
    paidToday,
    ctaLabel,
    ctaDisabled,
    ctaHint,
    onContinue,
}: BookingSidebarProps) {
    const cover = provider.cover ?? provider.logo ?? getProviderDefaultBanner(provider.category, provider.id);
    const slot = selectedSlot ? new Date(selectedSlot) : null;

    return (
        <div className="flex flex-col gap-4.5 rounded-3xl border border-line p-6 shadow-[0_12px_40px_rgba(19,32,27,0.08)]">
            <div className="flex items-center gap-3.5">
                <img src={cover} alt="" className="size-15 shrink-0 rounded-[14px] object-cover" />
                <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="truncate text-[17px] font-bold">{provider.businessName}</div>
                    <div className="text-[13px] text-moss">
                        {provider.reviewsCount ? (
                            <>
                                <strong className="text-ink">{provider.rating}</strong> ({provider.reviewsCount.toLocaleString()})
                            </>
                        ) : (
                            'New on Proxideck'
                        )}
                        {provider.city && ` · ${provider.city}`}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-[#EEF2EF] pt-4 text-sm text-moss">
                <SummaryRow label="When" value={slot ? `${format(slot, 'EEE d MMM')} · ${formatClock(slot)}` : '—'} />
                <SummaryRow label="Where" value={whereLabel} />
                <SummaryRow label="Length" value={durationMinutes ? formatDuration(durationMinutes) : '—'} />
            </div>

            <div className="flex flex-col gap-2 border-t border-[#EEF2EF] pt-4">
                {lines.length === 0 && <span className="text-sm text-moss">No services yet</span>}
                {lines.map((line) => (
                    <div key={line.id} className="flex justify-between gap-3 text-[15px]">
                        <span className="min-w-0">
                            <span className="capitalize">{line.name}</span>
                            <span className="block text-xs text-moss">with {line.proName}</span>
                        </span>
                        <span className="font-semibold">{formatNaira(line.price)}</span>
                    </div>
                ))}
                {homeServiceFee > 0 && <PriceRow label="Home service" amount={formatNaira(homeServiceFee)} />}
                {discountAmount > 0 && <PriceRow label={`Regular discount (${discountPercent}%)`} amount={`−${formatNaira(discountAmount)}`} positive />}
                {promoDiscount > 0 && <PriceRow label={`Promo ${promoCode}`} amount={`−${formatNaira(promoDiscount)}`} positive />}
            </div>

            <div className="flex flex-col gap-1.5 border-t border-[#EEF2EF] pt-4">
                <div className="flex justify-between text-[17px] font-bold">
                    <span>Total</span>
                    <span>{formatNaira(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-leaf">
                    <span>Due today</span>
                    <span>{formatNaira(paidToday)}</span>
                </div>
                <div className="flex justify-between text-sm text-moss">
                    <span>Pay at the visit</span>
                    <span>{formatNaira(totalPrice - paidToday)}</span>
                </div>
            </div>

            <button
                type="button"
                onClick={onContinue}
                disabled={ctaDisabled}
                className="h-14 rounded-full bg-forest text-[17px] font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-[#CCD2C6]"
            >
                {ctaLabel}
            </button>
            {ctaHint && <p className="-mt-2 text-center text-[13px] text-moss">{ctaHint}</p>}
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4">
            <span>{label}</span>
            <span className="truncate text-right font-semibold text-ink">{value}</span>
        </div>
    );
}

function PriceRow({ label, amount, positive = false }: { label: string; amount: string; positive?: boolean }) {
    return (
        <div className={cn('flex justify-between gap-3 text-[15px]', positive && 'text-leaf')}>
            <span>{label}</span>
            <span className="font-semibold">{amount}</span>
        </div>
    );
}
