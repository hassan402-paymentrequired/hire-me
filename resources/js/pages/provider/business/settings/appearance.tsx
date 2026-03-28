import AppLayout from '@/layouts/app-layout';
import BusinessSettingsLayout from '@/layouts/business-settings/layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import business from '@/routes/business';
import AppearanceSection from './components/appearance-section';
import FloatingSaveButton from './components/floating-save-button';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Business Settings', href: business.settings().url },
    { title: 'Images & Logo', href: '/business/settings/appearance' },
];

export default function BusinessSettingsAppearance({ profile }: { profile: any }) {
    const { flash } = usePage().props as any;
    const [logoPreview, setLogoPreview] = React.useState<string | null>(
        profile?.images?.find((img: any) => img.is_logo)?.path || null,
    );
    const [newImagePreviews, setNewImagePreviews] = React.useState<string[]>([]);
    const form = useForm({
        logo: null as File | null,
        new_images: [] as File[],
        delete_image_ids: [] as string[],
    } as any);

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

        form.setData('new_images', [...form.data.new_images, ...files]);

        const previews: string[] = [];
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result as string);
                if (previews.length === files.length) {
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
                {Object.keys(form.errors).length > 0 && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                        <p className="text-sm font-medium text-destructive">Please fix the errors below.</p>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/business/settings/appearance', {
                            preserveScroll: true,
                            forceFormData: true,
                        });
                    }}
                    className="space-y-6"
                >
                    <AppearanceSection
                        profile={profile}
                        data={form.data}
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
