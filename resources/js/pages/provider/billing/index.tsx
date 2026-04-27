import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import business from '@/routes/business';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        form.post('/business/billing/subscribe', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing" />
                <div className="space-y-6 p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing model</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Your current provider billing mode is set to{' '}
                                    <span className="font-semibold text-foreground">
                                        {billingModel === 'subscription'
                                            ? 'subscription'
                                            : '10% commission'}
                                    </span>
                                    .
                                </p>
                                {billingModel !== 'subscription' && (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Change it in Business Settings → Advanced Settings if you want to use a subscription instead.
                                    </p>
                                )}
                            </div>
                            {currentSubscription && (
                                <Badge className="border-border bg-muted text-foreground">
                                    Active until {new Date(currentSubscription.ends_at).toLocaleDateString()}
                                </Badge>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                        {plans.map((plan) => (
                            <Card key={plan.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between gap-3">
                                        <span>{plan.name}</span>
                                        <span className="text-base">₦{plan.price.toLocaleString()}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        {plan.description || 'Subscription plan'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Duration: {plan.duration_days} days
                                    </p>
                                    {plan.features?.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {plan.features.map((feature) => (
                                                <Badge key={feature} variant="secondary">
                                                    {feature}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : null}
                                    <Button
                                        type="button"
                                        className="w-full"
                                        disabled={billingModel !== 'subscription' || form.processing}
                                        onClick={() => subscribe(plan.id)}
                                    >
                                        {billingModel !== 'subscription'
                                            ? 'Switch billing model first'
                                            : 'Activate plan'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Current subscription</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {currentSubscription ? (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        {currentSubscription.plan?.name} is active from{' '}
                                        {new Date(currentSubscription.starts_at).toLocaleDateString()} to{' '}
                                        {new Date(currentSubscription.ends_at).toLocaleDateString()}.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.post('/business/billing/cancel')}
                                    >
                                        Cancel subscription
                                    </Button>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No active subscription yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Billing history</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {history.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No subscription activity yet.</p>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <p className="font-medium text-foreground">{item.plan_name || 'Plan'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(item.starts_at).toLocaleDateString()} - {new Date(item.ends_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-foreground">₦{Number(item.price || 0).toLocaleString()}</p>
                                            <p className="text-xs uppercase text-muted-foreground">{item.status}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
        </AppLayout>
    );
}
