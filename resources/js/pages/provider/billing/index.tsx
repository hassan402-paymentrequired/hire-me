import KeenIcon from '@/components/keen-icon';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import business from '@/routes/business';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';

interface Plan {
    id: string;
    name: string;
    slug: string;
    price: number;
    duration_days: number;
    description?: string | null;
    features?: string[];
}

interface SubscriptionSummary {
    id: string;
    status: string;
    starts_at: string;
    ends_at: string;
    plan?: {
        id?: string;
        name?: string;
        price?: number;
        duration_days?: number;
    } | null;
}

const defaultPlanFeatures = [
    'Unlimited bookings',
    'Booking widget for your website',
    'Team members',
    'Analytics',
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Billing', href: '/business/billing' },
];

export default function ProviderBillingPage({
    billingModel,
    plans,
    currentSubscription,
    history,
}: {
    billingModel: 'commission' | 'subscription';
    plans: Plan[];
    currentSubscription: SubscriptionSummary | null;
    history: Array<{
        id: string;
        status: string;
        starts_at: string;
        ends_at: string;
        plan_name?: string | null;
        price?: number;
    }>;
}) {
    const form = useForm({ plan_id: '' });

    const subscribe = (planId: string) => {
        form.setData('plan_id', planId);
        form.transform(() => ({ plan_id: planId }));
        form.post('/business/billing/subscribe', { preserveScroll: true });
    };

    const cancelSubscription = () => {
        if (
            confirm(
                'Cancel your subscription? It stays active until the end of the current period.',
            )
        ) {
            router.post(
                '/business/billing/cancel',
                {},
                { preserveScroll: true },
            );
        }
    };

    const isSubscription = billingModel === 'subscription';
    const daysLeft = currentSubscription
        ? Math.max(
              differenceInCalendarDays(
                  parseISO(currentSubscription.ends_at),
                  new Date(),
              ),
              0,
          )
        : 0;
    const card =
        'rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10';
    const cheapestPerDay = plans.length
        ? Math.min(
              ...plans.map(
                  (plan) => plan.price / Math.max(plan.duration_days, 1),
              ),
          )
        : 0;
    const formatDate = (value: string) => format(parseISO(value), 'd MMM yyyy');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing" />

            <div className="flex flex-col gap-[22px] p-4 md:p-6">
                <header className="flex flex-col gap-1">
                    <span className="text-[13px] text-muted-foreground">
                        Account
                    </span>
                    <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                        Billing
                    </h1>
                    <span className="text-sm text-muted-foreground">
                        Your plan and how Proxideck charges you.
                    </span>
                </header>

                {/* Billing model */}
                <section
                    className={cn(
                        card,
                        'flex flex-wrap items-center gap-4 px-5 py-[18px]',
                    )}
                >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                        <KeenIcon
                            name="receipt-square"
                            className="text-[22px]"
                        />
                    </div>
                    <div className="flex flex-[1_1_300px] flex-col gap-0.5">
                        <span className="text-[15px] font-bold text-foreground">
                            {isSubscription
                                ? 'You’re on a subscription'
                                : 'You pay a 10% commission per booking'}
                        </span>
                        <span className="text-[13px] text-muted-foreground">
                            {isSubscription
                                ? currentSubscription
                                    ? `No commission on bookings. Renews on ${formatDate(currentSubscription.ends_at)}.`
                                    : 'No commission on bookings once you activate a plan below.'
                                : 'Switch to a subscription in Booking rules to pay a flat fee instead.'}
                        </span>
                    </div>
                    {isSubscription && currentSubscription ? (
                        <span className="rounded-full bg-[#E6F4EC] px-2.5 py-1 text-xs font-bold text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                            Renews in {daysLeft} day{daysLeft === 1 ? '' : 's'}
                        </span>
                    ) : !isSubscription ? (
                        <Link
                            href={business.settings.advanced()}
                            className="flex h-10 items-center rounded-xl border border-[#0E3B2E]/15 px-3.5 text-sm font-bold text-foreground hover:bg-muted dark:border-white/15"
                            prefetch
                        >
                            Change billing model
                        </Link>
                    ) : null}
                </section>

                {/* Plans */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {plans.map((plan) => {
                        const isCurrent =
                            currentSubscription?.plan?.id === plan.id;
                        const isBestValue =
                            plans.length > 1 &&
                            plan.price / Math.max(plan.duration_days, 1) ===
                                cheapestPerDay &&
                            !isCurrent;

                        return (
                            <article
                                key={plan.id}
                                className={cn(
                                    'flex flex-col gap-4 rounded-[22px] p-[22px]',
                                    isCurrent
                                        ? 'bg-[#0E3B2E] text-white'
                                        : card,
                                )}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span
                                        className={cn(
                                            'font-[Sora] text-[17px] font-semibold',
                                            !isCurrent && 'text-foreground',
                                        )}
                                    >
                                        {plan.name}
                                    </span>
                                    {(isCurrent || isBestValue) && (
                                        <span
                                            className={cn(
                                                'rounded-full px-2.5 py-1 text-xs font-bold',
                                                isCurrent
                                                    ? 'bg-[#C8F169] text-[#0E3B2E]'
                                                    : 'bg-[#E6F4EC] text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]',
                                            )}
                                        >
                                            {isCurrent
                                                ? 'Current plan'
                                                : 'Best value'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span
                                        className={cn(
                                            'font-[Sora] text-[32px] font-bold',
                                            isCurrent
                                                ? 'text-[#C8F169]'
                                                : 'text-[#0E3B2E] dark:text-[#C8F169]',
                                        )}
                                    >
                                        ₦{plan.price.toLocaleString()}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-[13px]',
                                            isCurrent
                                                ? 'text-white/70'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        / {plan.duration_days} days
                                    </span>
                                </div>
                                <ul className="flex flex-1 flex-col gap-2.5">
                                    {(plan.features?.length
                                        ? plan.features
                                        : defaultPlanFeatures
                                    ).map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-2.5 text-[13px] leading-snug"
                                        >
                                            <KeenIcon
                                                name="check"
                                                className={cn(
                                                    'mt-0.5 text-sm',
                                                    isCurrent
                                                        ? 'text-[#C8F169]'
                                                        : 'text-[#1F6B43] dark:text-[#C8F169]',
                                                )}
                                            />
                                            <span
                                                className={
                                                    isCurrent
                                                        ? 'text-white'
                                                        : 'text-foreground'
                                                }
                                            >
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                {isCurrent ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="h-12 rounded-xl bg-[#C8F169] text-sm font-bold text-[#0E3B2E] hover:bg-[#C8F169]/90"
                                            >
                                                Manage plan
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="center"
                                            className="w-[var(--radix-dropdown-menu-trigger-width)]"
                                        >
                                            <DropdownMenuItem
                                                onClick={cancelSubscription}
                                                className="text-destructive"
                                            >
                                                <KeenIcon
                                                    name="cross-circle"
                                                    className="mr-2 text-sm"
                                                />
                                                Cancel subscription
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={
                                            !isSubscription || form.processing
                                        }
                                        onClick={() => subscribe(plan.id)}
                                        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#0E3B2E]/15 text-sm font-bold text-foreground hover:bg-muted disabled:opacity-60 dark:border-white/15"
                                    >
                                        {form.processing &&
                                            form.data.plan_id === plan.id && (
                                                <Spinner />
                                            )}
                                        {!isSubscription
                                            ? 'Switch billing model first'
                                            : currentSubscription
                                              ? `Switch to ${plan.name}`
                                              : 'Activate plan'}
                                    </button>
                                )}
                            </article>
                        );
                    })}
                    {plans.length === 0 && (
                        <div
                            className={cn(
                                card,
                                'col-span-full py-12 text-center text-sm text-muted-foreground',
                            )}
                        >
                            No subscription plans are available yet.
                        </div>
                    )}
                </div>

                {/* History */}
                <section className={cn(card, 'overflow-hidden')}>
                    <div className="px-[22px] py-[18px]">
                        <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                            Billing history
                        </h2>
                    </div>
                    {history.length === 0 ? (
                        <div className="border-t border-[#0E3B2E]/[0.07] py-10 text-center text-sm text-muted-foreground dark:border-white/10">
                            No subscription activity yet.
                        </div>
                    ) : (
                        <ul>
                            {history.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex flex-wrap items-center gap-x-6 gap-y-1.5 border-t border-[#0E3B2E]/[0.07] px-[22px] py-4 dark:border-white/10"
                                >
                                    <span className="flex-[1_1_200px] text-sm font-bold text-foreground">
                                        {item.plan_name || 'Plan'}
                                    </span>
                                    <span className="text-[13px] whitespace-nowrap text-muted-foreground md:w-[200px]">
                                        {formatDate(item.starts_at)} –{' '}
                                        {formatDate(item.ends_at)}
                                    </span>
                                    <span className="font-[Sora] font-bold text-foreground md:w-[110px]">
                                        ₦
                                        {Number(
                                            item.price || 0,
                                        ).toLocaleString()}
                                    </span>
                                    <span
                                        className={cn(
                                            'ml-auto rounded-full px-2.5 py-1 text-xs font-bold capitalize',
                                            item.status === 'active'
                                                ? 'bg-[#E6F4EC] text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]'
                                                : 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        {item.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
