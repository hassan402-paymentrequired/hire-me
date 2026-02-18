import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import becomeProviderRoute from '@/routes/become-provider';
import {
    ArrowTrendingUpIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    UsersIcon,
} from '@heroicons/react/24/solid';
import { Head, router } from '@inertiajs/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
    hasStartedOnboarding?: boolean;
}

export default function BecomeProvider({ hasStartedOnboarding }: Props) {
    const handleStartSetup = () => {
        router.post(becomeProviderRoute.store().url);
    };

    const benefits = [
        {
            icon: UsersIcon,
            title: 'Reach More Clients',
            description:
                'Get discovered by customers looking for your services in your area.',
        },
        {
            icon: CalendarIcon,
            title: 'Manage Your Schedule',
            description:
                'Control your availability and let clients book appointments that work for you.',
        },
        {
            icon: CurrencyDollarIcon,
            title: 'Earn More Income',
            description:
                'Grow your business with a steady stream of bookings and payments.',
        },
        {
            icon: ArrowTrendingUpIcon,
            title: 'Build Your Reputation',
            description:
                'Collect reviews and ratings to build trust with potential clients.',
        },
    ];

    return (
        <GuestLayout>
            <Head title="Become a Provider" />

            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-5xl px-4 py-12 md:py-20">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        {/* <div className="mb-6 inline-flex items-center justify-center">
                            <img
                                src="/assets/gifs/statistics.gif"
                                alt="Statistics"
                                className="size-16 object-contain"
                            />
                        </div> */}
                        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                            Start Offering Your Services
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                            Join our marketplace and connect with clients who
                            need your expertise. Set up your provider profile in
                            just a few minutes.
                        </p>
                    </div>

                    {/* Benefits Grid */}
                    <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="rounded-lg border bg-card p-6 transition-colors hover:border-primary/50"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <benefit.icon className="size-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Setup Steps */}
                    <div className="mb-12 rounded-lg border bg-muted/30 p-8">
                        <h2 className="mb-6 text-center text-xl font-semibold">
                            Quick Setup Process
                        </h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="text-center">
                                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                                    1
                                </div>
                                <h3 className="mb-2 font-medium">
                                    Business Profile
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Add your business details, location, and
                                    description
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                                    2
                                </div>
                                <h3 className="mb-2 font-medium">Work Hours</h3>
                                <p className="text-sm text-muted-foreground">
                                    Set your availability and working schedule
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                                    3
                                </div>
                                <h3 className="mb-2 font-medium">Services</h3>
                                <p className="text-sm text-muted-foreground">
                                    Add the services you offer with pricing
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <div className="inline-flex flex-col items-center gap-4">
                            <Button
                                size="lg"
                                onClick={handleStartSetup}
                                className="h-12 px-8 text-base"
                            >
                                Start Setup
                                <ArrowRight className="ml-2 size-5" />
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                It only takes a few minutes to get started
                            </p>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-12 border-t pt-8">
                        <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
                            <div>
                                <CheckCircle2 className="mx-auto mb-2 size-5 text-primary" />
                                <p className="text-sm font-medium">
                                    Free to Join
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    No upfront costs
                                </p>
                            </div>
                            <div>
                                <CheckCircle2 className="mx-auto mb-2 size-5 text-primary" />
                                <p className="text-sm font-medium">
                                    Secure Payments
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Get paid through our platform
                                </p>
                            </div>
                            <div>
                                <CheckCircle2 className="mx-auto mb-2 size-5 text-primary" />
                                <p className="text-sm font-medium">
                                    Full Control
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Manage your business your way
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
