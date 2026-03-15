import AppLogoIcon from '@/components/app-logo-icon';
import ToastNotification from '@/components/ui/toast-notification';
import { home } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';
import { PropsWithChildren } from 'react';

interface Step {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    status: 'current' | 'completed' | 'upcoming';
}

interface OnboardingLayoutProps extends PropsWithChildren {
    title: string;
    steps: Step[];
    currentStepId: string;
}

export default function OnboardingLayout({
    title,
    steps,
    currentStepId,
    children,
}: OnboardingLayoutProps) {
    const currentStepIndex = steps.findIndex((s) => s.id === currentStepId);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Head title={title} />

            {/* Sidebar / Left Panel */}
            <div className="hidden w-[400px] shrink-0 flex-col space-y-8 overflow-y-auto border-r bg-primary p-8 lg:flex">
                <div className="mb-8">
                    <Link
                        href={home()}
                        className="group relative z-20 flex items-center font-['Sekuya'] text-lg font-semibold tracking-widest text-white transition-opacity hover:opacity-90"
                        prefetch
                    >
                        <div className="mr-3 rounded-lg bg-white/10 p-2 backdrop-blur-sm transition-colors group-hover:bg-white/20">
                            <AppLogoIcon className="size-6 fill-current text-white" />
                        </div>
                        proxideck
                    </Link>
                </div>

                <div className="flex-1 space-y-8">
                    <div>
                        <div className="mb-6 text-sm font-medium tracking-wide text-white uppercase">
                            Get Started
                        </div>

                        <div className="space-y-6">
                            {steps.map((step, index) => {
                                const isCurrent = step.status === 'current';

                                return (
                                    <div key={step.id} className="flex gap-4">
                                        <div
                                            className={`flex size-10 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                                                isCurrent
                                                    ? 'border border-secondary/60 bg-primary text-white'
                                                    : 'bg-primary text-white'
                                            } `}
                                        >
                                            {isCurrent ? (
                                                <step.icon className="h-5 w-5" />
                                            ) : (
                                                <span className="text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <div
                                                className={`mb-1 text-sm font-semibold ${
                                                    isCurrent
                                                        ? 'text-white'
                                                        : 'text-white/60'
                                                }`}
                                            >
                                                {step.title}
                                            </div>
                                            <div
                                                className={`text-xs leading-relaxed ${
                                                    isCurrent
                                                        ? 'text-white/70'
                                                        : 'text-white/50'
                                                }`}
                                            >
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress Summary */}
                    <div className="space-y-3 rounded-lg bg-white/5 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-white">
                                Progress
                            </span>
                            <span className="font-bold text-white">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        {/* Fixed: removed stray 'w' character */}
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full rounded-full bg-white/40 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-white/70">
                            {currentStepIndex + 1} of {steps.length} steps
                            completed
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="space-y-3">
                    <div className="text-center text-xs text-white/60">
                        © {new Date().getFullYear()} proxideck. All rights
                        reserved.
                    </div>
                </div>
            </div>

            {/* Main Content / Right Panel — flex-1 + min-h-0 keeps scroll contained */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <main className="min-h-0 flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-4xl p-6 md:p-8 lg:p-10">
                        {/* Mobile Step Indicator */}
                        <div className="mb-8 lg:hidden">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="text-xs font-semibold tracking-wider text-primary uppercase">
                                    Step {currentStepIndex + 1} of{' '}
                                    {steps.length}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">
                                    {Math.round(progress)}% Complete
                                </div>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Page Content */}
                        <div className="space-y-6 pb-8">{children}</div>

                        <ToastNotification />
                    </div>
                </main>
            </div>
        </div>
    );
}
