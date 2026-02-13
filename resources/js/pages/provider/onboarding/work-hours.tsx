import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/layouts/onboarding-layout';
import onboarding from '@/routes/onboarding';
import { useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import DayScheduleRow from '@/pages/provider/business/components/day-schedule-row';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { getStepsWithStatus } from './onboarding-steps';

const defaultSchedule = {
    Monday: { isOpen: true, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Tuesday: { isOpen: true, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Wednesday: { isOpen: true, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Thursday: { isOpen: true, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Friday: { isOpen: true, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Saturday: { isOpen: false, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
    Sunday: { isOpen: false, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] }
};

export default function WorkHours() {
    const { data, setData, post, processing, errors } = useForm({
        schedule: defaultSchedule
    });

    const handleToggleDay = (day: string) => {
        setData('schedule', {
            ...data.schedule,
            [day]: { ...data.schedule[day], isOpen: !data.schedule[day].isOpen }
        });
    };

    const handleTimeChange = (day: string, shiftIndex: number, field: string, value: any) => {
        setData('schedule', {
            ...data.schedule,
            [day]: {
                ...data.schedule[day],
                shifts: data.schedule[day].shifts.map((shift, idx) =>
                    idx === shiftIndex ? { ...shift, [field]: value } : shift
                )
            }
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
                )
            }
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
                )
            }
        });
    };

    const handleBreakChange = (day: string, shiftIndex: number, breakIndex: number, field: string, value: any) => {
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
                            )
                        }
                        : shift
                )
            }
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(onboarding.workHours.store().url);
    };

    const skip = () => {
        post(onboarding.skip().url);
    };

    return (
        <OnboardingLayout title="Work Hours" steps={getStepsWithStatus('hours')} currentStepId="hours">
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Set your availability</h2>
                    <p className="text-muted-foreground ">
                        Configure your working hours for each day of the week. You can customize this later.
                    </p>
                </div>

                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            Please fix the errors below before continuing.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={submit} className="space-y-4">
                    {Object.keys(data.schedule).map(day => (
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

                    <div className="flex justify-end items-center gap-4 pt-4">
                        <Button type="submit" size="lg" disabled={processing} className="w-full rounded-lg md:w-auto">
                            {processing && <Spinner />} Continue
                        </Button>
                    </div>
                </form>
            </div>
        </OnboardingLayout>
    );
}
