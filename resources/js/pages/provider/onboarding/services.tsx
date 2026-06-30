import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OnboardingLayout from '@/layouts/onboarding-layout';
import onboarding from '@/routes/onboarding';
import { useForm, router } from '@inertiajs/react';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { getStepsWithStatus } from './onboarding-steps';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
interface ServicesProps {
    businessCategory: { id: string; name: string } | null;
    serviceCategories: {
        id: string;
        name: string;
        slug: string;
    }[];
    services?: {
        id: string;
        name: string;
        description: string;
        price: string;
        duration_minutes: string | number;
        service_category_id?: string | null;
    }[];
}

export default function Services({
    businessCategory,
    serviceCategories,
    services,
}: ServicesProps) {
    const firstService = services?.[0];
    const { data, setData, post, processing, errors } = useForm({
        name: firstService?.name || '',
        price: firstService?.price || '',
        duration_minutes: firstService?.duration_minutes?.toString() || '60',
        description: firstService?.description || '',
        service_category_id:
            firstService?.service_category_id || serviceCategories[0]?.id || '',
    });
    const {
        data: categoryData,
        setData: setCategoryData,
        post: postCategory,
        processing: creatingCategory,
        errors: categoryErrors,
        reset: resetCategory,
    } = useForm({
        name: '',
    });

    const [categoryModalOpen, setCategoryModalOpen] = useState(
        serviceCategories.length === 0,
    );

    useEffect(() => {
        if (serviceCategories.length === 0) {
            setCategoryModalOpen(true);
            return;
        }

        setCategoryModalOpen(false);

        if (!data.service_category_id) {
            setData('service_category_id', serviceCategories[0].id);
        }
    }, [serviceCategories]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(onboarding.services.store().url);
    };

    const createCategory = (e: React.FormEvent) => {
        e.preventDefault();
        postCategory('/onboarding/services/categories', {
            preserveScroll: true,
            onSuccess: () => resetCategory(),
        });
    };

    const goBack = () => {
        router.visit(onboarding.workHours().url);
    };

    const handleCategoryModalOpenChange = (open: boolean) => {
        if (!open && serviceCategories.length === 0) {
            return;
        }

        setCategoryModalOpen(open);
    };

    return (
        <OnboardingLayout
            title="Add Services"
            steps={getStepsWithStatus('services')}
            currentStepId="services"
        >
            <Dialog open={categoryModalOpen} onOpenChange={handleCategoryModalOpenChange}>
                <DialogContent
                    className="sm:max-w-md [&>button:last-child]:hidden"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Create your first service category</DialogTitle>
                        <DialogDescription>
                            Service categories organize what clients can book from you. Your
                            storefront stays under{' '}
                            <span className="font-medium text-foreground">
                                {businessCategory?.name ?? 'your business category'}
                            </span>
                            , while these categories structure your offerings.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={createCategory} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="service-category-name" className="text-sm font-medium">
                                Category name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="service-category-name"
                                value={categoryData.name}
                                onChange={(e) => setCategoryData('name', e.target.value)}
                                placeholder="e.g. Bridal, Home Cleaning, Repairs"
                                required
                                autoFocus
                            />
                            {categoryErrors.name && (
                                <p className="text-xs text-destructive">{categoryErrors.name}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={creatingCategory}
                                className="w-full sm:w-auto"
                            >
                                {creatingCategory && <Spinner className="mr-2" />}
                                Continue
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Add your first service
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Create a service so clients can start booking you immediately.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-4">
                        {errors.service_category_id && (
                            <p className="text-xs text-destructive">{errors.service_category_id}</p>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Service Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Standard Haircut"
                                required
                                className="h-10"
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-sm font-medium">
                                Service Description
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder={
                                    data.name
                                        ? `Tell users about ${data.name}`
                                        : 'Describe your service...'
                                }
                                rows={4}
                                className="field-sizing-fixed min-h-28 max-h-48 resize-none overflow-auto whitespace-pre-wrap"
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="price" className="text-sm font-medium">
                                    Price (₦) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    placeholder="0.00"
                                    required
                                    className="h-10"
                                    min="0"
                                    step="0.01"
                                />
                                {errors.price && (
                                    <p className="text-xs text-destructive mt-1">{errors.price}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="duration" className="text-sm font-medium">
                                    Duration (minutes){' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={data.duration_minutes}
                                    onChange={(e) =>
                                        setData('duration_minutes', e.target.value)
                                    }
                                    placeholder="60"
                                    required
                                    className="h-10"
                                    min="15"
                                    step="15"
                                />
                                {errors.duration_minutes && (
                                    <p className="text-xs text-destructive mt-1">
                                        {errors.duration_minutes}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={goBack}
                            className="text-sm"
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing || serviceCategories.length === 0}
                            className="w-full sm:w-auto min-w-[120px]"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Finish setup
                        </Button>
                    </div>
                </form>
            </div>
        </OnboardingLayout>
    );
}
