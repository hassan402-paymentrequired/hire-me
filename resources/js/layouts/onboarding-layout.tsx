import BrandMark from '@/components/brand-mark';
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
        <div className="flex h-screen overflow-hidden bg-background">
            <Head title={title} />

            {/* Main Content / Left Panel — flex-1 + min-h-0 keeps scroll contained */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="relative mx-auto w-full max-w-5xl p-5 md:p-8 lg:p-10">
                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between lg:mb-10">
                            <Link
                                href={home()}
                                className="flex items-center gap-2.5"
                                prefetch
                            >
                                <BrandMark className="size-8 dark:hidden" />
                                <BrandMark
                                    className="hidden size-8 dark:block"
                                    onDark
                                />
                                <span className="font-['Sora'] text-xl font-bold tracking-[-0.03em] text-[#0E3B2E] dark:text-white">
                                    proxideck
                                </span>
                            </Link>
                            <div className="text-xs font-semibold text-muted-foreground lg:hidden">
                                Step {currentStepIndex + 1}/{steps.length}
                            </div>
                        </div>

                        {/* Mobile progress bar */}
                        <div className="mb-7 lg:hidden">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="text-[11px] font-semibold tracking-[0.18em] text-[#2F7D4F] uppercase dark:text-[#C8F169]">
                                    {steps[currentStepIndex]?.title || 'Step'}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">
                                    {Math.round(progress)}%
                                </div>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-[#0E3B2E] transition-all duration-500 dark:bg-[#C8F169]"
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

            {/* Right Panel - Steps on brand illustration */}
            <aside className="relative hidden min-h-screen w-[440px] shrink-0 flex-col overflow-hidden bg-[#0E3B2E] lg:flex">
                <img
                    src="/brand/banners/proxideck-auth-panel-dark.svg"
                    alt=""
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-[#0E3B2E]/55" />

                <div className="relative z-10 flex h-full flex-col overflow-y-auto p-8">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold tracking-[0.18em] text-white/75 uppercase">
                            Setup steps
                        </p>
                        <span className="rounded-full border border-[#C8F169]/35 bg-[#0E3B2E]/70 px-3 py-1 text-[11px] font-semibold text-[#C8F169] backdrop-blur-sm">
                            Onboarding
                        </span>
                    </div>

                    <ol className="mt-6 space-y-2">
                        {steps.map((step, index) => {
                            const isCurrent = step.status === 'current';
                            const isCompleted = step.status === 'completed';

                            return (
                                <li
                                    key={step.id}
                                    aria-current={
                                        isCurrent ? 'step' : undefined
                                    }
                                    className={cn(
                                        'flex gap-4 rounded-2xl border p-3.5 backdrop-blur-sm transition-colors',
                                        isCurrent
                                            ? 'border-[#C8F169]/40 bg-white/[0.12]'
                                            : 'border-transparent bg-[#0E3B2E]/40',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl',
                                            isCompleted
                                                ? 'bg-[#C8F169] text-[#0E3B2E]'
                                                : isCurrent
                                                  ? 'bg-white text-[#0E3B2E]'
                                                  : 'border border-white/20 text-white/70',
                                        )}
                                        aria-hidden="true"
                                    >
                                        {isCompleted ? (
                                            <Check
                                                className="h-5 w-5"
                                                strokeWidth={2.5}
                                            />
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
                                                'font-[Sora] text-sm font-semibold',
                                                isCurrent || isCompleted
                                                    ? 'text-white'
                                                    : 'text-white/70',
                                            )}
                                        >
                                            {step.title}
                                        </div>
                                        <div
                                            className={cn(
                                                'mt-1 text-xs leading-relaxed',
                                                isCurrent
                                                    ? 'text-white/80'
                                                    : 'text-white/60',
                                            )}
                                        >
                                            {step.description}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>

                    <div className="mt-auto pt-8">
                        <div className="rounded-2xl bg-white p-4 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center justify-between">
                                <span className="font-['Sora'] text-sm font-semibold text-[#13201B]">
                                    Your progress
                                </span>
                                <span className="font-['Sora'] text-sm font-bold text-[#0E3B2E]">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E6F4EC]">
                                <div
                                    className="h-full rounded-full bg-[#0E3B2E] transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-[#4A5A52]">
                                <span>
                                    Step {currentStepIndex + 1} of{' '}
                                    {steps.length}
                                </span>
                                <span>You’re close.</span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs text-white/65">
                            <span>© {new Date().getFullYear()} Proxideck</span>
                            <span>hello@proxideck.com</span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
