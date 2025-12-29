import React from 'react';
import { Eye, Info } from 'lucide-react';

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
        <div className="bg-card sticky rounded border border-border p-4 ">
            <div className="flex items-center gap-2 mb-4">
                <div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground">
                        Schedule Preview
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        How customers will see your availability
                    </p>
                </div>
            </div>
            <div className="space-y-3">
                {schedule && Object.entries(schedule)?.map(([day, daySchedule]) => (
                    <div
                        key={day}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 md:p-4 bg-background rounded border border-border"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${daySchedule?.isOpen ? 'bg-success' : 'bg-muted-foreground'}`} />
                            <span className="text-sm md:text-base font-medium text-foreground min-w-[80px]">
                {day}
              </span>
                        </div>
                        <span className="text-xs md:text-sm text-muted-foreground">
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
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex gap-3">
                    <Info size={20}  className="flex-shrink-0 mt-0.5" />
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
