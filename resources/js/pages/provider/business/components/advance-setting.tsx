import React from 'react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Settings } from 'lucide-react';

interface AdvancedSettingsProps {
    settings: {
        bufferTime?: string;
        advanceBooking?: string;
        minNotice?: string | number;
        maxDaily?: string | number;
        allowSameDay?: boolean;
        enableWaitlist?: boolean;
        autoConfirm?: boolean;
        sendReminders?: boolean;
        max_bookings_per_week?: string | number;
        max_bookings_per_month?: string | number;
        auto_release_payment?: boolean;
        cancellation_penalty_percent?: string | number;
        [key: string]: any;
    };
    onSettingsChange: (field: string, value: any) => void;
}

const AdvancedSettings = ({ settings, onSettingsChange }: AdvancedSettingsProps) => {
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
                {/* General Time Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Buffer Time Between Appointments"
                        description="Time gap between consecutive bookings"
                        options={bufferOptions}
                        value={settings?.bufferTime || '0'}
                        onChange={(value) => onSettingsChange('bufferTime', value)}
                    />
                    <Select
                        label="Advance Booking Window"
                        description="How far ahead customers can book"
                        options={advanceBookingOptions}
                        value={settings?.advanceBooking || '30'}
                        onChange={(value) => onSettingsChange('advanceBooking', value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Minimum Notice Period (hours)"
                        type="number"
                        description="Minimum time before appointment"
                        value={settings?.minNotice ?? ''}
                        onChange={(e) => onSettingsChange('minNotice', e.target.value)}
                        min="0"
                    />
                    <Input
                        label="Maximum Daily Appointments"
                        type="number"
                        description="Limit bookings per day"
                        value={settings?.maxDaily ?? ''}
                        onChange={(e) => onSettingsChange('maxDaily', e.target.value)}
                        min="1"
                    />
                </div>

                {/* Booking Frequency Limits */}
                <div className="pt-4 border-t border-border space-y-4">
                     <h4 className="text-sm font-medium text-foreground">Booking Frequency Limits</h4>
                     <p className="text-xs text-muted-foreground -mt-3">Restrict how often the same client can book you.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Max Bookings per Week (per user)"
                            type="number"
                            description="Validation: per client, per week"
                            value={settings?.max_bookings_per_week ?? ''}
                            onChange={(e) => onSettingsChange('max_bookings_per_week', e.target.value)}
                            min="1"
                        />
                        <Input
                            label="Max Bookings per Month (per user)"
                            type="number"
                            description="Validation: per client, per month"
                            value={settings?.max_bookings_per_month ?? ''}
                            onChange={(e) => onSettingsChange('max_bookings_per_month', e.target.value)}
                            min="1"
                        />
                    </div>
                </div>

                {/* Payment Settings */}
                <div className="pt-4 border-t border-border space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Payment Settings</h4>
                    <p className="text-xs text-muted-foreground -mt-3">Configure how payments are handled for your appointments.</p>
                    <div className="space-y-4">
                        <Checkbox
                            label="Auto-release payment upon confirmation"
                            description="Automatically release payment to your wallet when you confirm an appointment (recommended for instant payment)"
                            checked={settings?.auto_release_payment ?? false}
                            onChange={(e) => onSettingsChange('auto_release_payment', e?.target?.checked)}
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Late Cancellation Penalty (%)
                            </label>
                            <Input
                                type="number"
                                description="Percentage of payment forfeited if client cancels less than 5 hours before appointment (0-100)"
                                value={settings?.cancellation_penalty_percent ?? '0'}
                                onChange={(e) => onSettingsChange('cancellation_penalty_percent', e.target.value)}
                                min="0"
                                max="100"
                            />
                            <p className="text-xs text-muted-foreground">
                                Example: 50% means client forfeits half the payment, you receive ₦500 from a ₦1000 booking if cancelled late.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="pt-4 border-t border-border space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Booking Preferences</h4>
                    <div className="space-y-3">
                        <Checkbox
                            label="Allow same-day bookings"
                            description="Customers can book appointments for today"
                            checked={settings?.allowSameDay ?? false}
                            onChange={(e) => onSettingsChange('allowSameDay', e?.target?.checked)}
                        />
                        <Checkbox
                            label="Enable waitlist for fully booked slots"
                            description="Let customers join waitlist when no slots available"
                            checked={settings?.enableWaitlist ?? false}
                            onChange={(e) => onSettingsChange('enableWaitlist', e?.target?.checked)}
                        />
                        <Checkbox
                            label="Auto-confirm bookings"
                            description="Automatically confirm without manual approval"
                            checked={settings?.autoConfirm ?? false}
                            onChange={(e) => onSettingsChange('autoConfirm', e?.target?.checked)}
                        />
                        <Checkbox
                            label="Send reminder notifications"
                            description="Email/SMS reminders before appointments"
                            checked={settings?.sendReminders ?? false}
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
