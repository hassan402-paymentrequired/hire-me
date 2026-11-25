import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import ClientSettingsLayout from '@/layouts/client-settings/layout';
import { cn } from '@/lib/utils';
import {
    SettingsSection,
    settingsOutlineButtonClass,
    settingsPrimaryButtonClass,
} from '@/pages/client/settings/components/settings-field';
import { disable, enable } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface TwoFactorProps {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: TwoFactorProps) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <>
            <Head title="Two-factor authentication" />
            <ClientSettingsLayout>
                <div className="space-y-6">
                    <Link
                        href={editPassword()}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-moss hover:text-ink"
                    >
                        <ArrowLeft className="size-4" />
                        Back to security
                    </Link>
                    <SettingsSection
                        title="Two-factor authentication"
                        description="Add a code from an authenticator app on your phone each time you log in."
                    >
                        <div className="rounded-2xl bg-paper p-5">
                            <span
                                className={cn(
                                    'rounded-full px-2.5 py-1 text-xs font-semibold',
                                    twoFactorEnabled
                                        ? 'bg-mint text-leaf'
                                        : 'bg-white text-moss',
                                )}
                            >
                                {twoFactorEnabled ? 'On' : 'Off'}
                            </span>
                            <p className="mt-3 text-sm leading-6 text-ink/80">
                                {twoFactorEnabled
                                    ? 'You will be asked for a code from your authenticator app when you log in.'
                                    : 'Turn this on and you will need a code from an app like Google Authenticator to log in, even if someone has your password.'}
                            </p>

                            <div className="mt-5">
                                {twoFactorEnabled ? (
                                    <Form {...disable.form()}>
                                        {({ processing }) => (
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className={cn(
                                                    settingsOutlineButtonClass,
                                                    'border-red-200 text-red-700 hover:bg-red-50',
                                                )}
                                            >
                                                <ShieldBan className="size-4" />
                                                Turn off
                                            </button>
                                        )}
                                    </Form>
                                ) : hasSetupData ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowSetupModal(true)}
                                        className={settingsPrimaryButtonClass}
                                    >
                                        <ShieldCheck className="size-4" />
                                        Continue setup
                                    </button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() =>
                                            setShowSetupModal(true)
                                        }
                                    >
                                        {({ processing }) => (
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className={
                                                    settingsPrimaryButtonClass
                                                }
                                            >
                                                <ShieldCheck className="size-4" />
                                                Turn on
                                            </button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    </SettingsSection>

                    {twoFactorEnabled && (
                        <TwoFactorRecoveryCodes
                            recoveryCodesList={recoveryCodesList}
                            fetchRecoveryCodes={fetchRecoveryCodes}
                            errors={errors}
                        />
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            </ClientSettingsLayout>
        </>
    );
}
