import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import ClientSettingsLayout from '@/layouts/client-settings/layout';
import { cn } from '@/lib/utils';
import { DeleteAccountRow } from '@/pages/client/settings/components/delete-account-row';
import {
    SettingsBadge,
    SettingsField,
    SettingsRow,
    SettingsSection,
    settingsInputClass,
    settingsOutlineButtonClass,
    settingsPrimaryButtonClass,
} from '@/pages/client/settings/components/settings-field';
import { show as showTwoFactor } from '@/routes/two-factor';
import { Form, Head, Link } from '@inertiajs/react';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useRef, useState, type Ref } from 'react';

function PasswordInput({
    id,
    name,
    autoComplete,
    invalid,
    inputRef,
}: {
    id: string;
    name: string;
    autoComplete: string;
    invalid: boolean;
    inputRef?: Ref<HTMLInputElement>;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                id={id}
                ref={inputRef}
                name={name}
                type={visible ? 'text' : 'password'}
                autoComplete={autoComplete}
                aria-invalid={invalid}
                className={cn(settingsInputClass, 'pr-12')}
            />
            <button
                type="button"
                onClick={() => setVisible((value) => !value)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-moss hover:bg-paper hover:text-ink"
            >
                {visible ? (
                    <EyeOff className="size-4" />
                ) : (
                    <Eye className="size-4" />
                )}
            </button>
        </div>
    );
}

export default function Password({
    twoFactorEnabled = false,
}: {
    twoFactorEnabled?: boolean;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Security" />

            <ClientSettingsLayout>
                <SettingsSection
                    title="Password"
                    description="Use at least 8 characters. A password you don't use anywhere else is safest."
                >
                    <Form
                        {...PasswordController.update.form()}
                        options={{ preserveScroll: true }}
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
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-5 md:grid-cols-3">
                                    <SettingsField
                                        id="current_password"
                                        label="Current password"
                                        error={errors.current_password}
                                    >
                                        <PasswordInput
                                            id="current_password"
                                            name="current_password"
                                            autoComplete="current-password"
                                            inputRef={currentPasswordInput}
                                            invalid={Boolean(
                                                errors.current_password,
                                            )}
                                        />
                                    </SettingsField>
                                    <SettingsField
                                        id="password"
                                        label="New password"
                                        error={errors.password}
                                    >
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            autoComplete="new-password"
                                            inputRef={passwordInput}
                                            invalid={Boolean(errors.password)}
                                        />
                                    </SettingsField>
                                    <SettingsField
                                        id="password_confirmation"
                                        label="Confirm new password"
                                        error={errors.password_confirmation}
                                    >
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            autoComplete="new-password"
                                            invalid={Boolean(
                                                errors.password_confirmation,
                                            )}
                                        />
                                    </SettingsField>
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-6">
                                    {recentlySuccessful && (
                                        <span className="mr-auto text-sm font-medium text-leaf">
                                            Password updated
                                        </span>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={settingsPrimaryButtonClass}
                                        data-test="update-password-button"
                                    >
                                        {processing && (
                                            <Loader2 className="size-4 animate-spin" />
                                        )}
                                        Update password
                                    </button>
                                </div>
                            </>
                        )}
                    </Form>
                </SettingsSection>

                <div className="border-t border-line pt-8">
                    <SettingsRow
                        icon={<ShieldCheck className="size-5" />}
                        title="Two-factor authentication"
                        badge={
                            <SettingsBadge
                                tone={twoFactorEnabled ? 'success' : 'muted'}
                            >
                                {twoFactorEnabled ? 'On' : 'Off'}
                            </SettingsBadge>
                        }
                        description="Ask for a code from your phone each time you log in."
                        action={
                            <Link
                                href={showTwoFactor()}
                                className={settingsOutlineButtonClass}
                            >
                                {twoFactorEnabled ? 'Manage' : 'Turn on'}
                            </Link>
                        }
                    />
                </div>

                <div className="border-t border-line pt-8">
                    <DeleteAccountRow />
                </div>
            </ClientSettingsLayout>
        </>
    );
}
