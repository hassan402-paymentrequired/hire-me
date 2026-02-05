import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
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
        <div className="bg-card rounded-lg border border-border p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2">
                        <Calendar size={24} />
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
            {showAddForm && (
                <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border space-y-4">
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
            <div className="space-y-3">
                {holidays?.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar size={48} className="mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">No holidays scheduled yet</p>
                    </div>
                ) : (
                    holidays?.map((holiday, index) => (
                        <div
                            key={index}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-background rounded-lg border border-border hover:shadow-elevation-1 transition-smooth"
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    holiday?.type === 'closed' ?'bg-error/10 text-error' :'bg-warning/10 text-warning'
                }`}>
                  {holiday?.type === 'closed' ? 'Closed' : 'Custom Hours'}
                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveHoliday(index)}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HolidayManager;
