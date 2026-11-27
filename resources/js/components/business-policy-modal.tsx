import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Car,
    Check,
    CircleHelp,
    Repeat,
    Store,
    type LucideIcon,
} from 'lucide-react';
import React, { type ReactNode } from 'react';

type DeliveryMode =
    | 'client_visits_provider'
    | 'provider_visits_client'
    | 'both';
type BillingModel = 'commission' | 'subscription';
type ToggleField =
    | 'accept_online_payment'
    | 'accept_offline_booking'
    | 'allowSameDay'
    | 'autoConfirm'
    | 'allowOffHoursRequests';

const defaultBusinessSettings = {
    bufferTime: '15',
    advanceBooking: '30',
    minNotice: '4',
    maxDaily: '8',
    allowSameDay: false,
    autoConfirm: false,
    allowOffHoursRequests: false,
    accept_online_payment: true,
    accept_offline_booking: false,
    offers_home_service: false,
    service_delivery_mode: 'client_visits_provider' as DeliveryMode,
    billing_model: 'commission' as BillingModel,
};

type SegmentOption<T extends string> = {
    value: T;
    segmentLabel: string;
    title: string;
    description: string;
    perks: string[];
    icon?: LucideIcon;
};

const billingOptions: SegmentOption<BillingModel>[] = [
    {
        value: 'commission',
        segmentLabel: '10% per booking',
        title: 'Pay as you earn',
        description:
            'Proxideck takes a cut only when money lands in your wallet — nothing on empty slots.',
        perks: [
            'No monthly fee',
            'Charged on completed payouts only',
            'Switch to subscription later',
        ],
    },
    {
        value: 'subscription',
        segmentLabel: 'Subscription',
        title: 'Keep every payout',
        description:
            'One monthly plan from Billing; completed bookings pay out to you in full.',
        perks: [
            '100% of booking revenue',
            'Predictable monthly cost',
            'Built for busy calendars',
        ],
    },
];

const deliveryOptions: SegmentOption<DeliveryMode>[] = [
    {
        value: 'client_visits_provider',
        segmentLabel: 'At my place',
        title: 'Clients come to me',
        description: 'Salon, barbershop or studio — clients travel to you.',
        perks: [
            'Show your studio address on your profile',
            'No travel or mileage to manage',
            'Ideal for fixed-location businesses',
        ],
        icon: Store,
    },
    {
        value: 'provider_visits_client',
        segmentLabel: 'Home visits',
        title: 'I go to them',
        description: 'Clients add their address when they book.',
        perks: [
            'Home service at the address they provide',
            'Set a travel or call-out fee in services',
            'You control how far you travel',
        ],
        icon: Car,
    },
    {
        value: 'both',
        segmentLabel: 'Both',
        title: 'Studio or home',
        description: 'Clients pick at the salon or at their address.',
        perks: [
            'Offer in-studio and home service',
            'Clients choose on each booking',
            'Widest reach in search',
        ],
        icon: Repeat,
    },
];

export default function BusinessPolicyModal() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const show = user?.has_provider_setup && !user?.has_setup_business_policy;

    const form = useForm({
        settings: {
            ...defaultBusinessSettings,
            ...(user?.business_profile?.settings ?? {}),
        } as typeof defaultBusinessSettings,
    });

    if (!show) {
        return null;
    }

    const settings = form.data.settings;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/business/settings/advanced', { preserveScroll: true });
    };

    const toggleSetting = (field: ToggleField) => {
        form.setData('settings', { ...settings, [field]: !settings[field] });
    };

    const setBillingModel = (value: BillingModel) => {
        form.setData('settings', { ...settings, billing_model: value });
    };

    const setDeliveryMode = (value: DeliveryMode) => {
        form.setData('settings', {
            ...settings,
            service_delivery_mode: value,
            offers_home_service:
                value === 'provider_visits_client' || value === 'both',
        });
    };

    const deliveryMode: DeliveryMode =
        settings.service_delivery_mode ??
        (settings.offers_home_service
            ? 'provider_visits_client'
            : 'client_visits_provider');

    // The server needs at least one way for clients to book, so the last
    // payment option that is on cannot be switched off.
    const isOnlyPaymentOption = (field: ToggleField) =>
        settings[field] &&
        !(field === 'accept_online_payment'
            ? settings.accept_offline_booking
            : settings.accept_online_payment);

    return (
        <Dialog open={true}>
            <DialogContent
                className="w-[calc(100%-1.5rem)] max-w-2xl border-none bg-transparent p-0 font-heading shadow-none sm:max-h-[90vh] [&>button]:hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-[28px] bg-background">
                    {/* Header */}
                    <div className="relative shrink-0 overflow-hidden bg-forest px-6 pt-7 pb-6 text-white sm:px-8">
                        <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold text-forest">
                            Almost there
                        </span>
                        <DialogTitle className="mt-4 font-['Sora'] text-2xl leading-tight font-bold tracking-tight sm:text-[28px]">
                            How do you take bookings?
                        </DialogTitle>
                        <DialogDescription className="mt-2 max-w-md text-[15px] leading-relaxed text-[#C9E2D3]">
                            Set your booking and payment rules. You can change
                            any of these later in your settings.
                        </DialogDescription>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="min-h-0 flex-1 divide-y divide-line overflow-y-auto dark:divide-white/10">
                            <PolicySection title="How you pay Proxideck">
                                <SegmentDetailPicker
                                    ariaLabel="How you pay Proxideck"
                                    options={billingOptions}
                                    value={settings.billing_model}
                                    onChange={setBillingModel}
                                    columns={2}
                                />
                            </PolicySection>

                            <PolicySection
                                title="Payment"
                                hint="Keep at least one of these on so clients can book you."
                            >
                                <ToggleRow
                                    label="Accept online payments"
                                    description="Clients pay through Proxideck when they book"
                                    tooltip="Clients complete payment during checkout before the booking is sent, so confirmed appointments always come with payment attached."
                                    enabled={settings.accept_online_payment}
                                    locked={isOnlyPaymentOption(
                                        'accept_online_payment',
                                    )}
                                    onChange={() =>
                                        toggleSetting('accept_online_payment')
                                    }
                                />
                                <ToggleRow
                                    label="Allow unpaid requests"
                                    description="Clients can book without paying upfront"
                                    tooltip="Clients can send a booking request without paying first. These usually need your review, and you collect payment your own way."
                                    enabled={settings.accept_offline_booking}
                                    locked={isOnlyPaymentOption(
                                        'accept_offline_booking',
                                    )}
                                    onChange={() =>
                                        toggleSetting('accept_offline_booking')
                                    }
                                />
                            </PolicySection>

                            <PolicySection title="Bookings">
                                <ToggleRow
                                    label="Allow same-day bookings"
                                    description="Clients can book for today"
                                    tooltip="Clients can pick slots on the current day, as long as they fit your minimum notice and working hours."
                                    enabled={settings.allowSameDay}
                                    onChange={() =>
                                        toggleSetting('allowSameDay')
                                    }
                                />
                                <ToggleRow
                                    label="Auto-confirm bookings"
                                    description="Approve bookings without reviewing each one"
                                    tooltip="Eligible bookings go ahead without waiting for you. Works best once your hours, prices and services are set up carefully."
                                    enabled={settings.autoConfirm}
                                    onChange={() =>
                                        toggleSetting('autoConfirm')
                                    }
                                />
                                <ToggleRow
                                    label="Allow off-hours requests"
                                    description="Clients can ask for times outside your hours"
                                    tooltip="Clients can request times outside your schedule. You still decide whether to accept them."
                                    enabled={settings.allowOffHoursRequests}
                                    onChange={() =>
                                        toggleSetting('allowOffHoursRequests')
                                    }
                                />
                            </PolicySection>

                            <PolicySection title="Where you work">
                                <SegmentDetailPicker
                                    ariaLabel="Where you work"
                                    options={deliveryOptions}
                                    value={deliveryMode}
                                    onChange={setDeliveryMode}
                                    columns={3}
                                />
                            </PolicySection>
                        </div>

                        {/* Footer */}
                        <div className="flex shrink-0 flex-col-reverse items-stretch gap-3 border-t border-line px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-white/10">
                            <p className="text-center text-[13px] text-muted-foreground sm:text-left">
                                You can change these any time in Settings.
                            </p>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="flex h-12 items-center justify-center gap-2 rounded-full bg-forest px-6 font-bold text-white transition hover:bg-forest-deep disabled:opacity-60 dark:bg-lime dark:text-forest dark:hover:brightness-95"
                            >
                                {form.processing
                                    ? 'Saving…'
                                    : 'Save and continue'}
                                {!form.processing && (
                                    <ArrowRight className="size-4" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SegmentDetailPicker<T extends string>({
    ariaLabel,
    options,
    value,
    onChange,
    columns,
}: {
    ariaLabel: string;
    options: SegmentOption<T>[];
    value: T;
    onChange: (value: T) => void;
    columns: 2 | 3;
}) {
    const active =
        options.find((option) => option.value === value) ?? options[0];
    const Icon = active.icon;

    return (
        <div className="flex flex-col gap-3.5">
            <div
                role="radiogroup"
                aria-label={ariaLabel}
                className={cn(
                    'grid gap-1 rounded-full bg-paper p-1',
                    columns === 2 ? 'grid-cols-2' : 'grid-cols-3',
                )}
            >
                {options.map((option) => {
                    const selected = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                'h-11 rounded-full px-1.5 text-[11px] font-bold transition sm:px-2 sm:text-sm',
                                columns === 3 && 'text-[12px]',
                                selected
                                    ? 'bg-forest text-lime shadow-[0_2px_8px_rgba(14,59,46,0.25)]'
                                    : 'text-moss hover:text-ink',
                            )}
                        >
                            {option.segmentLabel}
                        </button>
                    );
                })}
            </div>

            <div
                key={String(active.value)}
                className="flex flex-col gap-3 rounded-[20px] bg-[#F7FAF7] px-4 py-4 sm:px-5"
            >
                <div className="flex items-start gap-3">
                    {Icon && (
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime text-forest">
                            <Icon className="size-5" aria-hidden />
                        </span>
                    )}
                    <div className="min-w-0">
                        <p className="font-[Sora] text-lg font-bold text-forest">
                            {active.title}
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-moss sm:text-sm">
                            {active.description}
                        </p>
                    </div>
                </div>
                <ul className="flex flex-col gap-2">
                    {active.perks.map((perk) => (
                        <li
                            key={perk}
                            className="flex items-center gap-2.5 text-[13px] font-semibold text-ink sm:text-sm"
                        >
                            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-lime text-forest">
                                <Check className="size-3" strokeWidth={3} />
                            </span>
                            {perk}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function PolicySection({
    title,
    hint,
    children,
}: {
    title: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <section className="px-6 py-6 sm:px-8">
            <h3 className="font-['Sora'] text-base font-bold">{title}</h3>
            {hint && (
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                    {hint}
                </p>
            )}
            <div className="mt-4">{children}</div>
        </section>
    );
}

function ToggleRow({
    label,
    description,
    tooltip,
    enabled,
    locked = false,
    onChange,
}: {
    label: string;
    description: string;
    tooltip: string;
    enabled: boolean;
    locked?: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-6 py-3">
            <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-[15px] font-semibold">{label}</p>
                    <HelpTooltip content={tooltip} />
                </div>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                    {description}
                </p>
            </div>
            <ProxideckSwitch
                checked={enabled}
                disabled={locked}
                label={label}
                onChange={onChange}
            />
        </div>
    );
}

/** Brand switch: forest track with a lime knob when on, a quiet grey track when off. */
function ProxideckSwitch({
    checked,
    disabled,
    label,
    onChange,
}: {
    checked: boolean;
    disabled?: boolean;
    label: string;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            title={disabled ? 'Keep at least one payment option on' : undefined}
            onClick={onChange}
            className={cn(
                'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
                'focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-lime dark:focus-visible:ring-offset-background',
                'disabled:cursor-not-allowed disabled:opacity-60',
                checked
                    ? 'bg-forest dark:bg-lime'
                    : 'bg-[#DDE3DE] dark:bg-white/15',
            )}
        >
            <span
                className={cn(
                    'grid size-5.5 place-items-center rounded-full shadow-sm transition-transform duration-200',
                    checked
                        ? 'translate-x-[23px] bg-lime text-forest dark:bg-forest dark:text-lime'
                        : 'translate-x-[3px] bg-white',
                )}
            >
                {checked && <Check className="size-3" strokeWidth={3.5} />}
            </span>
        </button>
    );
}

function HelpTooltip({ content }: { content: string }) {
    return (
        <TooltipProvider delayDuration={150}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        aria-label="More information"
                        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                        <CircleHelp className="size-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    align="start"
                    className="max-w-xs text-xs leading-5"
                >
                    {content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
