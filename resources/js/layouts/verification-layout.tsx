import AppLogo from '@/components/app-logo';
import ToastNotification from '@/components/ui/toast-notification';
import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

interface VerificationLayoutProps {
    title?: string;
    children: React.ReactNode;
}

export default function VerificationLayout({
    title = 'Verification',
    children,
}: VerificationLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <Head title={title} />

            {/* Header */}
            <header className="border-b">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                 <AppLogo />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
                <div className="w-full max-w-4xl">
                    <div className="mb-8 text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {title}
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Verify your identity to make your business visible
                            to clients
                        </p>
                    </div>
                    <div className="rounded border bg-card p-6 ">
                        {children}
                    </div>
                </div>
            </main>

            <ToastNotification />
        </div>
    );
}
