import React from 'react';
import { Clock, X, Calendar, Tag, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';

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
    onClose: () => void;
}

export default function ServiceModal({ service, providerSlug, onClose }: ServiceModalProps) {
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
    const durationLabel = hours > 0
        ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
        : `${mins} min`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4"
            onClick={handleBackdropClick}
        >
            {/* Sheet on mobile (slides up), centered modal on sm+ */}
            <div className="relative w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

                {/* Drag handle (mobile only) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-4 pb-3 sm:pt-6">
                    <div className="flex-1 pr-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Service Details</p>
                        <h2 className="text-xl sm:text-2xl font-black capitalize leading-tight">
                            {service.name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 pb-2 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Duration</p>
                                <p className="font-bold text-sm">{durationLabel}</p>
                            </div>
                        </div>

                        <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Tag className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Price</p>
                                <p className="font-bold text-sm text-primary">
                                    ₦{(service.price || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {service.description ? (
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">About this service</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-muted/30 rounded-xl p-4 text-center">
                            <p className="text-sm text-muted-foreground italic">No description provided for this service.</p>
                        </div>
                    )}

                    {/* What's included hint */}
                    <div className="flex items-start gap-2 bg-primary/5 border border-primary/10 rounded-xl p-3">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Book this service to lock in your appointment. You can confirm details with the provider after booking.
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="px-5 pt-3 pb-6 sm:pb-5 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 h-11"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                    <Link href={`/provider/${providerSlug}/book`} className="flex-1">
                        <Button className="w-full h-11 font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Now
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}