import React, { useState } from 'react'
import AppLayout from '@/layouts/app-layout';
import { ArchiveIcon, Clock } from 'lucide-react';
import DayScheduleRow from '@/pages/provider/business/components/day-schedule-row';
import QuickActions from '@/pages/provider/business/components/quick-action';
import SchedulePreview from '@/pages/provider/business/components/schedule-preview';
import HolidayManager from '@/pages/provider/business/components/holiday-manager';
import AdvancedSettings from '@/pages/provider/business/components/advance-setting';
import { Button } from '@/components/ui/button';

const BusinessHoursConfig = () => {
    const [activeTab, setActiveTab] = useState('schedule');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const [schedule, setSchedule] = useState({
        Monday: {
            isOpen: true,
            shifts: [{ start: '09:00', end: '17:00', breaks: [] }]
        },
        Tuesday: {
            isOpen: true,
            shifts: [{ start: '09:00', end: '17:00', breaks: [] }]
        },
        Wednesday: {
            isOpen: true,
            shifts: [{ start: '09:00', end: '17:00', breaks: [] }]
        },
        Thursday: {
            isOpen: true,
            shifts: [{ start: '09:00', end: '17:00', breaks: [] }]
        },
        Friday: {
            isOpen: true,
            shifts: [{ start: '09:00', end: '17:00', breaks: [] }]
        },
        Saturday: {
            isOpen: true,
            shifts: [{ start: '10:00', end: '16:00', breaks: [] }]
        },
        Sunday: {
            isOpen: false,
            shifts: [{ start: '09:00', end: '17:00', breaks: [] }]
        }
    });

    const [holidays, setHolidays] = useState([
        {
            name: 'Christmas Day',
            date: '2025-12-25',
            type: 'closed'
        },
        {
            name: 'New Year\'s Day',
            date: '2026-01-01',
            type: 'closed'
        }
    ]);

    const [advancedSettings, setAdvancedSettings] = useState({
        bufferTime: '10',
        advanceBooking: '30',
        minNotice: '2',
        maxDaily: '20',
        allowSameDay: true,
        enableWaitlist: true,
        autoConfirm: false,
        sendReminders: true
    });

    const handleToggleDay = (day:string) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev?.[day], isOpen: !prev?.[day]?.isOpen }
        }));
        setHasUnsavedChanges(true);
    };

    const handleTimeChange = (day: string, shiftIndex: number, field: string, value) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev?.[day],
                shifts: prev?.[day]?.shifts?.map((shift, idx) =>
                    idx === shiftIndex ? { ...shift, [field]: value } : shift
                )
            }
        }));
        setHasUnsavedChanges(true);
    };

    const handleAddShift = (day) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev?.[day],
                shifts: [...prev?.[day]?.shifts, { start: '09:00', end: '17:00', breaks: [] }]
            }
        }));
        setHasUnsavedChanges(true);
    };

    const handleRemoveShift = (day, shiftIndex) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev?.[day],
                shifts: prev?.[day]?.shifts?.filter((_, idx) => idx !== shiftIndex)
            }
        }));
        setHasUnsavedChanges(true);
    };

    const handleAddBreak = (day: string, shiftIndex: number) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev?.[day],
                shifts: prev?.[day]?.shifts?.map((shift, idx) =>
                    idx === shiftIndex
                        ? { ...shift, breaks: [...shift?.breaks, { start: '12:00', end: '13:00' }] }
                        : shift
                )
            }
        }));
        setHasUnsavedChanges(true);
    };

    const handleRemoveBreak = (day: string, shiftIndex: number, breakIndex: number) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev?.[day],
                shifts: prev?.[day]?.shifts?.map((shift, idx) =>
                    idx === shiftIndex
                        ? { ...shift, breaks: shift?.breaks?.filter((_, bIdx) => bIdx !== breakIndex) }
                        : shift
                )
            }
        }));
        setHasUnsavedChanges(true);
    };

    const handleBreakChange = (day, shiftIndex, breakIndex, field, value) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev?.[day],
                shifts: prev?.[day]?.shifts?.map((shift, idx) =>
                    idx === shiftIndex
                        ? {
                            ...shift,
                            breaks: shift?.breaks?.map((breakTime, bIdx) =>
                                bIdx === breakIndex ? { ...breakTime, [field]: value } : breakTime
                            )
                        }
                        : shift
                )
            }
        }));
        setHasUnsavedChanges(true);
    };

    const handleAddHoliday = (holiday) => {
        setHolidays(prev => [...prev, holiday]);
        setHasUnsavedChanges(true);
    };

    const handleRemoveHoliday = (index) => {
        setHolidays(prev => prev?.filter((_, idx) => idx !== index));
        setHasUnsavedChanges(true);
    };

    const handleUpdateHoliday = (index, updatedHoliday) => {
        setHolidays(prev => prev?.map((holiday, idx) => idx === index ? updatedHoliday : holiday));
        setHasUnsavedChanges(true);
    };

    const handleCopyToAll = () => {
        const mondaySchedule = schedule?.Monday;
        const newSchedule = {};
        Object.keys(schedule)?.forEach(day => {
            newSchedule[day] = { ...mondaySchedule };
        });
        setSchedule(newSchedule);
        setHasUnsavedChanges(true);
    };

    const handleApplyTemplate = (templateName) => {
        let newSchedule = {};

        if (templateName === 'Standard 9-5') {
            Object.keys(schedule)?.forEach(day => {
                newSchedule[day] = {
                    isOpen: day !== 'Saturday' && day !== 'Sunday',
                    shifts: [{ start: '09:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] }]
                };
            });
        } else if (templateName === 'Retail Hours') {
            Object.keys(schedule)?.forEach(day => {
                newSchedule[day] = {
                    isOpen: day !== 'Sunday',
                    shifts: [{ start: '10:00', end: '20:00', breaks: [{ start: '14:00', end: '15:00' }] }]
                };
            });
        } else if (templateName === 'Salon Schedule') {
            Object.keys(schedule)?.forEach(day => {
                newSchedule[day] = {
                    isOpen: day !== 'Sunday' && day !== 'Monday',
                    shifts: [{ start: '09:00', end: '19:00', breaks: [{ start: '13:00', end: '14:00' }] }]
                };
            });
        }

        setSchedule(newSchedule);
        setHasUnsavedChanges(true);
    };

    const handleReset = () => {
        setSchedule({
            Monday: { isOpen: true, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
            Tuesday: { isOpen: true, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
            Wednesday: { isOpen: true, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
            Thursday: { isOpen: true, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
            Friday: { isOpen: true, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] },
            Saturday: { isOpen: true, shifts: [{ start: '10:00', end: '16:00', breaks: [] }] },
            Sunday: { isOpen: false, shifts: [{ start: '09:00', end: '17:00', breaks: [] }] }
        });
        setHasUnsavedChanges(true);
    };

    const handleSettingsChange = (field, value) => {
        setAdvancedSettings(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const handleSaveChanges = () => {
        console.log('Saving business hours configuration:', { schedule, holidays, advancedSettings });
        setHasUnsavedChanges(false);
    };

    const handlePreviewBooking = () => {
        navigate('/landing-marketing-page');
    };

    const tabs = [
        { id: 'schedule', label: 'Weekly Schedule', icon: 'Calendar' },
        { id: 'holidays', label: 'Holidays', icon: 'CalendarDays' },
        { id: 'advanced', label: 'Advanced', icon: 'Settings' }
    ];

    return (

            <AppLayout>

                <main className="p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 md:mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Clock size={24} color="var(--color-primary)" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                    Operating Hours
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Last updated: December 27, 2025
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                            <Button
                                variant="outline"
                                iconName="Eye"
                                iconPosition="left"
                                onClick={handlePreviewBooking}
                                className="flex-1 lg:flex-none"
                            >
                                Preview Booking Page
                            </Button>
                            <Button
                                variant="default"
                                iconName="Save"
                                iconPosition="left"
                                onClick={handleSaveChanges}
                                disabled={!hasUnsavedChanges}
                                className="flex-1 lg:flex-none"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>

                    {hasUnsavedChanges && (
                        <div className="mb-6 p-4 bg-warning/5 rounded-lg border border-warning/20">
                            <div className="flex gap-3">
                                <ArchiveIcon name="AlertCircle" size={20} color="var(--color-warning)" className="flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Unsaved Changes</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        You have unsaved changes. Click "Save Changes" to apply them to your booking page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-6 overflow-x-auto">
                        <div className="flex gap-2 border-b border-border min-w-max">
                            {tabs?.map(tab => (
                                <button
                                    key={tab?.id}
                                    onClick={() => setActiveTab(tab?.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-smooth border-b-2 whitespace-nowrap ${
                                        activeTab === tab?.id
                                            ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <ArchiveIcon  size={18} />
                                    {tab?.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === 'schedule' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                {Object.keys(schedule)?.map(day => (
                                    <DayScheduleRow
                                        key={day}
                                        day={day}
                                        schedule={schedule?.[day]}
                                        onToggle={handleToggleDay}
                                        onTimeChange={handleTimeChange}
                                        onAddBreak={handleAddBreak}
                                        onRemoveBreak={handleRemoveBreak}
                                        onBreakChange={handleBreakChange}
                                        onAddShift={handleAddShift}
                                        onRemoveShift={handleRemoveShift}
                                    />
                                ))}
                            </div>

                            <div className="space-y-6">
                                <QuickActions
                                    onCopyToAll={handleCopyToAll}
                                    onApplyTemplate={handleApplyTemplate}
                                    onReset={handleReset}
                                />
                                <SchedulePreview schedule={schedule} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'holidays' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                            <div className="lg:col-span-2">
                                <HolidayManager
                                    holidays={holidays}
                                    onAddHoliday={handleAddHoliday}
                                    onRemoveHoliday={handleRemoveHoliday}
                                    onUpdateHoliday={handleUpdateHoliday}
                                />
                            </div>
                            <div>
                                <SchedulePreview schedule={schedule} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                            <div className="lg:col-span-2">
                                <AdvancedSettings
                                    settings={advancedSettings}
                                    onSettingsChange={handleSettingsChange}
                                />
                            </div>
                            <div>
                                <SchedulePreview schedule={schedule} />
                            </div>
                        </div>
                    )}
                </main>
            </AppLayout>

    );
};

export default BusinessHoursConfig;
