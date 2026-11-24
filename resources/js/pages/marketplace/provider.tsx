import KiroChat from '@/components/kiro/kiro-chat';
import { ReviewSection } from '@/components/reviews/review-section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import GuestLayout from '@/layouts/guest-layout';
import { getProviderDefaultBanner } from '@/lib/provider-banner';
import {
    allowsHomeService,
    normalizeDeliveryMode,
} from '@/lib/service-delivery-mode';
import { cn } from '@/lib/utils';
import ReviewDrawal from '@/pages/marketplace/components/review-drawal';
import { findOnMap, login } from '@/routes';
import favourite from '@/routes/favourite';
import { booking } from '@/routes/marketplace';
import { gallery, show as providerShow } from '@/routes/provider';
import type { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
    ArrowRight,
    BadgeCheck,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Heart,
    MapPin,
    MessageCircle,
    Phone,
    Share2,
    Star,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
    avatar?: string | null;
    businessId: string;
    businessName: string;
    slug: string;
    description: string;
    category?: string | null;
    images: Array<{ url: string; isLogo: boolean }>;
    rating: number;
    reviews_count: number;
    can_review: boolean;
    latitude: number | null;
    longitude: number | null;
    address: string;
    city?: string | null;
    phone?: string | null;
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

interface NearbyProvider {
    id: string;
    businessId: string;
    name: string;
    address: string;
    city?: string | null;
    isAvailableToday?: boolean;
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
}

interface Props {
    provider: Provider;
    services: Service[];
    workHours: WorkHours;
    reviews: Review[];
    canEdit: boolean;
    isFavourite: boolean;
    favoriteBusinessIds: string[];
    nearbyProviders: NearbyProvider[];
    galleryPreview?: GalleryPreviewImage[];
    galleryTotal?: number;
}

const WEEKDAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const surfaceClass = 'rounded-3xl border border-line bg-white';

const forestButtonClass =
    'inline-flex h-14 items-center justify-center gap-2 rounded-full bg-forest px-6 text-[17px] font-bold text-white transition hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-forest/40';

const outlineButtonClass =
    'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#DDE3DE] bg-white px-4.5 text-sm font-semibold text-ink transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2';

function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
) {
    const earthRadiusKm = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
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

        if (period === 'PM' && hours !== 12) {
            hours += 12;
        }

        if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    }

    const match24h = str.match(/^(\d{1,2})(?::(\d{2}))?$/);

    if (match24h) {
        return (
            parseInt(match24h[1], 10) * 60 + parseInt(match24h[2] || '0', 10)
        );
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

function compactTime(value: string): string {
    return value.replace(':00', '');
}

function formatNaira(amount: number | string): string {
    return `₦${Number(amount || 0).toLocaleString('en-NG')}`;
}

function formatDuration(minutes: number): string {
    if (!minutes || minutes <= 0) {
        return '';
    }

    if (minutes < 60) {
        return minutes === 1 ? '1 min' : `${minutes} mins`;
    }

    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    const hourLabel = hours === 1 ? '1 hr' : `${hours} hr`;

    if (remainder === 0) {
        return hourLabel;
    }

    return `${hourLabel} ${remainder} mins`;
}

function profileBanner(
    category: string | null | undefined,
    id: string | number,
): string {
    return getProviderDefaultBanner(category, id).replace(
        '-light.jpg',
        '-dark.jpg',
    );
}

function formatCategory(value: string): string {
    return value
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function initialsFrom(name: string): string {
    const letters = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

    return letters || 'P';
}

function formatAddress(address: string, city?: string | null): string {
    if (!city) {
        return address;
    }

    if (address.toLowerCase().includes(city.toLowerCase())) {
        return address;
    }

    return address ? `${address}, ${city}` : city;
}

function getNextOpening(workHours: WorkHours, now: Date): string | null {
    const order = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (let offset = 0; offset < 7; offset += 1) {
        const dayName = order[(now.getDay() + offset) % 7];
        const day = workHours[dayName];

        if (!day?.isOpen || !day.hours?.length) {
            continue;
        }

        const range = day.hours.find((hour) => {
            return offset > 0 || parseTimeToMinutes(hour.end) > nowMinutes;
        });

        if (!range) {
            continue;
        }

        const startMinutes = parseTimeToMinutes(range.start);
        const endMinutes = parseTimeToMinutes(range.end);

        if (
            offset === 0 &&
            nowMinutes >= startMinutes &&
            nowMinutes < endMinutes
        ) {
            return 'Open now';
        }

        const dayLabel =
            offset === 0
                ? 'Today'
                : offset === 1
                  ? 'Tomorrow'
                  : dayName.slice(0, 3);

        return `${dayLabel} ${compactTime(range.start)}`;
    }

    return null;
}

function formatHours(hours?: Array<{ start: string; end: string }>): string {
    if (!hours?.length) {
        return 'Open';
    }

    return hours
        .map((hour) => `${compactTime(hour.start)} – ${compactTime(hour.end)}`)
        .join(', ');
}

function StarRow({
    rating,
    className,
}: {
    rating: number;
    className?: string;
}) {
    return (
        <span
            className={cn('inline-flex items-center gap-0.5', className)}
            aria-hidden
        >
            {Array.from({ length: 5 }, (_, index) => (
                <Star
                    key={index}
                    className={cn(
                        'size-3.5',
                        index < Math.round(rating)
                            ? 'fill-[#E2B203] text-[#E2B203]'
                            : 'fill-[#E7E4D8] text-[#E7E4D8] dark:fill-muted dark:text-muted',
                    )}
                />
            ))}
        </span>
    );
}

function NearbyCard({
    provider,
    favoriteBusinessIds,
}: {
    provider: NearbyProvider;
    favoriteBusinessIds: string[];
}) {
    const { auth } = usePage<SharedData>().props;
    const [isFavorite, setIsFavorite] = useState(
        favoriteBusinessIds.includes(provider.businessId),
    );
    const banner = profileBanner(provider.category, provider.id);
    const place = [provider.city, provider.address].find((value) => value);
    const distanceLabel =
        provider.distance !== null && provider.distance !== undefined
            ? `${provider.distance < 10 ? provider.distance.toFixed(1) : Math.round(provider.distance)} km`
            : null;

    const toggleFavorite = () => {
        if (!provider.businessId) {
            return;
        }

        if (!auth?.user) {
            router.visit(login.url());

            return;
        }

        const nextFavoriteState = !isFavorite;
        setIsFavorite(nextFavoriteState);

        router.post(
            favourite.update().url,
            { id: provider.businessId },
            {
                preserveScroll: true,
                onError: () => setIsFavorite(!nextFavoriteState),
            },
        );
    };

    return (
        <article
            className={cn(surfaceClass, 'flex h-full flex-col overflow-hidden')}
        >
            <div className="relative h-32 bg-[#0E3B2E]">
                <Link
                    href={providerShow(provider.slug)}
                    prefetch
                    className="absolute inset-0"
                    aria-label={`View ${provider.businessName}`}
                >
                    <img
                        src={banner}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                </Link>
                {provider.category && (
                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#163026]">
                        {formatCategory(provider.category)}
                    </span>
                )}
                <button
                    type="button"
                    onClick={toggleFavorite}
                    aria-label={
                        isFavorite
                            ? `Remove ${provider.businessName} from saved`
                            : `Save ${provider.businessName}`
                    }
                    aria-pressed={isFavorite}
                    className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white text-[#163026] shadow-sm"
                >
                    <Heart
                        className={cn(
                            'size-4',
                            isFavorite && 'fill-rose-500 text-rose-500',
                        )}
                    />
                </button>
            </div>

            <div className="flex flex-1 flex-col px-4 pt-0 pb-4">
                <Avatar className="-mt-7 size-14 border-4 border-white bg-[#0E3B2E] dark:border-card">
                    <AvatarImage
                        src={provider.logo ?? provider.avatar ?? undefined}
                        alt=""
                    />
                    <AvatarFallback className="bg-[#0E3B2E] text-sm font-semibold text-white">
                        {initialsFrom(provider.businessName || provider.name)}
                    </AvatarFallback>
                </Avatar>

                <Link
                    href={providerShow(provider.slug)}
                    prefetch
                    className="mt-2 min-w-0"
                >
                    <span className="flex items-center gap-1.5">
                        <span className="truncate font-heading text-base font-semibold text-[#163026] dark:text-foreground">
                            {provider.businessName}
                        </span>
                        {provider.isVerified && (
                            <BadgeCheck
                                aria-label="Verified"
                                className="size-4 shrink-0 fill-[#0E3B2E] text-[#D7F36A]"
                            />
                        )}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-[#667068] dark:text-muted-foreground">
                        <Star className="size-3.5 fill-[#E2B203] text-[#E2B203]" />
                        <span className="font-medium text-[#163026] dark:text-foreground">
                            {provider.reviewsCount
                                ? provider.rating.toFixed(1)
                                : 'New'}
                        </span>
                        <span>({provider.reviewsCount || 0})</span>
                        {distanceLabel && (
                            <>
                                <span aria-hidden>·</span>
                                <span>{distanceLabel}</span>
                            </>
                        )}
                        {place && (
                            <>
                                <span aria-hidden>·</span>
                                <span className="truncate">{place}</span>
                            </>
                        )}
                    </span>
                </Link>

                {provider.category && (
                    <span className="mt-3 w-fit rounded-full bg-[#F3F6F0] px-2.5 py-1 text-xs font-medium text-[#3E4A42] dark:bg-muted dark:text-foreground">
                        {formatCategory(provider.category)}
                    </span>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#EEF1EA] pt-4 dark:border-border">
                    <p className="font-heading text-lg font-semibold text-[#163026] dark:text-foreground">
                        {formatNaira(provider.minPrice)}
                    </p>
                    <Link
                        href={booking(provider.slug)}
                        className="inline-flex h-10 items-center rounded-xl bg-[#0E3B2E] px-4 text-sm font-semibold text-white transition hover:bg-[#0B3026]"
                    >
                        Book now
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default function ProviderProfile({
    provider,
    services,
    workHours,
    reviews,
    canEdit,
    isFavourite,
    favoriteBusinessIds,
    nearbyProviders,
    galleryPreview = [],
    galleryTotal = 0,
}: Props) {
    const [distance, setDistance] = useState<number | null>(null);
    const [isFavorite, setIsFavorite] = useState(isFavourite);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
        services[0]?.id ?? null,
    );
    const [activeServiceCategory, setActiveServiceCategory] = useState('All');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const lightboxOpen = lightboxIndex !== null;
    const galleryPreviewCount = galleryPreview.length;

    const closeLightbox = useCallback(() => setLightboxIndex(null), []);

    const showNextLightbox = useCallback(() => {
        if (galleryPreviewCount === 0) {
            return;
        }

        setLightboxIndex((current) =>
            current === null ? null : (current + 1) % galleryPreviewCount,
        );
    }, [galleryPreviewCount]);

    const showPrevLightbox = useCallback(() => {
        if (galleryPreviewCount === 0) {
            return;
        }

        setLightboxIndex((current) =>
            current === null
                ? null
                : (current - 1 + galleryPreviewCount) % galleryPreviewCount,
        );
    }, [galleryPreviewCount]);

    useEffect(() => {
        if (!lightboxOpen) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') {
                showNextLightbox();
            }

            if (event.key === 'ArrowLeft') {
                showPrevLightbox();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxOpen, showNextLightbox, showPrevLightbox]);

    const [profileKey, setProfileKey] = useState(provider.id);

    if (profileKey !== provider.id) {
        setProfileKey(provider.id);
        setSelectedServiceId(services[0]?.id ?? null);
        setActiveServiceCategory('All');
        setLightboxIndex(null);
        setIsFavorite(isFavourite);
    }

    const canBookProvider = provider.canBook ?? true;
    const bookingBlockedReason =
        provider.bookingBlockedReason ||
        'Booking is unavailable for this provider.';
    const deliveryMode = normalizeDeliveryMode(provider.serviceDeliveryMode);
    const offersHomeService = allowsHomeService(deliveryMode);

    useEffect(() => {
        if (!('geolocation' in navigator)) {
            return;
        }

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
    }, [provider.latitude, provider.longitude]);

    const logo = provider.images?.find((image) => image.isLogo);
    const bannerImages =
        provider.images?.filter((image) => !image.isLogo) || [];
    const heroImages = bannerImages.length
        ? bannerImages
        : [
              {
                  url: profileBanner(provider.category, provider.id),
                  isLogo: false,
              },
          ];
    const heroInitials = initialsFrom(provider.businessName || provider.name);

    const serviceCategories = useMemo(() => {
        const names = new Set<string>();

        services.forEach((service) => {
            if (service.service_category_name) {
                names.add(service.service_category_name);
            }
        });

        return names.size > 1 ? ['All', ...names] : [];
    }, [services]);

    const visibleServices = useMemo(() => {
        if (activeServiceCategory === 'All') {
            return services;
        }

        return services.filter(
            (service) =>
                (service.service_category_name || 'Services') ===
                activeServiceCategory,
        );
    }, [activeServiceCategory, services]);

    const selectedService =
        services.find((service) => service.id === selectedServiceId) ?? null;

    const orderedHours = useMemo(() => {
        return WEEKDAYS.map((day) => [day, workHours[day]] as const).filter(
            (entry): entry is [string, WorkHours[string]] => Boolean(entry[1]),
        );
    }, [workHours]);

    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = workHours[today];
    const isOpenNow =
        (todayHours?.isOpen ?? false) &&
        (todayHours?.hours?.length
            ? isWithinHours(now, todayHours.hours)
            : true);
    const nextOpening = getNextOpening(workHours, now);
    const locationLabel = provider.city || provider.address;
    const fullAddress = formatAddress(provider.address, provider.city);
    const bookingHref = selectedService
        ? booking(provider.slug, { query: { service: selectedService.id } })
        : booking(provider.slug);

    const handleFavourite = () => {
        if (!canEdit) {
            router.visit(login.url());

            return;
        }

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
                    text: `Check out ${provider.businessName}${provider.description ? ` - ${provider.description.substring(0, 100)}` : ''}`,
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
        if (!provider.latitude || !provider.longitude) {
            return;
        }

        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`,
            '_blank',
        );
    };

    const openMessage = () => {
        window.dispatchEvent(new Event('kiro:open'));
    };

    return (
        <GuestLayout>
            <Head title={provider.businessName} />
            <div className="bg-white text-ink">
                <div
                    className={cn(
                        'mx-auto w-full max-w-[1240px] px-4 pt-5 sm:px-6',
                        canBookProvider ? 'pb-28 md:pb-16' : 'pb-16',
                    )}
                >
                    <section className="flex flex-col gap-6">
                        <div className="flex flex-wrap items-end justify-between gap-6">
                            <div className="flex min-w-0 items-center gap-4">
                                <Avatar className="size-16 shrink-0 border border-line bg-forest sm:size-18">
                                    <AvatarImage
                                        src={logo?.url ?? provider.avatar ?? undefined}
                                        alt=""
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-forest text-xl font-bold text-lime">
                                        {heroInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex min-w-0 flex-col gap-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-[44px]">
                                            {provider.businessName}
                                        </h1>
                                        {provider.isVerified && (
                                            <span className="rounded-full bg-mint px-2.5 py-1 text-[13px] font-semibold text-forest">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15px]">
                                        <span className="inline-flex items-center gap-1">
                                            <strong>{provider.reviews_count ? provider.rating.toFixed(1) : 'New'}</strong>
                                            <Star className="size-4 fill-ink" />
                                            <a href="#reviews" className="font-semibold text-forest">
                                                ({provider.reviews_count})
                                            </a>
                                        </span>
                                        {todayHours !== undefined && (
                                            <>
                                                <span className="text-sage">•</span>
                                                <span>
                                                    <span className={cn('font-semibold', isOpenNow ? 'text-leaf' : 'text-moss')}>
                                                        {isOpenNow ? 'Open now' : 'Closed'}
                                                    </span>
                                                    {!isOpenNow && nextOpening && <span className="text-moss"> · {nextOpening}</span>}
                                                </span>
                                            </>
                                        )}
                                        {locationLabel && (
                                            <>
                                                <span className="text-sage">•</span>
                                                <span className="max-w-[20rem] truncate text-moss">{locationLabel}</span>
                                            </>
                                        )}
                                        {distance !== null && <span className="text-moss">{distance.toFixed(1)} km</span>}
                                        {offersHomeService && (
                                            <>
                                                <span className="text-sage">•</span>
                                                <span className="text-moss">Home service available</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2.5">
                                <button type="button" onClick={handleShare} aria-label="Share profile" className="grid size-11 place-items-center rounded-full border border-[#DDE3DE] hover:bg-paper">
                                    <Share2 className="size-4.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFavourite}
                                    aria-label={isFavorite ? 'Remove from saved' : 'Save provider'}
                                    aria-pressed={isFavorite}
                                    className="grid size-11 place-items-center rounded-full border border-[#DDE3DE] hover:bg-paper"
                                >
                                    <Heart className={cn('size-4.5', isFavorite && 'fill-forest text-forest')} />
                                </button>
                                <button type="button" onClick={openMessage} className={outlineButtonClass}>
                                    <MessageCircle className="size-4" />
                                    Message
                                </button>
                            </div>
                        </div>

                        <div
                            className={cn(
                                'relative grid gap-2 overflow-hidden rounded-[20px]',
                                heroImages.length >= 3 ? 'h-80 grid-cols-[2fr_1fr] grid-rows-2 sm:h-[480px]' : 'h-64 sm:h-[420px]',
                            )}
                        >
                            {heroImages.slice(0, heroImages.length >= 3 ? 3 : 1).map((image, index) => (
                                <div key={`${image.url}-${index}`} className={cn('group overflow-hidden bg-mint', index === 0 && heroImages.length >= 3 && 'row-span-2')}>
                                    <img
                                        src={image.url}
                                        alt={`${provider.businessName} photo ${index + 1}`}
                                        className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
                                    />
                                </div>
                            ))}
                            {galleryTotal > 0 && (
                                <Link
                                    href={gallery(provider.slug)}
                                    className="absolute right-4 bottom-4 rounded-full bg-white px-4 py-2.5 text-sm font-semibold shadow-lg"
                                >
                                    See all {galleryTotal} photos
                                </Link>
                            )}
                        </div>
                    </section>

                    {!canBookProvider && (
                        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                            {bookingBlockedReason}
                        </p>
                    )}

                    <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
                        <div className="space-y-5">
                            <section className={cn(surfaceClass, 'p-5 sm:p-6')}>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <h2 className="text-[28px] font-bold tracking-tight">
                                        Services & pricing
                                    </h2>
                                    {serviceCategories.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto">
                                            {serviceCategories.map(
                                                (category) => {
                                                    const isActive =
                                                        activeServiceCategory ===
                                                        category;

                                                    return (
                                                        <button
                                                            key={category}
                                                            type="button"
                                                            aria-pressed={
                                                                isActive
                                                            }
                                                            onClick={() =>
                                                                setActiveServiceCategory(
                                                                    category,
                                                                )
                                                            }
                                                            className={cn(
                                                                'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                                                                isActive
                                                                    ? 'bg-[#0E3B2E] text-white'
                                                                    : 'border border-[#E1E6DE] bg-white text-[#163026] hover:bg-[#F7F8F5] dark:border-border dark:bg-card dark:text-foreground',
                                                            )}
                                                        >
                                                            {category}
                                                        </button>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}
                                </div>

                                {visibleServices.length === 0 ? (
                                    <p className="mt-6 text-sm text-[#667068] dark:text-muted-foreground">
                                        No services available.
                                    </p>
                                ) : (
                                    <ul className="mt-2">
                                        {visibleServices.map((service) => {
                                            const isAdded =
                                                service.id ===
                                                selectedServiceId;

                                            return (
                                                <li
                                                    key={service.id}
                                                    className="flex items-center justify-between gap-4 border-t border-[#EEF1EA] py-5 first:border-t-0 dark:border-border"
                                                >
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold capitalize">
                                                            {service.name}
                                                        </h3>
                                                        {service.description && (
                                                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#667068] dark:text-muted-foreground">
                                                                {
                                                                    service.description
                                                                }
                                                            </p>
                                                        )}
                                                        {service.duration_minutes >
                                                            0 && (
                                                            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#667068] dark:text-muted-foreground">
                                                                <Clock className="size-3.5" />
                                                                {formatDuration(
                                                                    service.duration_minutes,
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-3">
                                                        <p className="font-semibold">
                                                            {formatNaira(
                                                                service.price,
                                                            )}
                                                        </p>
                                                        {isAdded ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#D7F36A] px-3 py-1.5 text-sm font-semibold text-[#163026]">
                                                                <Check className="size-3.5" />
                                                                Added
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedServiceId(
                                                                        service.id,
                                                                    )
                                                                }
                                                                className="rounded-full border border-[#E1E6DE] bg-white px-4 py-1.5 text-sm font-medium transition hover:border-[#0E3B2E] dark:border-border dark:bg-card"
                                                            >
                                                                Book
                                                            </button>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </section>

                            <section className={cn(surfaceClass, 'p-5 sm:p-6')}>
                                <h2 className="text-[28px] font-bold tracking-tight">
                                    About & location
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-[#5E6A62] dark:text-muted-foreground">
                                    {provider.description ||
                                        'This provider has not added a description yet.'}
                                </p>
                                <div
                                    className={cn(
                                        'mt-5 grid gap-4',
                                        provider.latitude && provider.longitude
                                            ? 'sm:grid-cols-[220px_minmax(0,1fr)]'
                                            : '',
                                    )}
                                >
                                    {provider.latitude &&
                                        provider.longitude && (
                                            <div className="h-40 overflow-hidden rounded-2xl bg-[#E7F0E4] sm:h-full">
                                                <iframe
                                                    title={`${provider.businessName} map`}
                                                    src={`https://www.google.com/maps?q=${provider.latitude},${provider.longitude}&z=15&output=embed`}
                                                    className="h-full min-h-40 w-full border-0"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                />
                                            </div>
                                        )}
                                    <div className="space-y-3 text-sm">
                                        {fullAddress && (
                                            <p className="flex items-start gap-2 text-[#163026] dark:text-foreground">
                                                <MapPin className="mt-0.5 size-4 shrink-0 text-[#0E3B2E]" />
                                                <span>{fullAddress}</span>
                                            </p>
                                        )}
                                        {provider.phone && (
                                            <a
                                                href={`tel:${provider.phone}`}
                                                className="flex items-center gap-2 font-medium"
                                            >
                                                <Phone className="size-4 text-[#0E3B2E]" />
                                                {provider.phone}
                                            </a>
                                        )}
                                        {provider.latitude &&
                                            provider.longitude && (
                                                <button
                                                    type="button"
                                                    onClick={getDirections}
                                                    className="inline-flex items-center gap-1 font-medium text-[#0E3B2E] dark:text-emerald-300"
                                                >
                                                    Get directions
                                                    <ArrowRight className="size-4" />
                                                </button>
                                            )}
                                    </div>
                                </div>
                            </section>

                            {galleryPreview.length > 0 && (
                                <section
                                    className={cn(surfaceClass, 'p-5 sm:p-6')}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <h2 className="text-[28px] font-bold tracking-tight">
                                            Gallery
                                        </h2>
                                        <Link
                                            href={gallery(provider.slug)}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-[#0E3B2E] dark:text-emerald-300"
                                        >
                                            See all
                                            {galleryTotal >
                                            galleryPreview.length
                                                ? ` ${galleryTotal}`
                                                : ''}
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {galleryPreview
                                            .slice(0, 4)
                                            .map((image, index) => (
                                                <button
                                                    key={image.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setLightboxIndex(index)
                                                    }
                                                    aria-label={`Open gallery image ${index + 1}`}
                                                    className="aspect-square overflow-hidden rounded-2xl bg-[#0E3B2E]"
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                    </div>
                                </section>
                            )}

                            <section className={cn(surfaceClass, 'p-5 sm:p-6')}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-[28px] font-bold tracking-tight">
                                            Customer reviews
                                        </h2>
                                        <ReviewSection
                                            reviews={reviews}
                                            canReview={provider.can_review}
                                            pendingAppointmentId={
                                                provider.pending_appointment_id
                                            }
                                            composerOnly
                                        />
                                    </div>
                                    <div className="text-right">
                                        <p className="font-heading text-3xl leading-none font-semibold">
                                            {provider.reviews_count
                                                ? provider.rating.toFixed(1)
                                                : '–'}
                                        </p>
                                        <p className="mt-1 text-xs text-[#667068] dark:text-muted-foreground">
                                            {provider.reviews_count} verified{' '}
                                            {provider.reviews_count === 1
                                                ? 'review'
                                                : 'reviews'}
                                        </p>
                                    </div>
                                </div>

                                {reviews.length === 0 ? (
                                    <p className="mt-6 text-sm text-[#667068] dark:text-muted-foreground">
                                        No reviews yet. Book a service and be
                                        the first to leave one.
                                    </p>
                                ) : (
                                    <ul className="mt-2">
                                        {reviews.slice(0, 2).map((review) => (
                                            <li
                                                key={review.id}
                                                className="border-t border-[#EEF1EA] py-5 first:border-t-0 dark:border-border"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex min-w-0 gap-3">
                                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E7F0E4] text-xs font-semibold text-[#0E3B2E] dark:bg-muted dark:text-foreground">
                                                            {initialsFrom(
                                                                review.client_name,
                                                            )}
                                                        </span>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold capitalize">
                                                                {
                                                                    review.client_name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-[#667068] dark:text-muted-foreground">
                                                                {
                                                                    review.created_at
                                                                }
                                                            </p>
                                                            <p className="mt-2 text-sm leading-6 text-[#5E6A62] dark:text-muted-foreground">
                                                                {review.comment}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <StarRow
                                                        rating={review.rating}
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {reviews.length > 2 && (
                                    <div className="mt-2 flex justify-center">
                                        <ReviewDrawal reviews={reviews} />
                                    </div>
                                )}
                            </section>
                        </div>

                        <aside className="space-y-5 lg:sticky lg:top-6">
                            <section className={cn(surfaceClass, 'rounded-[24px] p-7 shadow-[0_12px_40px_rgba(19,32,27,0.08)]')}>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    Book with {provider.businessName}
                                </h2>
                                {selectedService ? (
                                    <div className="mt-4 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-medium capitalize">
                                                {selectedService.name}
                                            </p>
                                            <p className="mt-1 text-sm text-[#667068] dark:text-muted-foreground">
                                                {formatDuration(
                                                    selectedService.duration_minutes,
                                                )}
                                            </p>
                                        </div>
                                        <p className="shrink-0 font-semibold">
                                            {formatNaira(selectedService.price)}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm text-[#667068] dark:text-muted-foreground">
                                        Choose a service to continue.
                                    </p>
                                )}

                                {nextOpening && (
                                    <div className="mt-5">
                                        <p className="text-sm text-[#667068] dark:text-muted-foreground">
                                            Next available
                                        </p>
                                        <span className="mt-2 inline-flex rounded-full bg-[#F3F6F0] px-3 py-1.5 text-sm font-medium dark:bg-muted">
                                            {nextOpening}
                                        </span>
                                    </div>
                                )}

                                {canBookProvider && selectedService ? (
                                    <Link
                                        href={bookingHref}
                                        className={cn(
                                            forestButtonClass,
                                            'mt-5 w-full',
                                        )}
                                    >
                                        Continue to book
                                        <ArrowRight className="size-4" />
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        title={
                                            canBookProvider
                                                ? 'Choose a service first'
                                                : bookingBlockedReason
                                        }
                                        className={cn(
                                            forestButtonClass,
                                            'mt-5 w-full',
                                        )}
                                    >
                                        Continue to book
                                        <ArrowRight className="size-4" />
                                    </button>
                                )}
                                <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-[#667068] dark:text-muted-foreground">
                                    <Check className="size-4 text-[#0E3B2E]" />
                                    Pay when you&apos;re satisfied
                                </p>
                            </section>

                            <section className={cn(surfaceClass, 'p-5')}>
                                <h2 className="text-[28px] font-bold tracking-tight">
                                    Working hours
                                </h2>
                                <dl className="mt-3">
                                    {orderedHours.map(([day, hours]) => {
                                        const isToday = day === today;

                                        return (
                                            <div
                                                key={day}
                                                className="flex items-center justify-between gap-4 border-b border-[#F1F3EE] py-2.5 text-sm last:border-b-0 dark:border-border"
                                            >
                                                <dt
                                                    className={cn(
                                                        isToday &&
                                                            'font-semibold text-[#1F7A45]',
                                                    )}
                                                >
                                                    {day.slice(0, 3)}
                                                </dt>
                                                <dd
                                                    className={cn(
                                                        'text-right',
                                                        isToday
                                                            ? 'font-semibold text-[#1F7A45]'
                                                            : 'text-[#5E6A62] dark:text-muted-foreground',
                                                        !hours.isOpen &&
                                                            'text-[#98A099]',
                                                    )}
                                                >
                                                    {hours.isOpen
                                                        ? formatHours(
                                                              hours.hours,
                                                          )
                                                        : 'Closed'}
                                                </dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </section>
                        </aside>
                    </div>

                    {nearbyProviders.length > 0 && (
                        <section className="mt-10">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-[28px] font-bold tracking-tight">
                                    Providers nearby
                                </h2>
                                <Link
                                    href={findOnMap()}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-[#0E3B2E] dark:text-emerald-300"
                                >
                                    See all
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {nearbyProviders.map((nearbyProvider) => (
                                    <NearbyCard
                                        key={nearbyProvider.id}
                                        provider={nearbyProvider}
                                        favoriteBusinessIds={
                                            favoriteBusinessIds
                                        }
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {canBookProvider && (
                    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E4E9E1] bg-white/95 p-3 backdrop-blur md:hidden dark:border-border dark:bg-card/95">
                        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium capitalize">
                                    {selectedService?.name ??
                                        'Select a service'}
                                </p>
                                <p className="text-sm text-[#667068] dark:text-muted-foreground">
                                    {selectedService
                                        ? formatNaira(selectedService.price)
                                        : 'Choose a service to book'}
                                </p>
                            </div>
                            {selectedService ? (
                                <Link
                                    href={bookingHref}
                                    className={cn(
                                        forestButtonClass,
                                        'shrink-0',
                                    )}
                                >
                                    Continue
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className={cn(
                                        forestButtonClass,
                                        'shrink-0',
                                    )}
                                >
                                    Continue
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <DialogPrimitive.Root
                open={lightboxOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeLightbox();
                    }
                }}
            >
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90" />
                    <DialogPrimitive.Content
                        aria-describedby={undefined}
                        className="fixed inset-0 z-50 flex items-center justify-center outline-none"
                    >
                        <DialogPrimitive.Title className="sr-only">
                            {provider.businessName} gallery
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Close
                            className="absolute top-4 right-4 inline-flex size-10 items-center justify-center rounded-full bg-white/15 text-white"
                            aria-label="Close gallery"
                        >
                            <X className="size-5" />
                        </DialogPrimitive.Close>
                        {galleryPreviewCount > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={showPrevLightbox}
                                    aria-label="Previous image"
                                    className="absolute top-1/2 left-3 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white"
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={showNextLightbox}
                                    aria-label="Next image"
                                    className="absolute top-1/2 right-3 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white"
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                            </>
                        )}
                        {lightboxIndex !== null &&
                            galleryPreview[lightboxIndex] && (
                                <img
                                    src={galleryPreview[lightboxIndex].url}
                                    alt=""
                                    className="max-h-[85vh] max-w-[92vw] object-contain"
                                />
                            )}
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>

            <KiroChat
                business={{
                    slug: provider.slug,
                    businessName: provider.businessName,
                    canBook: canBookProvider,
                }}
                launcherClassName="bottom-32 md:bottom-6"
            />
        </GuestLayout>
    );
}
