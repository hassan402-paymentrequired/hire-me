import { formatNaira } from '@/components/site/provider-card';
import { cn } from '@/lib/utils';
import promoCodes from '@/routes/business/promo-codes';
import { router, useForm } from '@inertiajs/react';
import { addDays, format } from 'date-fns';
import { useState } from 'react';

export interface ProviderPromoCode {
    id: string;
    code: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    maxUses: number | null;
    timesUsed: number;
    expiresAt: string | null;
    isActive: boolean;
    isExpired: boolean;
}

const inputClass =
    'h-11 min-w-0 rounded-[10px] border border-[#0E3B2E]/15 bg-transparent px-3 text-sm font-semibold text-foreground outline-none focus:ring-[3px] focus:ring-[#C8F169]/60 dark:border-white/15';

/** Create, pause and delete the codes clients can enter at checkout. */
export function PromoCodesSection({ codes }: { codes: ProviderPromoCode[] }) {
    const [earliestExpiry] = useState(() => format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    const form = useForm({
        code: '',
        discount_type: 'percent' as 'percent' | 'fixed',
        discount_value: '',
        max_uses: '',
        expires_at: '',
    });

    const create = (event: React.FormEvent) => {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            max_uses: data.max_uses || null,
            expires_at: data.expires_at || null,
        }));
        form.post(promoCodes.store().url, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <section className="overflow-hidden rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10">
            <div className="px-[22px] py-[18px]">
                <h2 className="font-[Sora] text-lg font-semibold text-foreground">Promo codes</h2>
                <p className="text-[13px] text-muted-foreground">
                    Clients enter these at checkout. Each code takes money off the first visit of a booking.
                </p>
            </div>

            <form onSubmit={create} className="flex flex-col gap-2 border-t border-[#0E3B2E]/[0.07] px-[22px] py-4 dark:border-white/10">
                <div className="flex flex-wrap items-end gap-2.5">
                    <Field label="Code" error={form.errors.code} className="flex-[1_1_140px]">
                        <input
                            value={form.data.code}
                            onChange={(event) => form.setData('code', event.target.value.toUpperCase())}
                            placeholder="GLOW10"
                            maxLength={32}
                            className={cn(inputClass, 'w-full tracking-wide uppercase')}
                        />
                    </Field>
                    <Field label="Discount" error={form.errors.discount_value ?? form.errors.discount_type} className="flex-[1_1_180px]">
                        <div className="flex gap-1.5">
                            <input
                                type="number"
                                min="1"
                                step="any"
                                value={form.data.discount_value}
                                onChange={(event) => form.setData('discount_value', event.target.value)}
                                placeholder={form.data.discount_type === 'percent' ? '10' : '2000'}
                                className={cn(inputClass, 'w-full')}
                            />
                            <select
                                aria-label="Discount type"
                                value={form.data.discount_type}
                                onChange={(event) => form.setData('discount_type', event.target.value as 'percent' | 'fixed')}
                                className={cn(inputClass, 'w-20')}
                            >
                                <option value="percent">%</option>
                                <option value="fixed">₦</option>
                            </select>
                        </div>
                    </Field>
                    <Field label="Uses" error={form.errors.max_uses} className="flex-[0_1_110px]">
                        <input
                            type="number"
                            min="1"
                            value={form.data.max_uses}
                            onChange={(event) => form.setData('max_uses', event.target.value)}
                            placeholder="No limit"
                            className={cn(inputClass, 'w-full')}
                        />
                    </Field>
                    <Field label="Expires" error={form.errors.expires_at} className="flex-[0_1_160px]">
                        <input
                            type="date"
                            min={earliestExpiry}
                            value={form.data.expires_at}
                            onChange={(event) => form.setData('expires_at', event.target.value)}
                            className={cn(inputClass, 'w-full')}
                        />
                    </Field>
                    <button
                        type="submit"
                        disabled={form.processing || !form.data.code || !form.data.discount_value}
                        className="h-11 rounded-full bg-[#0E3B2E] px-5 text-sm font-bold text-white disabled:opacity-50"
                    >
                        {form.processing ? 'Adding…' : 'Add code'}
                    </button>
                </div>
            </form>

            {codes.length > 0 && (
                <ul className="divide-y divide-[#0E3B2E]/[0.07] border-t border-[#0E3B2E]/[0.07] dark:divide-white/10 dark:border-white/10">
                    {codes.map((code) => (
                        <li key={code.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-[22px] py-3.5">
                            <span className="flex flex-[1_1_220px] flex-col gap-0.5">
                                <span className="flex items-center gap-2 text-[15px] font-bold text-foreground">
                                    {code.code}
                                    <StatusBadge code={code} />
                                </span>
                                <span className="text-[13px] text-muted-foreground">
                                    {code.discountType === 'percent' ? `${code.discountValue}% off` : `${formatNaira(code.discountValue)} off`}
                                    {' · '}
                                    {code.maxUses ? `${code.timesUsed} of ${code.maxUses} used` : `${code.timesUsed} used`}
                                    {code.expiresAt && ` · ends ${format(new Date(code.expiresAt), 'd MMM yyyy')}`}
                                </span>
                            </span>
                            {!code.isExpired && (
                                <button
                                    type="button"
                                    onClick={() => router.patch(promoCodes.update(code.id).url, { is_active: !code.isActive }, { preserveScroll: true, preserveState: true })}
                                    className="h-9 rounded-full border border-[#0E3B2E]/15 px-3.5 text-[13px] font-semibold text-foreground hover:bg-muted"
                                >
                                    {code.isActive ? 'Pause' : 'Resume'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm(`Delete ${code.code}? Clients won’t be able to use it.`)) {
                                        router.delete(promoCodes.destroy(code.id).url, { preserveScroll: true, preserveState: true });
                                    }
                                }}
                                className="h-9 rounded-full px-3 text-[13px] font-semibold text-destructive hover:bg-destructive/10"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
    return (
        <label className={cn('flex flex-col gap-1 text-xs font-bold text-muted-foreground', className)}>
            {label}
            {children}
            {error && <span className="font-medium text-destructive">{error}</span>}
        </label>
    );
}

function StatusBadge({ code }: { code: ProviderPromoCode }) {
    const usedUp = code.maxUses !== null && code.timesUsed >= code.maxUses;
    const [label, tone] = code.isExpired
        ? ['Expired', 'bg-muted text-muted-foreground']
        : usedUp
          ? ['Used up', 'bg-muted text-muted-foreground']
          : code.isActive
            ? ['Active', 'bg-[#E6F4EC] text-[#1F6B43]']
            : ['Paused', 'bg-amber-50 text-amber-800'];

    return <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold', tone)}>{label}</span>;
}
