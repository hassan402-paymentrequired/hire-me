import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { PageProps } from '@/types';
import { CircleHelp } from 'lucide-react';

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
    service_delivery_mode: 'client_visits_provider' as
        | 'client_visits_provider'
        | 'provider_visits_client'
        | 'both',
    billing_model: 'commission',
};

export default function BusinessPolicyModal() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const show = user?.has_provider_setup && !user?.has_setup_business_policy;

    const form = useForm({
        settings: {
            ...defaultBusinessSettings,
            ...(user?.business_profile?.settings || {}),
        },
    });

    if (!show) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/business/settings/advanced', { preserveScroll: true });
    };

    const toggleSetting = (field: string) => {
        form.setData('settings', {
            ...form.data.settings,
            [field]: !form.data.settings[field],
        });
    };

    const setBillingModel = (value: 'commission' | 'subscription') => {
        form.setData('settings', {
            ...form.data.settings,
            billing_model: value,
        });
    };

    const setDeliveryMode = (
        value: 'client_visits_provider' | 'provider_visits_client' | 'both',
    ) => {
        form.setData('settings', {
            ...form.data.settings,
            service_delivery_mode: value,
            offers_home_service:
                value === 'provider_visits_client' || value === 'both',
        });
    };

    const deliveryMode =
        form.data.settings.service_delivery_mode ??
        (form.data.settings.offers_home_service
            ? 'provider_visits_client'
            : 'client_visits_provider');

    return (
        <Dialog open={true} >
            <DialogContent
                className="w-2xl border-none bg-transparent p-0 shadow-none sm:max-h-[90vh] [&>button]:hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="bg-background flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-border/40">

                    {/* Header */}
                    <div className="shrink-0 px-8 pt-7 pb-6">
                        <h2 className="text-xl font-medium text-foreground mb-1">
                            Business policy
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Configure your booking and payment rules. You can change these anytime.
                        </p>
                    </div>

                    <div className="border-t border-border/40" />

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <div className="px-8 py-6">
                                <p className="mb-4 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                                    Billing
                                </p>
                                <div className="grid gap-3">
                                    <BillingOptionCard
                                        title="Pay 10% per booking"
                                        description="Use the default pay-as-you-book model"
                                        detail="The system deducts a 10% platform fee only when a completed appointment is released to your wallet."
                                        selected={form.data.settings.billing_model === 'commission'}
                                        onSelect={() => setBillingModel('commission')}
                                    />
                                    <BillingOptionCard
                                        title="Use subscription"
                                        description="Keep the full payout from completed bookings"
                                        detail="Choose this if you prefer to operate on a subscription plan."
                                        selected={form.data.settings.billing_model === 'subscription'}
                                        onSelect={() => setBillingModel('subscription')}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-border/40" />

                            {/* Payment section */}
                            <div className="px-8 py-6">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-4">
                                    Payment
                                </p>
                                <div className="space-y-0 divide-y divide-border/40">
                                    <ToggleRow
                                        label="Accept online payments"
                                        description="Clients pay through Proxideck at booking"
                                        tooltip="When this is enabled, clients must complete payment online during checkout before the booking is submitted. This is useful if you want confirmed appointments to always come in with payment attached."
                                        enabled={form.data.settings.accept_online_payment}
                                        onChange={() => toggleSetting('accept_online_payment')}
                                    />
                                    <ToggleRow
                                        label="Allow unpaid requests"
                                        description="Clients can book without paying upfront"
                                        tooltip="When this is enabled, clients can submit a booking request without paying first. These bookings usually need your review, and payment can be collected later based on how you run your business."
                                        enabled={form.data.settings.accept_offline_booking}
                                        onChange={() => toggleSetting('accept_offline_booking')}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-border/40" />

                            {/* Bookings section */}
                            <div className="px-8 py-6">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-4">
                                    Bookings
                                </p>
                                <div className="space-y-0 divide-y divide-border/40">
                                    <ToggleRow
                                        label="Allow same-day bookings"
                                        description="Clients can book for today"
                                        tooltip="This allows customers to choose timeslots on the current day, as long as they still fit within your minimum notice period and available working hours."
                                        enabled={form.data.settings.allowSameDay}
                                        onChange={() => toggleSetting('allowSameDay')}
                                    />
                                    <ToggleRow
                                        label="Auto-confirm bookings"
                                        description="Skip manual review and approve automatically"
                                        tooltip="Turn this on if you want eligible bookings to move forward without waiting for manual approval. This works best when your availability, pricing, and service rules are already set up carefully."
                                        enabled={form.data.settings.autoConfirm}
                                        onChange={() => toggleSetting('autoConfirm')}
                                    />
                                    <ToggleRow
                                        label="Allow off-hours requests"
                                        description="Accept bookings outside working hours"
                                        tooltip="This lets clients request appointments outside the working schedule you configured. It does not mean those bookings should be auto-approved by default, but it gives clients a way to ask for exceptions."
                                        enabled={form.data.settings.allowOffHoursRequests}
                                        onChange={() => toggleSetting('allowOffHoursRequests')}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-border/40" />

                            <div className="px-8 py-6">
                                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest mb-4">
                                    Service delivery
                                </p>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Tell clients whether they visit you, you go
                                    to them, or both. This controls booking
                                    address requirements.
                                </p>
                                <RadioGroup
                                    value={deliveryMode}
                                    onValueChange={(value) =>
                                        setDeliveryMode(
                                            value as
                                                | 'client_visits_provider'
                                                | 'provider_visits_client'
                                                | 'both',
                                        )
                                    }
                                    className="space-y-3"
                                >
                                    {[
                                        {
                                            value: 'client_visits_provider',
                                            title: 'Clients visit my location',
                                            description:
                                                'Salon, barbershop, or studio — clients come to your address.',
                                        },
                                        {
                                            value: 'provider_visits_client',
                                            title: 'I go to the client',
                                            description:
                                                'Mobile stylists, handymen, cleaners — clients must add their service address.',
                                        },
                                        {
                                            value: 'both',
                                            title: 'Both options',
                                            description:
                                                'Clients choose to visit you or receive service at their address.',
                                        },
                                    ].map((option) => (
                                        <label
                                            key={option.value}
                                            htmlFor={`policy-delivery-${option.value}`}
                                            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/20"
                                        >
                                            <RadioGroupItem
                                                value={option.value}
                                                id={`policy-delivery-${option.value}`}
                                                className="mt-0.5"
                                            />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-foreground">
                                                    {option.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>

                        <div className="shrink-0 border-t border-border/40" />

                        {/* Footer */}
                        <div className="flex shrink-0 justify-end px-8 py-5">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="h-9 px-5 rounded-md bg-foreground text-background text-sm font-medium disabled:opacity-50 transition-opacity"
                            >
                                {form.processing ? 'Saving…' : 'Get started'}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function BillingOptionCard({
    title,
    description,
    detail,
    selected,
    onSelect,
}: {
    title: string;
    description: string;
    detail: string;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                selected
                    ? 'border-foreground bg-foreground/5 ring-2 ring-foreground/10'
                    : 'border-border/60 hover:border-foreground/30 hover:bg-muted/20'
            }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
                <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 rounded-full border ${
                        selected ? 'border-foreground bg-foreground' : 'border-border'
                    }`}
                >
                    {selected ? <span className="m-auto h-2 w-2 rounded-full bg-background" /> : null}
                </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{detail}</p>
        </button>
    );
}

function ToggleRow({
    label,
    description,
    tooltip,
    enabled,
    onChange,
}: {
    label: string;
    description: string;
    tooltip: string;
    enabled: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="pr-6">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <HelpTooltip content={tooltip} />
                </div>
                <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={onChange}
                className={`
                    relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer rounded-full
                    transition-colors duration-150 focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    ${enabled ? 'bg-foreground' : 'bg-border'}
                `}
            >
                <span
                    className={`
                        pointer-events-none inline-block h-[16px] w-[16px] rounded-full bg-background
                        shadow-sm transition-transform duration-150 mt-[3px]
                        ${enabled ? 'translate-x-[21px]' : 'translate-x-[3px]'}
                    `}
                />
            </button>
        </div>
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
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <CircleHelp className="h-4 w-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="max-w-xs text-xs leading-5">
                    {content}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
