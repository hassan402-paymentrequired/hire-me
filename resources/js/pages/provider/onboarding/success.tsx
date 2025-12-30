import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, LayoutDashboard, Store } from 'lucide-react';
import AppLayout from '@/layouts/guest-layout';

export default function Success() {
    return (
        <div className="min-h-screen bg-background">
            <Head title="Success - Business Setup Complete" />

            <div className="max-w-3xl mx-auto px-6 py-20 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="size-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="size-10 text-green-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold tracking-tight mb-1">
                    Your Business is Ready!
                </h1>

                <p className="text-sm text-muted-foreground mb-3">
                    Congratulations! You've successfully set up your business profile.
                    Clients can now find and book your services on our marketplace.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-muted/50 p-6 rounded border text-left">
                        {/*<LayoutDashboard className="size-8 text-primary mb-4" />*/}
                        <h3 className="font-bold text-lg mb-2">Manage Appointments</h3>
                        <p className="text-sm text-muted-foreground">
                            View your schedule, confirm bookings, and manage your availability from your dashboard.
                        </p>
                    </div>

                    <div className="bg-muted/50 p-6 rounded border text-left">
                        {/*<Store className="size-8 text-primary mb-4" />*/}
                        <h3 className="font-bold text-lg mb-2">Public Profile</h3>
                        <p className="text-sm text-muted-foreground">
                            Your business is now live on the marketplace. Share your profile link with clients.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/business">
                        <Button size="lg" className="h-12 px-8 gap-2">
                            Go to Dashboard
                            <ArrowRight className="size-4" />
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="lg" className="h-12 px-8">
                            View Marketplace
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
