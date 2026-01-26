import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Schedule',
        href: '/schedule',
    },
    {
        title: 'Calendar',
        href: '/schedule/calendar',
    },
];

interface Appointment {
    id: string;
    date: string; // YYYY-MM-DD
    day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
    start_time: string; // ISO string
    end_time: string; // ISO string
    duration: number; // in minutes
    client: string;
    service: string;
    color: string;
    status: string;
    start_hour: string;
    start_minute: string;
}

interface CalendarProps {
    appointments: Appointment[];
    currentWeekStart?: string;
}

export default function Calendar({ appointments, currentWeekStart }: CalendarProps) {
    const [view, setView] = useState<'week' | 'day'>('week');
    
    // Initialize currentDate from prop or use today
    const initialDate = currentWeekStart 
        ? new Date(currentWeekStart)
        : new Date();
    
    const [currentDate, setCurrentDate] = useState(initialDate);

    // Calculate week dates based on current date (Monday to Sunday)
    const getWeekDates = () => {
        const start = new Date(currentDate);
        const day = start.getDay();
        // Adjust to Monday (1) - if Sunday (0), go back 6 days
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);

        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const weekDates = useMemo(() => getWeekDates(), [currentDate]);
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Extended time slots from 6 AM to 10 PM (16 hours)
    const timeSlots = Array.from({ length: 16 }, (_, i) => i + 6);

    const goToPreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
        // Reload appointments for new week
        const weekStart = new Date(newDate);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        router.reload({
            data: { start_date: weekStart.toISOString().split('T')[0] },
            only: ['appointments', 'currentWeekStart'],
        });
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
        // Reload appointments for new week
        const weekStart = new Date(newDate);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        router.reload({
            data: { start_date: weekStart.toISOString().split('T')[0] },
            only: ['appointments', 'currentWeekStart'],
        });
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        // Reload appointments for current week
        const weekStart = new Date(today);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        router.reload({
            data: { start_date: weekStart.toISOString().split('T')[0] },
            only: ['appointments', 'currentWeekStart'],
        });
    };

    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today = new Date();
    
    // Calculate current time position for the red line
    const getCurrentTimePosition = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const minutesFromStart = (currentHour - timeSlots[0]) * 60 + currentMinute;
        return (minutesFromStart / 60) * 80; // 80px per hour
    };

    // Filter appointments for the current week
    const weekAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return weekDates.some(weekDate => 
                aptDate.toDateString() === weekDate.toDateString()
            );
        });
    }, [appointments, weekDates]);

    // Calculate appointment position
    const getAppointmentPosition = (apt: Appointment) => {
        const startTime = new Date(apt.start_time);
        const endTime = new Date(apt.end_time);
        
        // Find which day of the week this appointment is on
        const aptDate = new Date(apt.date);
        const dayIndex = weekDates.findIndex(weekDate => 
            aptDate.toDateString() === weekDate.toDateString()
        );
        
        if (dayIndex === -1) return null;
        
        // Calculate top position based on start time
        const startHour = startTime.getHours();
        const startMinute = startTime.getMinutes();
        const minutesFromDayStart = (startHour - timeSlots[0]) * 60 + startMinute;
        const topOffset = (minutesFromDayStart / 60) * 80; // 80px per hour
        
        // Calculate height based on duration
        const durationMinutes = apt.duration;
        const height = (durationMinutes / 60) * 80; // 80px per hour
        
        // Calculate left position
        const widthPercent = 100 / 7;
        const leftPercent = dayIndex * widthPercent;
        
        return {
            top: topOffset,
            height: Math.max(height, 40), // Minimum height of 40px
            left: leftPercent,
            width: widthPercent,
            dayIndex,
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />
            <div className="flex h-full flex-col gap-4 p-4">
                {/* Calendar Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-semibold">
                            {monthYear}
                        </h2>
                        <Button variant="outline" size="icon" onClick={goToNextWeek}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                      
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={goToToday}>Today</Button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-background text-sm shadow-sm h-[calc(100vh-12rem)] min-h-[600px]">
                    {/* Header Row */}
                    <div className="flex border-b">
                        <div className="w-16 flex-none border-r bg-muted/50 p-2"></div>
                        {weekDays.map((day, i) => {
                            const date = weekDates[i];
                            const isToday = date.toDateString() === today.toDateString();

                            return (
                                <div
                                    key={day}
                                    className="flex-1 border-r p-2 text-center last:border-r-0"
                                >
                                    <div className="text-xs font-semibold text-muted-foreground">
                                        {day}
                                    </div>
                                    <div
                                        className={`mt-1 text-lg font-bold ${
                                            isToday
                                                ? 'flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground mx-auto'
                                                : ''
                                        }`}
                                    >
                                        {date.getDate()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Time Grid */}
                    <div className="flex flex-1 overflow-y-auto">
                        {/* Time Column */}
                        <div className="w-16 flex-none border-r bg-muted/50">
                            {timeSlots.map((hour) => (
                                <div
                                    key={hour}
                                    className="relative h-20 border-b p-2 text-xs text-muted-foreground last:border-b-0"
                                >
                                    <span className="-mt-2.5 block text-right">
                                        {hour > 12 ? hour - 12 : hour}{' '}
                                        {hour >= 12 ? 'PM' : 'AM'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        <div className="relative flex flex-1">
                            {/* Grid Lines */}
                            {weekDays.map((day) => (
                                <div
                                    key={day}
                                    className="flex-1 border-r last:border-r-0"
                                >
                                    {timeSlots.map((hour) => (
                                        <div
                                            key={hour}
                                            className="h-20 border-b last:border-b-0"
                                        ></div>
                                    ))}
                                </div>
                            ))}

                            {/* Appointments overlay */}
                            {weekAppointments.map((apt) => {
                                const position = getAppointmentPosition(apt);
                                if (!position) return null;

                                const startTime = new Date(apt.start_time);
                                const endTime = new Date(apt.end_time);
                                const timeStr = `${startTime.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                })} - ${endTime.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                })}`;

                                return (
                                    <div
                                        key={apt.id}
                                        className={`absolute mx-1 rounded-md border-l-4 p-2 text-xs shadow-sm cursor-pointer hover:shadow-md transition-shadow ${apt.color}`}
                                        style={{
                                            top: `${position.top}px`,
                                            height: `${position.height}px`,
                                            left: `${position.left}%`,
                                            width: `calc(${position.width}% - 8px)`,
                                            minHeight: '40px',
                                        }}
                                        onClick={() => router.visit(`/provider/appointments/${apt.id}`)}
                                        title={`${apt.service} - ${apt.client} (${timeStr})`}
                                    >
                                        <div className="font-semibold truncate">
                                            {apt.service}
                                        </div>
                                        <div className="truncate text-[10px] mt-0.5">
                                            {apt.client}
                                        </div>
                                        <div className="mt-1 flex items-center gap-1 text-[10px] opacity-80">
                                            <Clock className="w-3 h-3" />
                                            {apt.duration >= 60 
                                                ? `${Math.floor(apt.duration / 60)}h ${apt.duration % 60}m`
                                                : `${apt.duration}m`
                                            }
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Current Time Line - Only show if viewing current week and today */}
                            {weekDates.some(date => date.toDateString() === today.toDateString()) && (
                                <div
                                    className="absolute left-0 w-full border-t-2 border-red-500 z-20 pointer-events-none"
                                    style={{ top: `${getCurrentTimePosition()}px` }}
                                >
                                    <div className="absolute -left-2 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
