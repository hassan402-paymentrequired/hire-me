import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout, {
    SettingsSection,
    settingsDangerButtonClass,
    settingsPrimaryButtonClass,
} from '@/layouts/settings/layout';
import account from '@/routes/business/account';
import { disable, enable } from '@/routes/two-factor';
import { type BreadcrumbItem } from '@/types';
import { Form, Head } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface TwoFactorProps {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: account.twoFactor().url,
    },
];

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

    const statusBadge = (
        <span
            className={
                twoFactorEnabled
                    ? 'inline-flex h-8 items-center gap-1.5 rounded-full bg-[#C8F169] px-3 text-xs font-bold text-[#0E3B2E]'
                    : 'inline-flex h-8 items-center gap-1.5 rounded-full bg-muted px-3 text-xs font-bold text-muted-foreground'
            }
        >
            <span
                className={
                    twoFactorEnabled
                        ? 'size-1.5 rounded-full bg-[#0E3B2E]'
                        : 'size-1.5 rounded-full bg-muted-foreground'
                }
            />
            {twoFactorEnabled ? 'On' : 'Off'}
        </span>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />
            <SettingsLayout>
                <SettingsSection
                    title="Two-factor authentication"
                    description={
                        twoFactorEnabled
                            ? 'You will be asked for a code from your authenticator app each time you log in.'
                            : 'Add a second step to your login with a code from an authenticator app on your phone.'
                    }
                    action={statusBadge}
                >
                    <div className="flex flex-wrap items-center gap-3 border-t border-[#0E3B2E]/10 pt-4 dark:border-white/10">
                        {twoFactorEnabled ? (
                            <Form {...disable.form()}>
                                {({ processing }) => (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={settingsDangerButtonClass}
                                    >
                                        <ShieldBan className="size-4" />
                                        Turn off 2FA
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
                                onSuccess={() => setShowSetupModal(true)}
                            >
                                {({ processing }) => (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={settingsPrimaryButtonClass}
                                    >
                                        <ShieldCheck className="size-4" />
                                        Turn on 2FA
                                    </button>
                                )}
                            </Form>
                        )}
                    </div>
                </SettingsSection>

                {twoFactorEnabled && (
                    <TwoFactorRecoveryCodes
                        recoveryCodesList={recoveryCodesList}
                        fetchRecoveryCodes={fetchRecoveryCodes}
                        errors={errors}
                        className="rounded-[20px] border-[#0E3B2E]/10 shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10"
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
            </SettingsLayout>
        </AppLayout>
    );
}
