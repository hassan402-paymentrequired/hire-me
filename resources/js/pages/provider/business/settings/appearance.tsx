/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout';
import BusinessSettingsLayout from '@/layouts/business-settings/layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import business from '@/routes/business';
import AppearanceSection from './components/appearance-section';
import FloatingSaveButton from './components/floating-save-button';
import React from 'react';
import { gooeyToast as toast } from 'goey-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Business Settings', href: business.settings().url },
    { title: 'Images & Logo', href: '/business/settings/appearance' },
];

export default function BusinessSettingsAppearance({ profile }: { profile: any }) {
    const { flash } = usePage().props as any;
    const existingBannerCount = profile?.images?.filter((img: any) => !img.is_logo).length ?? 0;
    const [logoPreview, setLogoPreview] = React.useState<string | null>(
        profile?.images?.find((img: any) => img.is_logo)?.path || null,
    );
    const [newImagePreviews, setNewImagePreviews] = React.useState<string[]>([]);
    const form = useForm({
        logo: null as File | null,
        new_images: [] as File[],
        delete_image_ids: [] as string[],
    } as any);

    React.useEffect(() => {
        setLogoPreview(profile?.images?.find((img: any) => img.is_logo)?.path || null);
    }, [profile]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        form.setData('logo', file);
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleNewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const keptBannerCount = existingBannerCount - form.data.delete_image_ids.length;
        const currentPendingCount = form.data.new_images.length;
        const remainingSlots = 3 - keptBannerCount - currentPendingCount;

        if (remainingSlots <= 0) {
            toast.error('You can only keep up to 3 banner images, excluding your logo.');
            return;
        }

        const acceptedFiles = files.slice(0, remainingSlots);
        if (acceptedFiles.length < files.length) {
            toast.error(`Only ${remainingSlots} more banner image${remainingSlots === 1 ? '' : 's'} can be added.`);
        }

        form.setData('new_images', [...form.data.new_images, ...acceptedFiles]);

        const previews: string[] = [];
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result as string);
                if (previews.length === acceptedFiles.length) {
                    setNewImagePreviews((prev) => [...prev, ...previews]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index: number) => {
        form.setData(
            'new_images',
            form.data.new_images.filter((_: File, i: number) => i !== index),
        );
        setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleDeleteImage = (id: string) => {
        if (form.data.delete_image_ids.includes(id)) {
            form.setData(
                'delete_image_ids',
                form.data.delete_image_ids.filter((imageId: string) => imageId !== id),
            );
            return;
        }

        form.setData('delete_image_ids', [...form.data.delete_image_ids, id]);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Appearance" />

            <BusinessSettingsLayout>
                {flash?.success && (
                    <div className="rounded-lg border border-success/20 bg-success/10 p-4">
                        <p className="text-sm font-medium text-success">{flash.success}</p>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/business/settings/appearance', {
                            preserveScroll: true,
                            forceFormData: true,
                            onError: (errors) => {
                                const firstError = Object.values(errors)[0];
                                toast.error(
                                    typeof firstError === 'string'
                                        ? firstError
                                        : 'We could not save your business appearance. Please review your files and try again.',
                                );
                            },
                            onSuccess: () => {
                                form.reset('logo', 'new_images', 'delete_image_ids');
                                setNewImagePreviews([]);
                            },
                        });
                    }}
                    className="space-y-6"
                >
                    <AppearanceSection
                        profile={profile}
                        data={form.data}
                        maxBannerImages={3}
                        logoPreview={logoPreview}
                        newImagePreviews={newImagePreviews}
                        handleLogoChange={handleLogoChange}
                        handleNewImagesChange={handleNewImagesChange}
                        removeNewImage={removeNewImage}
                        toggleDeleteImage={toggleDeleteImage}
                    />
                    <FloatingSaveButton
                        visible={form.isDirty}
                        processing={form.processing}
                    />
                </form>
            </BusinessSettingsLayout>
        </AppLayout>
    );
}
