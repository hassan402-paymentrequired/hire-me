import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { 
    CheckCircle2, 
    ArrowRight, 
    LayoutDashboard, 
    Store, 
    ShieldCheck, 
    Sparkles,
    TrendingUp,
    Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Props {
    is_verified?: boolean;
}

export default function Success({ is_verified }: Props) {
    const { auth } = usePage().props as any;
    const userIsVerified = is_verified ?? auth?.user?.is_verified ?? false;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            <Head title="Success - Business Setup Complete" />

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
                {/* Success Animation */}
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                        <div className="relative size-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                            <CheckCircle2 className="size-12 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                            <Sparkles className="size-6 text-yellow-400 animate-bounce" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        🎉 Congratulations!
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        You've successfully set up your business profile. You're one step away from going live!
                    </p>
                </div>

                {/* Verification Alert */}
                {!userIsVerified && (
                    <Alert className="mb-8 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 dark:border-yellow-900">
                        <ShieldCheck className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <AlertTitle className="text-yellow-900 dark:text-yellow-100 font-semibold">
                            Verification Required to Go Live
                        </AlertTitle>
                        <AlertDescription className="text-yellow-800 dark:text-yellow-200 mt-2">
                            <p className="mb-3">
                                Your business profile is complete, but it won't be visible to clients until you verify your identity. 
                                This helps build trust and ensures a safe marketplace for everyone.
                            </p>
                            <Link href="/onboarding/verification">
                                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Verify Now
                                </Button>
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                        <CardHeader>
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                                <LayoutDashboard className="size-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">Manage Your Business</CardTitle>
                            <CardDescription>
                                Access your dashboard to manage appointments, services, and settings.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                        <CardHeader>
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                                <TrendingUp className="size-6 text-primary" />
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

                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                        <CardHeader>
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                                <Users className="size-6 text-primary" />
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
                <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="size-5 text-primary" />
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
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {!userIsVerified ? (
                        <>
                            <Link href="/onboarding/verification">
                                <Button size="lg" className="h-12 px-8 gap-2 shadow-lg hover:shadow-xl transition-all">
                                    <ShieldCheck className="size-5" />
                                    Verify Your Identity
                                    <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                            <Link href="/business">
                                <Button variant="outline" size="lg" className="h-12 px-8">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/business">
                                <Button size="lg" className="h-12 px-8 gap-2 shadow-lg hover:shadow-xl transition-all">
                                    <LayoutDashboard className="size-5" />
                                    Go to Dashboard
                                    <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" size="lg" className="h-12 px-8">
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
