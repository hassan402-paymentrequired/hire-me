import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

import type { ProviderSettings, TimeSlot } from '../types';

interface DateTimePickerProps {
    selectedDate: Date;
    onSelectedDateChange: (date: Date) => void;
    canBookProvider: boolean;
    providerSettings: ProviderSettings;
    loading: boolean;
    apiMessage: string | null;
    selectedSlot: string;
    onSelectedSlotChange: (slot: string) => void;
    categorizedSlots: {
        morning: TimeSlot[];
        afternoon: TimeSlot[];
        evening: TimeSlot[];
    };
    availableSlots: TimeSlot[];
    useCustomTime: boolean;
    onUseCustomTimeChange: (next: boolean) => void;
    customTime: string;
    onCustomTimeChange: (next: string) => void;
}

export function DateTimePicker({
    selectedDate,
    onSelectedDateChange,
    canBookProvider,
    providerSettings,
    loading,
    apiMessage,
    selectedSlot,
    onSelectedSlotChange,
    categorizedSlots,
    availableSlots,
    useCustomTime,
    onUseCustomTimeChange,
    customTime,
    onCustomTimeChange,
}: DateTimePickerProps) {
    const buildDatetime = (time: string) =>
        time
            ? `${format(selectedDate, 'yyyy-MM-dd')}T${time}:00`
            : '';

    return (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col md:h-[420px] md:flex-row">
                <div className="flex shrink-0 justify-center border-b px-2 py-3 md:border-r md:border-b-0 md:p-3">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (date) {
                                onSelectedDateChange(date);
                                onSelectedSlotChange('');
                            }
                        }}
                        disabled={(date) => {
                            if (!canBookProvider) {
                                return true;
                            }

                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const selected = new Date(date);
                            selected.setHours(0, 0, 0, 0);

                            if (selected < today) return true;

                            if (
                                !providerSettings.allowSameDay &&
                                selected.getTime() === today.getTime()
                            ) {
                                return true;
                            }

                            const advanceDays =
                                Number(providerSettings.advanceBooking) || 30;
                            const maxDate = new Date(today);
                            maxDate.setDate(maxDate.getDate() + advanceDays);

                            if (selected > maxDate) return true;

                            return false;
                        }}
                        className="w-[280px] rounded-md"
                    />
                </div>

                <div className="flex min-w-0 flex-1 flex-col space-y-3 bg-muted/5 px-3 pb-2 pt-4 md:overflow-hidden md:p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold tracking-tight uppercase md:text-xl md:tracking-tighter">
                            {format(selectedDate, 'EEEE, MMM d')}
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center px-8 text-center text-muted-foreground">
                            <p className="-3 mb-2 py-2 font-medium">
                                {apiMessage || 'No availability for this date'}
                            </p>
                            <p className="text-xs">
                                Try selecting fewer services or picking another
                                date.
                            </p>
                            {providerSettings.allowOffHoursRequests && (
                                <div className="mt-4 w-full max-w-xs rounded-lg border bg-background p-3 text-left">
                                    <p className="text-xs font-bold text-foreground">
                                        Request an off-hours time
                                    </p>
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        The provider will need to confirm. Your
                                        booking will be pending.
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <Input
                                            type="time"
                                            value={customTime}
                                            disabled={!canBookProvider}
                                            onChange={(e) => {
                                                const t = e.target.value;
                                                onUseCustomTimeChange(true);
                                                onCustomTimeChange(t);
                                                onSelectedSlotChange(
                                                    buildDatetime(t),
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="pb-6 md:min-h-0 md:flex-1 md:overflow-y-auto md:pb-0 md:pr-1">
                            <div className="space-y-6 md:space-y-8">
                                {(['morning', 'afternoon', 'evening'] as const).map(
                                    (cat) => {
                                        const slots = categorizedSlots[cat];
                                        if (slots.length === 0) return null;
                                        return (
                                            <div key={cat} className="space-y-3 md:space-y-4">
                                                <h4 className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
                                                    {cat}
                                                </h4>
                                                <div className="grid grid-cols-3 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
                                                    {slots.map((slot) => (
                                                        <Button
                                                            key={slot.datetime}
                                                            size="sm"
                                                            variant={
                                                                selectedSlot ===
                                                                slot.datetime
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            className={cn(
                                                                'h-9 rounded-md px-2 text-[11px] font-semibold transition-all md:h-10 md:text-xs lg:text-sm',
                                                                selectedSlot ===
                                                                    slot.datetime
                                                                    ? 'border-primary md:scale-[1.02]'
                                                                    : 'hover:border-primary/30 hover:bg-primary/5',
                                                            )}
                                                            disabled={
                                                                !canBookProvider
                                                            }
                                                            onClick={() => {
                                                                onUseCustomTimeChange(
                                                                    false,
                                                                );
                                                                onCustomTimeChange(
                                                                    '',
                                                                );
                                                                onSelectedSlotChange(
                                                                    slot.datetime,
                                                                );
                                                            }}
                                                        >
                                                            {slot.display}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                                {providerSettings.allowOffHoursRequests && (
                                    <div className="rounded-lg border bg-background p-3">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-foreground">
                                                    Request off-hours time
                                                </p>
                                                <p className="mt-1 text-[11px] text-muted-foreground">
                                                    If you can’t find a slot,
                                                    request a custom time. It
                                                    will be pending.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="shrink-0 self-start sm:self-auto"
                                                disabled={!canBookProvider}
                                                onClick={() => {
                                                    onUseCustomTimeChange(
                                                        !useCustomTime,
                                                    );
                                                    onSelectedSlotChange('');
                                                    onCustomTimeChange('');
                                                }}
                                            >
                                                {useCustomTime
                                                    ? 'Cancel'
                                                    : 'Request'}
                                            </Button>
                                        </div>

                                        {useCustomTime && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <Input
                                                    type="time"
                                                    value={customTime}
                                                    disabled={!canBookProvider}
                                                    onChange={(e) => {
                                                        const t = e.target.value;
                                                        onCustomTimeChange(t);
                                                        onSelectedSlotChange(
                                                            buildDatetime(t),
                                                        );
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DateTimePicker;
