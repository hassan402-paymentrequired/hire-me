import React, { useState } from 'react';
import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Clock, DollarSign } from 'lucide-react';
import { BookingModal } from '@/components/booking/booking-modal';

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
}

interface WorkHours {
    [key: string]: {
        isOpen: boolean;
        hours?: Array<{ start: string; end: string }>;
    };
}

interface Props {
    provider: Provider;
    services: Service[];
    workHours: WorkHours;
}

export default function ProviderProfile({ provider, services, workHours }: Props) {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    const handleBookService = (service: Service) => {
        setSelectedService(service);
        setShowBookingModal(true);
    };

    const openDays = Object.entries(workHours)
        .filter(([_, hours]) => hours.isOpen)
        .map(([day]) => day);

    return (
        <GuestLayout title={provider.businessName}>
            <div className="p-4 ">

                {/* Provider Header */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">


                <div className="bg-card lg:col-span-2 rounded border border-border p-4 ">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-foreground mb-2">{provider.businessName}</h1>
                            <p className="text-muted-foreground mb-4">by {provider.name}</p>

                            {provider.description && (
                                <p className="text-foreground mb-6">{provider.description}</p>
                            )}

                            {openDays.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="size-4" />
                                    <span>Open {openDays.length} days a week</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                 <div className="bg-card rounded border border-border p-4 ">
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


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Services */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Services</h2>

                        {services.length === 0 ? (
                            <div className="bg-card rounded-lg border border-border p-8 text-center">
                                <p className="text-muted-foreground">No services available at the moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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
        </GuestLayout>
    );
}
