import React from 'react';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/form-select';
import { Coffee, Plus, Trash2 } from 'lucide-react';

const DayScheduleRow = ({
                            day,
                            schedule,
                            onToggle,
                            onTimeChange,
                            onAddBreak,
                            onRemoveBreak,
                            onBreakChange,
                            errors
                        }) => {
    const getError = (path) => errors?.[`schedule.${day}.shifts.0.${path}`];
    const getBreakError = (breakIndex, field) => errors?.[`schedule.${day}.shifts.0.breaks.${breakIndex}.${field}`];
    const timeOptions = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2);
        const minute = i % 2 === 0 ? '00' : '30';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const period = hour < 12 ? 'AM' : 'PM';
        const value = `${hour?.toString()?.padStart(2, '0')}:${minute}`;
        return {
            value,
            label: `${displayHour}:${minute} ${period}`
        };
    });

    const shift = schedule?.shifts?.[0];
    const shiftIndex = 0;

    return (
        <div className={`p-2 md:p-4 rounded border transition-smooth ${schedule?.isOpen ? 'bg-card border-border' : 'bg-muted/50 border-border/50'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div className="flex items-start gap-2">
                    <button
                        onClick={() => onToggle(day)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-smooth focus-ring ${schedule?.isOpen ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                        role="switch"
                        aria-checked={schedule?.isOpen}
                        type={"button"}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-smooth ${schedule?.isOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <div>
                        <h3 className="text-base md:text-lg font-semibold text-foreground">{day}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            {schedule?.isOpen ? 'Open for business' : 'Closed'}
                        </p>
                    </div>
                </div>

                {schedule?.isOpen && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddBreak(day, shiftIndex)}
                        className="w-full md:w-auto"
                        type={"button"}
                    >
                        <Coffee className="size-4" />
                        Add Break
                    </Button>
                )}
            </div>

            {schedule?.isOpen && shift && (
                <div className=" space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelect
                            label="Start Time"
                            options={timeOptions}
                            value={shift?.start}
                            onChange={(value) => onTimeChange(day, shiftIndex, 'start', value)}
                            required
                            error={getError('start')}
                        />
                        <FormSelect
                            label="End Time"
                            options={timeOptions}
                            value={shift?.end}
                            onChange={(value) => onTimeChange(day, shiftIndex, 'end', value)}
                            required
                            error={getError('end')}
                        />
                    </div>

                    {shift?.breaks && shift?.breaks?.length > 0 && (
                        <div className="space-y-3">
                            <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
                                <Coffee size={16} />
                                Break Times
                            </h5>
                            {shift?.breaks?.map((breakTime, breakIndex) => (
                                <div key={breakIndex} className="flex flex-col md:flex-row gap-3 p-3 bg-muted/50 rounded">
                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                        <FormSelect
                                            label="Break Start"
                                            options={timeOptions}
                                            value={breakTime?.start}
                                            onChange={(value) => onBreakChange(day, shiftIndex, breakIndex, 'start', value)}
                                            required
                                            error={getBreakError(breakIndex, 'start')}
                                        />
                                        <FormSelect
                                            label="Break End"
                                            options={timeOptions}
                                            value={breakTime?.end}
                                            onChange={(value) => onBreakChange(day, shiftIndex, breakIndex, 'end', value)}
                                            required
                                            error={getBreakError(breakIndex, 'end')}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveBreak(day, shiftIndex, breakIndex)}
                                        className="md:self-end"
                                        type={"button"}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DayScheduleRow;
