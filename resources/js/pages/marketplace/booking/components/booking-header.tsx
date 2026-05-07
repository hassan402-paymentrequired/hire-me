import KeenIcon from '@/components/keen-icon';
import VerifiedProviderBadge from '@/components/verified-provider-badge';

import type { PaymentOption, Provider } from '../types';

interface BookingHeaderProps {
    provider: Provider;
    selectedServiceCount: number;
    paymentOption: PaymentOption;
}

export function BookingHeader({
    provider,
    selectedServiceCount,
    paymentOption,
}: BookingHeaderProps) {
    return (
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-border/70 bg-background px-5 py-5 sm:px-7 sm:py-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%)]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        <KeenIcon name="book-square" className="text-sm" />
                        Booking flow
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="space-y-1.5">
                            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Confirm your appointment
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    {provider.businessName}
                                </span>
                                {provider.isVerified && <VerifiedProviderBadge />}
                                <span className="hidden sm:inline">•</span>
                                <span>{provider.address}</span>
                            </div>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                Choose the service, team member, and time that fits
                                best. We’ll keep the next steps clear as you go.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4 backdrop-blur-sm">
                        <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                            Services
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-foreground">
                            {selectedServiceCount}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {selectedServiceCount > 0
                                ? 'Selected for this booking'
                                : 'Choose at least one service'}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4 backdrop-blur-sm">
                        <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                            Payment
                        </div>
                        <div className="mt-2 text-lg font-semibold text-foreground">
                            {paymentOption === 'online' ? 'Online now' : 'Pay later'}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {paymentOption === 'online'
                                ? 'Held securely until completion'
                                : 'Sent as a pending request'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
