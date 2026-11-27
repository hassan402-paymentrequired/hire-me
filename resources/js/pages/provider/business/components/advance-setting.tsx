/* eslint-disable @typescript-eslint/no-explicit-any */
import KeenIcon from '@/components/keen-icon';
import { AppSelect } from '@/components/ui/app-select';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

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
        service_delivery_mode?:
            | 'client_visits_provider'
            | 'provider_visits_client'
            | 'both';
        billing_model?: 'commission' | 'subscription';
        home_service_fee?: string | number | null;
        [key: string]: any;
    };
    onSettingsChange: (field: string, value: any) => void;
}

const bufferOptions = [
    { value: '0', label: 'No buffer' },
    { value: '5', label: '5 minutes' },
    { value: '10', label: '10 minutes' },
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
];

const advanceBookingOptions = [
    { value: '7', label: '1 week' },
    { value: '14', label: '2 weeks' },
    { value: '30', label: '1 month' },
    { value: '60', label: '2 months' },
    { value: '90', label: '3 months' },
];

const deliveryOptions = [
    {
        value: 'client_visits_provider',
        title: 'At my place',
        description: 'Clients come to your address.',
    },
    {
        value: 'provider_visits_client',
        title: 'Home service',
        description: 'You go to the client’s address.',
    },
    {
        value: 'both',
        title: 'Both',
        description: 'Clients choose either option.',
    },
] as const;

function Group({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="overflow-hidden rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10">
            <h2 className="px-[22px] py-[18px] font-[Sora] text-lg font-semibold text-foreground">
                {title}
            </h2>
            <div className="divide-y divide-[#0E3B2E]/[0.07] border-t border-[#0E3B2E]/[0.07] dark:divide-white/10 dark:border-white/10">
                {children}
            </div>
        </section>
    );
}

function Rule({
    title,
    description,
    htmlFor,
    children,
}: {
    title: string;
    description?: string;
    htmlFor?: string;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-[22px] py-4">
            <div className="flex flex-[1_1_280px] flex-col gap-0.5">
                <label
                    htmlFor={htmlFor}
                    className="text-[15px] font-bold text-foreground"
                >
                    {title}
                </label>
                {description && (
                    <span className="text-[13px] leading-snug text-muted-foreground">
                        {description}
                    </span>
                )}
            </div>
            {children}
        </div>
    );
}

function Toggle({
    checked,
    label,
    onChange,
}: {
    checked: boolean;
    label: string;
    onChange: (value: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={cn(
                'flex h-[26px] w-11 shrink-0 items-center rounded-full p-[3px] transition-colors focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 focus-visible:outline-none',
                checked
                    ? 'justify-end bg-[#0E3B2E]'
                    : 'justify-start bg-[#D5DDD8] dark:bg-white/15',
            )}
        >
            <span
                className={cn(
                    'size-5 rounded-full',
                    checked ? 'bg-[#C8F169]' : 'bg-white',
                )}
            />
        </button>
    );
}

function NumberInput({
    id,
    value,
    suffix,
    placeholder,
    onChange,
}: {
    id: string;
    value: any;
    suffix: string;
    placeholder?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex h-11 w-[180px] items-center overflow-hidden rounded-[10px] border border-[#0E3B2E]/15 focus-within:ring-[3px] focus-within:ring-[#C8F169]/60 dark:border-white/15">
            <input
                id={id}
                type="number"
                min="0"
                value={value ?? ''}
                placeholder={placeholder ?? 'No limit'}
                onChange={(e) => onChange(e.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-foreground outline-none"
            />
            <span className="flex h-full items-center bg-muted px-3 text-xs font-bold whitespace-nowrap text-muted-foreground">
                {suffix}
            </span>
        </div>
    );
}

const AdvancedSettings = ({
    settings,
    onSettingsChange,
}: AdvancedSettingsProps) => {
    const deliveryMode =
        settings?.service_delivery_mode ??
        (settings?.offers_home_service
            ? 'provider_visits_client'
            : 'client_visits_provider');
    const billingModel = settings?.billing_model || 'commission';

    return (
        <div className="flex flex-col gap-4">
            <Group title="Timing">
                <Rule
                    title="Buffer time between appointments"
                    description="Time to reset before the next client."
                    htmlFor="bufferTime"
                >
                    <AppSelect
                        id="bufferTime"
                        value={settings?.bufferTime || '0'}
                        onChange={(value) =>
                            onSettingsChange('bufferTime', value)
                        }
                        options={[...bufferOptions]}
                        size="sm"
                        className="w-[180px]"
                        triggerClassName="min-h-11 rounded-[10px] font-semibold"
                    />
                </Rule>
                <Rule
                    title="How far ahead clients can book"
                    description="Clients can’t book further out than this."
                    htmlFor="advanceBooking"
                >
                    <AppSelect
                        id="advanceBooking"
                        value={settings?.advanceBooking || '30'}
                        onChange={(value) =>
                            onSettingsChange('advanceBooking', value)
                        }
                        options={[...advanceBookingOptions]}
                        size="sm"
                        className="w-[180px]"
                        triggerClassName="min-h-11 rounded-[10px] font-semibold"
                    />
                </Rule>
                <Rule
                    title="Minimum notice"
                    description="How soon before a slot clients can still book it."
                    htmlFor="minNotice"
                >
                    <NumberInput
                        id="minNotice"
                        value={settings?.minNotice}
                        suffix="hours"
                        placeholder="0"
                        onChange={(value) =>
                            onSettingsChange('minNotice', value)
                        }
                    />
                </Rule>
                <Rule
                    title="Allow same-day bookings"
                    description="Clients can book for later today."
                >
                    <Toggle
                        checked={settings?.allowSameDay ?? false}
                        label="Allow same-day bookings"
                        onChange={(value) =>
                            onSettingsChange('allowSameDay', value)
                        }
                    />
                </Rule>
                <Rule
                    title="Accept requests outside hours"
                    description="Clients can ask for a time outside your business hours. You approve each one."
                >
                    <Toggle
                        checked={settings?.allowOffHoursRequests ?? false}
                        label="Accept requests outside hours"
                        onChange={(value) =>
                            onSettingsChange('allowOffHoursRequests', value)
                        }
                    />
                </Rule>
            </Group>

            <Group title="Limits">
                <Rule
                    title="Max bookings per day"
                    description="Across all clients. Leave empty for no limit."
                    htmlFor="maxDaily"
                >
                    <NumberInput
                        id="maxDaily"
                        value={settings?.maxDaily}
                        suffix="per day"
                        onChange={(value) =>
                            onSettingsChange('maxDaily', value)
                        }
                    />
                </Rule>
                <Rule
                    title="Max bookings per client, per week"
                    description="Stops one client filling your week."
                    htmlFor="max_bookings_per_week"
                >
                    <NumberInput
                        id="max_bookings_per_week"
                        value={settings?.max_bookings_per_week}
                        suffix="per week"
                        onChange={(value) =>
                            onSettingsChange('max_bookings_per_week', value)
                        }
                    />
                </Rule>
                <Rule
                    title="Max bookings per client, per month"
                    htmlFor="max_bookings_per_month"
                >
                    <NumberInput
                        id="max_bookings_per_month"
                        value={settings?.max_bookings_per_month}
                        suffix="per month"
                        onChange={(value) =>
                            onSettingsChange('max_bookings_per_month', value)
                        }
                    />
                </Rule>
            </Group>

            <Group title="Confirmation & payment">
                <Rule
                    title="Auto-confirm bookings"
                    description="New bookings are confirmed instantly. Turn off to review each one."
                >
                    <Toggle
                        checked={settings?.autoConfirm ?? false}
                        label="Auto-confirm bookings"
                        onChange={(value) =>
                            onSettingsChange('autoConfirm', value)
                        }
                    />
                </Rule>
                <Rule
                    title="Accept online payment"
                    description="Clients pay when booking. Money is held until the service is done."
                >
                    <Toggle
                        checked={settings?.accept_online_payment ?? true}
                        label="Accept online payment"
                        onChange={(value) =>
                            onSettingsChange('accept_online_payment', value)
                        }
                    />
                </Rule>
                <Rule
                    title="Allow pay on site"
                    description="Clients can book now and pay you in person."
                >
                    <Toggle
                        checked={settings?.accept_offline_booking ?? false}
                        label="Allow pay on site"
                        onChange={(value) =>
                            onSettingsChange('accept_offline_booking', value)
                        }
                    />
                </Rule>
                <Rule
                    title="How Proxideck charges you"
                    description="Pay 10% per booking, or a flat subscription from the Billing page."
                >
                    <div
                        role="radiogroup"
                        aria-label="Billing model"
                        className="flex gap-1 rounded-xl bg-muted p-1"
                    >
                        {[
                            { value: 'commission', label: '10% per booking' },
                            { value: 'subscription', label: 'Subscription' },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={billingModel === option.value}
                                onClick={() =>
                                    onSettingsChange(
                                        'billing_model',
                                        option.value,
                                    )
                                }
                                className={cn(
                                    'h-[38px] rounded-[9px] px-3 text-[13px] font-bold',
                                    billingModel === option.value
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </Rule>
            </Group>

            <Group title="Where you work">
                <div
                    role="radiogroup"
                    aria-label="Where clients receive the service"
                    className="grid grid-cols-1 gap-2.5 p-[22px] sm:grid-cols-3"
                >
                    {deliveryOptions.map((option) => {
                        const isSelected = deliveryMode === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => {
                                    onSettingsChange(
                                        'service_delivery_mode',
                                        option.value,
                                    );
                                    onSettingsChange(
                                        'offers_home_service',
                                        option.value ===
                                            'provider_visits_client' ||
                                            option.value === 'both',
                                    );
                                }}
                                className={cn(
                                    'flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-colors',
                                    isSelected
                                        ? 'border-2 border-[#0E3B2E] bg-[#E6F4EC] dark:border-[#C8F169] dark:bg-[#0E3B2E]'
                                        : 'border-[#0E3B2E]/12 hover:bg-muted dark:border-white/15',
                                )}
                            >
                                <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                                    <KeenIcon
                                        name={
                                            isSelected
                                                ? 'check-circle'
                                                : 'geolocation'
                                        }
                                        className={cn(
                                            'text-base',
                                            isSelected &&
                                                'text-[#0E3B2E] dark:text-[#C8F169]',
                                        )}
                                    />
                                    {option.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {option.description}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {deliveryMode !== 'client_visits_provider' && (
                    <Rule
                        title="Home service fee"
                        description="Added to the total when a client asks you to come to them. Leave empty to charge nothing extra."
                        htmlFor="home_service_fee"
                    >
                        <NumberInput
                            id="home_service_fee"
                            value={settings?.home_service_fee}
                            suffix="₦"
                            placeholder="No fee"
                            onChange={(value) =>
                                onSettingsChange(
                                    'home_service_fee',
                                    value === '' ? null : value,
                                )
                            }
                        />
                    </Rule>
                )}
            </Group>
        </div>
    );
};

export default AdvancedSettings;
