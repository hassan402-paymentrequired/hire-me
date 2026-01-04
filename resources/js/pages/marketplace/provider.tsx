import React, { useState, useEffect } from 'react';
import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import {
    Clock,
    Star,
    Navigation,
    ImageIcon,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Share2,
    Heart,
    Calendar,
    Award,
    TrendingUp,
    CheckCircle2
} from 'lucide-react';
import { ReviewSection } from '@/components/reviews/review-section';
import { router, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import ReviewDrawal from '@/pages/marketplace/components/review-drawal';
import favourite from '@/routes/favourite';

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
    businessId: string;
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
    canEdit: boolean;
    isFavourite: boolean;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export default function ProviderProfile({ provider, services, workHours, reviews, canEdit, isFavourite }: Props) {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

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

    const logo = provider.images.find(img => img.isLogo) || provider.images[0];
    const otherImages = provider.images.filter(img => img !== logo);
    const allImages = logo ? [logo, ...otherImages] : otherImages;

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % allImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const getDirections = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`;
        window.open(url, '_blank');
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: provider.businessName,
                text: `Check out ${provider.businessName}`,
                url: window.location.href,
            });
        }
    };

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = workHours[today];
    const isOpenNow = todayHours?.isOpen;

    const handleFavourite = () => {
        setIsFavorite(!isFavorite)
        router.post(favourite.update().url, {
            id: provider.businessId,
        })
    }

    return (
        <GuestLayout>
            {/* Hero Section with Image Carousel */}
            <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
                {allImages.length > 0 ? (
                    <>
                        <div className="relative w-full h-full">
                            <img
                                src={allImages[currentSlide].url}
                                alt={currentSlide === 0 && logo ? 'Business logo' : `Gallery ${currentSlide}`}
                                className="w-full h-full object-cover transition-transform duration-700"
                            />

                            {/* Gradient Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                        </div>

                        {/* Navigation Buttons */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-all hover:scale-110"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-all hover:scale-110"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Slide Indicators */}
                        {allImages.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                {allImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        className={`h-1 rounded-full transition-all ${
                                            i === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-6'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Top Actions */}
                        <div className="absolute top-6 right-6 flex gap-2">
                            {canEdit && (
                            <button
                                onClick={handleFavourite}
                                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Heart className={`w-5 h-5 ${isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                            )}
                            <button
                                onClick={handleShare}
                                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-all hover:scale-110"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Business Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
                                                {provider.businessName}
                                            </h1>
                                            {isOpenNow !== undefined && (
                                                <Badge
                                                    className={`${isOpenNow ? 'bg-green-500/90' : 'bg-red-500/90'} backdrop-blur-sm text-white border-none px-3 py-1`}
                                                >
                                                    {isOpenNow ? '● Open Now' : '● Closed'}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-white">
                                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="font-bold">{provider.rating.toFixed(1)}</span>
                                                <span className="text-sm opacity-90">({provider.reviews_count})</span>
                                            </div>

                                            {distance && (
                                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                                                    <Navigation className="w-4 h-4" />
                                                    <span className="font-semibold">{distance.toFixed(1)} km away</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm">{provider.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link href={`/provider/${provider.slug}/book`} className="hidden md:block">
                                        <Button size="lg" className="h-14 px-8 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                                            <Calendar className="w-5 h-5 mr-2" />
                                            Book Appointment
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <div className="text-center">
                            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-muted-foreground">No images available</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Book Button */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t z-50">
                <Link href={`/provider/${provider.slug}/book`} className="block">
                    <Button size="lg" className="w-full h-14 text-lg">
                        <Calendar className="w-5 h-5 mr-2" />
                        Book Appointment
                    </Button>
                </Link>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* About Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-1 w-6 sm:w-12 bg-primary rounded" />
                                <h2 className="text-lg sm:text-2xl font-bold">About</h2>
                            </div>

                            {provider.description ? (
                                <p className="text-muted-foreground leading-relaxed text-base">
                                    {provider.description}
                                </p>
                            ) : (
                                <p className="text-muted-foreground italic">No description available.</p>
                            )}

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-card border rounded-lg p-4 text-center">
                                    <Award className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="text-2xl font-bold">{provider.rating.toFixed(1)}</p>
                                    <p className="text-xs text-muted-foreground">Rating</p>
                                </div>
                                <div className="bg-card border rounded-lg p-4 text-center">
                                    <Star className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="text-2xl font-bold">{provider.reviews_count}</p>
                                    <p className="text-xs text-muted-foreground">Reviews</p>
                                </div>
                                <div className="bg-card border rounded-lg p-4 text-center">
                                    <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="text-2xl font-bold">{services.length}</p>
                                    <p className="text-xs text-muted-foreground">Services</p>
                                </div>
                                <div className="bg-card border rounded-lg p-4 text-center">
                                    <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="text-2xl font-bold">4.5yr</p>
                                    <p className="text-xs text-muted-foreground">Experience</p>
                                </div>
                            </div>
                        </section>

                        {/* Services Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-1 w-6 sm:w-12 bg-primary rounded" />
                                <h2 className="text-lg sm:text-2xl font-bold">Services & Pricing</h2>
                            </div>

                            {services.length === 0 ? (
                                <div className="bg-muted/30 rounded-xl border-2 border-dashed p-12 text-center">
                                    <p className="text-muted-foreground">No services available.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {services.map((service, index) => (
                                        <div
                                            key={service.id}
                                            className="bg-card border rounded p-3 hover:shadow-lg hover:border-primary/50 transition-all group"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                {/* Left side: Number + Service Details */}
                                                <div className="flex-1 flex gap-3 items-start">
                                                    {/* Number */}
                                                    <div className="flex-shrink-0">
                    <span className="text-2xl sm:text-4xl font-bold text-neutral-400">
                        {index + 1}
                    </span>
                                                    </div>

                                                    {/* Service Details */}
                                                    <div className="flex-1 space-y-0.5">
                                                        <h3 className="text-xl font-bold capitalize group-hover:text-primary transition-colors">
                                                            {service.name}
                                                        </h3>

                                                        {service.description && (
                                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                                {service.description}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center gap-4 text-sm">
                                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                <Clock className="w-4 h-4" />
                                                                <span className="font-medium">{service.duration} min</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right side: Price */}
                                                <div className="text-left sm:text-right flex-shrink-0">
                                                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                                                    <p className="text-base sm:text-xl font-bold text-primary">
                                                        ₦{service.price.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Reviews Section */}
                        <section className="pb-10 md:pb-0">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-1 w-6 sm:w-12 bg-primary rounded" />
                                    <h2 className="text-lg sm:text-2xl font-bold">Customer Reviews</h2>
                                </div>
                                <ReviewDrawal reviews={reviews} />
                            </div>
                            <ReviewSection reviews={reviews.slice(0, 3)} canReview={false} />
                        </section>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="space-y-6 mb-24 sm:mb-0">
                        {/* Working Hours Card */}
                        <div className="bg-card border rounded-lg p-6 sticky top-6 ">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="w-6 h-6 text-primary" />
                                <h3 className="text-xl font-bold">Working Hours</h3>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(workHours).map(([day, hours]) => {
                                    const isToday = day === today;
                                    return (
                                        <div
                                            key={day}
                                            className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                                                isToday ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                                            }`}
                                        >
                                            <span className={`font-semibold ${isToday ? 'text-primary' : ''}`}>
                                                {day}
                                                {isToday && <span className="ml-2 text-xs">(Today)</span>}
                                            </span>
                                            {hours.isOpen ? (
                                                <span className="text-sm text-muted-foreground font-medium">
                                                    {hours.hours?.map(h => `${h.start} - ${h.end}`).join(', ')}
                                                </span>
                                            ) : (
                                                <Badge variant="outline" className="bg-muted">Closed</Badge>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {provider.latitude && provider.longitude && (
                                <Button
                                    variant="outline"
                                    className="w-full mt-6"
                                    onClick={getDirections}
                                >
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Get Directions
                                </Button>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </GuestLayout>
    );
}
