import { LucideIcon, CheckCircle2, HelpCircle, ArrowLeft } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { home } from '@/routes';
import AppLogoIcon from '@/components/app-logo-icon';
import ToastNotification from '@/components/ui/toast-notification';

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

export default function OnboardingLayout({ title, steps, currentStepId, children }: OnboardingLayoutProps) {
    const currentStepIndex = steps.findIndex(s => s.id === currentStepId);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    return (
        <div className="min-h-screen bg-background flex">
            <Head title={title} />

            {/* Sidebar / Left Panel */}
            <div className="hidden lg:flex flex-col w-[400px] border-r bg-smoke-900 p-8 space-y-8">
                <div className="mb-8">
                    {/* Brand Logo */}
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center text-lg font-semibold group tracking-widest font-['Sekuya'] text-white hover:opacity-90 transition-opacity"
                        prefetch
                    >
                        <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm mr-3 group-hover:bg-white/20 transition-colors">
                            <AppLogoIcon className="size-6 fill-current text-white" />
                        </div>
                        Clockra
                    </Link>
                </div>

                <div className="flex-1 space-y-8">
                    <div>
                        <div className="text-sm font-medium text-smoke-50 mb-6 uppercase tracking-wide">
                            Get Started
                        </div>

                        <div className="space-y-0 relative">
                            {/* Connector Line */}
                            <div className="absolute left-4 top-2 bottom-6 w-px bg-muted-foreground/20 -z-10" />

                            {steps.map((step, index) => {
                                const isCompleted = step.status === 'completed';
                                const isCurrent = step.status === 'current';
                                const isUpcoming = step.status === 'upcoming';

                                return (
                                    <div
                                        key={step.id}
                                        className={`relative flex gap-4 pb-8 last:pb-0 transition-opacity duration-200 ${
                                            isUpcoming ? 'opacity-60' : ''
                                        }`}
                                    >
                                        <div className={`
                                            flex-shrink-0 size-9 rounded border-2 flex items-center justify-center bg-smoke-500 transition-all duration-200
                                            ${isCompleted ? 'border-primary text-smoke-50 shadow-lg shadow-primary/20' : ''}
                                            ${isCurrent ? 'border-smoke-400 text-smoke-900 ring-2 ring-smoke-500/10 scale-110' : ''}
                                            ${isUpcoming ? 'border-smoke-500/30 text-smoke-50' : ''}
                                        `}>
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : isCurrent ? (
                                                <step.icon className="w-4 h-4" />
                                            ) : (
                                                <span className="text-xs font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="pt-1 flex-1">
                                            <div className={`font-semibold text-sm mb-1 ${
                                                isUpcoming ? 'text-smoke-50' : 'text-smoke-100'
                                            }`}>
                                                {step.title}
                                            </div>
                                            <div className="text-xs text-smoke-200 leading-relaxed max-w-[240px]">
                                                {step.description}
                                            </div>
                                            {isCompleted && (
                                                <div className="mt-2 inline-block text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                                                    Completed
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress Summary */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-smoke-100 font-medium">Progress</span>
                            <span className="text-white font-bold">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-smoke-200">
                            {currentStepIndex + 1} of {steps.length} steps completed
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="space-y-3">
                    {/*<div className="flex items-center gap-2 text-smoke-100 text-sm bg-white/5 backdrop-blur-sm rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer">*/}
                    {/*    <HelpCircle className="w-4 h-4 flex-shrink-0" />*/}
                    {/*    <span>Need help?</span>*/}
                    {/*    <a href="#" className="ml-auto text-white font-medium hover:underline">*/}
                    {/*        Contact Support*/}
                    {/*    </a>*/}
                    {/*</div>*/}

                    <div className="text-xs text-smoke-200/60 text-center">
                        © 2026 Clockra. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Main Content / Right Panel */}
            <div className="flex-1 flex flex-col">
                <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full p-8 md:p-6 lg:p-8">
                    {/* Step Indicator for Mobile */}
                    <div className="lg:hidden mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                                Step {currentStepIndex + 1} of {steps.length}
                            </div>
                            <div className="text-xs font-medium text-muted-foreground">
                                {Math.round(progress)}% Complete
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Back Button */}
                    {currentStepIndex > 0 && (
                        <div className="mb-6">
                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to previous step
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="space-y-6 ">
                        {children}
                    </div>

                    {/* Help Footer */}
                    {/*<div className="mt-8 text-center">*/}
                    {/*    <p className="text-sm text-muted-foreground">*/}
                    {/*        Questions? Check out our{' '}*/}
                    {/*        <a href="#" className="text-primary hover:underline font-medium">*/}
                    {/*            setup guide*/}
                    {/*        </a>{' '}*/}
                    {/*        or{' '}*/}
                    {/*        <a href="#" className="text-primary hover:underline font-medium">*/}
                    {/*            contact support*/}
                    {/*        </a>*/}
                    {/*    </p>*/}
                    {/*</div>*/}

                    <ToastNotification />
                </main>
            </div>
        </div>
    );
}
