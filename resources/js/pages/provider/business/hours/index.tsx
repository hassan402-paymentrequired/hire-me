import FloatingSaveButton from '@/pages/provider/business/settings/components/floating-save-button';
import DayScheduleRow from '@/pages/provider/business/components/day-schedule-row';
import SchedulePreview from '@/pages/provider/business/components/schedule-preview';
import AppLayout from '@/layouts/app-layout';
import BusinessHoursLayout from '@/layouts/business-hours/layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import business from '@/routes/business';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Business Hours', href: business.hours().url },
];

interface Props {
    initialSchedule: any;
    initialHolidays: any[];
}

export default function BusinessHoursSchedule({ initialSchedule }: Props) {
    const { flash } = usePage().props as any;
    const form = useForm({
        schedule: initialSchedule,
    });

    const createDefaultShift = () => ({
        start: '09:00',
        end: '17:00',
        breaks: [],
    });

    const handleToggleDay = (day: string) => {
        const currentDay = form.data.schedule?.[day];
        const nextIsOpen = !currentDay?.isOpen;

        form.setData('schedule', {
            ...form.data.schedule,
            [day]: {
                ...currentDay,
                isOpen: nextIsOpen,
                shifts: nextIsOpen
                    ? (currentDay?.shifts?.length ? currentDay.shifts : [createDefaultShift()])
                    : (currentDay?.shifts ?? []),
            },
        });
    };

    const handleTimeChange = (day: string, shiftIndex: number, field: string, value: string) => {
        form.setData('schedule', {
            ...form.data.schedule,
            [day]: {
                ...form.data.schedule?.[day],
                shifts: form.data.schedule?.[day]?.shifts?.map((shift: any, idx: number) =>
                    idx === shiftIndex ? { ...shift, [field]: value } : shift,
                ),
            },
        });
    };

    const handleAddBreak = (day: string, shiftIndex: number) => {
        form.setData('schedule', {
            ...form.data.schedule,
            [day]: {
                ...form.data.schedule?.[day],
                shifts: form.data.schedule?.[day]?.shifts?.map((shift: any, idx: number) =>
                    idx === shiftIndex
                        ? { ...shift, breaks: [...(shift?.breaks ?? []), { start: '12:00', end: '13:00' }] }
                        : shift,
                ),
            },
        });
    };

    const handleRemoveBreak = (day: string, shiftIndex: number, breakIndex: number) => {
        form.setData('schedule', {
            ...form.data.schedule,
            [day]: {
                ...form.data.schedule?.[day],
                shifts: form.data.schedule?.[day]?.shifts?.map((shift: any, idx: number) =>
                    idx === shiftIndex
                        ? { ...shift, breaks: shift?.breaks?.filter((_: any, bIdx: number) => bIdx !== breakIndex) }
                        : shift,
                ),
            },
        });
    };

    const handleBreakChange = (day: string, shiftIndex: number, breakIndex: number, field: string, value: string) => {
        form.setData('schedule', {
            ...form.data.schedule,
            [day]: {
                ...form.data.schedule?.[day],
                shifts: form.data.schedule?.[day]?.shifts?.map((shift: any, idx: number) =>
                    idx === shiftIndex
                        ? {
                              ...shift,
                              breaks: shift?.breaks?.map((breakTime: any, bIdx: number) =>
                                  bIdx === breakIndex ? { ...breakTime, [field]: value } : breakTime,
                              ),
                          }
                        : shift,
                ),
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Hours" />

            <BusinessHoursLayout>
                {flash?.success && (
                    <div className="rounded-lg border border-success/20 bg-success/10 p-4">
                        <p className="text-sm font-medium text-success">{flash.success}</p>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/business/hours', { preserveScroll: true });
                    }}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="space-y-4">
                                {form.data.schedule && Object.keys(form.data.schedule).map((day) => (
                                    <DayScheduleRow
                                        key={day}
                                        day={day}
                                        schedule={form.data.schedule?.[day]}
                                        onToggle={handleToggleDay}
                                        onTimeChange={handleTimeChange}
                                        onAddBreak={handleAddBreak}
                                        onRemoveBreak={handleRemoveBreak}
                                        onBreakChange={handleBreakChange}
                                    />
                                ))}
                                {!form.data.schedule && (
                                    <div className="py-12 text-center">
                                        <p className="text-muted-foreground">
                                            No schedule set. Please complete onboarding to set your business hours.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <SchedulePreview schedule={form.data.schedule} />
                        </div>
                    </div>

                    <FloatingSaveButton visible={form.isDirty} processing={form.processing} />
                </form>
            </BusinessHoursLayout>
        </AppLayout>
    );
}
