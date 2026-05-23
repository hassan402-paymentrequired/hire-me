import { ReviewSection } from '@/components/reviews/review-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import VerifiedProviderBadge from '@/components/verified-provider-badge';
import GuestLayout from '@/layouts/guest-layout';
import { getBookingCtaLabel, getDeliveryModeBadge, normalizeDeliveryMode } from '@/lib/service-delivery-mode';
import BusinessCard from '@/pages/guest/components/business-card';
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
    Calendar,
    ChevronLeft,
    ChevronRight,
    Heart,
    ImageIcon,
    MapPin,
    Navigation,
    Share2,
    Star,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface Service {
    id: string;
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
    service_category_id?: string | null;
    service_category_name?: string | null;
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
    team_members_count?: number;
    canBook?: boolean;
    bookingBlockedReason?: string | null;
    isVerified?: boolean;
    serviceDeliveryMode?:
        | 'client_visits_provider'
        | 'provider_visits_client'
        | 'both';
    deliveryModeLabel?: string;
    bookingCtaLabel?: string;
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

interface GalleryPreviewImage {
    id: string;
    url: string;
}

interface Props {
    provider: Provider;
    services: Service[];
    workHours: WorkHours;
    reviews: Review[];
    canEdit: boolean;
    isFavourite: boolean;
    nearbyProviders: Array<{
        id: string;
        name: string;
        address: string;
        businessName: string;
        slug: string;
        logo?: string | null;
        avatar?: string | null;
        distance?: number | null;
        servicesCount: number;
        rating: number;
        reviewsCount: number;
        minPrice: number | string;
        category?: string;
        isVerified?: boolean;
    }>;
    galleryPreview?: GalleryPreviewImage[];
    galleryTotal?: number;
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
            if (nowMinutes >= startMinutes && nowMinutes < endMinutes) {
                return true;
            }
        } else if (nowMinutes >= startMinutes || nowMinutes < endMinutes) {
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
    nearbyProviders,
    galleryPreview = [],
    galleryTotal = 0,
}: Props) {
    const [distance, setDistance] = useState<number | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFavorite, setIsFavorite] = useState(isFavourite);
    const [selectedService, setSelectedService] = useState<Service | null>(
        null,
    );
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const lightboxOpen = lightboxIndex !== null;
    const galleryPreviewCount = galleryPreview.length;

    const closeLightbox = useCallback(() => setLightboxIndex(null), []);

    const showNextLightbox = useCallback(() => {
        if (galleryPreviewCount === 0) return;
        setLightboxIndex((current) =>
            current === null ? null : (current + 1) % galleryPreviewCount,
        );
    }, [galleryPreviewCount]);

    const showPrevLightbox = useCallback(() => {
        if (galleryPreviewCount === 0) return;
        setLightboxIndex((current) =>
            current === null
                ? null
                : (current - 1 + galleryPreviewCount) % galleryPreviewCount,
        );
    }, [galleryPreviewCount]);

    useEffect(() => {
        if (!lightboxOpen) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') showNextLightbox();
            if (event.key === 'ArrowLeft') showPrevLightbox();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxOpen, showNextLightbox, showPrevLightbox]);

    const canBookProvider = provider.canBook ?? true;
    const bookingBlockedReason =
        provider.bookingBlockedReason ||
        'Booking is unavailable for this provider.';
    const deliveryMode = normalizeDeliveryMode(provider.serviceDeliveryMode);
    const bookingCtaLabel =
        provider.bookingCtaLabel ?? getBookingCtaLabel(deliveryMode);
    const deliveryBadge =
        provider.deliveryModeLabel ?? getDeliveryModeBadge(deliveryMode);
    const showProviderAddress =
        deliveryMode === 'client_visits_provider' || deliveryMode === 'both';
    const nearbyRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                if (provider.latitude && provider.longitude) {
                    setDistance(
                        calculateDistance(
                            position.coords.latitude,
                            position.coords.longitude,
                            provider.latitude,
                            provider.longitude,
                        ),
                    );
                }
            });
        }
    }, [provider.latitude, provider.longitude]);

    useEffect(() => {
        document.body.style.overflow = selectedService ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedService]);

    const logo =
        provider.images?.find((image) => image.isLogo) || provider.images?.[0];
    const otherImages =
        provider.images?.filter((image) => image !== logo) || [];
    const allImages = logo ? [logo, ...otherImages] : otherImages;
    const heroInitials = (provider.businessName || provider.name || 'P')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

    const groupedServices = useMemo(() => {
        const groups = new Map<string, Service[]>();

        services.forEach((service) => {
            const category = service.service_category_name || 'Services';
            const items = groups.get(category) || [];
            items.push(service);
            groups.set(category, items);
        });

        return Array.from(groups.entries()).map(([category, items]) => ({
            category,
            items,
        }));
    }, [services]);
    const [activeServiceCategory, setActiveServiceCategory] = useState('');

    useEffect(() => {
        if (!groupedServices.length) {
            setActiveServiceCategory('');
            return;
        }

        setActiveServiceCategory((current) =>
            groupedServices.some((group) => group.category === current)
                ? current
                : groupedServices[0].category,
        );
    }, [groupedServices]);

    const activeServiceGroup =
        groupedServices.find(
            (group) => group.category === activeServiceCategory,
        ) ||
        groupedServices[0] ||
        null;

    const orderedHours = useMemo(() => {
        const order = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];

        return Object.entries(workHours).sort(
            ([a], [b]) => order.indexOf(a) - order.indexOf(b),
        );
    }, [workHours]);

    const nextSlide = () =>
        setCurrentSlide((prev) => (prev + 1) % allImages.length);
    const prevSlide = () =>
        setCurrentSlide(
            (prev) => (prev - 1 + allImages.length) % allImages.length,
        );

    useEffect(() => {
        if (allImages.length <= 1) return;

        const interval = window.setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % allImages.length);
        }, 4000);

        return () => window.clearInterval(interval);
    }, [allImages.length]);

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

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: provider.businessName,
                    text: `Check out ${provider.businessName}${provider.description ? ` - ${provider.description.substring(0, 100)}...` : ''}`,
                    url: window.location.href,
                });
            } catch {
                return;
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            return;
        }
    };

    const getDirections = () => {
        if (!provider.latitude || !provider.longitude) return;

        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`,
            '_blank',
        );
    };

    const scrollNearby = (direction: 'left' | 'right') => {
        const el = nearbyRef.current;
        if (!el) return;
        const delta = direction === 'left' ? -360 : 360;
        el.scrollBy({ left: delta, behavior: 'smooth' });
    };

    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = workHours[today];
    const isOpenNow =
        (todayHours?.isOpen ?? false) &&
        (todayHours?.hours?.length
            ? isWithinHours(now, todayHours.hours)
            : true);
    const miniGalleryImages = allImages.slice(0, 6);

    return (
        <GuestLayout>
            <div className="relative h-[50vh] w-full overflow-hidden sm:h-[58vh] md:h-[66vh]">
                {allImages.length > 0 ? (
                    <>
                        <div className="relative h-full w-full">
                            <img
                                src={allImages[currentSlide]?.url}
                                alt={`${provider.businessName} image ${currentSlide + 1}`}
                                className="h-full w-full object-cover transition-transform duration-700"
                                loading="eager"
                            />
                            
                        </div>

                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevSlide}
                                    className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:left-4 sm:h-11 sm:w-11"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:right-4 sm:h-11 sm:w-11"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}

                        <div className="absolute top-4 right-4 flex gap-2">
                            {canEdit && (
                                <button
                                    onClick={handleFavourite}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:h-10 sm:w-10"
                                    aria-label={
                                        isFavorite
                                            ? 'Remove from favorites'
                                            : 'Add to favorites'
                                    }
                                >
                                    <Heart
                                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                            isFavorite
                                                ? 'fill-red-500 text-red-500'
                                                : ''
                                        }`}
                                    />
                                </button>
                            )}
                            <button
                                onClick={handleShare}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:h-10 sm:w-10"
                                aria-label="Share provider profile"
                            >
                                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        </div>

                        {provider.isVerified && (
                            <div className="absolute top-4 left-4 z-10">
                                <VerifiedProviderBadge
                                    size="lg"
                                    tone="onDark"
                                />
                            </div>
                        )}

                        {/* <div className="absolute right-0 bottom-0 left-0 p-4 sm:p-6 md:p-8">
                            <div className="mx-auto max-w-7xl">
                                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <h1 className="text-2xl leading-tight font-black text-white sm:text-3xl md:text-5xl">
                                                {provider.businessName}
                                            </h1>
                                            {todayHours !== undefined && (
                                                <Badge
                                                    className={`border-none px-2 py-0.5 text-xs text-white ${
                                                        isOpenNow
                                                            ? 'bg-green-500/90'
                                                            : 'bg-red-500/90'
                                                    }`}
                                                >
                                                    {isOpenNow
                                                        ? '● Open Now'
                                                        : '● Closed'}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-white/95">
                                            <div className="inline-flex items-center gap-1.5 border border-white/20 bg-white/10 px-3 py-1.5 text-sm backdrop-blur">
                                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold">
                                                    {(
                                                        provider.rating ?? 0
                                                    ).toFixed(1)}
                                                </span>
                                                <span className="text-xs opacity-85">
                                                    (
                                                    {provider.reviews_count ||
                                                        0}
                                                    )
                                                </span>
                                            </div>

                                            {distance !== null && (
                                                <div className="inline-flex items-center gap-1.5 border border-white/20 bg-white/10 px-3 py-1.5 text-sm backdrop-blur">
                                                    <Navigation className="h-3.5 w-3.5" />
                                                    {distance.toFixed(1)} km
                                                    away
                                                </div>
                                            )}

                                            <div className="inline-flex items-center gap-1.5 border border-white/20 bg-white/10 px-3 py-1.5 text-sm backdrop-blur">
                                                <MapPin className="h-3.5 w-3.5" />
                                                {provider.address}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden items-center gap-2 md:flex">
                                        <Link
                                            href={`/provider/${provider.slug}/gallery`}
                                        >
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="h-12 border-white/25 bg-white/10 px-5 text-base text-white hover:bg-white/15 hover:text-white"
                                            >
                                                <ImageIcon className="mr-2 h-4 w-4" />
                                                View Gallery
                                            </Button>
                                        </Link>
                                        {canBookProvider ? (
                                            <Link
                                                href={`/provider/${provider.slug}/book`}
                                            >
                                                <Button
                                                    size="lg"
                                                    className="h-12 px-6 text-base"
                                                >
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {bookingCtaLabel}
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button
                                                size="lg"
                                                disabled
                                                title={bookingBlockedReason}
                                                className="h-12 px-6 text-base"
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Booking unavailable
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div> */}
                    </>
                ) : (
                    <div className="relative h-full w-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-background to-muted" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center border border-white/20 bg-white/10 text-3xl font-black tracking-tight backdrop-blur">
                                    {heroInitials}
                                </div>
                                <p className="mt-3 text-sm text-white/80">
                                    No photos yet. Still open for bookings.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed right-0 bottom-0 left-0 z-50 border-t bg-background/95 p-3 backdrop-blur md:hidden">
                <div className="grid grid-cols-2 gap-2">
                    <Link href={`/provider/${provider.slug}/gallery`}>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-12 w-full text-base"
                        >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Gallery
                        </Button>
                    </Link>
                    {canBookProvider ? (
                        <Link href={`/provider/${provider.slug}/book`}>
                            <Button
                                size="lg"
                                className="h-12 w-full text-base font-bold"
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                {bookingCtaLabel}
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            size="lg"
                            disabled
                            title={bookingBlockedReason}
                            className="h-12 w-full text-base font-bold"
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            Unavailable
                        </Button>
                    )}
                </div>
            </div>

            <div className="mx-auto w-full  px-4 py-2 sm:px-6 ">
                {!canBookProvider && (
                    <div className="mb-6 border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
                        <p className="font-semibold">Booking unavailable</p>
                        <p className="mt-1 text-sm leading-6">
                            {bookingBlockedReason}
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="flex flex-wrap items-center gap-2 text-2xl leading-tight font-black sm:text-3xl md:text-4xl">
                            {provider.businessName}
                            <Badge
                                variant="secondary"
                                className="text-[10px] font-semibold tracking-wide uppercase"
                            >
                                {deliveryMode === 'provider_visits_client' ? (
                                    <Navigation className="mr-1 inline size-3" />
                                ) : (
                                    <MapPin className="mr-1 inline size-3" />
                                )}
                                {deliveryBadge}
                            </Badge>
                        </h1>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="font-semibold text-foreground">
                                    {(provider.rating ?? 0).toFixed(1)}
                                </span>
                                <span>({provider.reviews_count || 0})</span>
                            </div>
                            {showProviderAddress && provider.address && (
                                <>
                                    <span>·</span>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Visit us: {provider.address}
                                    </div>
                                </>
                            )}
                            {deliveryMode === 'provider_visits_client' && (
                                <>
                                    <span>·</span>
                                    <span>
                                        Add your service address when booking
                                    </span>
                                </>
                            )}
                            {distance !== null && (
                                <>
                                    <span>·</span>
                                    <div className="flex items-center gap-1">
                                        <Navigation className="h-3.5 w-3.5" />
                                        {distance.toFixed(1)} km away
                                    </div>
                                </>
                            )}
                            {todayHours !== undefined && (
                                <>
                                    <span>·</span>
                                    <span
                                        className={
                                            isOpenNow
                                                ? 'font-medium text-green-600'
                                                : 'font-medium text-red-500'
                                        }
                                    >
                                        {isOpenNow ? '● Open now' : '● Closed'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden shrink-0 items-center gap-2 md:flex">
                        <Link href={`/provider/${provider.slug}/gallery`}>
                            <Button variant="outline" className="h-11">
                                <ImageIcon className="mr-2 h-4 w-4" />
                                View Gallery  
                            </Button>
                        </Link>
                        {canBookProvider ? (
                            <Link href={`/provider/${provider.slug}/book`}>
                                <Button className="h-11 px-6">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {bookingCtaLabel}
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                disabled
                                title={bookingBlockedReason}
                                className="h-11 px-6"
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Booking unavailable
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
                    <div className="space-y-10 lg:col-span-2">
                    
                        <section>
                            <div className="my-6 flex items-center gap-3">
                                <div className="h-1 w-8 rounded bg-primary sm:w-12" />
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    Services & Pricing
                                </h2>
                            </div>

                            {services.length === 0 ? (
                                <div className="border-2 border-dashed bg-muted/30 p-10 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        No services available.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-5 flex gap-2 overflow-x-auto pb-3">
                                        {groupedServices.map((group) => (
                                            <Button
                                                key={group.category}
                                                className="rounded-full"
                                                onClick={() =>
                                                    setActiveServiceCategory(
                                                        group.category,
                                                    )
                                                }
                                                variant={activeServiceCategory ===
                                                    group.category ? 'default' : 'outline'}
                                            >
                                                {group.category}
                                                <span className="ml-2 text-xs opacity-80">
                                                    ({group.items.length})
                                                </span>
                                            </Button>
                                        ))}
                                    </div>

                                    {activeServiceGroup && (
                                        <div>
                                            <div className="gap-2 flex flex-col">
                                                {activeServiceGroup.items.map(
                                                    (service) => (
                                                        <button
                                                            key={service.id}
                                                            onClick={() =>
                                                                setSelectedService(
                                                                    service,
                                                                )
                                                            }
                                                            className="flex cursor-pointer px-3 bg-gray-100 rounded w-full items-start justify-between gap-4 py-4 text-left transition-colors hover:bg-muted/20"
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="text-base font-semibold capitalize">
                                                                    {
                                                                        service.name
                                                                    }
                                                                </h4>
                                                                {service.description && (
                                                                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                                                        {
                                                                            service.description
                                                                        }
                                                                    </p>
                                                                )}
                                                                <div className="mt-2 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                                                                    {
                                                                        service.duration_minutes
                                                                    }{' '}
                                                                    mins
                                                                </div>
                                                            </div>

                                                            <div className="shrink-0 text-right">
                                                                <p className="text-base font-semibold text-primary">
                                                                    ₦
                                                                    {Number(
                                                                        service.price ||
                                                                            0,
                                                                    ).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="space-y-5 border-t border-border/70 pt-8">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-8 rounded bg-primary sm:w-12" />
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    About & Location
                                </h2>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                                <div>
                                    {provider.description ? (
                                        <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                                            {provider.description}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">
                                            No description available.
                                        </p>
                                    )}

                                    <div className="mt-5 space-y-3 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                            <span>{provider.address}</span>
                                        </div>
                                        {provider.latitude &&
                                            provider.longitude && (
                                                <Button
                                                    variant="outline"
                                                    className="mt-2 h-11"
                                                    onClick={getDirections}
                                                >
                                                    <Navigation className="mr-2 h-4 w-4" />
                                                    Get Directions
                                                </Button>
                                            )}
                                    </div>
                                </div>

                                <div className="overflow-hidden border border-border/70">
                                    {provider.latitude && provider.longitude ? (
                                        <iframe
                                            title={`${provider.businessName} map`}
                                            src={`https://www.google.com/maps?q=${provider.latitude},${provider.longitude}&z=15&output=embed`}
                                            className="h-[280px] w-full border-0"
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    ) : (
                                        <div className="flex h-[280px] items-center justify-center bg-muted/30 text-sm text-muted-foreground">
                                            Map location unavailable.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {galleryPreview.length >= 3 && (
                            <section className="space-y-5 border-t border-border/70 pt-8">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1 w-8 rounded bg-primary sm:w-12" />
                                        <h2 className="text-xl font-bold sm:text-2xl">
                                            Gallery
                                        </h2>
                                    </div>
                                    <Link
                                        href={`/provider/${provider.slug}/gallery`}
                                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                        View all
                                        {galleryTotal > 3 && (
                                            <span className="opacity-80">
                                                ({galleryTotal})
                                            </span>
                                        )}
                                    </Link>
                                </div>

                                <div className="grid aspect-[5/3] grid-cols-2 grid-rows-2 gap-2 sm:aspect-[2/1] sm:gap-3">
                                    {galleryPreview
                                        .slice(0, 3)
                                        .map((image, idx) => (
                                            <button
                                                key={`gallery-teaser-${image.id}`}
                                                type="button"
                                                onClick={() =>
                                                    setLightboxIndex(idx)
                                                }
                                                aria-label={`Preview gallery image ${idx + 1}`}
                                                className={`group relative overflow-hidden rounded-xl bg-muted text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                                    idx === 0
                                                        ? 'row-span-2'
                                                        : ''
                                                }`}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={`${provider.businessName} gallery ${idx + 1}`}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                                />
                                                {idx === 2 &&
                                                    galleryTotal > 3 && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-base font-semibold text-white transition group-hover:bg-black/50 sm:text-lg">
                                                            +
                                                            {galleryTotal - 3}{' '}
                                                            more
                                                        </div>
                                                    )}
                                            </button>
                                        ))}
                                </div>
                            </section>
                        )}

                        <section className="pb-20 md:pb-0">
                            <div className="mb-6 flex items-center justify-between">
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
                                <div className="border-2 border-dashed bg-muted/30 p-10 text-center">
                                    <ChatBubbleBottomCenterTextIcon className="mx-auto mb-4 h-10 w-10 opacity-30" />
                                    <p className="text-sm text-muted-foreground">
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

                    <aside className="mb-20 space-y-6 sm:mb-0">
                        <div className="border border-border/70 bg-background p-4 sm:p-6 lg:sticky lg:top-6">
                            <div className="mb-4 flex items-center gap-3 sm:mb-6">
                                <FireIcon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                                <h3 className="text-lg font-bold sm:text-xl">
                                    Working Hours
                                </h3>
                            </div>

                            <div className="space-y-0">
                                {orderedHours.map(([day, hours]) => {
                                    const isToday = day === today;
                                    return (
                                        <div
                                            key={day}
                                            className="flex items-center justify-between border-b border-border/50 py-3 text-sm sm:text-base"
                                        >
                                            <span
                                                className={`font-semibold ${
                                                    isToday
                                                        ? 'text-primary'
                                                        : ''
                                                }`}
                                            >
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
                                                            (hour) =>
                                                                `${hour.start} – ${hour.end}`,
                                                        )
                                                        .join(', ') || 'Open'}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    Closed
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {canBookProvider && (
                                    <Link prefetch href={`/provider/${provider.slug}/book`}>
                                        <Button className="h-11 px-6 w-full mt-2">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {bookingCtaLabel}
                                        </Button>
                                    </Link>
                                
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            {nearbyProviders?.length > 0 && (
                <div className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 md:pb-16">
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-8 rounded bg-primary sm:w-12" />
                                <h2 className="text-xl font-bold sm:text-2xl">
                                    Providers nearby
                                </h2>
                            </div>

                            <div className="hidden items-center gap-2 sm:flex">
                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center border bg-background transition hover:bg-muted"
                                    onClick={() => scrollNearby('left')}
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center border bg-background transition hover:bg-muted"
                                    onClick={() => scrollNearby('right')}
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div
                            ref={nearbyRef}
                            className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
                        >
                            {nearbyProviders.map((nearbyProvider) => (
                                <div
                                    key={nearbyProvider.id}
                                    className="max-w-[260px] min-w-[260px] snap-start"
                                >
                                    <BusinessCard provider={nearbyProvider} />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            {selectedService && (
                <ServiceModal
                    service={selectedService}
                    providerSlug={provider.slug}
                    canBook={canBookProvider}
                    bookingBlockedReason={bookingBlockedReason}
                    bookingCtaLabel={bookingCtaLabel}
                    onClose={() => setSelectedService(null)}
                />
            )}

            <DialogPrimitive.Root
                open={lightboxOpen}
                onOpenChange={(open) => {
                    if (!open) closeLightbox();
                }}
            >
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
                    <DialogPrimitive.Content
                        aria-describedby={undefined}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
                    >
                        <DialogPrimitive.Title className="sr-only">
                            {provider.businessName} gallery
                        </DialogPrimitive.Title>

                        <DialogPrimitive.Close
                            className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:top-6 sm:right-6"
                            aria-label="Close gallery preview"
                        >
                            <X className="size-5" />
                        </DialogPrimitive.Close>

                        {galleryPreviewCount > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={showPrevLightbox}
                                    aria-label="Previous image"
                                    className="absolute top-1/2 left-3 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6 sm:size-12"
                                >
                                    <ChevronLeft className="size-5 sm:size-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={showNextLightbox}
                                    aria-label="Next image"
                                    className="absolute top-1/2 right-3 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6 sm:size-12"
                                >
                                    <ChevronRight className="size-5 sm:size-6" />
                                </button>
                            </>
                        )}

                        {lightboxIndex !== null &&
                            galleryPreview[lightboxIndex] && (
                                <img
                                    src={galleryPreview[lightboxIndex].url}
                                    alt={`${provider.businessName} gallery ${lightboxIndex + 1}`}
                                    className="max-h-[85vh] max-w-[92vw] object-contain"
                                />
                            )}

                        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 text-xs text-white/80 sm:text-sm">
                            {galleryPreviewCount > 1 && (
                                <div className="flex items-center gap-1.5">
                                    {galleryPreview.map((image, idx) => (
                                        <span
                                            key={`lightbox-dot-${image.id}`}
                                            className={`h-1.5 rounded-full transition-all ${
                                                idx === lightboxIndex
                                                    ? 'w-6 bg-white'
                                                    : 'w-3 bg-white/40'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                            {galleryTotal > galleryPreviewCount && (
                                <Link
                                    href={`/provider/${provider.slug}/gallery`}
                                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur transition hover:bg-white/20"
                                >
                                    View all {galleryTotal} photos
                                </Link>
                            )}
                        </div>
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
        </GuestLayout>
    );
}
