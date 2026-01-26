// Components
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head, usePage } from '@inertiajs/react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { auth } = usePage().props as any;
    const userEmail = auth?.user?.email || 'your email';

    return (
        <AuthLayout
            title="Verify your email address"
            description={`We've sent a verification link to your email address ${userEmail}`}
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
                            <span>A new verification link has been sent to your email address.</span>
                        </div>
                    </div>
                )}

               

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
                                {processing ? 'Sending...' : 'Resend verification email'}
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
                        The verification link will expire in 24 hours.
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
