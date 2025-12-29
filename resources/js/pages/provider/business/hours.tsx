import React, { useState, useEffect } from 'react'
import AppLayout from '@/layouts/app-layout';
import { ArchiveIcon, Clock, Save, Scissors } from 'lucide-react';
import DayScheduleRow from '@/pages/provider/business/components/day-schedule-row';
import SchedulePreview from '@/pages/provider/business/components/schedule-preview';
import HolidayManager from '@/pages/provider/business/components/holiday-manager';
import ServicesManager from '@/pages/provider/business/components/services-manager';
import { Button } from '@/components/ui/button';
import { router, usePage } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import business from '@/routes/business';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: business.dashboard().url,
    },
    {
        title: 'Business',
        href: business.hours().url,
    },
    {
        title: 'Operating Hours',
        href: '',
    },
];

interface Props {
    initialSchedule: any;
    initialHolidays: any[];
    services: any[];
}

const BusinessHoursConfig = ({ initialSchedule, initialHolidays, services = [] }: Props) => {
    const { flash } = usePage().props as any;
    const [activeTab, setActiveTab] = useState('schedule');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const [schedule, setSchedule] = useState(initialSchedule);
    const [holidays, setHolidays] = useState(initialHolidays || []);

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





    const handleSaveChanges = () => {
        router.post('/business/hours', {
            schedule,
            holidays,
        }, {
            onSuccess: () => setHasUnsavedChanges(false),
        });
    };


    const tabs = [
        { id: 'schedule', label: 'Weekly Schedule', icon: Clock }, // Using Lucide component directly in loop requires component type
        { id: 'services', label: 'Services', icon: Scissors },
        { id: 'holidays', label: 'Holidays', icon: ArchiveIcon }, // Using ArchiveIcon as placeholder for generic Lucide icon if needed, or specific
    ];

    return (

            <AppLayout breadcrumbs={breadcrumbs}>

                <main className="flex flex-col p-4">

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 md:mb-8">
                        <div className="flex items-center gap-3">
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                    Business Configuration
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Manage your working hours, services, and settings.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">

                            <Button
                                variant="default"
                                onClick={handleSaveChanges}
                                disabled={!hasUnsavedChanges}
                                className="flex-1 lg:flex-none"
                            >
                               <Save /> Save Changes
                            </Button>
                        </div>
                    </div>

                    {hasUnsavedChanges && (
                        <div className="mb-6 p-4 bg-warning/5 rounded border border-red-300">
                            <div className="flex gap-3">
                                <ArchiveIcon  size={20}  className="flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Unsaved Changes</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        You have unsaved changes. Click "Save Changes" to apply them to your booking page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {flash?.success && (
                        <div className="mb-6 p-4 bg-success/10 rounded-lg border border-success/20">
                            <p className="text-sm font-medium text-success">{flash.success}</p>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-6 p-4 bg-error/10 rounded-lg border border-error/20">
                            <p className="text-sm font-medium text-error">{flash.error}</p>
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
                                    <tab.icon size={18} />
                                    {tab?.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === 'schedule' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                            <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {schedule && Object.keys(schedule)?.map(day => (
                                <DayScheduleRow
                                    key={day}
                                    day={day}
                                    schedule={schedule?.[day]}
                                    onToggle={handleToggleDay}
                                    onTimeChange={handleTimeChange}
                                    onAddBreak={handleAddBreak}
                                    onRemoveBreak={handleRemoveBreak}
                                    onBreakChange={handleBreakChange}
                                />
                            ))}
                            {!schedule && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No schedule set. Please complete onboarding to set your business hours.</p>
                                </div>
                            )}
                        </div>
                            </div>
                            <div>
                                <SchedulePreview schedule={schedule} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <ServicesManager services={services} />
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

                </main>
            </AppLayout>

    );
};

export default BusinessHoursConfig;
