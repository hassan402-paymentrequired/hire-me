import KeenIcon from '@/components/keen-icon';
import { AppSelect } from '@/components/ui/app-select';
import { formatHour, toHours, type DaySchedule } from '@/lib/schedule';
import { cn } from '@/lib/utils';

interface DayScheduleRowProps {
    day: string;
    schedule?: DaySchedule;
    onToggle(day: string): void;
    onTimeChange(
        day: string,
        shiftIndex: number,
        field: 'start' | 'end',
        value: string,
    ): void;
    onAddBreak(day: string, shiftIndex: number): void;
    onRemoveBreak(day: string, shiftIndex: number, breakIndex: number): void;
    onBreakChange(
        day: string,
        shiftIndex: number,
        breakIndex: number,
        field: 'start' | 'end',
        value: string,
    ): void;
    onCopyToAll?(day: string): void;
    errors?: Record<string, string>;
}

const timeOptions = Array.from({ length: 48 }, (_, index) => {
    const value = `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}`;

    return { value, label: formatHour(toHours(value)) };
});

function TimeSelect({
    value,
    label,
    onChange,
    error,
}: {
    value?: string;
    label: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <AppSelect
            value={value}
            onChange={onChange}
            options={timeOptions}
            error={error}
            searchable={false}
            size="sm"
            className="w-[136px]"
            triggerClassName="min-h-11 rounded-[10px] font-semibold"
            placeholder={label}
            ariaLabel={label}
        />
    );
}

export default function DayScheduleRow({
    day,
    schedule,
    onToggle,
    onTimeChange,
    onAddBreak,
    onRemoveBreak,
    onBreakChange,
    onCopyToAll,
    errors,
}: DayScheduleRowProps) {
    const shiftIndex = 0;
    const shift = schedule?.shifts?.[shiftIndex];
    const isOpen = Boolean(schedule?.isOpen);
    const errorFor = (path: string) =>
        errors?.[`schedule.${day}.shifts.0.${path}`];

    return (
        <div
            className={cn(
                'flex flex-wrap items-start gap-x-5 gap-y-4 px-[22px] py-[18px]',
                !isOpen && 'bg-muted/40',
            )}
        >
            <div className="flex min-h-11 w-[170px] items-center gap-3.5">
                <button
                    type="button"
                    role="switch"
                    aria-checked={isOpen}
                    aria-label={`${day} open`}
                    onClick={() => onToggle(day)}
                    className={cn(
                        'flex h-7 w-12 shrink-0 items-center rounded-full p-[3px] transition-colors focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 focus-visible:outline-none',
                        isOpen
                            ? 'justify-end bg-[#0E3B2E]'
                            : 'justify-start bg-[#D5DDD8] dark:bg-white/15',
                    )}
                >
                    <span
                        className={cn(
                            'size-[22px] rounded-full',
                            isOpen ? 'bg-[#C8F169]' : 'bg-white',
                        )}
                    />
                </button>
                <span
                    className={cn(
                        'font-[Sora] text-[15px] font-semibold',
                        isOpen ? 'text-foreground' : 'text-muted-foreground',
                    )}
                >
                    {day}
                </span>
            </div>

            {isOpen && shift ? (
                <div className="flex flex-[1_1_360px] flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <TimeSelect
                            value={shift.start}
                            label={`${day} opens`}
                            onChange={(value) =>
                                onTimeChange(day, shiftIndex, 'start', value)
                            }
                            error={errorFor('start')}
                        />
                        <span className="font-bold text-muted-foreground">
                            –
                        </span>
                        <TimeSelect
                            value={shift.end}
                            label={`${day} closes`}
                            onChange={(value) =>
                                onTimeChange(day, shiftIndex, 'end', value)
                            }
                            error={errorFor('end')}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {(shift.breaks ?? []).map((breakTime, breakIndex) => (
                            <div
                                key={breakIndex}
                                className="flex items-center gap-1.5 rounded-full border border-dashed border-[#0E3B2E]/20 bg-muted/60 py-1 pr-1 pl-3 dark:border-white/15"
                            >
                                <span className="text-xs font-bold text-muted-foreground">
                                    Break
                                </span>
                                <AppSelect
                                    value={breakTime.start}
                                    ariaLabel={`${day} break ${breakIndex + 1} start`}
                                    onChange={(value) =>
                                        onBreakChange(
                                            day,
                                            shiftIndex,
                                            breakIndex,
                                            'start',
                                            value,
                                        )
                                    }
                                    options={timeOptions}
                                    searchable={false}
                                    size="sm"
                                    triggerClassName="h-7 min-h-7 w-[104px] gap-1 border-0 bg-transparent px-1.5 text-xs font-bold hover:bg-card"
                                />
                                <span className="text-xs text-muted-foreground">
                                    –
                                </span>
                                <AppSelect
                                    value={breakTime.end}
                                    ariaLabel={`${day} break ${breakIndex + 1} end`}
                                    onChange={(value) =>
                                        onBreakChange(
                                            day,
                                            shiftIndex,
                                            breakIndex,
                                            'end',
                                            value,
                                        )
                                    }
                                    options={timeOptions}
                                    searchable={false}
                                    size="sm"
                                    triggerClassName="h-7 min-h-7 w-[104px] gap-1 border-0 bg-transparent px-1.5 text-xs font-bold hover:bg-card"
                                />
                                <button
                                    type="button"
                                    aria-label={`Remove ${day} break ${breakIndex + 1}`}
                                    onClick={() =>
                                        onRemoveBreak(
                                            day,
                                            shiftIndex,
                                            breakIndex,
                                        )
                                    }
                                    className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-card hover:text-foreground"
                                >
                                    <KeenIcon
                                        name="cross-circle"
                                        className="text-sm"
                                    />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => onAddBreak(day, shiftIndex)}
                            className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-bold text-[#0E3B2E] hover:bg-[#E6F4EC] dark:text-[#C8F169] dark:hover:bg-[#0E3B2E]"
                        >
                            <KeenIcon name="plus" className="text-xs" />
                            Add break
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex min-h-11 flex-[1_1_360px] items-center">
                    <span className="rounded-full bg-muted px-3 py-1.5 text-[13px] font-bold text-muted-foreground">
                        Closed all day
                    </span>
                </div>
            )}

            {onCopyToAll && isOpen && (
                <button
                    type="button"
                    onClick={() => onCopyToAll(day)}
                    className="flex h-9 items-center gap-1.5 rounded-[10px] bg-[#E6F4EC] px-3 text-xs font-bold whitespace-nowrap text-[#0E3B2E] hover:bg-[#d6ecdf] dark:bg-[#0E3B2E] dark:text-[#C8F169]"
                >
                    <KeenIcon name="copy" className="text-[13px]" />
                    Copy to all
                </button>
            )}
        </div>
    );
}
