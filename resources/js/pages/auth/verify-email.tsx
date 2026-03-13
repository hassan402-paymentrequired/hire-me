// Components
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head, useForm, usePage } from '@inertiajs/react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { auth } = usePage().props as any;
    const userEmail = auth?.user?.email || 'your email';
    const otpForm = useForm<{ code: string }>({ code: '' });

    return (
        <AuthLayout
            title="Verify your email address"
            description={`We've sent a 6-digit verification code to ${userEmail}. Enter it below to continue.`}
        >
            <Head title="Email verification" />

            <div className="flex flex-col items-center space-y-6">
                {/* Icon */}
                <img 
            src="/assets/gifs/mailbox.gif" 
            alt="Mailbox" 
            className="size-16 object-contain" 
        />

               

                {/* Success Message */}
                {status === 'verification-link-sent' && (
                    <div className="w-full p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                            <CheckCircle2 className="size-4" />
                            <span>A new verification code has been sent to your email address.</span>
                        </div>
                    </div>
                )}

                {/* OTP Form */}
                <form
                    className="w-full space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        otpForm.post('/email/verify/otp', {
                            preserveScroll: true,
                        });
                    }}
                >
                    <div className="space-y-2">
                        <Input
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="Enter 6-digit code"
                            value={otpForm.data.code}
                            onChange={(e) =>
                                otpForm.setData(
                                    'code',
                                    e.target.value
                                        .replace(/\D/g, '')
                                        .slice(0, 6),
                                )
                            }
                            className="text-center tracking-[0.35em] text-lg font-bold"
                        />
                        {otpForm.errors.code && (
                            <p className="text-sm text-destructive text-center">
                                {otpForm.errors.code}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={otpForm.processing}
                        className="w-full"
                    >
                        {otpForm.processing && <Spinner className="mr-2" />}
                        {otpForm.processing ? 'Verifying...' : 'Verify'}
                    </Button>
                </form>

                {/* Actions */}
                <div className="w-full space-y-3">
                    <Form {...send.form()} className="w-full">
                        {({ processing }) => (
                            <Button 
                                type="submit" 
                                disabled={processing} 
                                variant="outline"
                                className="w-full"
                            >
                                {processing && <Spinner className="mr-2" />}
                                {processing ? 'Sending...' : 'Resend code'}
                            </Button>
                        )}
                    </Form>

                    <div className="text-center">
                        <TextLink
                            href={logout()}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Wrong email? Log out and sign up again
                        </TextLink>
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-center space-y-1 pt-2">
                    <p className="text-xs text-muted-foreground">
                        Didn't receive the email? Check your spam folder or try resending.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        The verification code expires in 10 minutes.
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
