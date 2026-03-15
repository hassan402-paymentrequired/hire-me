import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Calendar, Sparkles, TrendingUp } from 'lucide-react';
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
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative box-border grid h-screen w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-8 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Side - Hero Section */}
            <div className="relative hidden h-full flex-col overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-8 text-white lg:flex lg:p-10">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDQwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xNCAyNmMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6bTAgNDBjLTIuMjEgMC00LTEuNzktNC00czEuNzktNCA0LTQgNCAxLjc5IDQgNC0xLjc5IDQtNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Logo and Brand */}
                <Link
                    href={home()}
                    className="group relative z-20 flex items-center font-['Sekuya'] text-lg font-semibold tracking-widest"
                    prefetch
                >
                    proxideck
                </Link>

                {/* Main Content */}
                <div className="relative z-20 flex min-h-0 flex-1 flex-col justify-center py-4 lg:py-8">
                    {/* Hero Text */}
                    <div className="mb-4 space-y-4 lg:mb-6 lg:space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
                            <Sparkles className="h-4 w-4" />
                            <span>Trusted by 10,000+ professionals</span>
                        </div>

                        <h2 className="text-2xl leading-tight font-bold lg:text-3xl">
                            Manage appointments
                            <br />
                            <span className="text-white/90">effortlessly</span>
                        </h2>

                        <p className="max-w-md text-sm leading-relaxed text-white/80 lg:text-base">
                            The all-in-one booking platform that helps service
                            professionals save time and grow their business.
                        </p>
                    </div>

                    {/* Feature List */}
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto lg:space-y-4">
                        {[
                            {
                                icon: Calendar,
                                title: '24/7 Online Booking',
                                description:
                                    'Accept appointments even while you sleep',
                            },
                            {
                                icon: TrendingUp,
                                title: 'Business Insights',
                                description:
                                    'Understand your busiest days and top services',
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10"
                            >
                                <div className="rounded-lg bg-white/10 p-2 transition-colors group-hover:bg-white/20">
                                    <feature.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs text-white/70">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex h-full w-full items-center justify-center overflow-y-auto lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-4 py-4 sm:w-[400px] sm:space-y-6 lg:py-0">
                    {/* Mobile Logo */}
                    <Link
                        href={home()}
                        className="relative z-20 mb-2 flex items-center justify-center gap-2 lg:hidden"
                    >
                        <AppLogoIcon />
                        
                    </Link>

                    {/* Title and Description */}
                    <div className="mb-2 flex flex-col items-start gap-1.5 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="max-w-sm text-sm leading-relaxed text-balance text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Form Content */}
                    <div className="w-full">{children}</div>
                </div>
            </div>
        </div>
    );
}
