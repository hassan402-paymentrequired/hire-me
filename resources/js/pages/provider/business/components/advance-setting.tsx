import React from 'react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Settings } from 'lucide-react';

const AdvancedSettings = ({ settings, onSettingsChange }) => {
    const bufferOptions = [
        { value: '0', label: 'No buffer' },
        { value: '5', label: '5 minutes' },
        { value: '10', label: '10 minutes' },
        { value: '15', label: '15 minutes' },
        { value: '30', label: '30 minutes' }
    ];

    const advanceBookingOptions = [
        { value: '7', label: '1 week' },
        { value: '14', label: '2 weeks' },
        { value: '30', label: '1 month' },
        { value: '60', label: '2 months' },
        { value: '90', label: '3 months' }
    ];

    return (
        <div className="bg-card rounded-lg border border-border p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
                <Settings size={24} color="var(--color-secondary)" />
                <div>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground">
                        Advanced Settings
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Fine-tune your booking availability
                    </p>
                </div>
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Buffer Time Between Appointments"
                        description="Time gap between consecutive bookings"
                        options={bufferOptions}
                        value={settings?.bufferTime}
                        onChange={(value) => onSettingsChange('bufferTime', value)}
                    />
                    <Select
                        label="Advance Booking Window"
                        description="How far ahead customers can book"
                        options={advanceBookingOptions}
                        value={settings?.advanceBooking}
                        onChange={(value) => onSettingsChange('advanceBooking', value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Minimum Notice Period (hours)"
                        type="number"
                        description="Minimum time before appointment"
                        value={settings?.minNotice}
                        onChange={(e) => onSettingsChange('minNotice', e?.target?.value)}
                        min="0"
                    />
                    <Input
                        label="Maximum Daily Appointments"
                        type="number"
                        description="Limit bookings per day"
                        value={settings?.maxDaily}
                        onChange={(e) => onSettingsChange('maxDaily', e?.target?.value)}
                        min="1"
                    />
                </div>

                <div className="pt-4 border-t border-border space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Booking Preferences</h4>
                    <div className="space-y-3">
                        <Checkbox
                            label="Allow same-day bookings"
                            description="Customers can book appointments for today"
                            checked={settings?.allowSameDay}
                            onChange={(e) => onSettingsChange('allowSameDay', e?.target?.checked)}
                        />
                        <Checkbox
                            label="Enable waitlist for fully booked slots"
                            description="Let customers join waitlist when no slots available"
                            checked={settings?.enableWaitlist}
                            onChange={(e) => onSettingsChange('enableWaitlist', e?.target?.checked)}
                        />
                        <Checkbox
                            label="Auto-confirm bookings"
                            description="Automatically confirm without manual approval"
                            checked={settings?.autoConfirm}
                            onChange={(e) => onSettingsChange('autoConfirm', e?.target?.checked)}
                        />
                        <Checkbox
                            label="Send reminder notifications"
                            description="Email/SMS reminders before appointments"
                            checked={settings?.sendReminders}
                            onChange={(e) => onSettingsChange('sendReminders', e?.target?.checked)}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
                        <div className="flex gap-3">
                            <AlertTriangle size={20} color="var(--color-warning)" className="flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-foreground mb-1">
                                    Important Note
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Changes to advanced settings will affect all future bookings. Existing appointments will not be modified.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedSettings;
