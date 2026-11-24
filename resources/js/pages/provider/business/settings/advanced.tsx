/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout';
import BusinessSettingsLayout from '@/layouts/business-settings/layout';
import business from '@/routes/business';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import AdvancedSettings from '../components/advance-setting';
import FloatingSaveButton from './components/floating-save-button';
import { type ProviderPromoCode, PromoCodesSection } from './components/promo-codes-section';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Business Settings', href: business.settings().url },
    { title: 'Advanced Settings', href: '/business/settings/advanced' },
];

export default function BusinessSettingsAdvanced({
    profile,
    promoCodes = [],
}: {
    profile: any;
    promoCodes?: ProviderPromoCode[];
}) {
    const form = useForm({
        settings: profile?.settings || {},
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Advanced Business Settings" />

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
                        form.post('/business/settings/advanced', {
                            preserveScroll: true,
                        });
                    }}
                    className="flex flex-col gap-4"
                >
                    <AdvancedSettings
                        settings={form.data.settings}
                        onSettingsChange={(field, value) =>
                            form.setData((previous) => ({
                                ...previous,
                                settings: {
                                    ...(previous.settings || {}),
                                    [field]: value,
                                },
                            }))
                        }
                    />
                    <FloatingSaveButton
                        visible={form.isDirty}
                        processing={form.processing}
                        onDiscard={() => form.reset()}
                    />
                </form>

                <PromoCodesSection codes={promoCodes} />
            </BusinessSettingsLayout>
        </AppLayout>
    );
}
