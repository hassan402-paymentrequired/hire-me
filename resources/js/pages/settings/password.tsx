import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout, {
    SettingsSection,
    settingsInputClass,
    settingsPrimaryButtonClass,
} from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';

import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import account from '@/routes/business/account';
import { Check } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: account.password().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <SettingsSection
                    title="Update password"
                    description="Use a long, unique password you don't use anywhere else."
                >
                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="flex flex-col gap-4"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="current_password">
                                        Current password
                                    </Label>

                                    <input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        type="password"
                                        className={settingsInputClass}
                                        autoComplete="current-password"
                                        placeholder="Current password"
                                    />

                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password">
                                        New password
                                    </Label>

                                    <input
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        type="password"
                                        className={settingsInputClass}
                                        autoComplete="new-password"
                                        placeholder="New password"
                                    />

                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm password
                                    </Label>

                                    <input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        className={settingsInputClass}
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                    />

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex items-center gap-3 border-t border-[#0E3B2E]/10 pt-4 dark:border-white/10">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        data-test="update-password-button"
                                        className={settingsPrimaryButtonClass}
                                    >
                                        {processing && <Spinner />}
                                        Save password
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
            </SettingsLayout>
        </AppLayout>
    );
}
