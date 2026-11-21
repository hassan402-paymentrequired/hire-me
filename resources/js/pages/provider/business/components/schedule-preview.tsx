import {
    openHoursFor,
    toHours,
    WEEK_DAYS,
    type WeeklySchedule,
} from '@/lib/schedule';

const SCALE_START = 6;
const SCALE_END = 22;
const SCALE = SCALE_END - SCALE_START;

const percent = (hour: number) =>
    `${((Math.min(Math.max(hour, SCALE_START), SCALE_END) - SCALE_START) / SCALE) * 100}%`;

const width = (start: number, end: number) =>
    `${((Math.min(Math.max(end, SCALE_START), SCALE_END) - Math.min(Math.max(start, SCALE_START), SCALE_END)) / SCALE) * 100}%`;

const breakStripes =
    'bg-[repeating-linear-gradient(135deg,#C8F169_0_3px,#0E3B2E_3px_6px)]';

export default function SchedulePreview({
    schedule,
}: {
    schedule?: WeeklySchedule | null;
}) {
    const totalHours = WEEK_DAYS.reduce(
        (total, day) => total + openHoursFor(schedule?.[day]),
        0,
    );

    return (
        <div className="flex flex-col gap-3.5 rounded-[20px] border border-[#0E3B2E]/10 bg-card p-5 shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10">
            <div className="flex items-baseline justify-between">
                <span className="font-[Sora] text-base font-semibold text-foreground">
                    Week at a glance
                </span>
                <span className="text-[13px] text-muted-foreground">
                    <b className="font-[Sora] text-[#0E3B2E] dark:text-[#C8F169]">
                        {Math.round(totalHours * 10) / 10}h
                    </b>{' '}
                    open
                </span>
            </div>

            {WEEK_DAYS.map((day) => {
                const daySchedule = schedule?.[day];
                const isOpen = Boolean(daySchedule?.isOpen);
                const hours = openHoursFor(daySchedule);

                return (
                    <div key={day} className="flex items-center gap-2.5">
                        <span
                            className={
                                isOpen
                                    ? 'w-[34px] text-xs font-bold text-foreground'
                                    : 'w-[34px] text-xs font-bold text-muted-foreground'
                            }
                        >
                            {day.slice(0, 3)}
                        </span>
                        <div className="relative h-3.5 flex-1 overflow-hidden rounded-full bg-muted">
                            {isOpen &&
                                daySchedule?.shifts.map((shift, shiftIndex) => (
                                    <div key={shiftIndex}>
                                        <div
                                            className="absolute inset-y-0 rounded-full bg-[#0E3B2E] dark:bg-[#C8F169]"
                                            style={{
                                                left: percent(
                                                    toHours(shift.start),
                                                ),
                                                width: width(
                                                    toHours(shift.start),
                                                    toHours(shift.end),
                                                ),
                                            }}
                                        />
                                        {(shift.breaks ?? []).map(
                                            (breakTime, breakIndex) => (
                                                <div
                                                    key={breakIndex}
                                                    className={`absolute inset-y-0 ${breakStripes}`}
                                                    style={{
                                                        left: percent(
                                                            toHours(
                                                                breakTime.start,
                                                            ),
                                                        ),
                                                        width: width(
                                                            toHours(
                                                                breakTime.start,
                                                            ),
                                                            toHours(
                                                                breakTime.end,
                                                            ),
                                                        ),
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                ))}
                        </div>
                        <span className="w-11 text-right text-[11px] font-bold text-muted-foreground">
                            {isOpen
                                ? `${Math.round(hours * 10) / 10}h`
                                : 'Closed'}
                        </span>
                    </div>
                );
            })}

            <div className="flex justify-between pr-[54px] pl-11 text-[10px] text-muted-foreground">
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>10 PM</span>
            </div>
            <div className="flex gap-3.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-[3px] bg-[#0E3B2E] dark:bg-[#C8F169]" />
                    Open
                </span>
                <span className="flex items-center gap-1.5">
                    <span
                        className={`size-2.5 rounded-[3px] ${breakStripes}`}
                    />
                    Break
                </span>
            </div>
        </div>
    );
}
