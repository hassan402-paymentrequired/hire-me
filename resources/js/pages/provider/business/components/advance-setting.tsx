import React from 'react';
import KeenIcon from '@/components/keen-icon';
import { FormSelect } from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface AdvancedSettingsProps {
    settings: {
        bufferTime?: string;
        advanceBooking?: string;
        minNotice?: string | number;
        maxDaily?: string | number;
        allowSameDay?: boolean;
        autoConfirm?: boolean;
        allowOffHoursRequests?: boolean;
        max_bookings_per_week?: string | number;
        max_bookings_per_month?: string | number;
        auto_release_payment?: boolean;
        accept_online_payment?: boolean;
        accept_offline_booking?: boolean;
        offers_home_service?: boolean;
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
        <div className="bg-card  p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
                <KeenIcon name="slider" className="text-xl text-primary" />
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
                        <Label>Buffer Time Between Appointments</Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                <KeenIcon name="electronic-clock" className="text-sm" />
                            </div>
                        <FormSelect
                            label=""
                            options={bufferOptions}
                            value={settings?.bufferTime || '0'}
                            onChange={(value) => onSettingsChange('bufferTime', value)}
                            placeholder="Select buffer time"
                            className="[&_[data-slot=select-trigger]]:pl-10"
                        />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Time gap between consecutive bookings
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label>Advance Booking Window</Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                <KeenIcon name="archive" className="text-sm" />
                            </div>
                        <FormSelect
                            label=""
                            options={advanceBookingOptions}
                            value={settings?.advanceBooking || '30'}
                            onChange={(value) => onSettingsChange('advanceBooking', value)}
                            placeholder="Select booking window"
                            className="[&_[data-slot=select-trigger]]:pl-10"
                        />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            How far ahead customers can book
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="minNotice">Minimum Notice Period (hours)</Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                <KeenIcon name="electronic-clock" className="text-sm" />
                            </div>
                        <Input
                            id="minNotice"
                            type="number"
                            value={settings?.minNotice ?? ''}
                            onChange={(e) => onSettingsChange('minNotice', e.target.value)}
                            min="0"
                            placeholder="e.g. 4"
                            className="pl-10"
                        />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Minimum time before appointment
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxDaily">Maximum Daily Appointments</Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                <KeenIcon name="status" className="text-sm" />
                            </div>
                        <Input
                            id="maxDaily"
                            type="number"
                            value={settings?.maxDaily ?? ''}
                            onChange={(e) => onSettingsChange('maxDaily', e.target.value)}
                            min="1"
                            placeholder="e.g. 8"
                            className="pl-10"
                        />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Limit bookings per day
                        </p>
                    </div>
                </div>

                {/* Booking Frequency Limits */}
                <div className="pt-4 border-t border-dashed border-border space-y-4">
                     <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                         <KeenIcon name="filter-square" className="text-sm text-primary" />
                         <span>Booking Frequency Limits</span>
                     </h4>
                     <p className="text-xs text-muted-foreground -mt-3">Restrict how often the same client can book you.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="max_bookings_per_week">Max Bookings per Week (per user)</Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                    <KeenIcon name="archive-tick" className="text-sm" />
                                </div>
                            <Input
                                id="max_bookings_per_week"
                                type="number"
                                value={settings?.max_bookings_per_week ?? ''}
                                onChange={(e) => onSettingsChange('max_bookings_per_week', e.target.value)}
                                min="1"
                                placeholder="e.g. 2"
                                className="pl-10"
                            />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Validation: per client, per week
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max_bookings_per_month">Max Bookings per Month (per user)</Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                    <KeenIcon name="archive" className="text-sm" />
                                </div>
                            <Input
                                id="max_bookings_per_month"
                                type="number"
                                value={settings?.max_bookings_per_month ?? ''}
                                onChange={(e) => onSettingsChange('max_bookings_per_month', e.target.value)}
                                min="1"
                                placeholder="e.g. 6"
                                className="pl-10"
                            />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Validation: per client, per month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Settings */}
                <div className="pt-4 border-t border-dashed border-border space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <KeenIcon name="receipt-square" className="text-sm text-primary" />
                        <span>Payment Settings</span>
                    </h4>
                    <p className="text-xs text-muted-foreground -mt-3">Configure payment policies for your appointments.</p>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="accept_online_payment"
                                checked={settings?.accept_online_payment ?? true}
                                onCheckedChange={(checked) => onSettingsChange('accept_online_payment', checked)}
                            />
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="accept_online_payment" className="cursor-pointer">
                                    Accept online payment before booking
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Clients can pay through Proxideck before the booking goes through.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="accept_offline_booking"
                                checked={settings?.accept_offline_booking ?? false}
                                onCheckedChange={(checked) => onSettingsChange('accept_offline_booking', checked)}
                            />
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="accept_offline_booking" className="cursor-pointer">
                                    Allow unpaid booking requests
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Clients can request an appointment first and pay you later. These requests always stay pending for review.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="pt-4 border-t border-dashed border-border space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <KeenIcon name="slider" className="text-sm text-primary" />
                        <span>Booking Preferences</span>
                    </h4>
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
                                id="allowOffHoursRequests"
                                checked={settings?.allowOffHoursRequests ?? false}
                                onCheckedChange={(checked) =>
                                    onSettingsChange('allowOffHoursRequests', checked)
                                }
                            />
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="allowOffHoursRequests" className="cursor-pointer">
                                    Allow off-hours requests
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Clients can request times outside your work hours. These requests will always be pending, even if auto-confirm is enabled.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-dashed border-border space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <KeenIcon name="geolocation-home" className="text-sm text-primary" />
                        <span>Service Delivery</span>
                    </h4>
                    <p className="text-xs text-muted-foreground -mt-3">
                        Choose whether clients can book appointments at their own location.
                    </p>
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="offers_home_service"
                            checked={settings?.offers_home_service ?? false}
                            onCheckedChange={(checked) => onSettingsChange('offers_home_service', checked === true)}
                        />
                        <div className="space-y-1 flex-1">
                            <Label htmlFor="offers_home_service" className="cursor-pointer">
                                Offer home service
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Clients will need to provide a service address when they book.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedSettings;
