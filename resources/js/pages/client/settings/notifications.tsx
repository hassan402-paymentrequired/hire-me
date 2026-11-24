import ClientSettingsLayout from '@/layouts/client-settings/layout';
import { cn } from '@/lib/utils';
import notificationPreferences from '@/routes/notification-preferences';
import { Head, useForm } from '@inertiajs/react';

interface Preferences {
    email: boolean;
    push: boolean;
}

const options: { key: keyof Preferences; title: string; description: string }[] = [
    { key: 'email', title: 'Email updates', description: 'Confirmations, reminders, reschedules and cancellations by email.' },
    { key: 'push', title: 'Push notifications', description: 'Alerts on this device, even when Proxideck is closed.' },
];

export default function Notifications({ preferences }: { preferences: Preferences }) {
    const form = useForm<Preferences>(preferences);

    const toggle = (key: keyof Preferences) => {
        form.transform((data) => ({ ...data, [key]: !data[key] }));
        form.setData(key, !form.data[key]);
        form.put(notificationPreferences.update().url, { preserveScroll: true });
    };

    return (
        <ClientSettingsLayout>
            <Head title="Notification settings" />

            <section className="flex flex-col gap-2">
                <h2 className="text-xl font-bold">Booking notifications</h2>
                <p className="text-[15px] text-moss">In-app notifications are always on, so you never miss a booking change.</p>

                <div className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                    {options.map((option) => {
                        const isOn = form.data[option.key];

                        return (
                            <div key={option.key} className="flex items-center gap-5 px-6 py-5">
                                <div className="flex-1">
                                    <div className="font-bold">{option.title}</div>
                                    <div className="mt-0.5 text-sm text-moss">{option.description}</div>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={isOn}
                                    aria-label={option.title}
                                    disabled={form.processing}
                                    onClick={() => toggle(option.key)}
                                    className={cn('relative h-7.5 w-13 shrink-0 rounded-full transition-colors', isOn ? 'bg-forest' : 'bg-[#CCD2C6]')}
                                >
                                    <span
                                        className={cn(
                                            'absolute top-0.75 size-6 rounded-full bg-white shadow transition-[left]',
                                            isOn ? 'left-6.25' : 'left-0.75',
                                        )}
                                    />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>
        </ClientSettingsLayout>
    );
}
