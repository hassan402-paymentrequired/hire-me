import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Plan = {
    id: string;
    name: string;
    slug: string;
    price: number;
    duration_days: number;
    description?: string | null;
    features?: string[];
    is_active: boolean;
    sort_order: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Subscription Plans', href: '/admin/subscriptions' },
];

function serializeFeatures(value: string) {
    return value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
}

export default function AdminSubscriptionPlansPage({ plans }: { plans: Plan[] }) {
    const createForm = useForm({
        name: '',
        slug: '',
        price: '',
        duration_days: '30',
        description: '',
        features_text: '',
        is_active: true,
        sort_order: '0',
    });

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Subscription Plans" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create subscription plan</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={createForm.data.name} onChange={(e) => createForm.setData('name', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input value={createForm.data.slug} onChange={(e) => createForm.setData('slug', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Price</Label>
                            <Input type="number" value={createForm.data.price} onChange={(e) => createForm.setData('price', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Duration days</Label>
                            <Input type="number" value={createForm.data.duration_days} onChange={(e) => createForm.setData('duration_days', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Sort order</Label>
                            <Input type="number" value={createForm.data.sort_order} onChange={(e) => createForm.setData('sort_order', e.target.value)} />
                        </div>
                        <div className="flex items-end gap-3">
                            <Checkbox checked={createForm.data.is_active} onCheckedChange={(checked) => createForm.setData('is_active', checked === true)} />
                            <Label>Active plan</Label>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Textarea value={createForm.data.description} onChange={(e) => createForm.setData('description', e.target.value)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Features, one per line</Label>
                            <Textarea value={createForm.data.features_text} onChange={(e) => createForm.setData('features_text', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <Button
                                type="button"
                                onClick={() =>
                                    createForm.transform((data) => ({
                                        ...data,
                                        price: Number(data.price || 0),
                                        duration_days: Number(data.duration_days || 30),
                                        sort_order: Number(data.sort_order || 0),
                                        features: serializeFeatures(data.features_text),
                                    })).post('/admin/subscriptions')
                                }
                                disabled={createForm.processing}
                            >
                                Create plan
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    {plans.map((plan) => (
                        <EditablePlanCard key={plan.id} plan={plan} />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}

function EditablePlanCard({ plan }: { plan: Plan }) {
    const form = useForm({
        name: plan.name,
        slug: plan.slug,
        price: String(plan.price),
        duration_days: String(plan.duration_days),
        description: plan.description || '',
        features_text: (plan.features || []).join('\n'),
        is_active: plan.is_active,
        sort_order: String(plan.sort_order ?? 0),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Price</Label>
                    <Input type="number" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Duration days</Label>
                    <Input type="number" value={form.data.duration_days} onChange={(e) => form.setData('duration_days', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Sort order</Label>
                    <Input type="number" value={form.data.sort_order} onChange={(e) => form.setData('sort_order', e.target.value)} />
                </div>
                <div className="flex items-end gap-3">
                    <Checkbox checked={form.data.is_active} onCheckedChange={(checked) => form.setData('is_active', checked === true)} />
                    <Label>Active plan</Label>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label>Features, one per line</Label>
                    <Textarea value={form.data.features_text} onChange={(e) => form.setData('features_text', e.target.value)} />
                </div>
                <div className="flex gap-3 md:col-span-2">
                    <Button
                        type="button"
                        onClick={() =>
                            form.transform((data) => ({
                                ...data,
                                price: Number(data.price || 0),
                                duration_days: Number(data.duration_days || 30),
                                sort_order: Number(data.sort_order || 0),
                                features: serializeFeatures(data.features_text),
                            })).put(`/admin/subscriptions/${plan.id}`)
                        }
                        disabled={form.processing}
                    >
                        Save changes
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => form.delete(`/admin/subscriptions/${plan.id}`)}
                        disabled={form.processing}
                    >
                        Delete
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
