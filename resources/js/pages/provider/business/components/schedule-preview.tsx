import KeenIcon from '@/components/keen-icon';
import React from 'react';
import { Info } from 'lucide-react';

const SchedulePreview = ({ schedule }) => {
    const formatTime = (time) => {
        const [hour, minute] = time?.split(':');
        const hourNum = parseInt(hour);
        const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
        const period = hourNum < 12 ? 'AM' : 'PM';
        return `${displayHour}:${minute} ${period}`;
    };

    const getDayStatus = (daySchedule) => {
        if (!daySchedule?.isOpen) return 'Closed';
        const shifts = daySchedule?.shifts?.filter(s => s?.start && s?.end);
        if (shifts?.length === 0) return 'Not configured';
        return shifts?.map(s => `${formatTime(s?.start)} - ${formatTime(s?.end)}`)?.join(', ');
    };

    return (
        <div className="sticky top-6 overflow-hidden rounded-3xl border border-border/70 bg-background">
            <div className="border-b border-border/60 bg-muted/20 px-5 py-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background text-sky-600 dark:text-sky-300">
                        <KeenIcon name="electronic-clock" className="text-lg" />
                    </div>
                    <div>
                        <h3 className="text-lg md:text-xl font-semibold text-foreground">
                        Schedule Preview
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            How customers will see your availability
                        </p>
                    </div>
                </div>
            </div>
            <div className="space-y-3 px-5 py-5">
                {schedule && Object.entries(schedule)?.map(([day, daySchedule]) => (
                    <div
                        key={day}
                        className="flex flex-col justify-between gap-2 rounded-2xl border border-border/70 bg-muted/20 p-4 md:flex-row md:items-center"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${daySchedule?.isOpen ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                            <span className="text-sm md:text-base font-medium text-foreground min-w-[80px]">
                {day}
              </span>
                        </div>
                        <span className="text-xs md:text-sm text-muted-foreground md:text-right">
              {getDayStatus(daySchedule)}
            </span>
                    </div>
                ))}
                {!schedule && (
                    <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No schedule configured yet.</p>
                    </div>
                )}
            </div>
            <div className="mx-5 mb-5 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <div className="flex gap-3">
                    <Info size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-foreground mb-1">
                            Booking Availability
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Customers can only book appointments during your configured business hours. Break times will be blocked automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulePreview;
