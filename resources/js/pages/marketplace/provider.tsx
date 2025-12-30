import React, { useState, useEffect } from 'react';
import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import {
    Clock,
    Star,
    Navigation,
    ImageIcon,
} from 'lucide-react';
import { ReviewSection } from '@/components/reviews/review-section';
import { router, Link } from '@inertiajs/react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Badge } from '@/components/ui/badge';

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
    latitude: number | null;
    longitude: number | null;
    address: string;
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

const libraries: ("places")[] = ["places"];


function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export default function ProviderProfile({ provider, services, workHours, reviews }: Props) {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserLocation(userCoords);

                if (provider.latitude && provider.longitude) {
                    const d = calculateDistance(
                        userCoords.lat,
                        userCoords.lng,
                        provider.latitude,
                        provider.longitude
                    );
                    setDistance(d);
                }
            });
        }
    }, [provider.latitude, provider.longitude]);

    const handleBookService = (service: Service) => {
        router.get(`/provider/${provider.slug}/book`, { service: service.id });
    };


    const logo = provider.images.find(img => img.isLogo) || provider.images[0];
    const otherImages = provider.images.filter(img => img !== logo);

    const getDirections = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`;
        window.open(url, '_blank');
    };

    return (
        <GuestLayout>
            <div className="p-4 max-w-6xl mx-auto space-y-4">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
                    {/* Logo - large, featured position */}
                    {logo && (
                        <div className="col-span-3 row-span-2 rounded overflow-hidden border bg-muted relative group">
                            <img
                                src={logo.url}
                                alt="Business logo"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                    )}

                    {/* Other images - smart bento layout */}
                    {otherImages.map((img, i) => {
                        // Make every 3rd image larger for visual interest
                        const isLarge = (i + 1) % 3 === 0;

                        return (
                            <div
                                key={i}
                                className={`rounded overflow-hidden border bg-muted relative group ${
                                    isLarge ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
                                }`}
                            >
                                <img
                                    src={img.url}
                                    alt={`Gallery image ${i + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                            </div>
                        );
                    })}

                    {/* Empty state when no images */}
                    {!logo && otherImages.length === 0 && (
                        <div className="col-span-2 md:col-span-4 aspect-[21/9] rounded border bg-muted flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No images available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info, Services, Reviews */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Business Info */}
                        <div className="space-y-3">
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h1 className="sm:text-3xl text-2xl font-black tracking-tight text-foreground uppercase italic underline decoration-primary decoration-4 underline-offset-8">
                                        {provider.businessName}
                                    </h1>
                                    <Link href={`/provider/${provider.slug}/book`}>
                                        <Button >
                                            Book an Appointment
                                        </Button>
                                    </Link>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                    <p className="text-sm text-muted-foreground font-medium">by {provider.name}</p>
                                    <div className="flex items-center gap-1.5  px-3 py-1.5 text-sm font-bold">
                                        <Star className="size-4 fill-yellow-500 text-yellow-500" />
                                        <span>{provider.rating.toFixed(1)}</span>
                                        <span className="opacity-60 font-medium">({provider.reviews_count} reviews)</span>
                                    </div>
                                </div>
                            </div>

                            {provider.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed">{provider.description}</p>
                            )}
                        </div>

                        {/* Services Section */}
                        <section>
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-4">
                                Our Services
                            </h2>
                            {services.length === 0 ? (
                                <div className="bg-muted/30 rounded-2xl border-2 border-dashed p-12 text-center">
                                    <p className="text-muted-foreground">No services available at the moment.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 ">
                                    {services.map((service) => (
                                        <div
                                            key={service.id}
                                            className="bg-card rounded border p-3 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div className="space-y-2">
                                                    <h3 className="text-lg capitalize font-bold group-hover:text-primary transition-colors">
                                                        {service.name}
                                                    </h3>
                                                    {service.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                                                            {service.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="size-4" />
                                                            {service.duration} min
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-foreground">
                                                            ₦{service.price}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Reviews Section */}
                        <section>
                            <ReviewSection
                                reviews={reviews}
                                canReview={provider.can_review}
                                pendingAppointmentId={provider.pending_appointment_id}
                            />
                        </section>
                    </div>

                    {/* Right Column: Sidebar (Location, Map, Hours) */}
                    <aside className="space-y-6">
                        {/* Location Card */}
                        <div className="bg-card rounded border p-3 space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-sm">Location</h4>
                                        <p className="text-sm text-muted-foreground">{provider.address}</p>
                                        {distance !== null && (
                                            <p className="text-xs font-bold text-primary mt-1">
                                                {distance.toFixed(1)} km from your location
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button onClick={getDirections} variant="outline" className="w-full">
                                    <Navigation className="size-4" />
                                    Get Directions
                                </Button>
                            </div>

                            {googleMapsApiKey && provider.latitude && provider.longitude && (
                                <div className="rounded border overflow-hidden  h-64">
                                    <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
                                        <GoogleMap
                                            mapContainerStyle={{ width: '100%', height: '100%' }}
                                            center={{ lat: provider.latitude, lng: provider.longitude }}
                                            zoom={15}
                                            options={{
                                                disableDefaultUI: true,
                                                zoomControl: true,
                                            }}
                                        >
                                            <Marker position={{ lat: provider.latitude, lng: provider.longitude }} />
                                        </GoogleMap>
                                    </LoadScript>
                                </div>
                            )}
                        </div>

                        {/* Working Hours Card */}
                        <div className="bg-card rounded border p-4 sticky top-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Clock className="size-5 text-primary" />
                                Working Hours
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(workHours).map(([day, hours]) => (
                                    <div key={day} className="flex justify-between items-center text-sm border-b border-muted pb-2 last:border-0 last:pb-0">
                                        <span className="font-semibold">{day}</span>
                                        {hours.isOpen ? (
                                            <span className="text-muted-foreground font-medium">
                                                {hours.hours?.map(h => `${h.start} - ${h.end}`).join(', ') || 'Open'}
                                            </span>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground bg-muted font-bold">Closed</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

        </GuestLayout>
    );
}
