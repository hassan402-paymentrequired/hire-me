import AppLayout from '@/layouts/app-layout';
import BusinessSettingsLayout from '@/layouts/business-settings/layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import business from '@/routes/business';
import GeneralSection from './components/general-section';
import FloatingSaveButton from './components/floating-save-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Business Settings', href: business.settings().url },
];

export default function BusinessSettingsGeneral({
    profile,
    categories,
}: {
    profile: any;
    categories: { value: string; label: string }[];
}) {
    const { flash } = usePage().props as any;
    const form = useForm({
        business_name: profile?.business_name || '',
        description: profile?.description || '',
        phone: profile?.phone || '',
        category: profile?.category || '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Settings" />

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
                        form.post(business.settings.update().url, {
                            preserveScroll: true,
                        });
                    }}
                    className="space-y-6"
                >
                    <GeneralSection
                        data={form.data}
                        setData={form.setData}
                        errors={form.errors as Record<string, string>}
                        categories={categories}
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
