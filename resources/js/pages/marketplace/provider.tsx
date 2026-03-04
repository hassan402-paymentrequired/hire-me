import { ReviewSection } from '@/components/reviews/review-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import ReviewDrawal from '@/pages/marketplace/components/review-drawal';
import ServiceModal from '@/pages/marketplace/components/service-modal';
import favourite from '@/routes/favourite';
import {
    ChatBubbleBottomCenterTextIcon,
    ClockIcon,
    FireIcon,
} from '@heroicons/react/24/solid';
import { Link, router } from '@inertiajs/react';
import {
    Award,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Heart,
    ImageIcon,
    MapPin,
    Navigation,
    Share2,
    Star,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Service {
    id: string;
    name: string;
    description: string;
    duration_minutes: number;
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
    years_in_business?: number;
    total_service_hours?: number;
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

function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

function parseTimeToMinutes(timeStr: string): number {
    const str = timeStr.trim();
    const match12h = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (match12h) {
        let hours = parseInt(match12h[1], 10);
        const minutes = parseInt(match12h[2] || '0', 10);
        const period = match12h[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    }
    const match24h = str.match(/^(\d{1,2})(?::(\d{2}))?$/);
    if (match24h) {
        const hours = parseInt(match24h[1], 10);
        const minutes = parseInt(match24h[2] || '0', 10);
        return hours * 60 + minutes;
    }
    return 0;
}

function isWithinHours(
    now: Date,
    hoursRanges: Array<{ start: string; end: string }>,
): boolean {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    for (const range of hoursRanges) {
        const startMinutes = parseTimeToMinutes(range.start);
        const endMinutes = parseTimeToMinutes(range.end);
        if (startMinutes <= endMinutes) {
            if (nowMinutes >= startMinutes && nowMinutes < endMinutes)
                return true;
        } else {
            if (nowMinutes >= startMinutes || nowMinutes < endMinutes)
                return true;
        }
    }
    return false;
}

export default function ProviderProfile({
    provider,
    services,
    workHours,
    reviews,
    canEdit,
    isFavourite,
}: Props) {
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFavorite, setIsFavorite] = useState(isFavourite);
    const [selectedService, setSelectedService] = useState<Service | null>(
        null,
    );
    const isAuthenticated = canEdit;

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setUserLocation(userCoords);
                if (provider.latitude && provider.longitude) {
                    setDistance(
                        calculateDistance(
                            userCoords.lat,
                            userCoords.lng,
                            provider.latitude,
                            provider.longitude,
                        ),
                    );
                }
            });
        }
    }, [provider.latitude, provider.longitude]);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = selectedService ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedService]);

    const logo =
        provider.images?.find((img) => img.isLogo) || provider.images?.[0];
    const otherImages = provider.images?.filter((img) => img !== logo) || [];
    const allImages = logo ? [logo, ...otherImages] : otherImages;

    const nextSlide = () =>
        setCurrentSlide((prev) => (prev + 1) % allImages.length);
    const prevSlide = () =>
        setCurrentSlide(
            (prev) => (prev - 1 + allImages.length) % allImages.length,
        );

    const getDirections = () => {
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`,
            '_blank',
        );
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: provider.businessName,
                    text: `Check out ${provider.businessName}${provider.description ? ` - ${provider.description.substring(0, 100)}...` : ''}`,
                    url: window.location.href,
                });
            } catch {
                /* cancelled */
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
            } catch {
                /* fallback */
            }
        }
    };

    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = workHours[today];
    const isOpenNow =
        (todayHours?.isOpen ?? false) &&
        (todayHours?.hours?.length
            ? isWithinHours(now, todayHours.hours)
            : true);

    const handleFavourite = () => {
        const newState = !isFavorite;
        setIsFavorite(newState);
        router.post(
            favourite.update().url,
            { id: provider.businessId },
            {
                preserveScroll: true,
                onError: () => setIsFavorite(!newState),
            },
        );
    };

    return (
        <GuestLayout>
            {/* ── Hero / Carousel ─────────────────────────────────── */}
            <div className="relative h-[50vh] w-full overflow-hidden sm:h-[60vh] md:h-[70vh]">
                {allImages.length > 0 ? (
                    <>
                        <div className="relative h-full w-full">
                            <img
                                src={allImages[currentSlide]?.url}
                                alt={
                                    currentSlide === 0 && logo
                                        ? `${provider.businessName} logo`
                                        : `${provider.businessName} - Image ${currentSlide + 1}`
                                }
                                className="h-full w-full object-cover transition-transform duration-700"
                                loading="eager"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const next =
                                        (currentSlide + 1) % allImages.length;
                                    if (
                                        next !== currentSlide &&
                                        allImages[next]?.url
                                    ) {
                                        target.src = allImages[next].url;
                                    } else {
                                        target.style.display = 'none';
                                        const ph =
                                            target.parentElement?.querySelector(
                                                '.image-placeholder',
                                            );
                                        if (ph)
                                            (ph as HTMLElement).style.display =
                                                'flex';
                                    }
                                }}
                            />
                            <div className="image-placeholder absolute inset-0 hidden items-center justify-center bg-muted">
                                <div className="text-center">
                                    <ImageIcon className="mx-auto mb-4 h-16 w-16 opacity-30" />
                                    <p className="text-muted-foreground">
                                        Image unavailable
                                    </p>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                        </div>

                        {/* Carousel nav */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevSlide}
                                    className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 sm:left-4 sm:h-12 sm:w-12"
                                >
                                    <span className="sr-only">prev</span>
                                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 sm:right-4 sm:h-12 sm:w-12"
                                >
                                    <span className="sr-only">next</span>
                                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>
                            </>
                        )}

                        {/* Slide dots */}
                        {allImages.length > 1 && (
                            <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-6 sm:gap-2">
                                {allImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        className={`h-1 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-white sm:w-8' : 'w-4 bg-white/50 sm:w-6'}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Top actions */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            {isAuthenticated && (
                                <button
                                    onClick={handleFavourite}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 sm:h-10 sm:w-10"
                                    aria-label={
                                        isFavorite
                                            ? 'Remove from favorites'
                                            : 'Add to favorites'
                                    }
                                >
                                    <Heart
                                        className={`h-4 w-4 sm:h-5 sm:w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                                    />
                                </button>
                            )}
                            <button
                                onClick={handleShare}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 sm:h-10 sm:w-10"
                                aria-label="Share provider profile"
                            >
                                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        </div>

                        {/* Business info overlay */}
                        <div className="absolute right-0 bottom-0 left-0 p-4 sm:p-6 md:p-8">
                            <div className="mx-auto max-w-7xl">
                                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end md:gap-4">
                                    <div className="space-y-2 sm:space-y-3">
                                        {/* Name + open badge */}
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <h1 className="text-2xl leading-tight font-black text-white drop-shadow-lg sm:text-3xl md:text-5xl">
                                                {provider.businessName}
                                            </h1>
                                            {todayHours !== undefined && (
                                                <Badge
                                                    className={`${isOpenNow ? 'bg-green-500/90' : 'bg-red-500/90'} border-none px-2 py-0.5 text-xs text-white backdrop-blur-sm sm:px-3 sm:py-1 sm:text-sm`}
                                                >
                                                    {isOpenNow
                                                        ? '● Open Now'
                                                        : '● Closed'}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Meta pills — scroll horizontally on small screens */}
                                        <div className="scrollbar-none flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 text-white sm:flex-wrap sm:pb-0">
                                            <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-md">
                                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-bold">
                                                    {(
                                                        provider.rating ?? 0
                                                    ).toFixed(1)}
                                                </span>
                                                <span className="text-xs opacity-90">
                                                    (
                                                    {provider.reviews_count ||
                                                        0}
                                                    )
                                                </span>
                                            </div>

                                            {distance && (
                                                <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-md">
                                                    <Navigation className="h-3.5 w-3.5" />
                                                    <span className="text-sm font-semibold">
                                                        {distance.toFixed(1)} km
                                                        away
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-md">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="text-xs sm:text-sm">
                                                    {provider.address}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop book button */}
                                    <Link
                                        href={`/provider/${provider.slug}/book`}
                                        className="hidden md:block"
                                    >
                                        <Button
                                            size="lg"
                                            className="h-12 px-6 text-base shadow-xl transition-all hover:scale-105 hover:shadow-2xl lg:h-14 lg:px-8 lg:text-lg"
                                        >
                                            <Calendar className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                                            Book Appointment
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <div className="text-center">
                            <ImageIcon className="mx-auto mb-4 h-16 w-16 opacity-30" />
                            <p className="text-muted-foreground">
                                No images available
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Mobile sticky book button ────────────────────────── */}
            <div className="fixed right-0 bottom-0 left-0 z-50 border-t bg-background/95 p-3 backdrop-blur-md md:hidden">
                <Link
                    href={`/provider/${provider.slug}/book`}
                    className="block"
                >
                    <Button
                        size="lg"
                        className="h-12 w-full text-base font-bold"
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
                    </Button>
                </Link>
            </div>

            {/* ── Main Content ─────────────────────────────────────── */}
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:py-12">
                <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-12">
                    {/* ── Left Column ─────────────────────────────── */}
                    <div className="space-y-8 sm:space-y-10 lg:col-span-2">
                        {/* About */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-8 rounded bg-primary sm:w-12" />
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    About
                                </h2>
                            </div>

                            {provider.description ? (
                                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    {provider.description}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    No description available.
                                </p>
                            )}

                            {/* Quick Stats */}
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-4 sm:gap-4">
                                <div className="rounded-lg border bg-card p-3 text-center sm:p-4">
                                    <Award className="mx-auto mb-1.5 h-5 w-5 text-primary sm:mb-2 sm:h-6 sm:w-6" />
                                    <p className="text-xl font-bold sm:text-2xl">
                                        {(provider.rating ?? 0).toFixed(1)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Rating
                                    </p>
                                </div>
                                <div className="rounded-lg border bg-card p-3 text-center sm:p-4">
                                    <Star className="mx-auto mb-1.5 h-5 w-5 text-primary sm:mb-2 sm:h-6 sm:w-6" />
                                    <p className="text-xl font-bold sm:text-2xl">
                                        {provider.reviews_count || 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Reviews
                                    </p>
                                </div>
                                <div className="rounded-lg border bg-card p-3 text-center sm:p-4">
                                    <CheckCircle2 className="mx-auto mb-1.5 h-5 w-5 text-primary sm:mb-2 sm:h-6 sm:w-6" />
                                    <p className="text-xl font-bold sm:text-2xl">
                                        {services.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Services
                                    </p>
                                </div>
                                {provider.years_in_business &&
                                provider.years_in_business > 0 ? (
                                    <div className="rounded-lg border bg-card p-3 text-center sm:p-4">
                                        <TrendingUp className="mx-auto mb-1.5 h-5 w-5 text-primary sm:mb-2 sm:h-6 sm:w-6" />
                                        <p className="text-xl font-bold sm:text-2xl">
                                            {provider.years_in_business}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Years in Business
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border bg-card p-3 text-center sm:p-4">
                                        <ClockIcon className="mx-auto mb-1.5 h-5 w-5 text-primary sm:mb-2 sm:h-6 sm:w-6" />
                                        <p className="text-xl font-bold sm:text-2xl">
                                            {services.length > 0
                                                ? Math.round(
                                                      services.reduce(
                                                          (sum, s) =>
                                                              sum +
                                                              (s.duration_minutes ||
                                                                  0),
                                                          0,
                                                      ) / 60,
                                                  )
                                                : 0}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Total Hours
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Services */}
                        <section>
                            <div className="mb-5 flex items-center gap-3 sm:mb-6">
                                <div className="h-1 w-8 rounded bg-primary sm:w-12" />
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    Services & Pricing
                                </h2>
                            </div>

                            {services.length === 0 ? (
                                <div className="rounded-xl border-2 border-dashed bg-muted/30 p-8 text-center sm:p-12">
                                    <p className="text-sm text-muted-foreground sm:text-base">
                                        No services available.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {services.map((service, index) => (
                                        <button
                                            key={service.id}
                                            onClick={() =>
                                                setSelectedService(service)
                                            }
                                            className="group w-full cursor-pointer rounded-xl border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.99] sm:p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                {/* Number + details */}
                                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                                    <span className="flex-shrink-0 text-2xl leading-none font-bold text-neutral-300 transition-colors group-hover:text-primary/30 sm:text-4xl">
                                                        {index + 1}
                                                    </span>
                                                    <div className="min-w-0 flex-1 space-y-0.5">
                                                        <h3 className="line-clamp-1 text-base leading-relaxed font-bold capitalize transition-colors group-hover:text-primary sm:text-xl">
                                                            {service.name}
                                                        </h3>
                                                        {service.description && (
                                                            <p className="line-clamp-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                                                {
                                                                    service.description
                                                                }
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                                                            <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                            <span className="font-medium">
                                                                {
                                                                    service.duration_minutes
                                                                }{' '}
                                                                min
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="flex-shrink-0 text-right">
                                                    <p className="mb-0.5 text-xs text-muted-foreground">
                                                        Price
                                                    </p>
                                                    <p className="text-sm font-bold text-primary sm:text-xl">
                                                        ₦
                                                        {(
                                                            service.price || 0
                                                        ).toLocaleString()}
                                                    </p>
                                                    <p className="invisible mt-1 hidden text-xs text-primary/60 group-hover:visible sm:block">
                                                        Tap to view →
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Reviews */}
                        <section className="pb-20 sm:pb-10 md:pb-0">
                            <div className="mb-5 flex items-center justify-between sm:mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-1 w-8 rounded bg-primary sm:w-12" />
                                    <h2 className="text-xl font-bold sm:text-2xl">
                                        Customer Reviews
                                    </h2>
                                </div>
                                {reviews.length > 3 && (
                                    <ReviewDrawal reviews={reviews} />
                                )}
                            </div>
                            {reviews.length === 0 ? (
                                <div className="rounded-xl border-2 border-dashed bg-muted/30 p-8 text-center sm:p-12">
                                    <ChatBubbleBottomCenterTextIcon className="mx-auto mb-3 h-10 w-10 opacity-30 sm:mb-4 sm:h-12 sm:w-12" />
                                    <p className="text-sm text-muted-foreground sm:text-base">
                                        No reviews yet. Be the first to review!
                                    </p>
                                </div>
                            ) : (
                                <ReviewSection
                                    reviews={reviews.slice(0, 5)}
                                    canReview={provider.can_review}
                                    pendingAppointmentId={
                                        provider.pending_appointment_id
                                    }
                                />
                            )}
                        </section>
                    </div>

                    {/* ── Sidebar ───────────────────────────────────── */}
                    <aside className="mb-20 space-y-6 sm:mb-0">
                        <div className="rounded-xl border bg-card p-4 sm:p-6 lg:sticky lg:top-6">
                            <div className="mb-4 flex items-center gap-3 sm:mb-6">
                                <FireIcon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                                <h3 className="text-lg font-bold sm:text-xl">
                                    Working Hours
                                </h3>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                {Object.entries(workHours)
                                    .sort(([a], [b]) => {
                                        const order = [
                                            'Sunday',
                                            'Monday',
                                            'Tuesday',
                                            'Wednesday',
                                            'Thursday',
                                            'Friday',
                                            'Saturday',
                                        ];
                                        return (
                                            order.indexOf(a) - order.indexOf(b)
                                        );
                                    })
                                    .map(([day, hours]) => {
                                        const isToday = day === today;
                                        return (
                                            <div
                                                key={day}
                                                className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors sm:px-3 sm:py-2.5 sm:text-base ${
                                                    isToday
                                                        ? 'skew-x-1 border border-primary/20 bg-primary/10'
                                                        : 'hover:bg-muted/50'
                                                }`}
                                            >
                                                <span
                                                    className={`font-semibold ${isToday ? 'text-primary' : ''}`}
                                                >
                                                    {/* Show abbreviated day on very small screens */}
                                                    <span className="sm:hidden">
                                                        {day.slice(0, 3)}
                                                    </span>
                                                    <span className="hidden sm:inline">
                                                        {day}
                                                    </span>
                                                    {isToday && (
                                                        <span className="ml-1.5 text-xs opacity-70">
                                                            (Today)
                                                        </span>
                                                    )}
                                                </span>
                                                {hours.isOpen ? (
                                                    <span className="text-right text-xs font-medium text-muted-foreground sm:text-sm">
                                                        {hours.hours
                                                            ?.map(
                                                                (h) =>
                                                                    `${h.start} – ${h.end}`,
                                                            )
                                                            .join(', ') ||
                                                            'Open'}
                                                    </span>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-muted text-xs"
                                                    >
                                                        Closed
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>

                            {provider.latitude && provider.longitude && (
                                <Button
                                    variant="outline"
                                    className="mt-4 h-10 w-full sm:mt-6 sm:h-11"
                                    onClick={getDirections}
                                >
                                    <Navigation className="mr-2 h-4 w-4" />
                                    Get Directions
                                </Button>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            {/* ── Service Modal ────────────────────────────────────── */}
            {selectedService && (
                <ServiceModal
                    service={selectedService}
                    providerSlug={provider.slug}
                    onClose={() => setSelectedService(null)}
                />
            )}
        </GuestLayout>
    );
}
