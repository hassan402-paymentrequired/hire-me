import AppLayout from '@/layouts/app-layout';
import { Appointment, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Clock, CalendarDays, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Schedule', href: '/schedule' },
    { title: 'Calendar', href: '/schedule/calendar' },
];

interface CalendarProps {
    appointments: Appointment[];
    currentWeekStart?: string;
}

const STATUS_STYLES: Record<string, string> = {
    pending:   'bg-sky-100 text-sky-700 border-sky-200',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    completed: 'bg-neutral-100 text-neutral-500 border-neutral-200',
    cancelled: 'bg-red-100 text-red-600 border-red-200',
};

const DAY_ACCENT_COLORS = [
    'bg-violet-500',
    'bg-sky-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-teal-500',
];

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function formatCurrency(amount: number) {
    return `₦${(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

function getDurationLabel(apt: Appointment) {
    const start = new Date(apt.start_time);
    const end = new Date(apt.end_time);
    const mins = Math.round((end.getTime() - start.getTime()) / 60000);
    if (mins >= 60) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${mins}m`;
}

export default function Calendar({ appointments, currentWeekStart }: CalendarProps) {
    const initialDate = currentWeekStart ? new Date(currentWeekStart) : new Date();
    const [currentDate, setCurrentDate] = useState(initialDate);

    const getWeekDates = (base: Date) => {
        const start = new Date(base);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });
    };

    const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
    const today = new Date();

    const navigateWeek = (dir: -1 | 1) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + dir * 7);
        setCurrentDate(newDate);
        const weekStart = getWeekDates(newDate)[0];
        router.reload({
            data: { start_date: weekStart.toISOString().split('T')[0] },
            only: ['appointments', 'currentWeekStart'],
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        const weekStart = getWeekDates(new Date())[0];
        router.reload({
            data: { start_date: weekStart.toISOString().split('T')[0] },
            only: ['appointments', 'currentWeekStart'],
        });
    };

    // Group appointments by date string
    const grouped = useMemo(() => {
        const map: Record<string, Appointment[]> = {};
        weekDates.forEach((d) => {
            map[d.toDateString()] = [];
        });
        appointments.forEach((apt) => {
            const key = new Date(apt.start_time).toDateString();
            if (map[key]) map[key].push(apt);
        });
        return map;
    }, [appointments, weekDates]);

    const monthYear = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    // Only show days that are within the week
    const daysWithContent = weekDates;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />

            <div className="flex h-full flex-col gap-6 p-4">

                {/* ── Page heading ── */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">My Calendar</h1>
                        <p className="text-sm text-muted-foreground">Upcoming appointments this week</p>
                    </div>
                </div>

                {/* ── Week navigation ── */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigateWeek(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-base font-semibold min-w-[140px] text-center">{monthYear}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigateWeek(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={goToToday}>
                        Today
                    </Button>
                </div>

                {/* ── Day strips ── */}
                <div className="flex flex-col gap-6 overflow-y-auto pb-6">
                    {daysWithContent.map((date, dayIdx) => {
                        const dateKey = date.toDateString();
                        const dayApts = grouped[dateKey] || [];
                        const isToday = dateKey === today.toDateString();
                        const isPast = date < today && !isToday;
                        const accentColor = DAY_ACCENT_COLORS[dayIdx % DAY_ACCENT_COLORS.length];

                        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
                        const dayNum = date.getDate();
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

                        return (
                            <div key={dateKey} className={isPast && dayApts.length === 0 ? 'opacity-40' : ''}>
                                {/* Month separator — show if first day or month changes */}
                                {(dayIdx === 0 || date.getMonth() !== daysWithContent[dayIdx - 1].getMonth()) && (
                                    <div className="mb-3 flex items-center gap-3">
                                        <span className="text-sm font-bold text-primary tracking-wide">{monthLabel}</span>
                                        <div className="flex-1 h-px bg-border" />
                                    </div>
                                )}

                                <div className="flex gap-4 items-start">
                                    {/* Date badge */}
                                    <div className="flex flex-col items-center gap-0.5 w-14 flex-shrink-0">
                                        <div className={`
                                            flex flex-col items-center justify-center rounded-xl w-12 h-14 shado border
                                            ${isToday
                                                ? `${accentColor} text-white border-transparent shadow-md`
                                                : 'bg-card border-border text-foreground'
                                            }
                                        `}>
                                            <span className="text-[10px] font-semibold tracking-widest opacity-80 leading-none mb-0.5">
                                                {dayName}
                                            </span>
                                            <span className="text-xl font-black leading-none">{dayNum}</span>
                                        </div>
                                        {/* Vertical line connecting to cards */}
                                        {dayApts.length > 0 && (
                                            <div className="w-px flex-1 bg-border/60 mt-1" style={{ minHeight: '20px' }} />
                                        )}
                                    </div>

                                    {/* Appointment cards — horizontal scroll on mobile */}
                                    {dayApts.length === 0 ? (
                                        <div className="flex items-center gap-2 h-14 text-sm text-muted-foreground italic">
                                            <CalendarDays className="w-4 h-4 opacity-40" />
                                            No appointments
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 overflow-x-auto pb-1 flex-1 scrollbar-none snap-x snap-mandatory">
                                            {dayApts.map((apt) => {
                                                const statusStyle = STATUS_STYLES[apt.status?.toLowerCase()] ?? STATUS_STYLES['pending'];
                                                const serviceName = apt.services?.[0]?.name ?? 'Service';

                                                return (
                                                    <button
                                                        key={apt.service_id + apt.start_time}
                                                        onClick={() => router.visit(`/provider/appointments/${apt.id}`)}
                                                        className="
                                                            snap-start flex-shrink-0 w-[220px] sm:w-[260px]
                                                            bg-card border border-border rounded-lg p-4
                                                            text-left shadow-sm
                                                            hover:shadow-md hover:border-primary/30
                                                            active:scale-[0.98]
                                                            transition-all duration-150
                                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                                                            group
                                                        "
                                                    >
                                                        {/* Client name */}
                                                        <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                                            {apt.client.name}
                                                        </p>

                                                        {/* Time range */}
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {formatTime(apt.start_time)} – {formatTime(apt.end_time)}
                                                        </p>

                                                        {/* Service name */}
                                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                                            {serviceName}
                                                        </p>

                                                        {/* Divider */}
                                                        <div className="my-3 h-px bg-border" />

                                                        {/* Footer: price + status + duration */}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-sm font-bold text-foreground">
                                                                {formatCurrency(apt.price)}
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                    <Clock className="w-3 h-3" />
                                                                    {getDurationLabel(apt)}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-[10px] px-2 py-0 font-semibold uppercase tracking-wide border ${statusStyle}`}
                                                                >
                                                                    {apt.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}