import React, { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { 
    CheckCircle2, 
    ArrowRight, 
    LayoutDashboard, 
    ShieldCheck, 
    Sparkles,
} from 'lucide-react';
import { BuildingOfficeIcon, ArrowTrendingUpIcon, UsersIcon } from '@heroicons/react/24/solid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    is_verified?: boolean;
}

// Confetti component
const Confetti = () => {
    const [confetti, setConfetti] = useState<Array<{
        id: number;
        left: number;
        delay: number;
        duration: number;
        color: string;
        size: number;
    }>>([]);

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
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
const FloatingEmoji = ({ emoji, delay, left }: { emoji: string; delay: number; left: number }) => {
    return (
        <div
            className="absolute text-4xl pointer-events-none"
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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
            <Head title="Success - Business Setup Complete" />

            {/* Confetti Effect */}
            {showCelebration && <Confetti />}

            {/* Floating Emojis */}
            {showCelebration && (
                <div className="fixed inset-0 pointer-events-none z-10">
                    {['🎉', '🎊', '✨', '🌟', '🎈', '🎁', '🥳', '🎯'].map((emoji, i) => (
                        <FloatingEmoji
                            key={i}
                            emoji={emoji}
                            delay={i * 0.3}
                            left={10 + (i * 12)}
                        />
                    ))}
                </div>
            )}

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 relative z-20">
                {/* Success Animation */}
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-6">
                        {/* Pulsing glow effect */}
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                        <div className="absolute inset-0 bg-green-400/30 rounded-full blur-xl animate-ping" style={{ animationDuration: '2s' }} />
                        
                        {/* Main success icon with scale animation */}
                        <div className="relative size-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-scale-in">
                            <CheckCircle2 className="size-12 text-white animate-bounce" style={{ animationDuration: '1.5s' }} />
                        </div>
                        
                        {/* Sparkle effects around the icon */}
                        <div className="absolute -top-2 -right-2">
                            <Sparkles className="size-6 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <div className="absolute -top-1 -left-2">
                            <Sparkles className="size-5 text-yellow-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <div className="absolute -bottom-2 left-0">
                            <Sparkles className="size-4 text-yellow-500 animate-bounce" style={{ animationDelay: '0.6s' }} />
                        </div>
                        <div className="absolute top-1/2 -right-4">
                            <Sparkles className="size-5 text-yellow-400 animate-bounce" style={{ animationDelay: '0.8s' }} />
                        </div>
                    </div>

                    {/* Animated title */}
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-green-600 via-primary to-green-600 bg-clip-text text-transparent animate-gradient-x">
                        🎉 Congratulations! 🎉
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up">
                        You've successfully set up your business profile. You're one step away from going live!
                    </p>
                </div>

                

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <CardHeader>
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors group-hover:scale-110">
                                <BuildingOfficeIcon className="size-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">Manage Your Business</CardTitle>
                            <CardDescription>
                                Access your dashboard to manage appointments, services, and settings.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <CardHeader>
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors group-hover:scale-110">
                                <ArrowTrendingUpIcon className="size-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">Grow Your Business</CardTitle>
                            <CardDescription>
                                {userIsVerified 
                                    ? "Your business is live! Start receiving bookings from clients."
                                    : "Complete verification to start receiving bookings from clients."
                                }
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <CardHeader>
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors group-hover:scale-110">
                                <UsersIcon className="size-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">Build Trust</CardTitle>
                            <CardDescription>
                                {userIsVerified 
                                    ? "You're verified! Clients can trust your business."
                                    : "Get verified to build trust and credibility with clients."
                                }
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Next Steps */}
                <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="size-5 text-primary animate-pulse" />
                            What's Next?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {!userIsVerified ? (
                                <>
                                    <div className="flex items-start gap-3">
                                        <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-semibold">Complete Identity Verification</p>
                                            <p className="text-sm text-muted-foreground">
                                                Upload a government-issued ID to verify your identity. This is required for your business to be visible to clients.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="size-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            2
                                        </div>
                                        <div>
                                            <p className="font-semibold">Go to Your Dashboard</p>
                                            <p className="text-sm text-muted-foreground">
                                                Manage your appointments, services, and business settings.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-3">
                                        <div className="size-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            ✓
                                        </div>
                                        <div>
                                            <p className="font-semibold">You're Verified!</p>
                                            <p className="text-sm text-muted-foreground">
                                                Your business is now live and visible to clients on the marketplace.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-semibold">Start Managing Your Business</p>
                                            <p className="text-sm text-muted-foreground">
                                                Access your dashboard to manage appointments, services, and grow your business.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    {!userIsVerified ? (
                        <>
                            <Link href="/onboarding/verification">
                                <Button size="lg" className="h-12 px-8 gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-pulse-once">
                                    <ShieldCheck className="size-5" />
                                    Verify Your Identity
                                    <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                            <Link href="/business">
                                <Button variant="outline" size="lg" className="h-12 px-8 hover:scale-105 transition-all">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/business">
                                <Button size="lg" className="h-12 px-8 gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-pulse-once">
                                    <LayoutDashboard className="size-5" />
                                    Go to Dashboard
                                    <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" size="lg" className="h-12 px-8 hover:scale-105 transition-all">
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
