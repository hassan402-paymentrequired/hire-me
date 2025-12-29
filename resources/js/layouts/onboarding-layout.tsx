import { LucideIcon, CheckCircle2, Circle } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { home } from '@/routes';
import AppLogoIcon from '@/components/app-logo-icon';

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
    return (
        <div className="min-h-screen bg-background flex">
            <Head title={title} />

            {/* Sidebar / Left Panel */}
            <div className="hidden lg:flex flex-col w-[400px] border-r bg-smoke-900 p-8 space-y-8">
                <div className="mb-8">
                    {/* Brand or Logo Placeholer */}
                    <Link
                        href={home()}
                        className="relative text-smoke-50 z-20 flex items-center text-lg font-medium"
                    >
                        <AppLogoIcon className="mr-2 size-8 fill-current fill-white" />
                        hello
                    </Link>
                </div>

                <div className="flex-1 space-y-8">
                    <div>
                        <div className="text-sm font-medium text-smoke-50 mb-6">
                            GET STARTED
                        </div>

                        <div className="space-y-0 relative">
                            {/* Connector Line */}
                            <div className="absolute left-4 top-2 bottom-6 w-px bg-muted-foreground/20 -z-10" />

                            {steps.map((step, index) => (
                                <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                                    <div className={`
                                        flex-shrink-0 size-9 rounded border-2 flex items-center justify-center bg-smoke-500
                                        ${step.status === 'completed' ? 'border-primary text-smoke-50' : ''}
                                        ${step.status === 'current' ? 'border-smoke-400 text-smoke-900 ring-2 ring-smoke-500/10' : ''}
                                        ${step.status === 'upcoming' ? 'border-smoke-500/30 text-smoke-50' : ''}
                                    `}>
                                        {step.status === 'completed' ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <step.icon className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div className="pt-1">
                                        <div className={`font-semibold text-sm ${
                                            step.status === 'upcoming' ? 'text-smoke-50' : 'text-smoke-100'
                                        }`}>
                                            {step.title}
                                        </div>
                                        <div className="text-xs text-smoke-200 mt-1 leading-relaxed max-w-[240px]">
                                            {step.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer or Help Link */}
                <div className="text-xs text-muted-foreground">
                    Need help? <a href="#" className="underline">Contact Support</a>
                </div>
            </div>

            {/* Main Content / Right Panel */}
            <div className="flex-1 flex flex-col">
                <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full p-8 md:p-6 lg:p-8">
                     {/* Step Indicator for Mobile */}
                    <div className="lg:hidden mb-8">
                       <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
                           Step {steps.findIndex(s => s.id === currentStepId) + 1} of {steps.length}
                       </div>
                       <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                           <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${((steps.findIndex(s => s.id === currentStepId) + 1) / steps.length) * 100}%` }}
                           />
                       </div>
                    </div>

                    {children}
                </main>
            </div>
        </div>
    );
}
