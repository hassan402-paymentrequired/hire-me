import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    SettingsField,
    SettingsRow,
    settingsDangerButtonClass,
    settingsInputClass,
    settingsOutlineButtonClass,
} from '@/pages/client/settings/components/settings-field';
import { Form } from '@inertiajs/react';
import { Loader2, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

export function DeleteAccountRow() {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <SettingsRow
                title="Delete account"
                description="Permanently remove your account, bookings history and wallet details. This can't be undone."
                action={
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className={settingsDangerButtonClass}
                        data-test="delete-user-button"
                    >
                        Delete account
                    </button>
                }
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="gap-0 rounded-3xl p-0 sm:max-w-md">
                    <div className="px-7 pt-7">
                        <span className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-600">
                            <Trash2 className="size-5" />
                        </span>
                        <DialogTitle className="mt-4 text-xl font-bold">
                            Delete your account?
                        </DialogTitle>
                        <DialogDescription className="mt-1.5 text-sm leading-6 text-moss">
                            Your bookings history, saved pros and addresses will
                            be removed for good. Enter your password to confirm.
                        </DialogDescription>
                    </div>

                    <Form
                        {...ProfileController.destroy.form()}
                        options={{ preserveScroll: true }}
                        onError={() => passwordInput.current?.focus()}
                        resetOnSuccess
                    >
                        {({ resetAndClearErrors, processing, errors }) => (
                            <>
                                <div className="px-7 pt-5 pb-6">
                                    <SettingsField
                                        id="delete-password"
                                        label="Password"
                                        error={errors.password}
                                    >
                                        <input
                                            id="delete-password"
                                            ref={passwordInput}
                                            type="password"
                                            name="password"
                                            autoComplete="current-password"
                                            aria-invalid={Boolean(
                                                errors.password,
                                            )}
                                            className={settingsInputClass}
                                        />
                                    </SettingsField>
                                </div>
                                <div className="flex justify-end gap-3 border-t border-line px-7 py-5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetAndClearErrors();
                                            setOpen(false);
                                        }}
                                        className={settingsOutlineButtonClass}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-[15px] font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                                        data-test="confirm-delete-user-button"
                                    >
                                        {processing && (
                                            <Loader2 className="size-4 animate-spin" />
                                        )}
                                        Delete account
                                    </button>
                                </div>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
