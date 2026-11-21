/* eslint-disable @typescript-eslint/no-explicit-any */
import KeenIcon from '@/components/keen-icon';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import BusinessHoursLayout from '@/layouts/business-hours/layout';
import { formatHour, type Holiday, toHours } from '@/lib/schedule';
import DayScheduleRow from '@/pages/provider/business/components/day-schedule-row';
import SchedulePreview from '@/pages/provider/business/components/schedule-preview';
import business from '@/routes/business';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { format, isBefore, parseISO, startOfToday } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Business Hours', href: business.hours().url },
];

interface Props {
    initialSchedule: any;
    initialHolidays: Holiday[];
}

export default function BusinessHoursSchedule({
    initialSchedule,
    initialHolidays = [],
}: Props) {
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
                    ? currentDay?.shifts?.length
                        ? currentDay.shifts
                        : [createDefaultShift()]
                    : (currentDay?.shifts ?? []),
            },
        });
    };

    const handleTimeChange = (
        day: string,
        shiftIndex: number,
        field: string,
        value: string,
    ) => {
        form.setData('schedule', {
            ...form.data.schedule,
            [day]: {
                ...form.data.schedule?.[day],
                shifts: form.data.schedule?.[day]?.shifts?.map(
                    (shift: any, idx: number) =>
                        idx === shiftIndex
                            ? { ...shift, [field]: value }
                            : shift,
                ),
            },
        });
    };

    const handleAddBreak = (day: string, shiftIndex: number) => {
        form.setData('schedule', {
            ...form.data.schedule,
            [day]: {
                ...form.data.schedule?.[day],
                shifts: form.data.schedule?.[day]?.shifts?.map(
                    (shift: any, idx: number) =>
                        idx === shiftIndex
                            ? {
                                  ...shift,
                                  breaks: [
                                      ...(shift?.breaks ?? []),
                                      { start: '12:00', end: '13:00' },
                                  ],
                              }
                            : shift,
                ),
            },
        });
    };

    const handleRemoveBreak = (
        day: string,
        shiftIndex: number,
        breakIndex: number,
    ) => {
        form.setData('schedule', {
            ...form.data.schedule,
            [day]: {
                ...form.data.schedule?.[day],
                shifts: form.data.schedule?.[day]?.shifts?.map(
                    (shift: any, idx: number) =>
                        idx === shiftIndex
                            ? {
                                  ...shift,
                                  breaks: shift?.breaks?.filter(
                                      (_: any, bIdx: number) =>
                                          bIdx !== breakIndex,
                                  ),
                              }
                            : shift,
                ),
            },
        });
    };

    const handleBreakChange = (
        day: string,
        shiftIndex: number,
        breakIndex: number,
        field: string,
        value: string,
    ) => {
        form.setData('schedule', {
            ...form.data.schedule,
            [day]: {
                ...form.data.schedule?.[day],
                shifts: form.data.schedule?.[day]?.shifts?.map(
                    (shift: any, idx: number) =>
                        idx === shiftIndex
                            ? {
                                  ...shift,
                                  breaks: shift?.breaks?.map(
                                      (breakTime: any, bIdx: number) =>
                                          bIdx === breakIndex
                                              ? { ...breakTime, [field]: value }
                                              : breakTime,
                                  ),
                              }
                            : shift,
                ),
            },
        });
    };

    const handleCopyToAll = (sourceDay: string) => {
        const source = form.data.schedule?.[sourceDay];

        if (!source) {
            return;
        }

        const copied = Object.fromEntries(
            Object.keys(form.data.schedule).map((day) => [
                day,
                day === sourceDay || !form.data.schedule[day]?.isOpen
                    ? form.data.schedule[day]
                    : JSON.parse(JSON.stringify(source)),
            ]),
        );

        form.setData('schedule', copied);
    };

    const upcomingHolidays = initialHolidays
        .filter(
            (holiday) =>
                holiday?.date &&
                !isBefore(parseISO(holiday.date), startOfToday()),
        )
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Hours" />

            <BusinessHoursLayout>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/business/hours', { preserveScroll: true });
                    }}
                    className="flex flex-wrap items-start gap-6"
                >
                    <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
                        {form.data.schedule ? (
                            <section className="divide-y divide-[#0E3B2E]/[0.07] overflow-hidden rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:divide-white/10 dark:border-white/10">
                                {Object.keys(form.data.schedule).map(
                                    (day, index) => (
                                        <DayScheduleRow
                                            key={day}
                                            day={day}
                                            schedule={form.data.schedule?.[day]}
                                            onToggle={handleToggleDay}
                                            onTimeChange={handleTimeChange}
                                            onAddBreak={handleAddBreak}
                                            onRemoveBreak={handleRemoveBreak}
                                            onBreakChange={handleBreakChange}
                                            onCopyToAll={
                                                index === 0
                                                    ? handleCopyToAll
                                                    : undefined
                                            }
                                            errors={
                                                form.errors as Record<
                                                    string,
                                                    string
                                                >
                                            }
                                        />
                                    ),
                                )}
                            </section>
                        ) : (
                            <div className="rounded-[20px] border border-dashed border-[#0E3B2E]/20 py-12 text-center dark:border-white/15">
                                <p className="text-muted-foreground">
                                    No schedule set. Please complete onboarding
                                    to set your business hours.
                                </p>
                            </div>
                        )}

                        {form.isDirty && (
                            <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-2xl bg-[#0E3B2E] px-[18px] py-3.5 text-white shadow-[0_20px_50px_rgba(14,59,46,0.35)]">
                                <span className="flex flex-[1_1_240px] items-center gap-2.5 text-sm font-semibold">
                                    <span className="size-2 rounded-full bg-[#C8F169]" />
                                    You have unsaved changes
                                </span>
                                <button
                                    type="button"
                                    onClick={() => form.reset()}
                                    className="h-11 rounded-xl border border-white/25 px-4 text-sm font-bold text-white hover:bg-white/10"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex h-11 items-center gap-2 rounded-xl bg-[#C8F169] px-[18px] text-sm font-bold text-[#0E3B2E] disabled:opacity-70"
                                >
                                    {form.processing && <Spinner />}
                                    Save hours
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex max-w-[380px] flex-[1_1_300px] flex-col gap-4">
                        <SchedulePreview schedule={form.data.schedule} />

                        <div className="flex flex-col gap-1.5 rounded-[20px] border border-[#0E3B2E]/10 bg-card p-5 shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10">
                            <div className="flex items-center justify-between pb-1.5">
                                <span className="font-[Sora] text-base font-semibold text-foreground">
                                    Holidays &amp; time off
                                </span>
                                <Link
                                    href="/business/hours/holidays"
                                    className="flex items-center gap-1 text-[13px] font-bold text-[#0E3B2E] dark:text-[#C8F169]"
                                    prefetch
                                >
                                    <KeenIcon name="plus" className="text-xs" />
                                    Add
                                </Link>
                            </div>
                            {upcomingHolidays.length === 0 ? (
                                <span className="py-2 text-[13px] text-muted-foreground">
                                    No upcoming holidays or days off.
                                </span>
                            ) : (
                                upcomingHolidays.map((holiday) => {
                                    const date = parseISO(holiday.date);

                                    return (
                                        <div
                                            key={`${holiday.date}-${holiday.name}`}
                                            className="flex items-center gap-3 border-t border-[#0E3B2E]/[0.07] py-2.5 dark:border-white/10"
                                        >
                                            <div className="flex size-[46px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                                <span className="text-[10px] font-bold uppercase">
                                                    {format(date, 'MMM')}
                                                </span>
                                                <span className="font-[Sora] text-base leading-none font-bold">
                                                    {format(date, 'dd')}
                                                </span>
                                            </div>
                                            <div className="flex min-w-0 flex-col gap-0.5">
                                                <span className="truncate text-sm font-bold text-foreground">
                                                    {holiday.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {holiday.type ===
                                                        'custom' &&
                                                    holiday.customHours
                                                        ? `Open ${formatHour(toHours(holiday.customHours.start))} – ${formatHour(toHours(holiday.customHours.end))}`
                                                        : 'Closed all day'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="flex gap-3 rounded-2xl bg-[#C8F169] p-4 text-[#0E3B2E]">
                            <KeenIcon
                                name="information-2"
                                className="text-xl"
                            />
                            <span className="text-[13px] leading-normal font-semibold">
                                Clients can only book inside these hours. Breaks
                                and holidays are blocked automatically.
                            </span>
                        </div>
                    </div>
                </form>
            </BusinessHoursLayout>
        </AppLayout>
    );
}
