import AppLayout from '@/layouts/app-layout';
import BusinessSettingsLayout from '@/layouts/business-settings/layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import business from '@/routes/business';
import LocationSection from './components/location-section';
import FloatingSaveButton from './components/floating-save-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Business Settings', href: business.settings().url },
    { title: 'Location', href: '/business/settings/location' },
];

export default function BusinessSettingsLocation({ profile }: { profile: any }) {
    const form = useForm({
        address: profile?.address || '',
        city: profile?.city || '',
        state: profile?.state || '',
        zip_code: profile?.zip_code || '',
        latitude: (profile?.latitude ?? null) as number | null,
        longitude: (profile?.longitude ?? null) as number | null,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Business Location" />

            <BusinessSettingsLayout>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/business/settings/location', {
                            preserveScroll: true,
                        });
                    }}
                    className="space-y-6"
                >
                    <LocationSection
                        data={form.data}
                        setData={form.setData}
                        errors={form.errors as Record<string, string>}
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
