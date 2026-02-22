import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/layouts/onboarding-layout';
import onboarding from '@/routes/onboarding';
import { useForm } from '@inertiajs/react';
import { AlertCircle, Copy } from 'lucide-react';
import React, { useState } from 'react';
import DayScheduleRow from '@/pages/provider/business/components/day-schedule-row';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { getStepsWithStatus } from './onboarding-steps';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultSchedule = {
    Monday:    { isOpen: true,  shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Tuesday:   { isOpen: true,  shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Wednesday: { isOpen: true,  shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Thursday:  { isOpen: true,  shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Friday:    { isOpen: true,  shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Saturday:  { isOpen: false, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Sunday:    { isOpen: false, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
};

export default function WorkHours() {
    const { data, setData, post, processing, errors } = useForm({
        schedule: defaultSchedule,
    });

    const [applyAllFeedback, setApplyAllFeedback] = useState(false);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleToggleDay = (day: string) => {
        setData('schedule', {
            ...data.schedule,
            [day]: { ...data.schedule[day], isOpen: !data.schedule[day].isOpen },
        });
    };

    const handleTimeChange = (day: string, shiftIndex: number, field: string, value: any) => {
        setData('schedule', {
            ...data.schedule,
            [day]: {
                ...data.schedule[day],
                shifts: data.schedule[day].shifts.map((shift, idx) =>
                    idx === shiftIndex ? { ...shift, [field]: value } : shift
                ),
            },
        });
    };

    const handleAddBreak = (day: string, shiftIndex: number) => {
        setData('schedule', {
            ...data.schedule,
            [day]: {
                ...data.schedule[day],
                shifts: data.schedule[day].shifts.map((shift, idx) =>
                    idx === shiftIndex
                        ? { ...shift, breaks: [...shift.breaks, { start: '12:00', end: '13:00' }] }
                        : shift
                ),
            },
        });
    };

    const handleRemoveBreak = (day: string, shiftIndex: number, breakIndex: number) => {
        setData('schedule', {
            ...data.schedule,
            [day]: {
                ...data.schedule[day],
                shifts: data.schedule[day].shifts.map((shift, idx) =>
                    idx === shiftIndex
                        ? { ...shift, breaks: shift.breaks.filter((_, bIdx) => bIdx !== breakIndex) }
                        : shift
                ),
            },
        });
    };

    const handleBreakChange = (
        day: string,
        shiftIndex: number,
        breakIndex: number,
        field: string,
        value: any
    ) => {
        setData('schedule', {
            ...data.schedule,
            [day]: {
                ...data.schedule[day],
                shifts: data.schedule[day].shifts.map((shift, idx) =>
                    idx === shiftIndex
                        ? {
                              ...shift,
                              breaks: shift.breaks.map((breakTime, bIdx) =>
                                  bIdx === breakIndex ? { ...breakTime, [field]: value } : breakTime
                              ),
                          }
                        : shift
                ),
            },
        });
    };

    /**
     * Apply Monday's hours to all other open days — one click saves the user
     * from editing 4 more rows when they all share the same schedule.
     */
    const handleApplyToAll = () => {
        const mondayShifts = data.schedule['Monday'].shifts;
        const updated = { ...data.schedule };

        DAYS.forEach((day) => {
            if (day !== 'Monday' && updated[day].isOpen) {
                updated[day] = {
                    ...updated[day],
                    shifts: mondayShifts.map((s) => ({
                        ...s,
                        breaks: s.breaks.map((b) => ({ ...b })),
                    })),
                };
            }
        });

        setData('schedule', updated);

        // Brief visual feedback
        setApplyAllFeedback(true);
        setTimeout(() => setApplyAllFeedback(false), 2000);
    };

    // ── Submit / Skip ─────────────────────────────────────────────────────────

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(onboarding.workHours.store().url);
    };

    const skip = () => {
        post(onboarding.skip('work-hours').url);
    };

    return (
        <OnboardingLayout title="Work Hours" steps={getStepsWithStatus('hours')} currentStepId="hours">
            <div className="space-y-4">
                {/* ── Heading ── */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Set your availability</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configure your working hours for each day. You can always update this later.
                    </p>
                </div>

                {/* ── Validation errors ── */}
                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            Please fix the errors below before continuing.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={submit} className="space-y-3">
                    {/* ── Apply to all shortcut ── */}
                    <div className="flex items-center justify-between py-1">
                        <p className="text-xs text-muted-foreground">
                            Mon–Fri open · Sat–Sun closed by default
                        </p>

                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleApplyToAll}
                                        className="h-7 text-xs gap-1.5 shrink-0"
                                    >
                                        <Copy className="w-3 h-3" />
                                        {applyAllFeedback ? '✓ Applied!' : 'Apply Monday to all open days'}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-xs max-w-[180px] text-center">
                                    Copies Monday's start time, end time, and breaks to every other open day
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* ── Day rows ── */}
                    <div className="space-y-2">
                        {DAYS.map((day) => (
                            <DayScheduleRow
                                key={day}
                                day={day}
                                schedule={data.schedule[day]}
                                onToggle={handleToggleDay}
                                onTimeChange={handleTimeChange}
                                onAddBreak={handleAddBreak}
                                onRemoveBreak={handleRemoveBreak}
                                onBreakChange={handleBreakChange}
                                errors={errors}
                            />
                        ))}
                    </div>

                    {/* ── Footer actions ── */}
                    <div className="flex items-center justify-between gap-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={skip}
                            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                        >
                            Skip for now
                        </button>

                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                            className="w-full sm:w-auto min-w-[120px]"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Continue
                        </Button>
                    </div>
                </form>
            </div>
        </OnboardingLayout>
    );
}