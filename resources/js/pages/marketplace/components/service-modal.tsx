import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Calendar, CheckCircle2, Clock, Tag, X } from 'lucide-react';
import React from 'react';

interface Service {
    id: string;
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
}

interface ServiceModalProps {
    service: Service | null;
    providerSlug: string;
    canBook?: boolean;
    bookingBlockedReason?: string | null;
    bookingCtaLabel?: string;
    onClose: () => void;
}

export default function ServiceModal({
    service,
    providerSlug,
    canBook = true,
    bookingBlockedReason,
    bookingCtaLabel = 'Book now',
    onClose,
}: ServiceModalProps) {
    if (!service) return null;

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Close on Escape key
    React.useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const hours = Math.floor(service.duration_minutes / 60);
    const mins = service.duration_minutes % 60;
    const durationLabel =
        hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins} min`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-0 backdrop-blur-sm sm:items-center sm:px-4"
            onClick={handleBackdropClick}
        >
            {/* Sheet on mobile (slides up), centered modal on sm+ */}
            <div className="relative w-full animate-in overflow-hidden rounded-t-2xl bg-background shadow-2xl duration-300 slide-in-from-bottom-4 sm:max-w-md sm:rounded-2xl sm:zoom-in-95">
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

                {/* Drag handle (mobile only) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-4 pb-3 sm:pt-6">
                    <div className="flex-1 pr-3">
                        <p className="mb-1 text-xs font-semibold tracking-widest text-primary uppercase">
                            Service Details
                        </p>
                        <h2 className="text-xl leading-tight font-black capitalize sm:text-2xl">
                            {service.name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted/80"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4 px-5 pb-2">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Duration
                                </p>
                                <p className="text-sm font-bold">
                                    {durationLabel}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Tag className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Price
                                </p>
                                <p className="text-sm font-bold text-primary">
                                    ₦{(service.price || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {service.description ? (
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                About this service
                            </p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {service.description}
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl bg-muted/30 p-4 text-center">
                            <p className="text-sm text-muted-foreground italic">
                                No description provided for this service.
                            </p>
                        </div>
                    )}

                    {/* What's included hint */}
                    <div className="flex items-start gap-2 rounded-xl border border-primary/10 bg-primary/5 p-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Book this service to lock in your appointment. You
                            can confirm details with the provider after booking.
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-3 px-5 pt-3 pb-6 sm:flex-row sm:pb-5">
                    <Button
                        variant="outline"
                        className="h-11 flex-1"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                    {canBook ? (
                        <Link
                            href={`/provider/${providerSlug}/book`}
                            className="flex-1"
                        >
                            <Button className="h-11 w-full font-bold shadow-md transition-all hover:scale-[1.02] hover:shadow-lg">
                                <Calendar className="mr-2 h-4 w-4" />
                                {bookingCtaLabel}
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            disabled
                            title={bookingBlockedReason || undefined}
                            className="h-11 w-full font-bold"
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            Booking unavailable
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
