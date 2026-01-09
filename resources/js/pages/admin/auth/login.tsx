import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/login', {
            onSuccess: () => {
                router.visit('/admin/dashboard');
            },
        });
    };

    return (
        <AuthLayout
            title="Admin Login"
            description="Enter your admin credentials to access the admin panel"
        >
            <Head title="Admin Login" />

            <div className="mb-6 flex items-center justify-center">
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-primary">Admin Portal</span>
                </div>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            placeholder="admin@hireme.com"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) =>
                                setData('remember', checked === true)
                            }
                        />
                        <Label
                            htmlFor="remember"
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Remember me
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        tabIndex={3}
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Log in to Admin Panel
                    </Button>
                </div>
            </form>

            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:bg-amber-950/20">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> This is a secure admin area. Unauthorized access is prohibited.
                </p>
            </div>
        </AuthLayout>
    );
}
