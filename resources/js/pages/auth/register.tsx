import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import KeenIcon from '@/components/keen-icon';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login, register } from '@/routes';

const getStrengthScore = (pw: string): number => {
    if (pw.length === 0) return 0;
    if (pw.length < 4) return 1;
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(5, s + 1);
};

const strengthConfig = [
    { emoji: null,  border: undefined,    label: '' },
    { emoji: '😟',  border: '#E24B4A',    label: 'Too short' },
    { emoji: '😐',  border: '#EF9F27',    label: 'Weak' },
    { emoji: '🙂',  border: '#639922',    label: 'Fair' },
    { emoji: '😎',  border: '#1D9E75',    label: 'Strong' },
    { emoji: '🔥',  border: '#533AB7',    label: 'Unbreakable!' },
];

const EyeOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
        <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0 1 15.75 12ZM12.53 15.713l-4.243-4.244a3.75 3.75 0 0 0 4.244 4.243Z" />
        <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 0 0-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 0 1 6.75 12Z" />
    </svg>
);

export default function Register({
    invitationToken,
    invitationBusinessName,
}: {
    invitationToken?: string | null;
    invitationBusinessName?: string | null;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        invitation_token: invitationToken || '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(register().url, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const pwScore = getStrengthScore(data.password);
    const pwStrength = strengthConfig[pwScore];

    return (
        <AuthLayout
            title="Create an account"
            description={
                invitationToken
                    ? `Complete your registration to join ${invitationBusinessName || 'this provider'} as staff.`
                    : 'Enter your details below to create your account'
            }
        >
            <Head title="Register" />

            <Button
                type="button"
                variant="outline"
                className="h-10 w-full font-medium"
                onClick={() => {
                    const url = invitationToken
                        ? `/auth/google/redirect?invitation=${encodeURIComponent(invitationToken)}`
                        : '/auth/google/redirect';
                    window.location.href = url;
                }}
            >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
            </Button>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                    </span>
                </div>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4 sm:gap-5">
                {invitationToken && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                        You are registering through a team invitation for{' '}
                        <span className="font-semibold">
                            {invitationBusinessName || 'this provider'}
                        </span>
                        .
                    </div>
                )}

                <div className="grid gap-4 sm:gap-5">
                    {/* Name */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                <KeenIcon name="security-user" className="text-sm" />
                            </div>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                name="name"
                                placeholder="Full name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="h-10 pl-10"
                            />
                        </div>
                        <InputError message={errors.name} />
                    </div>

                    {/* Email */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                <KeenIcon name="messages" className="text-sm" />
                            </div>
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                name="email"
                                placeholder="email@example.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="h-10 pl-10"
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    {/* Password */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                <KeenIcon name="lock" className="text-sm" />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                name="password"
                                placeholder="Password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="h-10 pl-10 transition-[border-color] duration-300"
                                style={
                                    data.password && pwStrength.border
                                        ? { borderColor: pwStrength.border, borderWidth: '2px' }
                                        : {}
                                }
                            />
                            {/* Strength emoji — purely decorative, no click */}
                            {data.password && pwStrength.emoji && (
                                <span
                                    className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-base leading-none"
                                    aria-hidden="true"
                                >
                                    {pwStrength.emoji}
                                </span>
                            )}
                            {/* SVG eye toggle — always present when field has value, unaffected by emoji */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
                            </button>
                        </div>
                        {/* Strength label */}
                        {data.password && pwStrength.label && (
                            <p
                                className="text-xs font-medium transition-colors duration-300"
                                style={{ color: pwStrength.border }}
                            >
                                {pwStrength.label}
                            </p>
                        )}
                        <InputError message={errors.password} />
                    </div>

                  {/* Confirm Password */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="password_confirmation" className="text-sm font-medium">
                            Confirm password
                        </Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                <KeenIcon name="lock" className="text-sm" />
                            </div>
                            <Input
                                id="password_confirmation"
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                name="password_confirmation"
                                placeholder="Confirm password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="h-10 pl-10 pr-10 transition-[border-color] duration-300"
                                style={
                                    data.password_confirmation
                                        ? {
                                              borderColor:
                                                  data.password_confirmation === data.password
                                                      ? '#1D9E75'
                                                      : '#E24B4A',
                                              borderWidth: '2px',
                                          }
                                        : {}
                                }
                            />
                            {/* Match emoji — purely decorative, no click */}
                            {data.password_confirmation && (
                                <span
                                    className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-base leading-none"
                                    aria-hidden="true"
                                >
                                    {data.password_confirmation === data.password ? '✅' : '❌'}
                                </span>
                            )}
                            {/* SVG eye toggle — independent */}
                            <button
                                type="button"
                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                tabIndex={-1}
                                aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
                            >
                                {showPasswordConfirmation ? <EyeOffIcon /> : <EyeOpenIcon />}
                            </button>
                        </div>
                        {/* Match label */}
                        {data.password_confirmation && (
                            <p
                                className="text-xs font-medium transition-colors duration-300"
                                style={{
                                    color:
                                        data.password_confirmation === data.password
                                            ? '#1D9E75'
                                            : '#E24B4A',
                                }}
                            >
                                {data.password_confirmation === data.password
                                    ? 'Passwords match'
                                    : "Passwords don't match"}
                            </p>
                        )}
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 h-10 w-full font-medium"
                        tabIndex={5}
                        disabled={processing}
                    >
                        {processing && <Spinner className="mr-2" />}
                        Create account
                    </Button>
                </div>

                <div className="pt-2 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink
                        href={
                            invitationToken
                                ? `/login?invitation=${encodeURIComponent(invitationToken)}`
                                : login()
                        }
                        tabIndex={6}
                        className="font-medium text-foreground hover:underline"
                    >
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}