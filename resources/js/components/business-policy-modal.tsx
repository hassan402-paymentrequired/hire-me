import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { PageProps } from '@/types';
import { CircleHelp } from 'lucide-react';

export default function BusinessPolicyModal() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const show = user?.has_provider_setup && !user?.has_setup_business_policy;

    const form = useForm({
        settings: user?.business_profile?.settings || {
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

    return (
        <Dialog open={true}>
            <DialogContent
                className="max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="bg-background rounded-2xl border border-border/40 overflow-hidden">

                    {/* Header */}
                    <div className="px-8 pt-7 pb-6">
                        <h2 className="text-xl font-medium text-foreground mb-1">
                            Business policy
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Configure your booking and payment rules. You can change these anytime.
                        </p>
                    </div>

                    <div className="border-t border-border/40" />

                    <form onSubmit={handleSubmit}>
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
                            <div className="space-y-0 divide-y divide-border/40">
                                <ToggleRow
                                    label="Offer home service"
                                    description="Clients can expect you to travel to their location for appointments"
                                    tooltip="This tells clients that your business can deliver services at their home, office, or another client-provided location instead of only at your business address."
                                    enabled={form.data.settings.offers_home_service}
                                    onChange={() => toggleSetting('offers_home_service')}
                                />
                            </div>
                        </div>

                        <div className="border-t border-border/40" />

                        {/* Footer */}
                        <div className="px-8 py-5 flex justify-end">
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
