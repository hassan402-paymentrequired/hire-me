import { AppSelect } from '@/components/ui/app-select';
import { cn } from '@/lib/utils';

import type { RecurrencePattern } from '../types';

const REPEAT_OPTIONS: { value: RecurrencePattern | null; label: string; gap: string }[] = [
    { value: null, label: 'Once', gap: '' },
    { value: 'weekly', label: 'Weekly', gap: 'in 1 week' },
    { value: 'bi_weekly', label: 'Every 2 wks', gap: 'in 2 weeks' },
    { value: 'monthly', label: 'Monthly', gap: 'in 4 weeks' },
];

const VISIT_COUNT_OPTIONS = [4, 8, 12];

interface VisitExtrasProps {
    recurrencePattern: RecurrencePattern | null;
    onRecurrencePatternChange: (pattern: RecurrencePattern | null) => void;
    recurrenceCount: number | null;
    onRecurrenceCountChange: (count: number | null) => void;
    recurringDiscountPercent: number;
    disabled: boolean;
}

/** Repeat booking on a schedule — full-width card on the confirm step. */
export function VisitExtras({
    recurrencePattern,
    onRecurrencePatternChange,
    recurrenceCount,
    onRecurrenceCountChange,
    recurringDiscountPercent,
    disabled,
}: VisitExtrasProps) {
    const current = REPEAT_OPTIONS.find((option) => option.value === recurrencePattern) ?? REPEAT_OPTIONS[0];
    const isRecurring = Boolean(current.value);
    const futureSaving =
        recurringDiscountPercent > 0
            ? ` You save ${recurringDiscountPercent}% from your 2nd visit onward.`
            : '';

    const hint = isRecurring
        ? `Next one: same time, ${current.gap}.${futureSaving} Cancel any time.`
        : `Book the same slot again automatically.${futureSaving}`;

    return (
        <section className="flex w-full flex-col gap-3 rounded-[22px] border border-line p-4.5 sm:gap-3.5 sm:p-5.5">
            <span className="text-[15px] font-bold">Make it a regular</span>

            <div role="radiogroup" aria-label="Repeat" className="flex gap-1 rounded-full bg-[#F2F5F2] p-1">
                {REPEAT_OPTIONS.map((option) => {
                    const active = option.value === recurrencePattern;

                    return (
                        <button
                            key={option.label}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            disabled={disabled}
                            onClick={() => {
                                onRecurrencePatternChange(option.value);
                                if (!option.value) {
                                    onRecurrenceCountChange(null);
                                }
                            }}
                            className={cn(
                                'h-8.5 flex-1 rounded-full px-1 text-xs font-bold whitespace-nowrap sm:text-sm',
                                active ? 'bg-white text-ink shadow-[0_1px_3px_rgba(19,32,27,0.12)]' : 'text-moss hover:text-ink',
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>

            <p className="text-xs leading-relaxed text-moss sm:text-sm">{hint}</p>

            {isRecurring && (
                <div className="flex flex-col gap-2 rounded-2xl bg-paper px-3.5 py-3 sm:flex-row sm:items-center sm:gap-3">
                    <span id="recurrence-count-label" className="text-[13px] font-bold text-ink">
                        For how long?
                    </span>
                    <AppSelect
                        aria-labelledby="recurrence-count-label"
                        value={recurrenceCount ? String(recurrenceCount) : ''}
                        onChange={(value) => onRecurrenceCountChange(value ? Number(value) : null)}
                        disabled={disabled}
                        searchable={false}
                        size="sm"
                        placeholder="Until I cancel"
                        className="w-full sm:max-w-[11.5rem]"
                        triggerClassName="h-10 min-h-10 w-full rounded-xl border border-[#DDE3DE] bg-white px-3 text-sm font-semibold text-ink"
                        options={[
                            { value: '', label: 'Until I cancel' },
                            ...VISIT_COUNT_OPTIONS.map((count) => ({ value: String(count), label: `${count} visits` })),
                        ]}
                    />
                </div>
            )}
        </section>
    );
}