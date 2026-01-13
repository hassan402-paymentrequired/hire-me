import React from 'react';
import { FormSelect } from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, CheckCircle2, Settings } from 'lucide-react';

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
                    <div className="space-y-2">
                        <FormSelect
                            label="Buffer Time Between Appointments"
                            options={bufferOptions}
                            value={settings?.bufferTime || '0'}
                            onChange={(value) => onSettingsChange('bufferTime', value)}
                            placeholder="Select buffer time"
                        />
                        <p className="text-xs text-muted-foreground">
                            Time gap between consecutive bookings
                        </p>
                    </div>
                    <div className="space-y-2">
                        <FormSelect
                            label="Advance Booking Window"
                            options={advanceBookingOptions}
                            value={settings?.advanceBooking || '30'}
                            onChange={(value) => onSettingsChange('advanceBooking', value)}
                            placeholder="Select booking window"
                        />
                        <p className="text-xs text-muted-foreground">
                            How far ahead customers can book
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="minNotice">Minimum Notice Period (hours)</Label>
                        <Input
                            id="minNotice"
                            type="number"
                            value={settings?.minNotice ?? ''}
                            onChange={(e) => onSettingsChange('minNotice', e.target.value)}
                            min="0"
                        />
                        <p className="text-xs text-muted-foreground">
                            Minimum time before appointment
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxDaily">Maximum Daily Appointments</Label>
                        <Input
                            id="maxDaily"
                            type="number"
                            value={settings?.maxDaily ?? ''}
                            onChange={(e) => onSettingsChange('maxDaily', e.target.value)}
                            min="1"
                        />
                        <p className="text-xs text-muted-foreground">
                            Limit bookings per day
                        </p>
                    </div>
                </div>

                {/* Booking Frequency Limits */}
                <div className="pt-4 border-t border-border space-y-4">
                     <h4 className="text-sm font-medium text-foreground">Booking Frequency Limits</h4>
                     <p className="text-xs text-muted-foreground -mt-3">Restrict how often the same client can book you.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="max_bookings_per_week">Max Bookings per Week (per user)</Label>
                            <Input
                                id="max_bookings_per_week"
                                type="number"
                                value={settings?.max_bookings_per_week ?? ''}
                                onChange={(e) => onSettingsChange('max_bookings_per_week', e.target.value)}
                                min="1"
                            />
                            <p className="text-xs text-muted-foreground">
                                Validation: per client, per week
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max_bookings_per_month">Max Bookings per Month (per user)</Label>
                            <Input
                                id="max_bookings_per_month"
                                type="number"
                                value={settings?.max_bookings_per_month ?? ''}
                                onChange={(e) => onSettingsChange('max_bookings_per_month', e.target.value)}
                                min="1"
                            />
                            <p className="text-xs text-muted-foreground">
                                Validation: per client, per month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Settings */}
                <div className="pt-4 border-t border-border space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Payment Settings</h4>
                    <p className="text-xs text-muted-foreground -mt-3">Configure payment policies for your appointments.</p>
                    <div className="space-y-4">
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-primary">
                                        Dual Approval Payment System
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Clients pay when booking, but payment is held securely until both you and the client confirm the service is completed. This protects both parties from exploitation and ensures service quality.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cancellation_penalty_percent">
                                Late Cancellation Penalty (%)
                            </Label>
                            <Input
                                id="cancellation_penalty_percent"
                                type="number"
                                value={settings?.cancellation_penalty_percent ?? '0'}
                                onChange={(e) => onSettingsChange('cancellation_penalty_percent', e.target.value)}
                                min="0"
                                max="100"
                            />
                            <p className="text-xs text-muted-foreground">
                                Percentage of payment forfeited if client cancels less than 5 hours before appointment (0-100)
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Example: 50% means client forfeits half the payment, you receive ₦500 from a ₦1000 booking if cancelled late. The remaining ₦500 is refunded to the client.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="pt-4 border-t border-border space-y-4">
                    <h4 className="text-sm font-medium text-foreground">Booking Preferences</h4>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="allowSameDay"
                                checked={settings?.allowSameDay ?? false}
                                onCheckedChange={(checked) => onSettingsChange('allowSameDay', checked)}
                            />
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="allowSameDay" className="cursor-pointer">
                                    Allow same-day bookings
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Customers can book appointments for today
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="enableWaitlist"
                                checked={settings?.enableWaitlist ?? false}
                                onCheckedChange={(checked) => onSettingsChange('enableWaitlist', checked)}
                            />
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="enableWaitlist" className="cursor-pointer">
                                    Enable waitlist for fully booked slots
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Let customers join waitlist when no slots available
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="autoConfirm"
                                checked={settings?.autoConfirm ?? false}
                                onCheckedChange={(checked) => onSettingsChange('autoConfirm', checked)}
                            />
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="autoConfirm" className="cursor-pointer">
                                    Auto-confirm bookings
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Automatically confirm without manual approval
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="sendReminders"
                                checked={settings?.sendReminders ?? false}
                                onCheckedChange={(checked) => onSettingsChange('sendReminders', checked)}
                            />
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="sendReminders" className="cursor-pointer">
                                    Send reminder notifications
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Email/SMS reminders before appointments
                                </p>
                            </div>
                        </div>
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
