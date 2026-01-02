import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import {
    Calendar,
    Clock,
    Users,
    TrendingUp,
    CheckCircle2,
    Sparkles,
    ArrowRight
} from 'lucide-react';

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
        <div className="relative m-3 overflow-hidden grid h-screen flex-col box-border items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Side - Hero Section */}
            <div className="relative hidden overflow-hidden h-full flex-col rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-10 text-white lg:flex">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDQwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xNCAyNmMtMi4yMSAwLTQtMS43OS00LTRzMS43OS00IDQtNCA0IDEuNzkgNCA0LTEuNzkgNC00IDR6bTAgNDBjLTIuMjEgMC00LTEuNzktNC00czEuNzktNCA0LTQgNCAxLjc5IDQgNC0xLjc5IDQtNCA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Logo and Brand */}
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-semibold group tracking-widest font-['Sekuya']"
                    prefetch
                >
                    <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm mr-3 group-hover:bg-white/20 transition-colors">
                        <AppLogoIcon className="size-6 fill-current text-white" />
                    </div>
                    Clockra
                </Link>

                {/* Main Content */}
                <div className="relative z-20 flex flex-col justify-center flex-1 py-8">
                    {/* Hero Text */}
                    <div className="space-y-6 mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            <span>Trusted by 10,000+ professionals</span>
                        </div>

                        <h2 className="text-2xl  font-bold leading-tight">
                            Manage appointments
                            <br />
                            <span className="text-white/90">effortlessly</span>
                        </h2>

                        <p className="text-sm text-white/80 max-w-md leading-relaxed">
                            The all-in-one booking platform that helps service professionals save time and grow their business.
                        </p>
                    </div>

                    {/* Feature List */}
                    <div className="space-y-4">
                        {[
                            {
                                icon: Calendar,
                                title: '24/7 Online Booking',
                                description: 'Accept appointments even while you sleep'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Business Insights',
                                description: 'Understand your busiest days and top services'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group"
                            >
                                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                                        {feature.title}
                                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </h3>
                                    <p className="text-xs text-white/70">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    {/* Mobile Logo */}
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center gap-2 lg:hidden"
                    >
                        <AppLogoIcon className="h-10 fill-current text-primary sm:h-12" />
                        <span className="text-xl font-semibold tracking-widest font-['Sekuya']">{name}</span>
                    </Link>

                    {/* Title and Description */}
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-sm text-balance text-muted-foreground max-w-sm">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Form Content */}
                    {children}
                </div>
            </div>
        </div>
    );
}
