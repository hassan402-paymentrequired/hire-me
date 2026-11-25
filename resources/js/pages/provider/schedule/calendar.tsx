import KeenIcon from '@/components/keen-icon';
import AppLayout from '@/layouts/app-layout';
import {
    formatHour,
    type Holiday,
    toHours,
    WEEK_DAYS,
    type WeeklySchedule,
} from '@/lib/schedule';
import { cn } from '@/lib/utils';
import schedule from '@/routes/schedule';
import { Appointment, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    addDays,
    addWeeks,
    endOfMonth,
    format,
    isSameDay,
    isSameMonth,
    parseISO,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Schedule', href: '/schedule' },
    { title: 'Calendar', href: '/schedule/calender' },
];

interface CalendarProps {
    appointments: Appointment[];
    currentWeekStart?: string;
    businessHours?: WeeklySchedule | null;
    holidays?: Holiday[];
    bookedDays?: string[];
}

const ROW_HEIGHT = 56;

const STATUS: Record<string, { label: string; block: string; legend: string }> =
    {
        confirmed: {
            label: 'Confirmed',
            block: 'bg-[#E6F4EC] border-[#0E3B2E] text-[#13201B] dark:bg-[#0E3B2E]/60 dark:text-white dark:border-[#C8F169]/60',
            legend: 'bg-[#E6F4EC] border-[#0E3B2E]',
        },
        pending: {
            label: 'Pending',
            block: 'bg-[#F6FCE6] border-[#9BC63A] text-[#13201B] dark:bg-[#C8F169]/10 dark:text-white',
            legend: 'bg-[#F6FCE6] border-[#9BC63A]',
        },
        pending_completion: {
            label: 'Awaiting client',
            block: 'bg-[#0E3B2E] border-[#C8F169] text-white',
            legend: 'bg-[#0E3B2E] border-[#C8F169]',
        },
        completed: {
            label: 'Completed',
            block: 'bg-[#F1F3F1] border-[#A9B4AE] text-[#4A5A52] dark:bg-white/5 dark:text-white/70',
            legend: 'bg-[#F1F3F1] border-[#A9B4AE]',
        },
        cancelled: {
            label: 'Cancelled',
            block: 'bg-red-50 border-red-300 text-red-700 line-through dark:bg-red-950/30 dark:text-red-300',
            legend: 'bg-red-50 border-red-300',
        },
    };

const hatch =
    'bg-[repeating-linear-gradient(135deg,rgba(14,59,46,0.05)_0_8px,transparent_8px_16px)] dark:bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.04)_0_8px,transparent_8px_16px)]';

const cardClass =
    'rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10';

const naira = (value: number) => `₦${Math.round(value).toLocaleString()}`;

const hoursOf = (date: Date) => date.getHours() + date.getMinutes() / 60;

/** Place overlapping appointments side by side. */
function layoutDay(items: Appointment[]) {
    const sorted = [...items].sort(
        (a, b) =>
            parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime(),
    );
    const laneEnds: number[] = [];
    const placed = sorted.map((appointment) => {
        const start = parseISO(appointment.start_time).getTime();
        const end = appointment.end_time
            ? parseISO(appointment.end_time).getTime()
            : start + 60 * 60 * 1000;
        let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);

        if (lane === -1) {
            lane = laneEnds.length;
            laneEnds.push(end);
        } else {
            laneEnds[lane] = end;
        }

        return { appointment, lane };
    });

    return placed.map((item) => ({
        ...item,
        lanes: Math.max(laneEnds.length, 1),
    }));
}

export default function Calendar({
    appointments,
    currentWeekStart,
    businessHours,
    holidays = [],
    bookedDays = [],
}: CalendarProps) {
    const weekStart = useMemo(
        () =>
            startOfWeek(
                currentWeekStart ? parseISO(currentWeekStart) : new Date(),
                { weekStartsOn: 1 },
            ),
        [currentWeekStart],
    );
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60_000);

        return () => clearInterval(timer);
    }, []);

    const weekDates = useMemo(
        () =>
            Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
        [weekStart],
    );

    const goToWeek = (date: Date) => {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        router.reload({
            data: { start_date: format(start, 'yyyy-MM-dd') },
            only: ['appointments', 'currentWeekStart', 'bookedDays'],
            preserveState: true,
            preserveScroll: true,
        } as Parameters<typeof router.reload>[0]);
    };

    // Visible hour range: business hours plus any booking outside them.
    const [firstHour, lastHour] = useMemo(() => {
        let first = 8;
        let last = 20;
        const shifts = Object.values(businessHours ?? {}).flatMap((day) =>
            day.isOpen ? day.shifts : [],
        );

        if (shifts.length) {
            first =
                Math.floor(
                    Math.min(...shifts.map((shift) => toHours(shift.start))),
                ) - 1;
            last =
                Math.ceil(
                    Math.max(...shifts.map((shift) => toHours(shift.end))),
                ) + 1;
        }

        appointments.forEach((appointment) => {
            const start = parseISO(appointment.start_time);
            const end = appointment.end_time
                ? parseISO(appointment.end_time)
                : start;
            first = Math.min(first, Math.floor(hoursOf(start)));
            last = Math.max(last, Math.ceil(hoursOf(end)));
        });

        return [Math.max(first, 0), Math.min(Math.max(last, first + 6), 24)];
    }, [appointments, businessHours]);

    const gridHeight = (lastHour - firstHour) * ROW_HEIGHT;
    const yFor = (hour: number) => (hour - firstHour) * ROW_HEIGHT;

    const appointmentsByDay = useMemo(
        () =>
            weekDates.map((date) =>
                appointments.filter((appointment) =>
                    isSameDay(parseISO(appointment.start_time), date),
                ),
            ),
        [appointments, weekDates],
    );

    const weekSummary = useMemo(() => {
        const counts: Record<string, number> = {};
        appointments.forEach((appointment) => {
            counts[appointment.status] = (counts[appointment.status] ?? 0) + 1;
        });
        const active = appointments.filter(
            (appointment) => appointment.status !== 'cancelled',
        );
        const revenue = appointments
            .filter((appointment) =>
                ['confirmed', 'completed', 'pending_completion'].includes(
                    appointment.status,
                ),
            )
            .reduce(
                (total, appointment) => total + Number(appointment.price || 0),
                0,
            );

        return { counts, total: active.length, revenue };
    }, [appointments]);

    const monthStart = startOfMonth(weekStart);
    const monthCells = useMemo(() => {
        const leading = (monthStart.getDay() + 6) % 7;
        const days = Array.from(
            { length: endOfMonth(monthStart).getDate() },
            (_, index) => addDays(monthStart, index),
        );

        return [...Array.from({ length: leading }, () => null), ...days];
    }, [monthStart]);

    const holidayOn = (date: Date) =>
        holidays.find((holiday) => holiday.date === format(date, 'yyyy-MM-dd'));
    const weekLabel = `${format(weekDates[0], 'd MMM')} – ${format(weekDates[6], 'd MMM yyyy')}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />

            <div className="flex flex-col gap-[22px] p-4 md:p-6">
                {/* Header */}
                <header className="flex flex-wrap items-end gap-3.5">
                    <div className="flex flex-[1_1_260px] flex-col gap-1">
                        <span className="text-[13px] text-muted-foreground">
                            Schedule
                        </span>
                        <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                            Calendar
                        </h1>
                    </div>
                    <div
                        className={cn(
                            cardClass,
                            'flex items-center gap-2 rounded-xl p-1',
                        )}
                    >
                        <button
                            type="button"
                            aria-label="Previous week"
                            onClick={() => goToWeek(addWeeks(weekStart, -1))}
                            className="flex size-10 items-center justify-center rounded-[9px] text-foreground hover:bg-muted"
                        >
                            <KeenIcon name="left" className="text-base" />
                        </button>
                        <span className="px-1.5 font-[Sora] text-[15px] font-semibold whitespace-nowrap text-foreground">
                            {weekLabel}
                        </span>
                        <button
                            type="button"
                            aria-label="Next week"
                            onClick={() => goToWeek(addWeeks(weekStart, 1))}
                            className="flex size-10 items-center justify-center rounded-[9px] text-foreground hover:bg-muted"
                        >
                            <KeenIcon name="right" className="text-base" />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => goToWeek(new Date())}
                        className="h-12 rounded-xl border border-[#0E3B2E]/15 bg-card px-4 text-sm font-bold text-foreground hover:bg-muted dark:border-white/15"
                    >
                        Today
                    </button>
                    <Link
                        href={schedule.appointments.index()}
                        className="flex h-12 items-center gap-2 rounded-xl bg-[#0E3B2E] px-4 text-sm font-semibold text-white hover:bg-[#0E3B2E]/90 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                        prefetch
                    >
                        <KeenIcon name="parcel" className="text-lg" />
                        List view
                    </Link>
                </header>

                <div className="flex flex-wrap items-start gap-6">
                    {/* Week grid */}
                    <section
                        className={cn(
                            cardClass,
                            'min-w-0 flex-[999_1_640px] overflow-hidden',
                        )}
                    >
                        <div className="overflow-x-auto">
                            <div className="min-w-[840px]">
                                <div className="flex border-b border-[#0E3B2E]/[0.08] dark:border-white/10">
                                    <div className="w-16 shrink-0" />
                                    {weekDates.map((date, index) => {
                                        const isToday = isSameDay(date, now);
                                        const count =
                                            appointmentsByDay[index].length;

                                        return (
                                            <div
                                                key={date.toISOString()}
                                                className="flex min-w-[110px] flex-1 flex-col items-center gap-1 border-l border-[#0E3B2E]/[0.07] px-2 py-3 dark:border-white/10"
                                            >
                                                <span className="text-xs font-bold tracking-[0.08em] text-muted-foreground">
                                                    {format(
                                                        date,
                                                        'EEE',
                                                    ).toUpperCase()}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'flex size-10 items-center justify-center rounded-full font-[Sora] text-xl font-bold',
                                                        isToday
                                                            ? 'bg-[#0E3B2E] text-[#C8F169]'
                                                            : 'text-foreground',
                                                    )}
                                                >
                                                    {format(date, 'd')}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {count
                                                        ? `${count} booking${count === 1 ? '' : 's'}`
                                                        : '—'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex pt-2.5 pb-1.5">
                                    <div className="w-16 shrink-0">
                                        {Array.from(
                                            { length: lastHour - firstHour },
                                            (_, index) => (
                                                <div
                                                    key={index}
                                                    className="-translate-y-[7px] pr-2.5 text-right text-[11px] text-muted-foreground"
                                                    style={{
                                                        height: ROW_HEIGHT,
                                                    }}
                                                >
                                                    {formatHour(
                                                        firstHour + index,
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    {weekDates.map((date, index) => {
                                        const daySchedule =
                                            businessHours?.[WEEK_DAYS[index]];
                                        const holiday = holidayOn(date);
                                        const isClosed =
                                            (businessHours &&
                                                !daySchedule?.isOpen) ||
                                            holiday?.type === 'closed';
                                        const isToday = isSameDay(date, now);
                                        const shifts = daySchedule?.isOpen
                                            ? daySchedule.shifts
                                            : [];

                                        return (
                                            <div
                                                key={date.toISOString()}
                                                className={cn(
                                                    'relative min-w-[110px] flex-1 border-l border-[#0E3B2E]/[0.07] dark:border-white/10',
                                                    isToday &&
                                                        'bg-[#C8F169]/10',
                                                )}
                                                style={{ height: gridHeight }}
                                            >
                                                {Array.from(
                                                    {
                                                        length:
                                                            lastHour -
                                                            firstHour +
                                                            1,
                                                    },
                                                    (_, line) => (
                                                        <div
                                                            key={line}
                                                            className="absolute inset-x-0 h-px bg-[#0E3B2E]/[0.06] dark:bg-white/[0.06]"
                                                            style={{
                                                                top:
                                                                    line *
                                                                    ROW_HEIGHT,
                                                            }}
                                                        />
                                                    ),
                                                )}

                                                {/* Outside working hours */}
                                                {!isClosed &&
                                                    shifts.length > 0 &&
                                                    (() => {
                                                        const open = Math.min(
                                                            ...shifts.map(
                                                                (shift) =>
                                                                    toHours(
                                                                        shift.start,
                                                                    ),
                                                            ),
                                                        );
                                                        const close = Math.max(
                                                            ...shifts.map(
                                                                (shift) =>
                                                                    toHours(
                                                                        shift.end,
                                                                    ),
                                                            ),
                                                        );

                                                        return (
                                                            <>
                                                                <div
                                                                    className="absolute inset-x-0 top-0 bg-muted/50"
                                                                    style={{
                                                                        height: Math.max(
                                                                            yFor(
                                                                                open,
                                                                            ),
                                                                            0,
                                                                        ),
                                                                    }}
                                                                />
                                                                <div
                                                                    className="absolute inset-x-0 bottom-0 bg-muted/50"
                                                                    style={{
                                                                        top: Math.min(
                                                                            yFor(
                                                                                close,
                                                                            ),
                                                                            gridHeight,
                                                                        ),
                                                                    }}
                                                                />
                                                            </>
                                                        );
                                                    })()}

                                                {/* Breaks */}
                                                {!isClosed &&
                                                    shifts
                                                        .flatMap(
                                                            (shift) =>
                                                                shift.breaks ??
                                                                [],
                                                        )
                                                        .map(
                                                            (
                                                                item,
                                                                breakIndex,
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        breakIndex
                                                                    }
                                                                    className={cn(
                                                                        'absolute inset-x-0',
                                                                        hatch,
                                                                    )}
                                                                    style={{
                                                                        top: yFor(
                                                                            toHours(
                                                                                item.start,
                                                                            ),
                                                                        ),
                                                                        height:
                                                                            (toHours(
                                                                                item.end,
                                                                            ) -
                                                                                toHours(
                                                                                    item.start,
                                                                                )) *
                                                                            ROW_HEIGHT,
                                                                    }}
                                                                    title="Break"
                                                                />
                                                            ),
                                                        )}

                                                {isClosed && (
                                                    <div
                                                        className={cn(
                                                            'absolute inset-0 flex items-start justify-center pt-6',
                                                            hatch,
                                                        )}
                                                    >
                                                        <span className="max-w-[90%] truncate rounded-full border border-[#0E3B2E]/12 bg-card px-2.5 py-1.5 text-xs font-bold text-muted-foreground dark:border-white/15">
                                                            {holiday
                                                                ? holiday.name
                                                                : 'Closed'}
                                                        </span>
                                                    </div>
                                                )}

                                                {layoutDay(
                                                    appointmentsByDay[index],
                                                ).map(
                                                    ({
                                                        appointment,
                                                        lane,
                                                        lanes,
                                                    }) => {
                                                        const start = parseISO(
                                                            appointment.start_time,
                                                        );
                                                        const end =
                                                            appointment.end_time
                                                                ? parseISO(
                                                                      appointment.end_time,
                                                                  )
                                                                : addDays(
                                                                      start,
                                                                      0,
                                                                  );
                                                        const top =
                                                            yFor(
                                                                hoursOf(start),
                                                            ) + 2;
                                                        const height = Math.max(
                                                            (hoursOf(end) -
                                                                hoursOf(
                                                                    start,
                                                                )) *
                                                                ROW_HEIGHT -
                                                                4,
                                                            26,
                                                        );
                                                        const style =
                                                            STATUS[
                                                                appointment
                                                                    .status
                                                            ] ??
                                                            STATUS.confirmed;
                                                        const client =
                                                            appointment.client
                                                                ?.name ||
                                                            appointment.client_name ||
                                                            'Guest client';

                                                        return (
                                                            <button
                                                                key={
                                                                    appointment.id
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    router.visit(
                                                                        `/provider/appointments/${appointment.id}`,
                                                                    )
                                                                }
                                                                className={cn(
                                                                    'absolute flex flex-col gap-0.5 overflow-hidden rounded-[10px] border-l-[3px] px-2 py-1.5 text-left transition-shadow hover:shadow-md',
                                                                    style.block,
                                                                )}
                                                                style={{
                                                                    top,
                                                                    height,
                                                                    left: `calc(${(lane / lanes) * 100}% + 4px)`,
                                                                    width: `calc(${100 / lanes}% - 8px)`,
                                                                }}
                                                            >
                                                                <span className="text-[11px] font-bold no-underline">
                                                                    {format(
                                                                        start,
                                                                        'h:mm',
                                                                    )}{' '}
                                                                    –{' '}
                                                                    {format(
                                                                        end,
                                                                        'h:mm a',
                                                                    )}
                                                                </span>
                                                                <span className="truncate text-xs font-bold">
                                                                    {client}
                                                                </span>
                                                                {height >
                                                                    44 && (
                                                                    <span className="truncate text-[11px] capitalize opacity-85">
                                                                        {
                                                                            appointment
                                                                                .services?.[0]
                                                                                ?.name
                                                                        }
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    },
                                                )}

                                                {isToday &&
                                                    hoursOf(now) >= firstHour &&
                                                    hoursOf(now) <=
                                                        lastHour && (
                                                        <div
                                                            className="pointer-events-none absolute right-0 -left-1 h-0.5 bg-[#E8A317]"
                                                            style={{
                                                                top: yFor(
                                                                    hoursOf(
                                                                        now,
                                                                    ),
                                                                ),
                                                            }}
                                                        >
                                                            <span className="absolute -top-1 -left-0.5 size-2.5 rounded-full bg-[#E8A317]" />
                                                        </div>
                                                    )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Side column */}
                    <div className="flex max-w-[320px] flex-[1_1_280px] flex-col gap-4">
                        <div
                            className={cn(
                                cardClass,
                                'flex flex-col gap-3 p-[18px]',
                            )}
                        >
                            <span className="font-[Sora] text-[15px] font-semibold text-foreground">
                                {format(monthStart, 'MMMM yyyy')}
                            </span>
                            <div className="grid grid-cols-7 gap-0.5 text-center">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(
                                    (label, index) => (
                                        <span
                                            key={index}
                                            className="py-1 text-[11px] font-bold text-muted-foreground"
                                        >
                                            {label}
                                        </span>
                                    ),
                                )}
                                {monthCells.map((date, index) =>
                                    date ? (
                                        <button
                                            key={date.toISOString()}
                                            type="button"
                                            onClick={() => goToWeek(date)}
                                            aria-label={format(
                                                date,
                                                'EEEE d MMMM',
                                            )}
                                            className={cn(
                                                'relative h-[34px] rounded-[9px] text-[13px]',
                                                isSameDay(date, now)
                                                    ? 'bg-[#0E3B2E] font-bold text-[#C8F169]'
                                                    : weekDates.some((day) =>
                                                            isSameDay(
                                                                day,
                                                                date,
                                                            ),
                                                        )
                                                      ? 'bg-[#E6F4EC] font-bold text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]'
                                                      : 'text-foreground hover:bg-muted',
                                                !isSameMonth(
                                                    date,
                                                    monthStart,
                                                ) && 'opacity-40',
                                            )}
                                        >
                                            {format(date, 'd')}
                                            {bookedDays.includes(
                                                format(date, 'yyyy-MM-dd'),
                                            ) &&
                                                !isSameDay(date, now) && (
                                                    <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#9BC63A]" />
                                                )}
                                        </button>
                                    ) : (
                                        <span key={`blank-${index}`} />
                                    ),
                                )}
                            </div>
                        </div>

                        <div
                            className={cn(
                                cardClass,
                                'flex flex-col gap-3 p-[18px]',
                            )}
                        >
                            <span className="font-[Sora] text-[15px] font-semibold text-foreground">
                                This week
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="font-[Sora] text-[28px] font-bold text-[#0E3B2E] dark:text-[#C8F169]">
                                    {weekSummary.total}
                                </span>
                                <span className="text-[13px] text-muted-foreground">
                                    bookings · {naira(weekSummary.revenue)}
                                </span>
                            </div>
                            {Object.entries(STATUS).map(([status, style]) => (
                                <div
                                    key={status}
                                    className="flex items-center justify-between text-[13px] text-foreground"
                                >
                                    <span className="flex items-center gap-2.5">
                                        <span
                                            className={cn(
                                                'size-3 rounded border-l-[3px]',
                                                style.legend,
                                            )}
                                        />
                                        {style.label}
                                    </span>
                                    <span className="font-bold">
                                        {weekSummary.counts[status] ?? 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
