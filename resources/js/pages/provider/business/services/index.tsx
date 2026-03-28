import KeenIcon from '@/components/keen-icon';
import { Pagination } from '@/components/pagination';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowUpRight,
    Box,
    Clock,
    Edit2,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BreadcrumbItem } from '@/types';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    category_id: string | null;
    category_name: string | null;
    status: 'active' | 'inactive';
}

interface BusinessCategory {
    id: string;
    name: string;
    slug: string;
}

interface StatsValue {
    value: number | string;
    change: string;
}

interface Props {
    services: {
        data: Service[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    businessCategory: BusinessCategory | null;
    filters: {
        search?: string;
    };
    stats: {
        totalServices: StatsValue;
        activeCategories: number;
        activeServices: number;
        inactiveServices: number;
        mostBooked: {
            name: string;
            change: string;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/business',
    },
    {
        title: 'Services',
        href: '',
    },
];

export default function ServicesIndex({ services, businessCategory, filters, stats }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        price: '',
        duration_minutes: '',
    });

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            if (searchQuery === (filters.search || '')) {
                return;
            }

            router.get(
                '/business/services',
                { search: searchQuery || undefined },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [searchQuery, filters.search]);

    const averagePrice = services.data.length
        ? Math.round(services.data.reduce((sum, service) => sum + Number(service.price || 0), 0) / services.data.length)
        : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingService) {
            put(`/business/services/${editingService.id}`, {
                onSuccess: () => {
                    setEditingService(null);
                    reset();
                },
            });
        } else {
            post('/business/services', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setData({
            name: service.name,
            description: service.description || '',
            price: service.price.toString(),
            duration_minutes: service.duration_minutes.toString(),
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            router.delete(`/business/services/${id}`);
        }
    };

    const toggleStatus = (id: string) => {
        router.post(`/business/services/${id}/toggle`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Management" />

            <div className="flex w-full flex-col gap-6 p-4">
                <section className="overflow-hidden rounded-3xl border border-border/70 bg-background">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.06),_transparent_24%),radial-gradient(circle_at_left,_rgba(16,185,129,0.06),_transparent_24%)]" />
                        <div className="relative space-y-5 px-6 py-6 lg:px-8 lg:py-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70">
                                    <KeenIcon name="menu" className="text-sm text-sky-600 dark:text-sky-300" />
                                    Service catalog
                                </span>
                                <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                                    {stats.totalServices.value} services configured
                                </span>
                            </div>

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div className="max-w-2xl space-y-2">
                                    <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                                        Services
                                    </h1>
                                    <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                                        Shape the services clients can actually book, keep pricing clear, and fine-tune what stays active on your storefront.
                                    </p>
                                </div>

                                <Dialog
                                    open={isAddModalOpen || !!editingService}
                                    onOpenChange={(open) => {
                                        if (!open) {
                                            setIsAddModalOpen(false);
                                            setEditingService(null);
                                            reset();
                                        }
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full px-5">
                                            <Plus className="size-5" />
                                            Add New Service
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-[560px]">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-semibold">
                                                {editingService ? 'Edit Service' : 'Add New Service'}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                                <p className="text-sm font-medium text-foreground">Service details</p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Add the core information clients need before they book this service.
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="name">Service Name</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="e.g. Premium House Cleaning"
                                                />
                                                {errors.name && <p className="text-xs font-bold text-destructive">{errors.name}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="price">Price (₦)</Label>
                                                    <Input
                                                        id="price"
                                                        type="number"
                                                        value={data.price}
                                                        onChange={(e) => setData('price', e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                    {errors.price && <p className="text-xs font-bold text-destructive">{errors.price}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="duration">Duration (Min)</Label>
                                                    <Input
                                                        id="duration"
                                                        type="number"
                                                        value={data.duration_minutes}
                                                        onChange={(e) => setData('duration_minutes', e.target.value)}
                                                        placeholder="60"
                                                    />
                                                    {errors.duration_minutes && (
                                                        <p className="text-xs font-bold text-destructive">{errors.duration_minutes}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="hidden space-y-2">
                                                <Label htmlFor="category">Business Category</Label>
                                                <div className="rounded-xl border bg-muted/20 px-3 py-2 text-sm font-semibold">
                                                    {businessCategory?.name ?? 'Not set'}
                                                </div>
                                                {errors.category_id && (
                                                    <p className="text-xs font-bold text-destructive">{errors.category_id}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Briefly describe the service..."
                                                    className="min-h-[120px]"
                                                />
                                                {errors.description && (
                                                    <p className="text-xs font-bold text-destructive">{errors.description}</p>
                                                )}
                                            </div>

                                            <div className="flex justify-end gap-3 pt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsAddModalOpen(false);
                                                        setEditingService(null);
                                                        reset();
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={processing}>
                                                    {processing && <Spinner />}
                                                    {editingService ? 'Update Service' : 'Create Service'}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        <KeenIcon name="verify" className="text-sm text-emerald-600 dark:text-emerald-300" />
                                        Active lineup
                                    </div>
                                    <p className="mt-3 text-3xl font-semibold text-foreground">
                                        {stats.totalServices.value}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {stats.activeServices} active, {stats.inactiveServices} inactive
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        <KeenIcon name="receipt-square" className="text-sm text-sky-600 dark:text-sky-300" />
                                        Average ticket
                                    </div>
                                    <p className="mt-3 text-3xl font-semibold text-foreground">
                                        ₦{averagePrice.toLocaleString()}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        across your current service menu
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                        <KeenIcon name="star" className="text-sm text-violet-600 dark:text-violet-300" />
                                        Top performer
                                    </div>
                                    <p className="mt-3 text-lg font-semibold text-foreground">
                                        {stats.mostBooked.name}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {stats.mostBooked.change} vs last month
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Card className="overflow-hidden rounded-3xl border border-border/70">
                    <CardHeader className="border-b border-border/60 bg-muted/20 pb-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background text-sky-600 dark:text-sky-300">
                                        <Box className="h-4 w-4" />
                                    </span>
                                    Service List
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Search your service menu, adjust what stays active, or open a service to update the details.
                                </CardDescription>
                            </div>
                            <div className="relative flex-1 xl:max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search services..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="rounded-full pl-12"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="space-y-4">
                            {services.data.length > 0 ? (
                                services.data.map((service) => (
                                    <div
                                        key={service.id}
                                        className="rounded-2xl border border-border/70 bg-gradient-to-br from-background to-muted/20 p-5 transition-colors hover:bg-muted/20"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/20 text-primary">
                                                        <KeenIcon name="menu" className="text-lg" />
                                                    </div>
                                                    <div className="min-w-0 space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="max-w-[240px] truncate text-base font-semibold capitalize sm:max-w-[360px]">
                                                                {service.name}
                                                            </h3>
                                                            <span
                                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                                                    service.status === 'active'
                                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                                                                }`}
                                                            >
                                                                {service.status}
                                                            </span>
                                                        </div>

                                                        {service.description ? (
                                                            <p className="max-w-2xl truncate text-sm text-muted-foreground">
                                                                {service.description}
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">
                                                                No description added yet.
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                                            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm font-medium text-foreground/80">
                                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                                {service.duration_minutes} mins
                                                            </span>
                                                            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm font-medium text-foreground/80">
                                                                <KeenIcon name="receipt-square" className="text-sm text-muted-foreground" />
                                                                ₦{Number(service.price).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-end gap-2 lg:ml-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleStatus(service.id)}
                                                    className="rounded-full"
                                                >
                                                    <ArrowUpRight className="mr-2 h-3.5 w-3.5" />
                                                    {service.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEdit(service)}
                                                    className="rounded-full"
                                                >
                                                    <Edit2 className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(service.id)}
                                                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-border/70 py-16 text-center">
                                    <div className="mx-auto max-w-sm space-y-3">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/20 text-muted-foreground">
                                            <KeenIcon name="menu" className="text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">No services found</p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {searchQuery
                                                    ? 'Try another keyword or clear your search.'
                                                    : 'Start by adding your first service offering.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-6">
                            <Pagination links={services.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
