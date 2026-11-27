import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { AppSelect } from '@/components/ui/app-select';
import ClientSettingsLayout from '@/layouts/client-settings/layout';
import { cn } from '@/lib/utils';
import {
    CalendarSyncRow,
    type GoogleCalendarStatus,
} from '@/pages/client/settings/components/calendar-sync-row';
import { DateField } from '@/pages/client/settings/components/date-field';
import {
    SettingsField,
    settingsInputClass,
    settingsOutlineButtonClass,
    settingsPrimaryButtonClass,
    settingsSelectTriggerClass,
} from '@/pages/client/settings/components/settings-field';
import { send } from '@/routes/verification';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, type FormEvent } from 'react';

interface ProfileForm {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    avatar: File | null;
    remove_avatar: boolean;
}

const GENDER_LABELS: Record<string, string> = {
    female: 'Female',
    male: 'Male',
    other: 'Other',
    prefer_not_to_say: 'Prefer not to say',
};

function splitName(name: string): { first: string; last: string } {
    const [first = '', ...rest] = name.trim().split(/\s+/);

    return { first, last: rest.join(' ') };
}

function initialsFrom(name: string): string {
    return (
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join('')
            .toUpperCase() || 'P'
    );
}

export default function Profile({
    mustVerifyEmail,
    status,
    genders,
    googleCalendar,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    genders: string[];
    googleCalendar: GoogleCalendarStatus;
}) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const fileInput = useRef<HTMLInputElement>(null);

    const initialValues = useMemo<ProfileForm>(() => {
        const { first, last } = splitName(user.name);

        return {
            first_name: first,
            last_name: last,
            email: user.email,
            phone: user.phone ?? '',
            gender: user.gender ?? '',
            date_of_birth: user.date_of_birth?.slice(0, 10) ?? '',
            avatar: null,
            remove_avatar: false,
        };
    }, [user]);

    const form = useForm<ProfileForm>(initialValues);
    const avatarPreview = useMemo(
        () => (form.data.avatar ? URL.createObjectURL(form.data.avatar) : null),
        [form.data.avatar],
    );

    useEffect(
        () => () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        },
        [avatarPreview],
    );

    const shownAvatar =
        avatarPreview ?? (form.data.remove_avatar ? null : user.avatar);
    const displayName =
        `${form.data.first_name} ${form.data.last_name}`.trim() || user.name;
    const isEmailVerified =
        user.email_verified_at !== null && form.data.email === user.email;

    const discard = () => {
        form.setData(initialValues);
        form.clearErrors();

        if (fileInput.current) {
            fileInput.current.value = '';
        }
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.transform((data) => ({ ...data, _method: 'patch' }));
        form.post(ProfileController.update.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setData('avatar', null);
                form.setData('remove_avatar', false);

                if (fileInput.current) {
                    fileInput.current.value = '';
                }
            },
        });
    };

    return (
        <>
            <Head title="Account settings" />

            <ClientSettingsLayout>
                <form onSubmit={submit} noValidate>
                    <div className="flex flex-wrap items-center gap-5">
                        <span className="grid size-[88px] shrink-0 place-items-center overflow-hidden rounded-full bg-lime text-[28px] font-bold text-forest">
                            {shownAvatar ? (
                                <img
                                    src={shownAvatar}
                                    alt=""
                                    className="size-full object-cover"
                                />
                            ) : (
                                initialsFrom(displayName)
                            )}
                        </span>
                        <div>
                            <p className="text-lg font-bold">Profile photo</p>
                            <div className="mt-2 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInput.current?.click()}
                                    className={cn(
                                        settingsOutlineButtonClass,
                                        'h-10 px-4 text-sm',
                                    )}
                                >
                                    Upload new
                                </button>
                                {shownAvatar && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            form.setData((data) => ({
                                                ...data,
                                                avatar: null,
                                                remove_avatar: true,
                                            }));

                                            if (fileInput.current) {
                                                fileInput.current.value = '';
                                            }
                                        }}
                                        className="text-sm font-medium text-moss hover:text-ink"
                                    >
                                        Remove
                                    </button>
                                )}
                                <input
                                    ref={fileInput}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    aria-label="Upload profile photo"
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0] ?? null;
                                        form.setData((data) => ({
                                            ...data,
                                            avatar: file,
                                            remove_avatar: false,
                                        }));
                                    }}
                                />
                            </div>
                            {form.errors.avatar && (
                                <p className="mt-2 text-xs font-medium text-red-600">
                                    {form.errors.avatar}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                        <SettingsField
                            id="first_name"
                            label="First name"
                            error={form.errors.first_name}
                        >
                            <input
                                id="first_name"
                                value={form.data.first_name}
                                onChange={(event) =>
                                    form.setData(
                                        'first_name',
                                        event.target.value,
                                    )
                                }
                                autoComplete="given-name"
                                aria-invalid={Boolean(form.errors.first_name)}
                                className={settingsInputClass}
                                required
                            />
                        </SettingsField>

                        <SettingsField
                            id="last_name"
                            label="Last name"
                            error={form.errors.last_name}
                        >
                            <input
                                id="last_name"
                                value={form.data.last_name}
                                onChange={(event) =>
                                    form.setData(
                                        'last_name',
                                        event.target.value,
                                    )
                                }
                                autoComplete="family-name"
                                aria-invalid={Boolean(form.errors.last_name)}
                                className={settingsInputClass}
                            />
                        </SettingsField>

                        <SettingsField
                            id="email"
                            label="Email address"
                            error={form.errors.email}
                            hint={
                                isEmailVerified ? (
                                    <span className="font-medium text-leaf">
                                        Verified
                                    </span>
                                ) : mustVerifyEmail &&
                                  user.email_verified_at === null ? (
                                    <span className="text-moss">
                                        Not verified.{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="font-semibold text-forest underline underline-offset-2"
                                        >
                                            Resend link
                                        </Link>
                                        {status ===
                                            'verification-link-sent' && (
                                            <span className="ml-1 text-leaf">
                                                Sent — check your inbox.
                                            </span>
                                        )}
                                    </span>
                                ) : null
                            }
                        >
                            <input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                autoComplete="email"
                                aria-invalid={Boolean(form.errors.email)}
                                className={settingsInputClass}
                                required
                            />
                        </SettingsField>

                        <SettingsField
                            id="phone"
                            label="Phone"
                            error={form.errors.phone}
                        >
                            <input
                                id="phone"
                                type="tel"
                                value={form.data.phone}
                                onChange={(event) =>
                                    form.setData('phone', event.target.value)
                                }
                                autoComplete="tel"
                                placeholder="+234 803 000 0000"
                                aria-invalid={Boolean(form.errors.phone)}
                                className={settingsInputClass}
                            />
                        </SettingsField>

                        <SettingsField
                            id="gender"
                            label="Gender"
                            error={form.errors.gender}
                        >
                            <AppSelect
                                id="gender"
                                value={form.data.gender}
                                onChange={(value) =>
                                    form.setData('gender', value)
                                }
                                options={genders.map((gender) => ({
                                    value: gender,
                                    label: GENDER_LABELS[gender] ?? gender,
                                }))}
                                placeholder="Select"
                                searchable={false}
                                triggerClassName={cn(
                                    settingsSelectTriggerClass,
                                    form.errors.gender && 'border-red-500',
                                )}
                            />
                        </SettingsField>

                        <SettingsField
                            id="date_of_birth"
                            label="Date of birth"
                            error={form.errors.date_of_birth}
                        >
                            <DateField
                                id="date_of_birth"
                                value={form.data.date_of_birth}
                                onChange={(value) =>
                                    form.setData('date_of_birth', value)
                                }
                                invalid={Boolean(form.errors.date_of_birth)}
                            />
                        </SettingsField>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-3 border-t border-line pt-6">
                        {form.recentlySuccessful && (
                            <span className="mr-auto text-sm font-medium text-leaf">
                                Saved
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={discard}
                            disabled={!form.isDirty || form.processing}
                            className={settingsOutlineButtonClass}
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className={settingsPrimaryButtonClass}
                            data-test="update-profile-button"
                        >
                            {form.processing && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            Save changes
                        </button>
                    </div>
                </form>

                <div className="border-t border-line pt-8">
                    <CalendarSyncRow googleCalendar={googleCalendar} />
                </div>
            </ClientSettingsLayout>
        </>
    );
}
