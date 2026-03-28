import HolidayManager from '@/pages/provider/business/components/holiday-manager';
import SchedulePreview from '@/pages/provider/business/components/schedule-preview';
import FloatingSaveButton from '@/pages/provider/business/settings/components/floating-save-button';
import AppLayout from '@/layouts/app-layout';
import BusinessHoursLayout from '@/layouts/business-hours/layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import business from '@/routes/business';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: business.dashboard().url },
    { title: 'Business Hours', href: business.hours().url },
    { title: 'Holidays', href: '/business/hours/holidays' },
];

interface Props {
    initialSchedule: any;
    initialHolidays: any[];
}

export default function BusinessHoursHolidays({ initialSchedule, initialHolidays }: Props) {
    const { flash } = usePage().props as any;
    const form = useForm({
        holidays: initialHolidays || [],
    });

    const handleAddHoliday = (holiday: any) => {
        form.setData('holidays', [...form.data.holidays, holiday]);
    };

    const handleRemoveHoliday = (index: number) => {
        form.setData('holidays', form.data.holidays.filter((_: any, idx: number) => idx !== index));
    };

    const handleUpdateHoliday = (index: number, updatedHoliday: any) => {
        form.setData(
            'holidays',
            form.data.holidays.map((holiday: any, idx: number) => (idx === index ? updatedHoliday : holiday)),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Holiday Schedule" />

            <BusinessHoursLayout>
                {flash?.success && (
                    <div className="rounded-lg border border-success/20 bg-success/10 p-4">
                        <p className="text-sm font-medium text-success">{flash.success}</p>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/business/hours/holidays', { preserveScroll: true });
                    }}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <HolidayManager
                                holidays={form.data.holidays}
                                onAddHoliday={handleAddHoliday}
                                onRemoveHoliday={handleRemoveHoliday}
                                onUpdateHoliday={handleUpdateHoliday}
                            />
                        </div>
                        <div>
                            <SchedulePreview schedule={initialSchedule} />
                        </div>
                    </div>

                    <FloatingSaveButton visible={form.isDirty} processing={form.processing} />
                </form>
            </BusinessHoursLayout>
        </AppLayout>
    );
}
