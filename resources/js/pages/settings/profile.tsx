import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import GoogleCalendarCard, {
    type GoogleCalendarData,
} from '@/components/google-calendar-card';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout, {
    SettingsSection,
    settingsInputClass,
    settingsPrimaryButtonClass,
} from '@/layouts/settings/layout';
import account from '@/routes/business/account';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: account.profile().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
    googleCalendar,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    googleCalendar: GoogleCalendarData;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <SettingsSection
                    title="Profile information"
                    description="The name and email you sign in with."
                >
                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="flex flex-col gap-4"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="name">Full name</Label>
                                        <input
                                            id="name"
                                            className={settingsInputClass}
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="email">
                                            Email address
                                        </Label>
                                        <input
                                            id="email"
                                            type="email"
                                            className={settingsInputClass}
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="you@example.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="rounded-xl bg-[#FFF8E6] px-3.5 py-3 text-[13px] text-[#7A5200] dark:bg-amber-500/10 dark:text-amber-200">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="font-bold underline underline-offset-4"
                                            >
                                                Resend the verification email
                                            </Link>
                                            {status ===
                                                'verification-link-sent' && (
                                                <p className="mt-1 font-semibold text-[#0E3B2E] dark:text-[#C8F169]">
                                                    A new verification link has
                                                    been sent.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-3 border-t border-[#0E3B2E]/10 pt-4 dark:border-white/10">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        data-test="update-profile-button"
                                        className={settingsPrimaryButtonClass}
                                    >
                                        {processing && <Spinner />}
                                        Save changes
                                    </button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="flex items-center gap-1.5 text-sm font-semibold text-[#0E3B2E] dark:text-[#C8F169]">
                                            <Check className="size-4" />
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </SettingsSection>

                <GoogleCalendarCard googleCalendar={googleCalendar} />

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
