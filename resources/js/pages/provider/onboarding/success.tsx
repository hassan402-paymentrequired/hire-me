import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ArrowTrendingUpIcon,
    BuildingOfficeIcon,
    UsersIcon,
} from '@heroicons/react/24/solid';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    LayoutDashboard,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    is_verified?: boolean;
}

// Confetti component
const Confetti = () => {
    const [confetti, setConfetti] = useState<
        Array<{
            id: number;
            left: number;
            delay: number;
            duration: number;
            color: string;
            size: number;
        }>
    >([]);

    useEffect(() => {
        const colors = [
            '#3B82F6', // blue
            '#10B981', // green
            '#F59E0B', // amber
            '#EF4444', // red
            '#8B5CF6', // purple
            '#EC4899', // pink
            '#06B6D4', // cyan
            '#F97316', // orange
        ];

        const particles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 3,
            duration: 3 + Math.random() * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 8 + Math.random() * 8,
        }));

        setConfetti(particles);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {confetti.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute rounded-full opacity-80"
                    style={{
                        left: `${particle.left}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        animation: `confetti-fall ${particle.duration}s ease-in ${particle.delay}s forwards`,
                        transform: 'translateY(-100vh)',
                    }}
                />
            ))}
            <style>{`
                @keyframes confetti-fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

// Floating emoji component
const FloatingEmoji = ({
    emoji,
    delay,
    left,
}: {
    emoji: string;
    delay: number;
    left: number;
}) => {
    return (
        <div
            className="pointer-events-none absolute text-4xl"
            style={{
                left: `${left}%`,
                animation: `float-up 4s ease-out ${delay}s forwards, fade-out 4s ease-out ${delay}s forwards`,
                transform: 'translateY(100vh)',
            }}
        >
            {emoji}
            <style>{`
                @keyframes float-up {
                    to {
                        transform: translateY(-100vh) rotate(360deg);
                    }
                }
                @keyframes fade-out {
                    0%, 50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default function Success({ is_verified }: Props) {
    const { auth } = usePage().props as any;
    const userIsVerified = is_verified ?? auth?.user?.is_verified ?? false;
    const [showCelebration, setShowCelebration] = useState(true);

    useEffect(() => {
        // Trigger celebration on mount
        const timer = setTimeout(() => {
            setShowCelebration(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
            <Head title="Success - Business Setup Complete" />

            {/* Confetti Effect */}
            {showCelebration && <Confetti />}

            {/* Floating Emojis */}
            {showCelebration && (
                <div className="pointer-events-none fixed inset-0 z-10">
                    {['🎉', '🎊', '✨', '🌟', '🎈', '🎁', '🥳', '🎯'].map(
                        (emoji, i) => (
                            <FloatingEmoji
                                key={i}
                                emoji={emoji}
                                delay={i * 0.3}
                                left={10 + i * 12}
                            />
                        ),
                    )}
                </div>
            )}

            <div className="relative z-20 mx-auto max-w-6xl font-heading px-6 py-12 md:py-20">
                {/* Success Animation */}
                <div className="mb-12 text-center">
                    <div className="relative mb-6 inline-block">
                       

                        {/* Main success icon with scale animation */}
                        <div className="animate-scale-in relative flex size-24 items-center justify-center ">
                            <img  src='/assets/illustrations/check-success.png' alt='check-icon'/>
                        </div>

                    </div>

                    {/* Animated title */}
                    <h1 className="animate-gradient-x mb-4 bg-gradient-to-r from-green-600 via-primary to-green-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                        🎉 Congratulations! 🎉
                    </h1>
                    <p className="animate-fade-in-up mx-auto max-w-2xl text-lg text-muted-foreground">
                        You've successfully set up your business profile. You're
                        one step away from going live!
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card
                        className="group animate-fade-in-up border transition-all hover:border-primary/50 hover:shadow-lg"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <CardHeader>
                            <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:scale-110 group-hover:bg-primary/20">
                                <BuildingOfficeIcon className="size-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">
                                Manage Your Business
                            </CardTitle>
                            <CardDescription>
                                Access your dashboard to manage appointments,
                                services, and settings.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="group animate-fade-in-up border transition-all hover:border-primary/50 hover:shadow-lg"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <CardHeader>
                            <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:scale-110 group-hover:bg-primary/20">
                                <ArrowTrendingUpIcon className="size-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">
                                Grow Your Business
                            </CardTitle>
                            <CardDescription>
                                {userIsVerified
                                    ? 'Your business is live! Start receiving bookings from clients.'
                                    : 'Complete verification to start receiving bookings from clients.'}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card
                        className="group animate-fade-in-up border transition-all hover:border-primary/50 hover:shadow-lg"
                        style={{ animationDelay: '0.3s' }}
                    >
                        <CardHeader>
                            <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:scale-110 group-hover:bg-primary/20">
                                <UsersIcon className="size-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">
                                Build Trust
                            </CardTitle>
                            <CardDescription>
                                {userIsVerified
                                    ? "You're verified! Clients can trust your business."
                                    : 'Get verified to build trust and credibility with clients.'}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Next Steps */}
                <Card
                    className="animate-fade-in-up mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
                    style={{ animationDelay: '0.4s' }}
                >
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="size-5 animate-pulse text-primary" />
                            What's Next?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {!userIsVerified ? (
                                <>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                Complete Identity Verification
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Upload a government-issued ID to
                                                verify your identity. This is
                                                required for your business to be
                                                visible to clients.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                            2
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                Go to Your Dashboard
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Manage your appointments,
                                                services, and business settings.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                                            ✓
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                You're Verified!
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Your business is now live and
                                                visible to clients on the
                                                marketplace.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                Start Managing Your Business
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Access your dashboard to manage
                                                appointments, services, and grow
                                                your business.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div
                    className="animate-fade-in-up flex flex-col items-center justify-center gap-4 sm:flex-row"
                    style={{ animationDelay: '0.5s' }}
                >
                    {!userIsVerified ? (
                        <>
                            <Link href="/onboarding/verification">
                                <Button
                                    size="lg"
                                    className="animate-pulse-once h-12 gap-2 px-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                                >
                                    <ShieldCheck className="size-5" />
                                    Verify Your Identity
                                    <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                            <Link href="/business">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-12 px-8 transition-all hover:scale-105"
                                >
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/business">
                                <Button
                                    size="lg"
                                    className="animate-pulse-once h-12 gap-2 px-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                                >
                                    <LayoutDashboard className="size-5" />
                                    Go to Dashboard
                                    <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-12 px-8 transition-all hover:scale-105"
                                >
                                    View Marketplace
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
