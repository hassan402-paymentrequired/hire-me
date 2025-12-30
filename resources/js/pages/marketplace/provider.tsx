import React, { useState } from 'react';
import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, DollarSign, Star } from 'lucide-react';
import { BookingModal } from '@/components/booking/booking-modal';
import { ReviewSection } from '@/components/reviews/review-section';
import client from '@/routes/client';
import { Link } from '@inertiajs/react';

interface Service {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
}

interface Provider {
    id: string;
    name: string;
    businessName: string;
    slug: string;
    description: string;
    images: Array<{ url: string; isLogo: boolean }>;
    rating: number;
    reviews_count: number;
    can_review: boolean;
    pending_appointment_id: string | null;
}

interface WorkHours {
    [key: string]: {
        isOpen: boolean;
        hours?: Array<{ start: string; end: string }>;
    };
}

interface Review {
    id: string;
    client_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface Props {
    provider: Provider;
    services: Service[];
    workHours: WorkHours;
    reviews: Review[];
}

export default function ProviderProfile({ provider, services, workHours, reviews }: Props) {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    const handleBookService = (service: Service) => {
        setSelectedService(service);
        setShowBookingModal(true);
    };

    const openDays = Object.entries(workHours)
        .filter(([_, hours]) => hours.isOpen)
        .map(([day]) => day);

    const logo = provider.images.find(img => img.isLogo) || provider.images[0];
    const otherImages = provider.images.filter(img => img !== logo);

    return (
        <GuestLayout>
            <div className="p-4 space-y-8">
                <div className="flex items-center gap-3">

                <Link
                    href={'#'}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                    <div>
                        {provider.name} - {provider.businessName} - {provider.address}
                    </div>
                </div>

                {/* Image Gallery & Header */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Image */}
                        <div className="aspect-[21/9] rounded-xl overflow-hidden border bg-muted relative">
                            {logo ? (
                                <img src={logo.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    No image available
                                </div>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {otherImages.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                {otherImages.map((img, i) => (
                                    <div key={i} className="aspect-[16/9] rounded-xl overflow-hidden border">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                </div>

                <div className="space-y-6 grid sm:grid-cols-3 gap-5">
                    <div className="sm:col-span-2 bg-card rounded border p-3 space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">{provider.businessName}</h1>
                            <div className="flex items-center gap-3">
                                <p className="text-muted-foreground">by {provider.name}</p>
                                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                <div className="flex items-center gap-1.5">
                                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold">{provider.rating.toFixed(1)}</span>
                                    <span className="text-muted-foreground text-sm">({provider.reviews_count} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {provider.description && (
                            <p className="text-foreground leading-relaxed">{provider.description}</p>
                        )}

                        <div className="pt-4 border-t space-y-3">
                            <h3 className="font-semibold">Location & Contact</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="size-4" />
                                <span>Available {openDays.length} days a week</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded border p-3">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Business Hours</h3>
                        <div className="space-y-3">
                            {Object.entries(workHours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between text-sm">
                                    <span className="font-medium text-foreground">{day}</span>
                                    {hours.isOpen ? (
                                        <span className="text-muted-foreground">
                                                {hours.hours?.map(h => `${h.start} - ${h.end}`).join(', ') || 'Open'}
                                            </span>
                                    ) : (
                                        <span className="text-muted-foreground">Closed</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Services */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Services</h2>

                        {services.length === 0 ? (
                            <div className="bg-card rounded border border-border p-8 text-center">
                                <p className="text-muted-foreground">No services available at the moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:center sm:justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                                    {service.name}
                                                </h3>
                                                {service.description && (
                                                    <p className="text-sm text-muted-foreground mb-4">
                                                        {service.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="size-4" />
                                                        <span>{service.duration} min</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="size-4" />
                                                        <span className="font-semibold text-foreground">
                                                            ${service.price}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button onClick={() => handleBookService(service)} className="w-full sm:w-auto">
                                                Book Now
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Reservation/Info (could add something here) */}
                    <div className="space-y-8">
                        <ReviewSection
                            reviews={reviews}
                            canReview={provider.can_review}
                            pendingAppointmentId={provider.pending_appointment_id}
                        />
                    </div>
            </div>

            {/* Booking Modal */}
            {selectedService && (
                <BookingModal
                    isOpen={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    provider={provider}
                    service={selectedService}
                />
            )}
            </div>
        </GuestLayout>
    );
}
