import KeenIcon from '@/components/keen-icon';
import { Pagination } from '@/components/pagination';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ServiceFormPanel, {
    formatDuration,
    type ServiceFormData,
} from './components/service-form-panel';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    category_id: string | null;
    category_name: string | null;
    service_category_id: string | null;
    service_category_name: string | null;
    status: 'active' | 'inactive';
    bookings_this_month: number;
}

interface ServiceCategory {
    id: string;
    name: string;
    slug: string;
    services_count: number;
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
    serviceCategories: ServiceCategory[];
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
            bookings: number;
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

export default function ServicesIndex({
    services,
    businessCategory,
    serviceCategories,
    filters,
    stats,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [editingCategory, setEditingCategory] =
        useState<ServiceCategory | null>(null);

    const { data, setData, post, put, processing, reset, errors } =
        useForm<ServiceFormData>({
            service_category_id: serviceCategories[0]?.id || '',
            name: '',
            description: '',
            price: '',
            duration_minutes: '60',
            status: 'active',
        });
    const {
        data: categoryData,
        setData: setCategoryData,
        post: postCategory,
        put: putCategory,
        processing: categoryProcessing,
        reset: resetCategory,
        errors: categoryErrors,
    } = useForm({
        name: '',
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
            service_category_id: service.service_category_id || '',
            name: service.name,
            description: service.description || '',
            price: service.price.toString(),
            duration_minutes: service.duration_minutes.toString(),
            status: service.status,
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

    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCategory) {
            putCategory(`/business/services/categories/${editingCategory.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingCategory(null);
                    resetCategory();
                },
            });
            return;
        }

        postCategory('/business/services/categories', {
            preserveScroll: true,
            onSuccess: () => resetCategory(),
        });
    };

    const handleEditCategory = (category: ServiceCategory) => {
        setEditingCategory(category);
        setCategoryData('name', category.name);
    };

    const handleDeleteCategory = (category: ServiceCategory) => {
        if (confirm(`Delete "${category.name}"?`)) {
            router.delete(`/business/services/categories/${category.id}`, {
                preserveScroll: true,
            });
        }
    };

    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const isServiceFormOpen = isAddModalOpen || !!editingService;

    const visibleServices = services.data.filter(
        (service) =>
            categoryFilter === 'all' ||
            service.service_category_id === categoryFilter,
    );

    const closeServiceForm = () => {
        setIsAddModalOpen(false);
        setEditingService(null);
        reset();
    };

    const openNewServiceForm = () => {
        setEditingService(null);
        reset();
        setIsAddModalOpen(true);
    };

    const card =
        'rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10';
    const inputClass =
        'h-12 w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-3.5 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15';

    const statCards = [
        {
            icon: 'element-8',
            label: 'Total services',
            value: String(stats.totalServices.value),
            note: `across ${stats.activeCategories} categories`,
        },
        {
            icon: 'check-circle',
            label: 'Active',
            value: String(stats.activeServices),
            note: 'visible to clients',
        },
        {
            icon: 'eye',
            label: 'Inactive',
            value: String(stats.inactiveServices),
            note: 'hidden from booking',
        },
        {
            icon: 'medal-star',
            label: 'Most booked',
            value: stats.mostBooked.name,
            note: `${stats.mostBooked.bookings} booking${stats.mostBooked.bookings === 1 ? '' : 's'} this month`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services" />

            <div className="flex w-full flex-col gap-[22px] p-4 md:p-6">
                {/* Header */}
                <header className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-[1_1_300px] flex-col gap-1">
                        <span className="text-[13px] text-muted-foreground">
                            Business
                            {businessCategory
                                ? ` · ${businessCategory.name}`
                                : ''}
                        </span>
                        <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                            Services
                        </h1>
                        <span className="text-sm text-muted-foreground">
                            What clients can book, how long it takes and what it
                            costs.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsCategoriesOpen(true)}
                        className="flex h-11 items-center gap-2 rounded-xl border border-[#0E3B2E]/15 bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted dark:border-white/15"
                    >
                        <KeenIcon name="category" className="text-lg" />
                        Categories
                    </button>
                    <button
                        type="button"
                        onClick={openNewServiceForm}
                        disabled={serviceCategories.length === 0}
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#0E3B2E] px-[18px] text-sm font-semibold text-white hover:bg-[#0E3B2E]/90 disabled:opacity-60 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                    >
                        <KeenIcon name="plus" className="text-lg" />
                        Add service
                    </button>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className={`${card} flex items-center gap-3.5 p-[18px]`}
                        >
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                <KeenIcon
                                    name={stat.icon}
                                    className="text-[22px]"
                                />
                            </div>
                            <div className="flex min-w-0 flex-col gap-0.5">
                                <span className="text-[13px] text-muted-foreground">
                                    {stat.label}
                                </span>
                                <span className="truncate font-[Sora] text-[22px] font-bold text-foreground">
                                    {stat.value}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {stat.note}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex flex-auto flex-wrap gap-2">
                        {[
                            {
                                id: 'all',
                                name: 'All',
                                services_count: stats.totalServices
                                    .value as number,
                            },
                            ...serviceCategories,
                        ].map((category) => {
                            const isActive = categoryFilter === category.id;

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                        setCategoryFilter(category.id)
                                    }
                                    aria-pressed={isActive}
                                    className={
                                        isActive
                                            ? 'flex h-[38px] items-center gap-2 rounded-full bg-[#0E3B2E] px-3.5 text-[13px] font-bold text-white dark:bg-[#C8F169] dark:text-[#0E3B2E]'
                                            : 'flex h-[38px] items-center gap-2 rounded-full border border-[#0E3B2E]/12 bg-card px-3.5 text-[13px] font-bold text-foreground hover:bg-muted dark:border-white/15'
                                    }
                                >
                                    {category.name}
                                    <span
                                        className={
                                            isActive
                                                ? 'rounded-full bg-[#C8F169] px-[7px] py-px text-[11px] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]'
                                                : 'rounded-full bg-muted px-[7px] py-px text-[11px] text-muted-foreground'
                                        }
                                    >
                                        {category.services_count}
                                    </span>
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => setIsCategoriesOpen(true)}
                            className="flex h-[38px] items-center gap-1.5 rounded-full border border-dashed border-[#0E3B2E]/25 px-3 text-[13px] font-bold text-[#0E3B2E] hover:bg-[#E6F4EC] dark:border-white/20 dark:text-[#C8F169] dark:hover:bg-[#0E3B2E]"
                        >
                            <KeenIcon name="plus" className="text-[13px]" />
                            Category
                        </button>
                    </div>
                    <label className="flex h-10 flex-[0_1_240px] items-center gap-2.5 rounded-[10px] border border-[#0E3B2E]/12 bg-card px-3 text-muted-foreground dark:border-white/15">
                        <KeenIcon name="magnifier" className="text-base" />
                        <input
                            type="search"
                            aria-label="Search services"
                            placeholder="Search services…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        />
                    </label>
                </div>

                {serviceCategories.length === 0 && (
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#C8F169] p-4 text-[#0E3B2E]">
                        <KeenIcon name="information-2" className="text-xl" />
                        <span className="flex-1 text-sm font-semibold">
                            Create a category first, then add your services to
                            it.
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsCategoriesOpen(true)}
                            className="h-10 rounded-xl bg-[#0E3B2E] px-4 text-sm font-bold text-white"
                        >
                            Create category
                        </button>
                    </div>
                )}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    {isServiceFormOpen && (
                        <div className="order-first lg:order-last">
                            <ServiceFormPanel
                                key={editingService?.id ?? 'new'}
                                isEditing={!!editingService}
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                categories={serviceCategories}
                                onSubmit={handleSubmit}
                                onClose={closeServiceForm}
                            />
                        </div>
                    )}
                    {/* Grid */}
                    <div className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                        {visibleServices.map((service) => {
                            const isActive = service.status === 'active';

                            return (
                                <article
                                    key={service.id}
                                    className={`${card} flex flex-col gap-3 p-[18px] ${isActive ? '' : 'opacity-60'}`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="truncate rounded-full bg-[#E6F4EC] px-2.5 py-1 text-[11px] font-bold text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                            {service.service_category_name ||
                                                service.category_name ||
                                                'Uncategorised'}
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    aria-label={`More for ${service.name}`}
                                                    className="flex size-9 items-center justify-center rounded-[10px] text-muted-foreground hover:bg-muted"
                                                >
                                                    <KeenIcon
                                                        name="dots-horizontal"
                                                        className="text-lg"
                                                    />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleEdit(service)
                                                    }
                                                >
                                                    <KeenIcon
                                                        name="pencil"
                                                        className="mr-2 text-sm"
                                                    />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        handleDelete(service.id)
                                                    }
                                                    className="text-destructive"
                                                >
                                                    <KeenIcon
                                                        name="trash"
                                                        className="mr-2 text-sm"
                                                    />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-[Sora] text-[17px] font-semibold text-foreground capitalize">
                                            {service.name}
                                        </h3>
                                        <p className="line-clamp-2 text-[13px] leading-normal text-muted-foreground">
                                            {service.description ||
                                                'No description yet.'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-foreground">
                                            <KeenIcon
                                                name="time"
                                                className="text-[13px]"
                                            />
                                            {formatDuration(
                                                Number(
                                                    service.duration_minutes,
                                                ),
                                            )}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-foreground">
                                            <KeenIcon
                                                name="calendar-tick"
                                                className="text-[13px]"
                                            />
                                            {service.bookings_this_month} this
                                            month
                                        </span>
                                    </div>
                                    <div className="mt-auto h-px bg-[#0E3B2E]/[0.08] dark:bg-white/10" />
                                    <div className="flex items-center justify-between gap-2.5">
                                        <span className="font-[Sora] text-xl font-bold text-[#0E3B2E] dark:text-[#C8F169]">
                                            ₦
                                            {Number(
                                                service.price,
                                            ).toLocaleString()}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={
                                                    isActive
                                                        ? 'text-xs font-bold text-[#1F6B43] dark:text-[#C8F169]'
                                                        : 'text-xs font-bold text-muted-foreground'
                                                }
                                            >
                                                {isActive ? 'Active' : 'Hidden'}
                                            </span>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={isActive}
                                                aria-label={`${service.name} available for booking`}
                                                onClick={() =>
                                                    toggleStatus(service.id)
                                                }
                                                className={`flex h-[26px] w-11 shrink-0 items-center rounded-full p-[3px] transition-colors ${
                                                    isActive
                                                        ? 'justify-end bg-[#0E3B2E]'
                                                        : 'justify-start bg-[#D5DDD8] dark:bg-white/15'
                                                }`}
                                            >
                                                <span
                                                    className={`size-5 rounded-full ${isActive ? 'bg-[#C8F169]' : 'bg-white'}`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}

                        {serviceCategories.length > 0 && (
                            <button
                                type="button"
                                onClick={openNewServiceForm}
                                className="flex min-h-[240px] flex-col items-center justify-center gap-2.5 rounded-[20px] border-[1.5px] border-dashed border-[#0E3B2E]/25 text-[#0E3B2E] hover:bg-[#E6F4EC]/50 dark:border-white/20 dark:text-[#C8F169] dark:hover:bg-white/[0.03]"
                            >
                                <span className="flex size-12 items-center justify-center rounded-[14px] bg-[#C8F169] text-[#0E3B2E]">
                                    <KeenIcon
                                        name="plus"
                                        className="text-[22px]"
                                    />
                                </span>
                                <span className="font-[Sora] text-[15px] font-semibold">
                                    Add a service
                                </span>
                                <span className="text-[13px] text-muted-foreground">
                                    Price, duration and category
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {visibleServices.length === 0 && services.data.length > 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                        No services in this category on this page.
                    </p>
                )}

                {services.links?.length > 3 && (
                    <div className="flex justify-center">
                        <Pagination links={services.links} />
                    </div>
                )}
            </div>

            {/* Categories */}
            <Dialog
                open={isCategoriesOpen}
                onOpenChange={(open) => {
                    setIsCategoriesOpen(open);
                    if (!open) {
                        setEditingCategory(null);
                        resetCategory();
                    }
                }}
            >
                <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="font-[Sora] text-xl font-semibold">
                            Categories
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col">
                        {serviceCategories.length === 0 && (
                            <p className="py-4 text-sm text-muted-foreground">
                                No categories yet. Add your first one below.
                            </p>
                        )}
                        {serviceCategories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center gap-3 border-t border-[#0E3B2E]/[0.07] py-3 first:border-t-0 dark:border-white/10"
                            >
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate text-sm font-bold text-foreground">
                                        {category.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {category.services_count} service
                                        {category.services_count === 1
                                            ? ''
                                            : 's'}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    aria-label={`Edit ${category.name}`}
                                    onClick={() => handleEditCategory(category)}
                                    className="flex size-9 items-center justify-center rounded-[10px] border border-[#0E3B2E]/12 text-muted-foreground hover:bg-muted dark:border-white/15"
                                >
                                    <KeenIcon
                                        name="pencil"
                                        className="text-sm"
                                    />
                                </button>
                                <button
                                    type="button"
                                    aria-label={`Delete ${category.name}`}
                                    onClick={() =>
                                        handleDeleteCategory(category)
                                    }
                                    className="flex size-9 items-center justify-center rounded-[10px] border border-[#0E3B2E]/12 text-red-700 hover:bg-red-50 dark:border-white/15 dark:text-red-300"
                                >
                                    <KeenIcon
                                        name="trash"
                                        className="text-sm"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                    <form
                        onSubmit={handleCategorySubmit}
                        className="flex flex-col gap-2.5 rounded-2xl bg-muted/60 p-4"
                    >
                        <Label htmlFor="category-name">
                            {editingCategory
                                ? 'Rename category'
                                : 'New category'}
                        </Label>
                        <div className="flex gap-2">
                            <input
                                id="category-name"
                                value={categoryData.name}
                                onChange={(e) =>
                                    setCategoryData('name', e.target.value)
                                }
                                placeholder="e.g. Braids"
                                className={inputClass}
                            />
                            <button
                                type="submit"
                                disabled={categoryProcessing}
                                className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#0E3B2E] px-4 text-sm font-bold text-white disabled:opacity-70 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                            >
                                {categoryProcessing && <Spinner />}
                                {editingCategory ? 'Save' : 'Add'}
                            </button>
                        </div>
                        {categoryErrors.name && (
                            <p className="text-xs font-bold text-destructive">
                                {categoryErrors.name}
                            </p>
                        )}
                        {editingCategory && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingCategory(null);
                                    resetCategory();
                                }}
                                className="self-start text-xs font-bold text-muted-foreground hover:text-foreground"
                            >
                                Cancel editing
                            </button>
                        )}
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
