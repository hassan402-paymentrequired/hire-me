import { cn } from '@/lib/utils';

type WorkHours = {
    [key: string]: {
        isOpen: boolean;
        hours?: Array<{ start: string; end: string }>;
    };
};

const WEEKDAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const DEFAULT_AXIS_START = 7 * 60;
const DEFAULT_AXIS_END = 22 * 60;
const MINUTES_IN_DAY = 24 * 60;

function parseTimeToMinutes(timeStr: string): number {
    const str = timeStr.trim();
    const match12h = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);

    if (match12h) {
        let hours = parseInt(match12h[1], 10);
        const minutes = parseInt(match12h[2] || '0', 10);
        const period = match12h[3].toUpperCase();

        if (period === 'PM' && hours !== 12) {
            hours += 12;
        }

        if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    }

    const match24h = str.match(/^(\d{1,2})(?::(\d{2}))?$/);

    if (match24h) {
        return (
            parseInt(match24h[1], 10) * 60 + parseInt(match24h[2] || '0', 10)
        );
    }

    return 0;
}

/**
 * Converts a day's ranges into minute spans, clamping overnight ranges to midnight.
 */
function spansForDay(
    day: WorkHours[string] | undefined,
): Array<{ start: number; end: number }> {
    if (!day?.isOpen || !day.hours?.length) {
        return [];
    }

    return day.hours.map((range) => {
        const start = parseTimeToMinutes(range.start);
        const end = parseTimeToMinutes(range.end);

        return { start, end: end > start ? end : MINUTES_IN_DAY };
    });
}

function formatAxisLabel(minutes: number): string {
    const hours = Math.floor(minutes / 60) % 24;
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHour}${period}`;
}

function formatShortTime(value: string): string {
    return value
        .toLowerCase()
        .replace(':00', '')
        .replace(/\s*(am|pm)$/, ' $1');
}

function formatDayHours(day: WorkHours[string] | undefined): string {
    if (!day?.isOpen) {
        return 'Closed';
    }

    if (!day.hours?.length) {
        return 'Open';
    }

    return day.hours
        .map(
            (range) =>
                `${formatShortTime(range.start)} — ${formatShortTime(range.end)}`,
        )
        .join(', ');
}

export function OpeningHoursChart({
    workHours,
    todayName,
    now,
}: {
    workHours: WorkHours;
    todayName: string;
    now: Date;
}) {
    const days = WEEKDAYS.map((day) => ({
        day,
        spans: spansForDay(workHours[day]),
        label: formatDayHours(workHours[day]),
    }));

    const allSpans = days.flatMap((entry) => entry.spans);
    const axisStart = allSpans.length
        ? Math.min(
              DEFAULT_AXIS_START,
              Math.floor(Math.min(...allSpans.map((s) => s.start)) / 60) * 60,
          )
        : DEFAULT_AXIS_START;
    const axisEnd = allSpans.length
        ? Math.max(
              DEFAULT_AXIS_END,
              Math.ceil(Math.max(...allSpans.map((s) => s.end)) / 60) * 60,
          )
        : DEFAULT_AXIS_END;
    const axisLength = axisEnd - axisStart;
    const axisTicks = [0, 1, 2, 3].map(
        (step) => axisStart + Math.round((axisLength * step) / 3 / 60) * 60,
    );

    const toPercent = (minutes: number) =>
        ((Math.min(Math.max(minutes, axisStart), axisEnd) - axisStart) /
            axisLength) *
        100;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nowIsOnAxis = nowMinutes >= axisStart && nowMinutes <= axisEnd;

    return (
        <div className="mt-4">
            <dl className="space-y-2">
                {days.map((entry) => {
                    const isToday = entry.day === todayName;
                    const isClosed = entry.spans.length === 0;

                    return (
                        <div
                            key={entry.day}
                            className="grid grid-cols-[36px_minmax(0,1fr)_88px] items-center gap-3 text-xs"
                        >
                            <dt
                                className={cn(
                                    isToday
                                        ? 'font-bold text-ink'
                                        : isClosed
                                          ? 'text-sage'
                                          : 'text-ink',
                                )}
                            >
                                {entry.day.slice(0, 3)}
                            </dt>
                            <dd
                                className="relative h-2 rounded-full bg-paper"
                                aria-hidden
                            >
                                {entry.spans.map((span) => (
                                    <span
                                        key={`${span.start}-${span.end}`}
                                        className={cn(
                                            'absolute inset-y-0 rounded-full',
                                            isToday ? 'bg-forest' : 'bg-sage',
                                        )}
                                        style={{
                                            left: `${toPercent(span.start)}%`,
                                            width: `${toPercent(span.end) - toPercent(span.start)}%`,
                                        }}
                                    />
                                ))}
                                {isToday && nowIsOnAxis && (
                                    <span
                                        className="absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-ink"
                                        style={{
                                            left: `${toPercent(nowMinutes)}%`,
                                        }}
                                    />
                                )}
                            </dd>
                            <dd
                                className={cn(
                                    'text-right whitespace-nowrap',
                                    isToday && 'font-bold',
                                    isClosed ? 'text-sage' : 'text-ink',
                                )}
                            >
                                {entry.label}
                            </dd>
                        </div>
                    );
                })}
            </dl>
            <div
                className="mt-2 grid grid-cols-[36px_minmax(0,1fr)_88px] gap-3 text-[10px] text-moss"
                aria-hidden
            >
                <span />
                <div className="relative h-3">
                    {axisTicks.map((tick, index) => (
                        <span
                            key={tick}
                            className={cn(
                                'absolute',
                                index === 0
                                    ? 'left-0'
                                    : index === axisTicks.length - 1
                                      ? 'right-0'
                                      : '-translate-x-1/2',
                            )}
                            style={
                                index > 0 && index < axisTicks.length - 1
                                    ? { left: `${toPercent(tick)}%` }
                                    : undefined
                            }
                        >
                            {formatAxisLabel(tick)}
                        </span>
                    ))}
                </div>
                <span />
            </div>
        </div>
    );
}
