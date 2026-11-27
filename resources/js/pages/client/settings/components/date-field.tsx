import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { settingsInputClass } from '@/pages/client/settings/components/settings-field';
import { format, isValid, parse } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';
import { Popover } from 'radix-ui';
import { useMemo, useState } from 'react';

const VALUE_FORMAT = 'yyyy-MM-dd';
const DISPLAY_FORMAT = 'dd / MM / yyyy';

/**
 * A date input that opens the app calendar. The value is a "YYYY-MM-DD" string.
 */
export function DateField({
    id,
    value,
    onChange,
    placeholder = 'DD / MM / YYYY',
    fromYear = 1920,
    maxDate,
    allowFuture = false,
    triggerClassName = settingsInputClass,
    invalid,
}: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    fromYear?: number;
    maxDate?: Date;
    /** When true, dates after today can be selected (e.g. holidays). */
    allowFuture?: boolean;
    triggerClassName?: string;
    invalid?: boolean;
}) {
    const [open, setOpen] = useState(false);

    const selected = useMemo(() => {
        if (!value) {
            return undefined;
        }

        const parsed = parse(value, VALUE_FORMAT, new Date());

        return isValid(parsed) ? parsed : undefined;
    }, [value]);

    const today = new Date();
    const latest = allowFuture ? (maxDate ?? new Date(today.getFullYear() + 5, 11, 31)) : (maxDate ?? today);
    const [month, setMonth] = useState<Date>(() => {
        if (selected) {
            return selected;
        }

        if (allowFuture) {
            return today;
        }

        return new Date(latest.getFullYear() - 25, 0, 1);
    });

    return (
        <Popover.Root
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (next && selected) {
                    setMonth(selected);
                }
            }}
        >
            <div className="relative">
                <Popover.Trigger asChild>
                    <button
                        id={id}
                        type="button"
                        aria-haspopup="dialog"
                        aria-expanded={open}
                        aria-invalid={invalid}
                        className={cn(
                            triggerClassName,
                            'flex items-center justify-between gap-3 text-left',
                            open && 'border-[#0E3B2E]',
                        )}
                    >
                        <span className={cn(!selected && 'text-sage')}>
                            {selected
                                ? format(selected, DISPLAY_FORMAT)
                                : placeholder}
                        </span>
                        <CalendarDays
                            aria-hidden
                            className={cn(
                                'size-4 shrink-0 text-moss',
                                selected && 'mr-7',
                            )}
                        />
                    </button>
                </Popover.Trigger>
                {selected && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        aria-label="Clear date"
                        className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full text-moss hover:bg-paper hover:text-ink"
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>

            <Popover.Portal>
                <Popover.Content
                    align="start"
                    sideOffset={6}
                    collisionPadding={12}
                    className="z-50 rounded-2xl border border-[#0E3B2E]/10 bg-white p-2 shadow-[0_20px_50px_rgba(14,59,46,0.18)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
                >
                    <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        selected={selected}
                        month={month}
                        onMonthChange={setMonth}
                        startMonth={new Date(fromYear, 0)}
                        endMonth={latest}
                        disabled={allowFuture ? undefined : { after: maxDate ?? today }}
                        onSelect={(date) => {
                            onChange(date ? format(date, VALUE_FORMAT) : '');
                            setOpen(false);
                        }}
                        className="bg-white [--cell-size:--spacing(9)] [&_[data-selected-single=true]]:bg-forest [&_[data-selected-single=true]]:text-white"
                    />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
