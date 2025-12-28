import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { useState } from 'react';

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

// Mock Data
const timeSlots = Array.from({ length: 11 }, (_, i) => i + 9); // 9 AM to 7 PM
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const currentWeekDates = [23, 24, 25, 26, 27, 28, 29];

const mockAppointments = [
    {
        id: 1,
        day: 'Mon',
        startTime: 10,
        duration: 1, // hours
        client: 'Tunde Adebayo',
        service: 'Massage',
        color: 'bg-blue-100 border-blue-200 text-blue-700',
    },
    {
        id: 2,
        day: 'Tue',
        startTime: 13,
        duration: 2,
        client: 'Chioma Onu',
        service: 'Facial',
        color: 'bg-purple-100 border-purple-200 text-purple-700',
    },
    {
        id: 3,
        day: 'Fri',
        startTime: 11,
        duration: 1.5,
        client: 'Emeka Okafor',
        service: 'Haircut',
        color: 'bg-green-100 border-green-200 text-green-700',
    },
];

export default function Calendar() {
    const [view, setView] = useState<'week' | 'day'>('week');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />
            <div className="flex h-full flex-col gap-4 p-4">
                {/* Calendar Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-semibold">
                            December 2025
                        </h2>
                        <Button variant="outline" size="icon">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <div className="ml-4 flex items-center rounded-lg border bg-muted p-1">
                            <button
                                onClick={() => setView('day')}
                                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                                    view === 'day'
                                        ? 'bg-background shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Day
                            </button>
                            <button
                                onClick={() => setView('week')}
                                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                                    view === 'week'
                                        ? 'bg-background shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Week
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">Today</Button>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Event
                        </Button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-background text-sm shadow-sm h-[calc(100vh-12rem)] min-h-[600px]">
                    {/* Header Row */}
                    <div className="flex border-b">
                        <div className="w-16 flex-none border-r bg-muted/50 p-2"></div>
                        {weekDays.map((day, i) => (
                            <div
                                key={day}
                                className="flex-1 border-r p-2 text-center last:border-r-0"
                            >
                                <div className="text-xs font-semibold text-muted-foreground">
                                    {day}
                                </div>
                                <div
                                    className={`mt-1 text-lg font-bold ${
                                        day === 'Mon' // Simulating "Today"
                                            ? 'flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground mx-auto'
                                            : ''
                                    }`}
                                >
                                    {currentWeekDates[i]}
                                </div>
                            </div>
                        ))}
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
                            {mockAppointments.map((apt) => {
                                const dayIndex = weekDays.indexOf(apt.day);
                                const topOffset =
                                    (apt.startTime - timeSlots[0]) * 80; // 80px per hour
                                const height = apt.duration * 80;
                                const widthPercent = 100 / 7;
                                const leftPercent = dayIndex * widthPercent;

                                return (
                                    <div
                                        key={apt.id}
                                        className={`absolute mx-1 rounded-md border p-2 text-xs shadow-sm cursor-pointer hover:opacity-90 ${apt.color}`}
                                        style={{
                                            top: `${topOffset}px`,
                                            height: `${height}px`,
                                            left: `${leftPercent}%`,
                                            width: `calc(${widthPercent}% - 8px)`,
                                        }}
                                    >
                                        <div className="font-semibold truncate">
                                            {apt.service}
                                        </div>
                                        <div className="truncate">
                                            {apt.client}
                                        </div>
                                        <div className="mt-1 flex items-center gap-1 text-[10px] opacity-80">
                                            <Clock className="w-3 h-3" />
                                            {apt.duration}h
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Current Time Line Mockup */}
                             <div 
                                className="absolute left-0 w-full border-t-2 border-red-500 z-10 pointer-events-none"
                                style={{ top: '150px' }} // 10:50ish mockup
                             >
                                <div className="absolute -left-2 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
                             </div>

                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
