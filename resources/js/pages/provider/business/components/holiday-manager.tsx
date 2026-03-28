import React, { useState } from 'react';
import KeenIcon from '@/components/keen-icon';
import { Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const HolidayManager = ({ holidays, onAddHoliday, onRemoveHoliday, onUpdateHoliday }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newHoliday, setNewHoliday] = useState({
        name: '',
        date: '',
        type: 'closed',
        customHours: { start: '09:00', end: '17:00' }
    });

    const holidayTypeOptions = [
        { value: 'closed', label: 'Closed All Day' },
        { value: 'custom', label: 'Custom Hours' }
    ];

    const handleAddHoliday = () => {
        if (newHoliday?.name && newHoliday?.date) {
            onAddHoliday(newHoliday);
            setNewHoliday({
                name: '',
                date: '',
                type: 'closed',
                customHours: { start: '09:00', end: '17:00' }
            });
            setShowAddForm(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date?.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-background">
            <div className="border-b border-border/60 bg-muted/20 px-5 py-5 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h3 className="flex items-center gap-3 text-lg font-semibold text-foreground md:text-xl">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background text-emerald-600 dark:text-emerald-300">
                            <KeenIcon name="archive" className="text-lg" />
                        </span>
                        Holiday Schedule
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage special dates and holiday hours
                    </p>
                </div>
                <Button
                    variant="default"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    Add Holiday
                </Button>
            </div>
            </div>
            {showAddForm && (
                <div className="m-5 space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4 md:m-6">
                    <h4 className="text-sm font-medium text-foreground">Add New Holiday</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            type="text"
                            placeholder="e.g., Christmas Day"
                            value={newHoliday?.name}
                            onChange={(e) => setNewHoliday({ ...newHoliday, name: e?.target?.value })}
                            required
                        />
                        <Input
                            type="date"
                            value={newHoliday?.date}
                            onChange={(e) => setNewHoliday({ ...newHoliday, date: e?.target?.value })}
                            required
                        />
                    </div>
                    <Select
                        label="Holiday Type"
                        options={holidayTypeOptions}
                        value={newHoliday?.type}
                        onChange={(value) => setNewHoliday({ ...newHoliday, type: value })}
                    />
                    {newHoliday?.type === 'custom' && (
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Start Time"
                                type="time"
                                value={newHoliday?.customHours?.start}
                                onChange={(e) => setNewHoliday({
                                    ...newHoliday,
                                    customHours: { ...newHoliday?.customHours, start: e?.target?.value }
                                })}
                            />
                            <Input
                                label="End Time"
                                type="time"
                                value={newHoliday?.customHours?.end}
                                onChange={(e) => setNewHoliday({
                                    ...newHoliday,
                                    customHours: { ...newHoliday?.customHours, end: e?.target?.value }
                                })}
                            />
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button variant="default" onClick={handleAddHoliday}>
                            Save Holiday
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddForm(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
            <div className="space-y-3 px-5 pb-5 md:px-6 md:pb-6">
                {holidays?.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 py-10 text-center">
                        <Calendar size={48} className="mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No holidays scheduled yet</p>
                    </div>
                ) : (
                    holidays?.map((holiday, index) => (
                        <div
                            key={index}
                            className="flex flex-col justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:flex-row md:items-center"
                        >
                            <div className="flex-1">
                                <h4 className="text-sm md:text-base font-medium text-foreground">{holiday?.name}</h4>
                                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                    {formatDate(holiday?.date)}
                                </p>
                                {holiday?.type === 'custom' && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Custom hours: {holiday?.customHours?.start} - {holiday?.customHours?.end}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    holiday?.type === 'closed' ?'bg-error/10 text-error' :'bg-warning/10 text-warning'
                }`}>
                  {holiday?.type === 'closed' ? 'Closed' : 'Custom Hours'}
                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveHoliday(index)}
                                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HolidayManager;
