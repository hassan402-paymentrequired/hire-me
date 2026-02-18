import { LucideIcon } from 'lucide-react';
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
        <div className="h-screen bg-background flex overflow-hidden">
            <Head title={title} />

            {/* Sidebar / Left Panel */}
            <div className="hidden lg:flex flex-col w-[400px] border-r bg-primary p-8 space-y-8 overflow-y-auto shrink-0">
                <div className="mb-8">
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
                        <div className="text-sm font-medium text-white mb-6 uppercase tracking-wide">
                            Get Started
                        </div>

                        <div className="space-y-6">
                            {steps.map((step, index) => {
                                const isCurrent = step.status === 'current';

                                return (
                                    <div key={step.id} className="flex gap-4">
                                        <div className={`
                                            flex-shrink-0 size-10 rounded-lg flex items-center justify-center transition-all duration-200
                                            ${isCurrent
                                                ? 'bg-primary text-white border border-secondary/60'
                                                : 'bg-primary text-white'
                                            }
                                        `}>
                                            {isCurrent ? (
                                                <step.icon className="w-5 h-5" />
                                            ) : (
                                                <span className="text-sm font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="pt-0.5 flex-1">
                                            <div className={`font-semibold text-sm mb-1 ${
                                                isCurrent ? 'text-white' : 'text-white/60'
                                            }`}>
                                                {step.title}
                                            </div>
                                            <div className={`text-xs leading-relaxed ${
                                                isCurrent ? 'text-white/70' : 'text-white/50'
                                            }`}>
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress Summary */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white font-medium">Progress</span>
                            <span className="text-white font-bold">{Math.round(progress)}%</span>
                        </div>
                        {/* Fixed: removed stray 'w' character */}
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white/40 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-white/70">
                            {currentStepIndex + 1} of {steps.length} steps completed
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="space-y-3">
                    <div className="text-xs text-white/60 text-center">
                        © {new Date().getFullYear()} Clockra. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Main Content / Right Panel — flex-1 + min-h-0 keeps scroll contained */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <main className="flex-1 min-h-0 overflow-y-auto">
                    <div className="max-w-4xl mx-auto w-full p-6 md:p-8 lg:p-10">
                        {/* Mobile Step Indicator */}
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

                        {/* Page Content */}
                        <div className="space-y-6 pb-8">
                            {children}
                        </div>

                        <ToastNotification />
                    </div>
                </main>
            </div>
        </div>
    );
}