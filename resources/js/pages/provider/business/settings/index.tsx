/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout';
import BusinessSettingsLayout from '@/layouts/business-settings/layout';
import business from '@/routes/business';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { gooeyToast as toast } from 'goey-toast';
import React from 'react';
import FloatingSaveButton from './components/floating-save-button';
import GeneralSection from './components/general-section';
import LocationSection from './components/location-section';
import ProfileHeader from './components/profile-header';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Business Settings', href: business.settings().url },
];

const readAsDataUrl = (file: File, onLoad: (url: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => onLoad(reader.result as string);
    reader.readAsDataURL(file);
};

export default function BusinessSettingsGeneral({
    profile,
    categories,
}: {
    profile: any;
    categories: { value: string; label: string }[];
}) {
    const logoImage =
        profile?.images?.find((image: any) => image.is_logo) ?? null;
    const coverBanner =
        profile?.images?.find((image: any) => !image.is_logo) ?? null;

    const [logoPreview, setLogoPreview] = React.useState<string | null>(
        logoImage?.path ?? profile?.logo_path ?? null,
    );
    const [bannerPreview, setBannerPreview] = React.useState<string | null>(
        coverBanner?.path ?? null,
    );

    const form = useForm({
        business_name: profile?.business_name || '',
        description: profile?.description || '',
        phone: profile?.phone || '',
        category: profile?.category || '',
        address: profile?.address || '',
        city: profile?.city || '',
        state: profile?.state || '',
        zip_code: profile?.zip_code || '',
        latitude: (profile?.latitude ?? null) as number | null,
        longitude: (profile?.longitude ?? null) as number | null,
        logo: null as File | null,
        new_images: [] as File[],
        delete_image_ids: [] as string[],
    } as any);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        form.setData('logo', file);
        readAsDataUrl(file, setLogoPreview);
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        form.setData((data: any) => ({
            ...data,
            new_images: [file],
            delete_image_ids: coverBanner ? [coverBanner.id] : [],
        }));
        readAsDataUrl(file, setBannerPreview);
    };

    const discardChanges = () => {
        form.reset();
        setLogoPreview(logoImage?.path ?? profile?.logo_path ?? null);
        setBannerPreview(coverBanner?.path ?? null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Settings" />

            <BusinessSettingsLayout>
                {Object.keys(form.errors).length > 0 && (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
                        <p className="text-sm font-medium text-destructive">
                            Please fix the errors below.
                        </p>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(business.settings.update().url, {
                            preserveScroll: true,
                            forceFormData: true,
                            onError: (errors) => {
                                const firstError = Object.values(errors)[0];
                                if (typeof firstError === 'string') {
                                    toast.error(firstError);
                                }
                            },
                            onSuccess: () => {
                                const savedData = {
                                    ...form.data,
                                    logo: null,
                                    new_images: [],
                                    delete_image_ids: [],
                                };
                                form.setDefaults(savedData);
                                form.setData(savedData);
                            },
                        });
                    }}
                    className="flex flex-col gap-4"
                >
                    <ProfileHeader
                        businessName={form.data.business_name}
                        slug={profile?.slug}
                        bannerUrl={bannerPreview}
                        logoUrl={logoPreview}
                        onBannerChange={handleBannerChange}
                        onLogoChange={handleLogoChange}
                    />
                    <GeneralSection
                        data={form.data}
                        setData={form.setData}
                        errors={form.errors as Record<string, string>}
                        categories={categories}
                    />
                    <LocationSection
                        data={form.data}
                        setData={form.setData}
                        errors={form.errors as Record<string, string>}
                    />
                    <FloatingSaveButton
                        visible={form.isDirty}
                        processing={form.processing}
                        onDiscard={discardChanges}
                    />
                </form>
            </BusinessSettingsLayout>
        </AppLayout>
    );
}
