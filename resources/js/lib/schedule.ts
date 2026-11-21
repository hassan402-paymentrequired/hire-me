export interface BreakTime {
    start: string;
    end: string;
}

export interface Shift {
    start: string;
    end: string;
    breaks?: BreakTime[];
}

export interface DaySchedule {
    isOpen: boolean;
    shifts: Shift[];
}

export type WeeklySchedule = Record<string, DaySchedule>;

export interface Holiday {
    name: string;
    date: string;
    type?: 'closed' | 'custom' | string;
    customHours?: { start: string; end: string };
}

export const WEEK_DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

/** "13:30" → 13.5 */
export const toHours = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);

    return (hours || 0) + (minutes || 0) / 60;
};

/** 13.5 → "1:30 PM" */
export const formatHour = (value: number) => {
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    const period = hours >= 12 && hours < 24 ? 'PM' : 'AM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;

    return minutes
        ? `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`
        : `${displayHour} ${period}`;
};

/** Total open hours for a day, minus breaks. */
export const openHoursFor = (day?: DaySchedule) => {
    if (!day?.isOpen) {
        return 0;
    }

    return day.shifts.reduce((total, shift) => {
        const breaks = (shift.breaks ?? []).reduce(
            (sum, item) =>
                sum + Math.max(toHours(item.end) - toHours(item.start), 0),
            0,
        );

        return (
            total +
            Math.max(toHours(shift.end) - toHours(shift.start) - breaks, 0)
        );
    }, 0);
};
