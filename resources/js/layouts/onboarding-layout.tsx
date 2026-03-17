import AppLogoIcon from '@/components/app-logo-icon';
import ToastNotification from '@/components/ui/toast-notification';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { Check, LucideIcon } from 'lucide-react';
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
        <div className="flex min-h-screen overflow-hidden bg-background">
            <Head title={title} />

            {/* Sidebar / Left Panel */}
            <div className="relative hidden w-[420px] shrink-0 flex-col overflow-hidden border-r lg:flex">
                <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_-10%_-10%,rgba(255,255,255,0.14),transparent_55%),radial-gradient(900px_circle_at_110%_20%,rgba(255,255,255,0.10),transparent_50%),linear-gradient(180deg,#0B1220_0%,#071018_100%)]" />
                <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:24px_24px] [background-position:0_0]" />

                <div className="relative z-10 flex h-full flex-col p-8">
                    <div className="flex items-center justify-between">
                        <Link
                            href={home()}
                            className="group flex items-center gap-3"
                            prefetch
                        >
                            <span className="font-['Sekuya'] text-lg font-semibold tracking-widest text-white">
                                proxideck
                            </span>
                        </Link>

                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/80">
                            Onboarding
                        </div>
                    </div>

                    <div className="mt-10">
                        <p className="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
                            Setup Steps
                        </p>

                        <div className="mt-6 space-y-5">
                            {steps.map((step, index) => {
                                const isCurrent = step.status === 'current';
                                const isCompleted = step.status === 'completed';

                                return (
                                    <div
                                        key={step.id}
                                        className={cn(
                                            'group flex gap-4 rounded-xl p-3 transition-colors',
                                            isCurrent
                                                ? 'bg-white/10'
                                                : 'hover:bg-white/[0.06]',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border text-white',
                                                isCurrent
                                                    ? 'border-white/25 bg-white/10'
                                                    : isCompleted
                                                      ? 'border-emerald-300/25 bg-emerald-300/10'
                                                      : 'border-white/10 bg-white/5',
                                            )}
                                            aria-hidden="true"
                                        >
                                            {isCompleted ? (
                                                <Check className="h-5 w-5 text-emerald-200" />
                                            ) : isCurrent ? (
                                                <step.icon className="h-5 w-5" />
                                            ) : (
                                                <span className="text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div
                                                className={cn(
                                                    'text-sm font-semibold',
                                                    isCurrent
                                                        ? 'text-white'
                                                        : isCompleted
                                                          ? 'text-white/85'
                                                          : 'text-white/60',
                                                )}
                                            >
                                                {step.title}
                                            </div>
                                            <div
                                                className={cn(
                                                    'mt-1 text-xs leading-relaxed',
                                                    isCurrent
                                                        ? 'text-white/75'
                                                        : 'text-white/55',
                                                )}
                                            >
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-auto pt-8">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-white">
                                    Progress
                                </span>
                                <span className="font-bold text-white">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full bg-white/45 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-white/70">
                                <span>
                                    Step {currentStepIndex + 1} of{' '}
                                    {steps.length}
                                </span>
                                <span className="text-white/55">
                                    You’re close.
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs text-white/55">
                            <span>
                                © {new Date().getFullYear()} proxideck
                            </span>
                            <span>Support: hello@proxideck.com</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content / Right Panel — flex-1 + min-h-0 keeps scroll contained */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <main className="min-h-0 flex-1 overflow-y-auto">
                    <div className="relative mx-auto w-full max-w-5xl p-5 md:p-8 lg:p-10">
                        {/* Mobile header */}
                        <div className="mb-6 flex items-center justify-between lg:hidden">
                            <Link href={home()} className="flex items-center gap-2" prefetch>
                                <AppLogoIcon className="w-24" />
                            </Link>
                            <div className="text-xs font-semibold text-muted-foreground">
                                Step {currentStepIndex + 1}/{steps.length}
                            </div>
                        </div>

                        {/* Mobile progress bar */}
                        <div className="mb-7 lg:hidden">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                                    {steps[currentStepIndex]?.title || 'Step'}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">
                                    {Math.round(progress)}%
                                </div>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Content (no card wrapper; keep it on the page background) */}
                        <div className="space-y-6 pb-10">{children}</div>

                        <ToastNotification />
                    </div>
                </main>
            </div>
        </div>
    );
}
