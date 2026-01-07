import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Briefcase, CheckCircle2, Users, Calendar, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import becomeProviderRoute from '@/routes/become-provider';
import onboarding from '@/routes/onboarding';

interface Props {
    hasStartedOnboarding?: boolean;
}

export default function BecomeProvider({ hasStartedOnboarding }: Props) {
    const handleStartSetup = () => {
        router.post(becomeProviderRoute.store().url);
    };

    const benefits = [
        {
            icon: Users,
            title: 'Reach More Clients',
            description: 'Get discovered by customers looking for your services in your area.',
        },
        {
            icon: Calendar,
            title: 'Manage Your Schedule',
            description: 'Control your availability and let clients book appointments that work for you.',
        },
        {
            icon: DollarSign,
            title: 'Earn More Income',
            description: 'Grow your business with a steady stream of bookings and payments.',
        },
        {
            icon: TrendingUp,
            title: 'Build Your Reputation',
            description: 'Collect reviews and ratings to build trust with potential clients.',
        },
    ];

    return (
        <GuestLayout>
            <Head title="Become a Provider" />

            <div className="min-h-screen bg-background">
                <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center size-16 bg-primary/10 rounded-full mb-6">
                            <Briefcase className="size-8 text-primary" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                            Start Offering Your Services
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Join our marketplace and connect with clients who need your expertise. 
                            Set up your provider profile in just a few minutes.
                        </p>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <benefit.icon className="size-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">
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
                    <div className="bg-muted/30 rounded-lg border p-8 mb-12">
                        <h2 className="text-xl font-semibold mb-6 text-center">
                            Quick Setup Process
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                                    1
                                </div>
                                <h3 className="font-medium mb-2">Business Profile</h3>
                                <p className="text-sm text-muted-foreground">
                                    Add your business details, location, and description
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                                    2
                                </div>
                                <h3 className="font-medium mb-2">Work Hours</h3>
                                <p className="text-sm text-muted-foreground">
                                    Set your availability and working schedule
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                                    3
                                </div>
                                <h3 className="font-medium mb-2">Services</h3>
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
                                className="px-8 h-12 text-base"
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
                    <div className="mt-12 pt-8 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <CheckCircle2 className="size-5 text-primary mx-auto mb-2" />
                                <p className="text-sm font-medium">Free to Join</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    No upfront costs
                                </p>
                            </div>
                            <div>
                                <CheckCircle2 className="size-5 text-primary mx-auto mb-2" />
                                <p className="text-sm font-medium">Secure Payments</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Get paid through our platform
                                </p>
                            </div>
                            <div>
                                <CheckCircle2 className="size-5 text-primary mx-auto mb-2" />
                                <p className="text-sm font-medium">Full Control</p>
                                <p className="text-xs text-muted-foreground mt-1">
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
