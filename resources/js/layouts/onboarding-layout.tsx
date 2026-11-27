import BrandMark from '@/components/brand-mark';
import ToastNotification from '@/components/ui/toast-notification';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { Check, Lightbulb, LucideIcon } from 'lucide-react';
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

const statusLabels: Record<Step['status'], string> = {
    completed: 'Done',
    current: 'In progress',
    upcoming: 'Next',
};

interface StepTip {
    title: string;
    text: string;
}

const stepTips: Record<string, StepTip> = {
    profile: {
        title: 'First impressions count',
        text: 'Add a clear cover photo and your exact area. It is the first thing clients see on your listing.',
    },
    hours: {
        title: 'Only open hours you can keep',
        text: 'Clients book straight into your open slots, so block out the times you are usually busy.',
    },
    services: {
        title: 'Name services the way clients search',
        text: 'Use names like "Knotless braids" or "Gel manicure" and include how long each one takes.',
    },
};

const defaultTip: StepTip = {
    title: 'You can change this later',
    text: 'Everything you add here can be edited from your dashboard once you are live.',
};

function SegmentedProgress({ steps }: { steps: Step[] }) {
    return (
        <div className="flex gap-1.5" aria-hidden>
            {steps.map((step) => (
                <div
                    key={step.id}
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                >
                    <div
                        className={cn(
                            'h-full rounded-full bg-forest transition-all duration-500 dark:bg-lime',
                            step.status === 'completed' && 'w-full',
                            step.status === 'current' && 'w-1/2',
                            step.status === 'upcoming' && 'w-0',
                        )}
                    />
                </div>
            ))}
        </div>
    );
}

function encouragement(stepsLeft: number): string {
    if (stepsLeft <= 0) {
        return 'Last step before verification.';
    }

    return stepsLeft === 1
        ? '1 step after this one.'
        : `${stepsLeft} steps after this one.`;
}

export default function OnboardingLayout({
    title,
    steps,
    currentStepId,
    children,
}: OnboardingLayoutProps) {
    const currentStepIndex = Math.max(
        steps.findIndex((s) => s.id === currentStepId),
        0,
    );
    const currentStep = steps[currentStepIndex];
    const stepsLeft = steps.length - currentStepIndex - 1;

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
                                <span className="font-['Sora'] text-xl font-bold tracking-[-0.03em] text-forest dark:text-white">
                                    proxideck
                                </span>
                            </Link>
                            <div className="text-xs font-semibold text-muted-foreground lg:hidden">
                                Step {currentStepIndex + 1} of {steps.length}
                            </div>
                        </div>

                        {/* Mobile progress */}
                        <div className="mb-7 flex flex-col gap-2.5 lg:hidden">
                            <div className="flex items-baseline justify-between gap-3">
                                <span className="font-['Sora'] text-sm font-bold text-forest dark:text-lime">
                                    {currentStep?.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {encouragement(stepsLeft)}
                                </span>
                            </div>
                            <SegmentedProgress steps={steps} />
                        </div>

                        {/* Content (no card wrapper; keep it on the page background) */}
                        <div className="space-y-6 pb-10">{children}</div>

                        <ToastNotification />
                    </div>
                </main>
            </div>

            {/* Right Panel - Steps on brand illustration */}
            <aside className="relative hidden min-h-screen w-[440px] shrink-0 flex-col overflow-hidden bg-forest lg:flex">
                <img
                    src="/brand/banners/proxideck-auth-panel-dark.svg"
                    alt=""
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/55 to-forest/90" />

                <div className="relative z-10 flex h-full flex-col overflow-y-auto p-9">
                    {/* Current step headline */}
                    <div className="flex items-end gap-4">
                        <span className="font-['Sora'] text-[72px] leading-[0.8] font-bold tracking-[-0.05em] text-lime">
                            {String(currentStepIndex + 1).padStart(2, '0')}
                        </span>
                        <span className="pb-1 text-sm font-medium text-sage">
                            of {String(steps.length).padStart(2, '0')}
                        </span>
                    </div>
                    <h2 className="mt-5 font-['Sora'] text-[28px] leading-tight font-bold tracking-tight text-white">
                        {currentStep?.title}
                    </h2>
                    <p className="mt-2 max-w-80 text-[15px] leading-relaxed text-[#C9E2D3]">
                        {currentStep?.description}
                    </p>

                    {/* Timeline */}
                    <ol className="mt-10">
                        {steps.map((step, index) => {
                            const isCurrent = step.status === 'current';
                            const isCompleted = step.status === 'completed';
                            const isLast = index === steps.length - 1;

                            return (
                                <li
                                    key={step.id}
                                    aria-current={
                                        isCurrent ? 'step' : undefined
                                    }
                                    className="flex gap-4"
                                >
                                    <div className="flex flex-col items-center">
                                        <span
                                            aria-hidden
                                            className={cn(
                                                'grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors',
                                                isCompleted &&
                                                    'bg-lime text-forest',
                                                isCurrent &&
                                                    'bg-white text-forest ring-4 ring-lime/30',
                                                !isCompleted &&
                                                    !isCurrent &&
                                                    'border border-dashed border-white/35 text-white/60',
                                            )}
                                        >
                                            {isCompleted ? (
                                                <Check
                                                    className="size-4"
                                                    strokeWidth={3}
                                                />
                                            ) : isCurrent ? (
                                                <step.icon className="size-4" />
                                            ) : (
                                                index + 1
                                            )}
                                        </span>
                                        {!isLast && (
                                            <span
                                                aria-hidden
                                                className={cn(
                                                    'my-1 w-0.5 flex-1 rounded-full',
                                                    isCompleted
                                                        ? 'bg-lime'
                                                        : 'bg-white/15',
                                                )}
                                            />
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            'min-w-0 flex-1 pt-1.5',
                                            !isLast && 'pb-7',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "font-['Sora'] text-[15px] font-semibold",
                                                isCurrent
                                                    ? 'text-white'
                                                    : isCompleted
                                                      ? 'text-white/85'
                                                      : 'text-white/55',
                                            )}
                                        >
                                            {step.title}
                                        </div>
                                        <div
                                            className={cn(
                                                'mt-0.5 text-[13px]',
                                                isCurrent
                                                    ? 'text-lime'
                                                    : 'text-white/45',
                                            )}
                                        >
                                            {statusLabels[step.status]}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>

                    {/* Listing preview */}
                    <div className="mt-auto pt-10">
                        <div className="flex gap-3.5 rounded-3xl bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
                            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint text-forest">
                                <Lightbulb className="size-4.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="font-['Sora'] text-[15px] font-bold text-ink">
                                    {(currentStep &&
                                        stepTips[currentStep.id]?.title) ??
                                        defaultTip.title}
                                </div>
                                <p className="mt-1 text-[13px] leading-relaxed text-moss">
                                    {(currentStep &&
                                        stepTips[currentStep.id]?.text) ??
                                        defaultTip.text}
                                </p>
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
