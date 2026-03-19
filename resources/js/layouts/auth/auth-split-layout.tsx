import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { Calendar, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-screen overflow-hidden bg-background">
            {/* Left Side - Hero / Brand */}
            <div className="relative hidden w-[420px] shrink-0 flex-col overflow-hidden border-r lg:flex">
                <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_-10%_-10%,rgba(255,255,255,0.14),transparent_55%),radial-gradient(900px_circle_at_110%_20%,rgba(255,255,255,0.10),transparent_50%),linear-gradient(180deg,#0B1220_0%,#071018_100%)]" />
                <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:24px_24px] [background-position:0_0] opacity-[0.08]" />

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
                            Access
                        </div>
                    </div>

                    <div className="mt-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-white/80" />
                            <span>Built for service professionals</span>
                        </div>

                        <h2 className="mt-6 text-2xl leading-tight font-bold text-white uppercase">
                            Bookings that feel
                            <br />
                            <span className="text-white/85">
                                simple and fast
                            </span>
                        </h2>

                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                            Run your schedule, services, staff, and client
                            bookings from one place.
                        </p>

                        <div className="mt-7 space-y-4">
                            {[
                                {
                                    icon: Calendar,
                                    title: '24/7 Online Booking',
                                    description:
                                        'Clients book anytime, you stay in control.',
                                },
                                {
                                    icon: TrendingUp,
                                    title: 'Clear Business Insights',
                                    description:
                                        'Know what’s working and what to improve.',
                                },
                                {
                                    icon: ShieldCheck,
                                    title: 'Reliable Confirmations',
                                    description:
                                        'Reduce no-shows with smart reminders.',
                                },
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/[0.08]"
                                >
                                    <div className="rounded-lg bg-white/10 p-2 transition-colors group-hover:bg-white/15">
                                        <feature.icon className="h-5 w-5 text-white/90" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-white">
                                            {feature.title}
                                        </div>
                                        <div className="mt-1 text-xs leading-relaxed text-white/65">
                                            {feature.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-8">
                        <div className="mt-4 flex items-center justify-between text-xs text-white/55">
                            <span>© {new Date().getFullYear()} proxideck</span>
                            <span>Support: hello@proxideck.com</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex min-h-screen flex-1 items-center justify-center overflow-hidden">
                <main className="flex min-h-screen w-full items-center justify-center overflow-y-auto">
                    <div className="relative mx-auto w-full max-w-5xl p-5 md:p-8 lg:p-10">
                        {/* Mobile Brand */}
                        <div className="mb-6 flex items-center justify-between lg:hidden">
                            <Link
                                href={home()}
                                className="font-['Sekuya'] text-base font-semibold tracking-widest"
                                prefetch
                            >
                                proxideck
                            </Link>
                        </div>

                        {/* Title and Description */}
                        <div className="mb-6 flex flex-col items-start gap-1.5 text-left sm:items-center sm:text-center">
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                {title}
                            </h1>
                            {description && (
                                <p className="max-w-sm text-sm leading-relaxed text-balance text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Form Content (plain background; no card wrapper) */}
                        <div className="mx-auto h-full w-full max-w-[420px] place-content-center">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
