import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { addMonths, format } from 'date-fns';
import { Repeat } from 'lucide-react';

import type { RecurrencePattern } from '../types';

interface RecurrenceSectionProps {
    canBookProvider: boolean;
    selectedDate: Date;
    recurrencePattern: RecurrencePattern | null;
    onRecurrencePatternChange: (next: RecurrencePattern | null) => void;
    recurrenceEndDate: Date | null;
    onRecurrenceEndDateChange: (next: Date | null) => void;
    recurrenceCount: number | null;
    onRecurrenceCountChange: (next: number | null) => void;
    discountPercent: number;
    discountAmount: number;
}

export function RecurrenceSection({
    canBookProvider,
    selectedDate,
    recurrencePattern,
    onRecurrencePatternChange,
    recurrenceEndDate,
    onRecurrenceEndDateChange,
    recurrenceCount,
    onRecurrenceCountChange,
    discountPercent,
    discountAmount,
}: RecurrenceSectionProps) {
    return (
        <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Repeat className="size-4 text-primary" />
                <span>
                    Book on a schedule and save{' '}
                    <span className="font-semibold text-foreground">
                        {discountPercent || '—'}%
                    </span>{' '}
                    on each booking.
                </span>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Repeat Frequency</Label>
                    <Select
                        value={recurrencePattern || ''}
                        onValueChange={(value) => {
                            if (!value || value === 'once') {
                                onRecurrencePatternChange(null);
                                onRecurrenceEndDateChange(null);
                                onRecurrenceCountChange(null);
                                return;
                            }
                            onRecurrencePatternChange(
                                value as RecurrencePattern,
                            );
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select frequency (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="once">
                                One-time booking
                            </SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="bi_weekly">
                                Bi-weekly (Every 2 weeks)
                            </SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {recurrencePattern && (
                    <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                        <div className="space-y-2">
                            <Label htmlFor="recurrence-end-date">
                                End Date (Optional)
                            </Label>
                            <Input
                                id="recurrence-end-date"
                                type="date"
                                disabled={!canBookProvider}
                                min={format(selectedDate, 'yyyy-MM-dd')}
                                max={format(
                                    addMonths(selectedDate, 12),
                                    'yyyy-MM-dd',
                                )}
                                value={
                                    recurrenceEndDate
                                        ? format(recurrenceEndDate, 'yyyy-MM-dd')
                                        : ''
                                }
                                onChange={(e) => {
                                    if (e.target.value) {
                                        onRecurrenceEndDateChange(
                                            new Date(e.target.value),
                                        );
                                    } else {
                                        onRecurrenceEndDateChange(null);
                                    }
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty to continue indefinitely
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="recurrence-count">
                                Number of Appointments (Optional)
                            </Label>
                            <Input
                                id="recurrence-count"
                                type="number"
                                disabled={!canBookProvider}
                                min="2"
                                max="52"
                                placeholder="e.g., 4"
                                value={recurrenceCount || ''}
                                onChange={(e) => {
                                    const value = e.target.value
                                        ? parseInt(e.target.value)
                                        : null;
                                    onRecurrenceCountChange(
                                        value && value > 1 ? value : null,
                                    );
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Total number of appointments in the series
                                (minimum 2)
                            </p>
                        </div>

                        {discountAmount > 0 && (
                            <div className="rounded bg-green-50 p-2 text-sm dark:bg-green-950/20">
                                <p className="font-medium text-green-900 dark:text-green-100">
                                    💰 You'll save ₦
                                    {discountAmount.toLocaleString()} (
                                    {discountPercent}%) on each booking!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
