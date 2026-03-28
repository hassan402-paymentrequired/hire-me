import AppLayout from '@/layouts/app-layout';
import BusinessSettingsLayout from '@/layouts/business-settings/layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import business from '@/routes/business';
import AdvancedSettings from '../components/advance-setting';
import FloatingSaveButton from './components/floating-save-button';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Business Settings', href: business.settings().url },
    { title: 'Advanced Settings', href: '/business/settings/advanced' },
];

export default function BusinessSettingsAdvanced({ profile }: { profile: any }) {
    const form = useForm({
        settings: profile?.settings || {},
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Advanced Business Settings" />

            <BusinessSettingsLayout>
                {Object.keys(form.errors).length > 0 && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                        <p className="text-sm font-medium text-destructive">Please fix the errors below.</p>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/business/settings/advanced', {
                            preserveScroll: true,
                        });
                    }}
                    className="space-y-6"
                >
                    <AdvancedSettings
                        settings={form.data.settings}
                        onSettingsChange={(field, value) =>
                            form.setData('settings', {
                                ...(form.data.settings || {}),
                                [field]: value,
                            })
                        }
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
