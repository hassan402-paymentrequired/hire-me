import { cn } from '@/lib/utils';
import { addDays, format, isSameDay, isSameMonth, isSameYear, startOfDay, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { DayAvailability } from '../types';

const FEW_SLOTS_LEFT = 3;

interface WeekStripProps {
    weekStart: Date;
    onWeekChange: (weekStart: Date) => void;
    selectedDate: Date;
    onSelect: (date: Date) => void;
    isDisabled: (date: Date) => boolean;
    maxDate: Date;
    availability: Record<string, DayAvailability>;
}

const weekRangeLabel = (start: Date): string => {
    const end = addDays(start, 6);
    if (isSameMonth(start, end)) {
        return format(start, 'MMMM yyyy');
    }

    return isSameYear(start, end) ? `${format(start, 'MMM')} – ${format(end, 'MMM yyyy')}` : `${format(start, 'MMM yyyy')} – ${format(end, 'MMM yyyy')}`;
};

/** "Pick a time" heading with week navigation, then seven day buttons showing how open each day is. */
export function WeekStrip({ weekStart, onWeekChange, selectedDate, onSelect, isDisabled, maxDate, availability }: WeekStripProps) {
    const thisWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
    const canGoBack = weekStart > thisWeek;
    const canGoForward = addDays(weekStart, 7) <= startOfDay(maxDate);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <h1 className="text-[40px] leading-tight font-bold tracking-tight">Pick a time</h1>
                <div className="flex items-center gap-2">
                    <span className="mr-2 font-bold">{weekRangeLabel(weekStart)}</span>
                    <button
                        type="button"
                        aria-label="Previous week"
                        disabled={!canGoBack}
                        onClick={() => onWeekChange(addDays(weekStart, -7))}
                        className="grid size-10 place-items-center rounded-full border border-[#DDE3DE] hover:bg-paper disabled:opacity-40"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                    <button
                        type="button"
                        aria-label="Next week"
                        disabled={!canGoForward}
                        onClick={() => onWeekChange(addDays(weekStart, 7))}
                        className="grid size-10 place-items-center rounded-full border border-[#DDE3DE] hover:bg-paper disabled:opacity-40"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
                {days.map((day) => {
                    const summary = availability[format(day, 'yyyy-MM-dd')];
                    const disabled = isDisabled(day) || Boolean(summary?.closed);
                    const active = isSameDay(day, selectedDate);
                    const hint = summary?.closed ? 'Closed' : summary ? (summary.slots === 0 ? 'Full' : summary.slots <= FEW_SLOTS_LEFT ? `${summary.slots} left` : `${summary.slots} slots`) : null;

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            disabled={disabled}
                            aria-pressed={active}
                            aria-label={`${format(day, 'EEEE d MMMM')}${hint ? `, ${hint}` : ''}`}
                            onClick={() => onSelect(day)}
                            className={cn('flex flex-col items-center gap-1.5', disabled ? 'cursor-not-allowed text-[#99A58D]' : 'text-ink')}
                        >
                            <span
                                className={cn(
                                    'grid size-11 place-items-center rounded-full border text-lg font-bold sm:size-16 sm:text-[22px]',
                                    active ? 'border-forest bg-forest text-white' : 'border-[#DDE3DE] bg-white',
                                    disabled && 'border-dashed',
                                )}
                            >
                                {format(day, 'd')}
                            </span>
                            <span className="text-sm font-medium">{format(day, 'EEE')}</span>
                            <span
                                className={cn(
                                    'h-4 text-[11px] font-semibold sm:text-xs',
                                    summary?.closed || summary?.slots === 0 ? 'text-[#99A58D]' : summary && summary.slots <= FEW_SLOTS_LEFT ? 'text-[#7A5200]' : 'text-moss',
                                )}
                            >
                                {disabled && !summary?.closed ? '' : hint}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
