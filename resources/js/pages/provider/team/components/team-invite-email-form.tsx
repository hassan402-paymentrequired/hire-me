import KeenIcon from '@/components/keen-icon';
import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog';
import { AppSelect } from '@/components/ui/app-select';
import { Spinner } from '@/components/ui/spinner';
import business from '@/routes/business';
import { cn } from '@/lib/utils';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const inputClass =
    'h-12 w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-3.5 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15';

interface TeamInviteEmailFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
    className?: string;
}

export function TeamInviteEmailForm({
    onSuccess,
    onCancel,
    showCancel = false,
    className,
}: TeamInviteEmailFormProps) {
    const { data, setData, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: 'staff' as 'admin' | 'staff',
    });
    const [existingUserOpen, setExistingUserOpen] = useState(false);

    const finish = () => {
        reset();
        onSuccess?.();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(business.team.index().url, data, {
            preserveScroll: true,
            onSuccess: () => finish(),
            onError: (validationErrors) => {
                if (validationErrors.exists) {
                    setExistingUserOpen(true);
                }
            },
        });
    };

    const sendExistingUserInvite = () => {
        router.post(business.team.invite().url, {
            email: data.email,
            role: data.role,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setExistingUserOpen(false);
                finish();
            },
        });
    };

    const permissions =
        data.role === 'admin'
            ? [
                  'Full access to business settings and analytics',
                  'Manage team members, services and hours',
                  'Handle all appointments and payouts',
              ]
            : [
                  'View and manage appointments',
                  'View services and client details',
                  'Cannot change business settings or team',
              ];

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className={cn('flex flex-col gap-4', className)}
            >
                <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-bold text-foreground">
                        Full name <span className="text-destructive">*</span>
                    </span>
                    <input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Kemi Adeyemi"
                        className={inputClass}
                        autoComplete="name"
                        required
                    />
                    {errors.name && (
                        <span className="text-xs font-bold text-destructive">
                            {errors.name}
                        </span>
                    )}
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-bold text-foreground">
                        Email address <span className="text-destructive">*</span>
                    </span>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="colleague@example.com"
                        className={inputClass}
                        autoComplete="email"
                        required
                    />
                    {errors.email && (
                        <span className="text-xs font-bold text-destructive">
                            {errors.email}
                        </span>
                    )}
                </label>

                <div className="flex flex-col gap-2">
                    <span className="text-[13px] font-bold text-foreground">
                        Role <span className="text-destructive">*</span>
                    </span>
                    <AppSelect
                        id="team-invite-role"
                        value={data.role}
                        onChange={(value) =>
                            setData('role', value as 'admin' | 'staff')
                        }
                        searchable={false}
                        options={[
                            {
                                value: 'admin',
                                label: 'Admin',
                                description: 'Full access to manage business',
                                icon: 'shield-tick',
                            },
                            {
                                value: 'staff',
                                label: 'Staff',
                                description:
                                    'Can manage appointments and services',
                                icon: 'user',
                            },
                        ]}
                    />
                    {errors.role && (
                        <span className="text-xs font-bold text-destructive">
                            {errors.role}
                        </span>
                    )}
                </div>

                <div className="rounded-2xl bg-[#F7FAF7] px-4 py-3.5 dark:bg-white/[0.04]">
                    <span className="text-[13px] font-bold text-foreground">
                        What they can do
                    </span>
                    <ul className="mt-2 flex flex-col gap-1.5 text-[13px] leading-snug text-muted-foreground">
                        {permissions.map((line) => (
                            <li key={line} className="flex gap-2">
                                <KeenIcon
                                    name="check-circle"
                                    className="mt-0.5 shrink-0 text-sm text-[#2F7D4F] dark:text-[#C8F169]"
                                />
                                <span>{line}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-wrap justify-end gap-2.5 pt-1">
                    {showCancel && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex h-11 items-center rounded-xl border border-[#0E3B2E]/15 px-4 text-sm font-bold text-foreground hover:bg-muted dark:border-white/15"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#0E3B2E] px-5 text-sm font-bold text-white disabled:opacity-60 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                    >
                        {processing && <Spinner />}
                        Send invitation
                    </button>
                </div>
            </form>

            <CustomAlertDialog
                open={existingUserOpen}
                onOpenChange={setExistingUserOpen}
                icon={
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                        <KeenIcon name="sms" className="text-3xl" />
                    </span>
                }
                title="They already have an account"
                description="This email is already on Proxideck. Send a team invitation so they can join under your business instead of creating a new login."
                acceptLabel="Send invite"
                rejectLabel="Cancel"
                onAccept={sendExistingUserInvite}
                onReject={() => setExistingUserOpen(false)}
            />
        </>
    );
}