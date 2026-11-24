import KiroChat from '@/components/kiro/kiro-chat';
import { ReviewSection } from '@/components/reviews/review-section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import GuestLayout from '@/layouts/guest-layout';
import { getProviderDefaultBanner } from '@/lib/provider-banner';
import {
    allowsHomeService,
    allowsVisitProvider,
    normalizeDeliveryMode,
    type ServiceDeliveryMode,
} from '@/lib/service-delivery-mode';
import { cn } from '@/lib/utils';
import ReviewDrawal from '@/pages/marketplace/components/review-drawal';
import { home, login } from '@/routes';
import explore from '@/routes/explore';
import favourite from '@/routes/favourite';
import { booking } from '@/routes/marketplace';
import { gallery, show as providerShow } from '@/routes/provider';
import { Head, Link, router } from '@inertiajs/react';
import {
    Check,
    Clock,
    CreditCard,
    Heart,
    House,
    LayoutGrid,
    MapPin,
    Phone,
    Share,
    ShieldCheck,
    Star,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

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
    state?: string | null;
    phone?: string | null;
    pending_appointment_id: string | null;
    canBook?: boolean;
    bookingBlockedReason?: string | null;
    isVerified?: boolean;
    serviceDeliveryMode?: ServiceDeliveryMode;
    autoConfirm?: boolean;
    acceptsOnlinePayment?: boolean;
    acceptsOfflinePayment?: boolean;
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
    date_label?: string;
    service_name?: string | null;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar?: string | null;
    rating: number | null;
    reviewsCount: number;
}

interface RatingBucket {
    stars: number;
    count: number;
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
    businessName: string;
    slug: string;
    logo?: string | null;
    rating: number;
    reviewsCount: number;
    category?: string;
}

interface Props {
    provider: Provider;
    services: Service[];
    workHours: WorkHours;
    reviews: Review[];
    teamMembers: TeamMember[];
    ratingBreakdown: RatingBucket[];
    canEdit: boolean;
    isFavourite: boolean;
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

const FEATURED_TAB = 'Featured';
const FEATURED_SERVICES_LIMIT = 5;
const REVIEWS_PREVIEW_LIMIT = 4;

const TILE_STYLES = [
    'bg-forest text-lime',
    'bg-mint text-forest',
    'bg-lime text-forest',
    'bg-mint text-forest',
    'bg-ink text-white',
];

const pillButtonClass =
    'inline-flex h-10 items-center justify-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2';

const primaryButtonClass =
    'inline-flex h-13 w-full items-center justify-center rounded-full bg-forest px-6 text-base font-bold text-white transition hover:bg-forest-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-forest/40';

const iconButtonClass =
    'grid size-11 place-items-center rounded-full border border-line bg-white transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest';

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

function isWithinRange(
    nowMinutes: number,
    range: { start: string; end: string },
): boolean {
    const startMinutes = parseTimeToMinutes(range.start);
    const endMinutes = parseTimeToMinutes(range.end);

    if (startMinutes <= endMinutes) {
        return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    }

    return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

function formatTime(value: string): string {
    return value.toLowerCase();
}

interface OpenStatus {
    isOpen: boolean;
    detail: string | null;
}

function getOpenStatus(workHours: WorkHours, now: Date): OpenStatus {
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
    const today = workHours[order[now.getDay()]];

    if (today?.isOpen) {
        if (!today.hours?.length) {
            return { isOpen: true, detail: null };
        }

        const current = today.hours.find((range) =>
            isWithinRange(nowMinutes, range),
        );

        if (current) {
            return { isOpen: true, detail: `until ${formatTime(current.end)}` };
        }
    }

    for (let offset = 0; offset < 7; offset += 1) {
        const dayName = order[(now.getDay() + offset) % 7];
        const day = workHours[dayName];

        if (!day?.isOpen || !day.hours?.length) {
            continue;
        }

        const range = day.hours.find(
            (hour) => offset > 0 || parseTimeToMinutes(hour.start) > nowMinutes,
        );

        if (!range) {
            continue;
        }

        const dayLabel =
            offset === 0
                ? 'today'
                : offset === 1
                  ? 'tomorrow'
                  : dayName.slice(0, 3);

        return {
            isOpen: false,
            detail: `· opens ${dayLabel} ${formatTime(range.start)}`,
        };
    }

    return { isOpen: false, detail: null };
}

function formatNaira(amount: number | string): string {
    return `₦${Number(amount || 0).toLocaleString('en-NG')}`;
}

function formatDuration(minutes: number): string {
    if (!minutes || minutes <= 0) {
        return '';
    }

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;

    return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
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

function tileLettersFrom(name: string): string {
    const letters = name.replace(/[^A-Za-z]/g, '');

    if (!letters) {
        return 'P';
    }

    return letters[0].toUpperCase() + (letters[1]?.toLowerCase() ?? '');
}

function formatAddress(address: string, city?: string | null): string {
    if (!city || address.toLowerCase().includes(city.toLowerCase())) {
        return address;
    }

    return address ? `${address}, ${city}` : city;
}

function formatHours(hours?: Array<{ start: string; end: string }>): string {
    if (!hours?.length) {
        return 'Open';
    }

    return hours
        .map((hour) => `${formatTime(hour.start)} — ${formatTime(hour.end)}`)
        .join(', ');
}

function deliveryModeSummary(mode: ServiceDeliveryMode): string {
    if (mode === 'both') {
        return 'In-studio & home service';
    }

    return mode === 'provider_visits_client'
        ? 'Home service only'
        : 'In-studio only';
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
            aria-label={`${rating} out of 5 stars`}
        >
            {Array.from({ length: 5 }, (_, index) => (
                <Star
                    key={index}
                    aria-hidden
                    className={cn(
                        'size-3.5',
                        index < Math.round(rating)
                            ? 'fill-ink text-ink'
                            : 'fill-line text-line',
                    )}
                />
            ))}
        </span>
    );
}

function SectionHeading({
    children,
    id,
}: {
    children: ReactNode;
    id?: string;
}) {
    return (
        <h2
            id={id}
            className="scroll-mt-24 text-[28px] font-bold tracking-tight"
        >
            {children}
        </h2>
    );
}

function TeamAvatar({ member, index }: { member: TeamMember; index: number }) {
    return (
        <li className="flex w-24 flex-col items-center text-center">
            <div className="relative">
                <Avatar
                    className={cn(
                        'size-[72px]',
                        TILE_STYLES[index % TILE_STYLES.length],
                    )}
                >
                    <AvatarImage
                        src={member.avatar ?? undefined}
                        alt=""
                        className="object-cover"
                    />
                    <AvatarFallback
                        className={cn(
                            'text-2xl font-semibold',
                            TILE_STYLES[index % TILE_STYLES.length],
                        )}
                    >
                        {initialsFrom(member.name)}
                    </AvatarFallback>
                </Avatar>
                {member.rating !== null && (
                    <span className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-line bg-white px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap">
                        {member.rating.toFixed(1)}
                        <Star className="size-2.5 fill-ink" aria-hidden />
                    </span>
                )}
            </div>
            <p className="mt-4 w-full truncate text-sm font-semibold">
                {member.name.split(' ')[0]}
            </p>
            <p className="w-full truncate text-xs text-moss">{member.role}</p>
        </li>
    );
}

function NearbyVenue({
    venue,
    index,
}: {
    venue: NearbyProvider;
    index: number;
}) {
    const place = venue.city || venue.address;

    return (
        <Link
            href={providerShow(venue.slug)}
            prefetch
            className="group block min-w-0"
        >
            <div
                className={cn(
                    'grid h-40 place-items-center overflow-hidden rounded-2xl',
                    TILE_STYLES[index % TILE_STYLES.length],
                )}
            >
                {venue.logo ? (
                    <img
                        src={venue.logo}
                        alt=""
                        className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                ) : (
                    <span className="text-[40px] font-semibold">
                        {tileLettersFrom(venue.businessName)}
                    </span>
                )}
            </div>
            <p className="mt-3 truncate font-semibold group-hover:underline">
                {venue.businessName}
            </p>
            <p className="mt-1 flex items-center gap-1 truncate text-sm text-moss">
                <span className="font-semibold text-ink">
                    {venue.reviewsCount ? venue.rating.toFixed(1) : 'New'}
                </span>
                <Star className="size-3 fill-ink text-ink" aria-hidden />
                <span>({venue.reviewsCount})</span>
                {place && <span className="truncate">· {place}</span>}
            </p>
            {venue.category && (
                <span className="mt-2 inline-flex rounded-full bg-mint px-2.5 py-0.5 text-xs font-medium text-forest">
                    {formatCategory(venue.category)}
                </span>
            )}
        </Link>
    );
}

export default function ProviderProfile({
    provider,
    services,
    workHours,
    reviews,
    teamMembers = [],
    ratingBreakdown = [],
    canEdit,
    isFavourite,
    nearbyProviders,
    galleryPreview = [],
    galleryTotal = 0,
}: Props) {
    const [isFavorite, setIsFavorite] = useState(isFavourite);
    const [activeTab, setActiveTab] = useState(FEATURED_TAB);
    const [showAllServices, setShowAllServices] = useState(false);
    const [profileKey, setProfileKey] = useState(provider.id);

    if (profileKey !== provider.id) {
        setProfileKey(provider.id);
        setActiveTab(FEATURED_TAB);
        setShowAllServices(false);
        setIsFavorite(isFavourite);
    }

    const selectTab = (tab: string) => {
        setActiveTab(tab);
        setShowAllServices(false);
    };

    const canBookProvider = provider.canBook ?? true;
    const bookingBlockedReason =
        provider.bookingBlockedReason ||
        'Booking is unavailable for this provider.';
    const deliveryMode = normalizeDeliveryMode(provider.serviceDeliveryMode);
    const hasLocation = Boolean(provider.latitude && provider.longitude);
    const fullAddress = formatAddress(provider.address, provider.city);

    const heroImages = useMemo(() => {
        const bannerImages = (provider.images ?? [])
            .filter((image) => !image.isLogo)
            .map((image) => image.url);
        const urls = [
            ...bannerImages,
            ...galleryPreview.map((image) => image.url),
        ];

        return urls.length
            ? urls.slice(0, 3)
            : [
                  getProviderDefaultBanner(
                      provider.category,
                      provider.id,
                  ).replace('-light.jpg', '-dark.jpg'),
              ];
    }, [provider.images, provider.category, provider.id, galleryPreview]);

    const serviceTabs = useMemo(() => {
        const names = new Set<string>();

        services.forEach((service) => {
            if (service.service_category_name) {
                names.add(service.service_category_name);
            }
        });

        return [FEATURED_TAB, ...names];
    }, [services]);

    const tabServices = useMemo(() => {
        if (activeTab === FEATURED_TAB) {
            return services;
        }

        return services.filter(
            (service) => service.service_category_name === activeTab,
        );
    }, [activeTab, services]);

    const visibleServices = showAllServices
        ? tabServices
        : tabServices.slice(0, FEATURED_SERVICES_LIMIT);
    const lowestPrice = services.length
        ? Math.min(...services.map((service) => Number(service.price) || 0))
        : null;

    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'long' });
    const openStatus = getOpenStatus(workHours, now);
    const hasWorkHours = Object.keys(workHours).length > 0;

    const orderedHours = WEEKDAYS.map(
        (day) => [day, workHours[day]] as const,
    ).filter((entry): entry is [string, WorkHours[string]] =>
        Boolean(entry[1]),
    );

    const breadcrumbs = [
        provider.state && {
            label: provider.state,
            href: explore.index({ query: { location: provider.state } }),
        },
        provider.city && {
            label: provider.city,
            href: explore.index({ query: { location: provider.city } }),
        },
        provider.category && {
            label: formatCategory(provider.category),
            href: explore.index({ query: { category: provider.category } }),
        },
    ].filter((crumb) => Boolean(crumb)) as Array<{
        label: string;
        href: ReturnType<typeof explore.index>;
    }>;

    const goodToKnow = [
        provider.autoConfirm && 'Instant confirmation',
        allowsHomeService(deliveryMode) && 'Home service available',
        allowsVisitProvider(deliveryMode) &&
            !allowsHomeService(deliveryMode) &&
            'Visit the studio',
        provider.acceptsOnlinePayment && 'Pay by wallet or card',
        provider.acceptsOfflinePayment && 'Pay at the venue',
        provider.isVerified && 'Verified business',
    ].filter((item): item is string => Boolean(item));

    const totalReviews = ratingBreakdown.reduce(
        (sum, bucket) => sum + bucket.count,
        0,
    );

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
        try {
            if (navigator.share) {
                await navigator.share({
                    title: provider.businessName,
                    url: window.location.href,
                });

                return;
            }

            await navigator.clipboard.writeText(window.location.href);
        } catch {
            return;
        }
    };

    const directionsUrl = hasLocation
        ? `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`
        : null;

    const ratingLabel = provider.reviews_count
        ? provider.rating.toFixed(1)
        : 'New';

    const openStatusNode = hasWorkHours && (
        <span>
            <span
                className={cn(
                    'font-semibold',
                    openStatus.isOpen ? 'text-leaf' : 'text-moss',
                )}
            >
                {openStatus.isOpen ? 'Open' : 'Closed'}
            </span>
            {openStatus.detail && (
                <span className="text-moss"> {openStatus.detail}</span>
            )}
        </span>
    );

    return (
        <GuestLayout>
            <Head title={provider.businessName} />
            <div
                className={cn(
                    'mx-auto w-full max-w-[1240px] px-4 pt-5 sm:px-6',
                    canBookProvider ? 'pb-28 md:pb-20' : 'pb-20',
                )}
            >
                <nav aria-label="Breadcrumb" className="text-xs text-moss">
                    <ol className="flex flex-wrap items-center gap-1.5">
                        <li>
                            <Link href={home()} className="hover:text-ink">
                                Home
                            </Link>
                        </li>
                        {breadcrumbs.map((crumb, index) => (
                            <li
                                key={crumb.label}
                                className="flex items-center gap-1.5"
                            >
                                <span aria-hidden>/</span>
                                <Link
                                    href={crumb.href}
                                    className={cn(
                                        'hover:text-ink',
                                        index === breadcrumbs.length - 1 &&
                                            'text-ink',
                                    )}
                                >
                                    {crumb.label}
                                </Link>
                            </li>
                        ))}
                    </ol>
                </nav>

                <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-[40px]">
                                {provider.businessName}
                            </h1>
                            {provider.isVerified && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-forest">
                                    <ShieldCheck className="size-3.5" />
                                    Verified
                                </span>
                            )}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                            <span className="inline-flex items-center gap-1.5">
                                <strong>{ratingLabel}</strong>
                                <StarRow rating={provider.rating} />
                                <a
                                    href="#reviews"
                                    className="font-medium text-forest underline underline-offset-2"
                                >
                                    ({provider.reviews_count.toLocaleString()})
                                </a>
                            </span>
                            {openStatusNode && (
                                <>
                                    <span className="text-sage" aria-hidden>
                                        •
                                    </span>
                                    {openStatusNode}
                                </>
                            )}
                            {fullAddress && (
                                <>
                                    <span className="text-sage" aria-hidden>
                                        •
                                    </span>
                                    <span className="max-w-[22rem] truncate text-moss">
                                        {fullAddress}
                                    </span>
                                </>
                            )}
                            {directionsUrl && (
                                <a
                                    href={directionsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-forest underline underline-offset-2"
                                >
                                    Get directions
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            type="button"
                            onClick={handleShare}
                            aria-label="Share profile"
                            className={iconButtonClass}
                        >
                            <Share className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleFavourite}
                            aria-label={
                                isFavorite ? 'Remove from saved' : 'Save venue'
                            }
                            aria-pressed={isFavorite}
                            className={iconButtonClass}
                        >
                            <Heart
                                className={cn(
                                    'size-4',
                                    isFavorite && 'fill-forest text-forest',
                                )}
                            />
                        </button>
                    </div>
                </header>

                <div
                    className={cn(
                        'relative mt-5 grid gap-2 overflow-hidden rounded-[20px]',
                        heroImages.length >= 3
                            ? 'h-80 grid-cols-[2fr_1fr] grid-rows-2 sm:h-[440px]'
                            : 'h-64 sm:h-[420px]',
                    )}
                >
                    {heroImages.map((url, index) => (
                        <div
                            key={`${url}-${index}`}
                            className={cn(
                                'overflow-hidden bg-mint',
                                index === 0 &&
                                    heroImages.length >= 3 &&
                                    'row-span-2',
                                heroImages.length === 2 &&
                                    index === 1 &&
                                    'hidden',
                            )}
                        >
                            <img
                                src={url}
                                alt={`${provider.businessName} photo ${index + 1}`}
                                className="size-full object-cover"
                            />
                        </div>
                    ))}
                    {galleryTotal > 0 && (
                        <Link
                            href={gallery(provider.slug)}
                            className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-md transition hover:bg-paper"
                        >
                            <LayoutGrid className="size-4" />
                            See all {galleryTotal} photos
                        </Link>
                    )}
                </div>

                {!canBookProvider && (
                    <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                        {bookingBlockedReason}
                    </p>
                )}

                <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
                    <div className="min-w-0 space-y-14">
                        <section aria-labelledby="services">
                            <SectionHeading id="services">
                                Services
                            </SectionHeading>

                            {serviceTabs.length > 1 && (
                                <div
                                    role="tablist"
                                    className="mt-4 flex gap-2 overflow-x-auto pb-1"
                                >
                                    {serviceTabs.map((tab) => {
                                        const isActive = activeTab === tab;

                                        return (
                                            <button
                                                key={tab}
                                                type="button"
                                                role="tab"
                                                aria-selected={isActive}
                                                onClick={() => selectTab(tab)}
                                                className={cn(
                                                    'h-9 shrink-0 rounded-full px-4 text-sm font-medium transition',
                                                    isActive
                                                        ? 'bg-forest text-white'
                                                        : 'border border-line bg-white hover:bg-paper',
                                                )}
                                            >
                                                {tab}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {visibleServices.length === 0 ? (
                                <p className="mt-6 text-sm text-moss">
                                    No services available.
                                </p>
                            ) : (
                                <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                                    {visibleServices.map((service) => (
                                        <li
                                            key={service.id}
                                            className="flex items-center justify-between gap-4 px-5 py-4"
                                        >
                                            <div className="min-w-0">
                                                <h3 className="font-semibold">
                                                    {service.name}
                                                </h3>
                                                {service.duration_minutes >
                                                    0 && (
                                                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-moss">
                                                        <Clock className="size-3" />
                                                        {formatDuration(
                                                            service.duration_minutes,
                                                        )}
                                                    </p>
                                                )}
                                                <p className="mt-1.5 text-sm font-semibold">
                                                    {formatNaira(service.price)}
                                                </p>
                                            </div>
                                            {canBookProvider ? (
                                                <Link
                                                    href={booking(
                                                        provider.slug,
                                                        {
                                                            query: {
                                                                service:
                                                                    service.id,
                                                            },
                                                        },
                                                    )}
                                                    className={pillButtonClass}
                                                    aria-label={`Book ${service.name}`}
                                                >
                                                    Book
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled
                                                    title={bookingBlockedReason}
                                                    className={cn(
                                                        pillButtonClass,
                                                        'cursor-not-allowed opacity-50',
                                                    )}
                                                >
                                                    Book
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {tabServices.length > FEATURED_SERVICES_LIMIT && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAllServices((value) => !value)
                                    }
                                    className={cn(pillButtonClass, 'mt-4')}
                                >
                                    {showAllServices
                                        ? 'Show fewer services'
                                        : `See all ${tabServices.length} services`}
                                </button>
                            )}
                        </section>

                        {teamMembers.length > 1 && (
                            <section aria-labelledby="team">
                                <SectionHeading id="team">Team</SectionHeading>
                                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-8 sm:justify-between">
                                    {teamMembers.map((member, index) => (
                                        <TeamAvatar
                                            key={member.id}
                                            member={member}
                                            index={index}
                                        />
                                    ))}
                                </ul>
                            </section>
                        )}

                        <section aria-labelledby="reviews">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <SectionHeading id="reviews">
                                    Reviews
                                </SectionHeading>
                                <ReviewSection
                                    reviews={reviews}
                                    canReview={provider.can_review}
                                    pendingAppointmentId={
                                        provider.pending_appointment_id
                                    }
                                    composerOnly
                                />
                            </div>

                            <div className="mt-5 grid gap-6 rounded-2xl bg-paper p-6 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
                                <div>
                                    <p className="text-5xl leading-none font-bold tracking-tight">
                                        {provider.reviews_count
                                            ? provider.rating.toFixed(1)
                                            : '–'}
                                    </p>
                                    <StarRow
                                        rating={provider.rating}
                                        className="mt-3"
                                    />
                                    <p className="mt-1.5 text-xs text-moss">
                                        {provider.reviews_count.toLocaleString()}{' '}
                                        verified{' '}
                                        {provider.reviews_count === 1
                                            ? 'review'
                                            : 'reviews'}
                                    </p>
                                </div>
                                <dl className="space-y-1.5">
                                    {ratingBreakdown.map((bucket) => (
                                        <div
                                            key={bucket.stars}
                                            className="grid grid-cols-[12px_minmax(0,1fr)_40px] items-center gap-3 text-xs"
                                        >
                                            <dt className="font-semibold">
                                                {bucket.stars}
                                            </dt>
                                            <dd className="h-1.5 overflow-hidden rounded-full bg-line">
                                                <span
                                                    className="block h-full rounded-full bg-forest"
                                                    style={{
                                                        width: `${totalReviews ? (bucket.count / totalReviews) * 100 : 0}%`,
                                                    }}
                                                />
                                            </dd>
                                            <dd className="text-right text-moss">
                                                {bucket.count.toLocaleString()}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>

                            {reviews.length === 0 ? (
                                <p className="mt-6 text-sm text-moss">
                                    No reviews yet. Book a service and be the
                                    first to leave one.
                                </p>
                            ) : (
                                <ul className="mt-6 grid gap-x-10 gap-y-7 sm:grid-cols-2">
                                    {reviews
                                        .slice(0, REVIEWS_PREVIEW_LIMIT)
                                        .map((review) => (
                                            <li key={review.id}>
                                                <div className="flex items-center gap-3">
                                                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint text-sm font-semibold text-forest">
                                                        {review.client_name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold capitalize">
                                                            {review.client_name}
                                                        </p>
                                                        <p className="truncate text-xs text-moss">
                                                            {[
                                                                review.date_label ??
                                                                    review.created_at,
                                                                review.service_name,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' · ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <StarRow
                                                    rating={review.rating}
                                                    className="mt-3"
                                                />
                                                {review.comment && (
                                                    <p className="mt-2 text-sm leading-6">
                                                        {review.comment}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                </ul>
                            )}

                            {reviews.length > REVIEWS_PREVIEW_LIMIT && (
                                <div className="mt-6">
                                    <ReviewDrawal
                                        reviews={reviews}
                                        triggerLabel="See all reviews"
                                        triggerClassName={pillButtonClass}
                                    />
                                </div>
                            )}
                        </section>

                        <section aria-labelledby="about">
                            <SectionHeading id="about">About</SectionHeading>
                            <p className="mt-3 max-w-2xl text-sm leading-7">
                                {provider.description ||
                                    'This provider has not added a description yet.'}
                            </p>

                            {hasLocation && (
                                <div className="mt-5 h-56 overflow-hidden rounded-2xl bg-mint">
                                    <iframe
                                        title={`${provider.businessName} map`}
                                        src={`https://www.google.com/maps?q=${provider.latitude},${provider.longitude}&z=15&output=embed`}
                                        className="size-full border-0"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                            )}

                            <div className="mt-6 grid gap-8 sm:grid-cols-2">
                                {orderedHours.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold">
                                            Opening times
                                        </h3>
                                        <dl className="mt-3 space-y-2 text-sm">
                                            {orderedHours.map(
                                                ([day, hours]) => {
                                                    const isToday =
                                                        day === today;

                                                    return (
                                                        <div
                                                            key={day}
                                                            className={cn(
                                                                'flex items-center justify-between gap-4',
                                                                isToday &&
                                                                    'font-bold',
                                                            )}
                                                        >
                                                            <dt className="flex items-center gap-2.5">
                                                                <span
                                                                    aria-hidden
                                                                    className={cn(
                                                                        'size-1.5 rounded-full',
                                                                        hours.isOpen
                                                                            ? 'bg-leaf'
                                                                            : 'bg-sage',
                                                                    )}
                                                                />
                                                                {day}
                                                            </dt>
                                                            <dd
                                                                className={cn(
                                                                    'text-right',
                                                                    !hours.isOpen &&
                                                                        'text-moss',
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
                                                },
                                            )}
                                        </dl>
                                    </div>
                                )}

                                {goodToKnow.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold">
                                            Good to know
                                        </h3>
                                        <ul className="mt-3 space-y-2.5 text-sm">
                                            {goodToKnow.map((item) => (
                                                <li
                                                    key={item}
                                                    className="flex items-center gap-3"
                                                >
                                                    <span className="grid size-6 place-items-center rounded-md bg-mint text-forest">
                                                        <Check className="size-3.5" />
                                                    </span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-24">
                        <section className="rounded-2xl border border-line bg-white p-6 shadow-[0_8px_30px_rgba(19,32,27,0.06)]">
                            <h2 className="text-xl font-bold tracking-tight">
                                {provider.businessName}
                            </h2>
                            <p className="mt-1 flex items-center gap-1 text-sm">
                                <strong>{ratingLabel}</strong>
                                <Star
                                    className="size-3.5 fill-ink"
                                    aria-hidden
                                />
                                <a
                                    href="#reviews"
                                    className="text-forest underline underline-offset-2"
                                >
                                    ({provider.reviews_count.toLocaleString()})
                                </a>
                            </p>

                            {canBookProvider ? (
                                <Link
                                    href={booking(provider.slug)}
                                    className={cn(primaryButtonClass, 'mt-5')}
                                >
                                    Book now
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    title={bookingBlockedReason}
                                    className={cn(primaryButtonClass, 'mt-5')}
                                >
                                    Book now
                                </button>
                            )}

                            <ul className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
                                {openStatusNode && (
                                    <li className="flex items-start gap-3">
                                        <Clock className="mt-0.5 size-4 shrink-0" />
                                        {openStatusNode}
                                    </li>
                                )}
                                {fullAddress && (
                                    <li className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 size-4 shrink-0" />
                                        <span>
                                            {fullAddress}
                                            {directionsUrl && (
                                                <a
                                                    href={directionsUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block font-semibold text-forest underline underline-offset-2"
                                                >
                                                    Get directions
                                                </a>
                                            )}
                                        </span>
                                    </li>
                                )}
                                {provider.phone && (
                                    <li className="flex items-center gap-3">
                                        <Phone className="size-4 shrink-0" />
                                        <a
                                            href={`tel:${provider.phone}`}
                                            className="hover:underline"
                                        >
                                            {provider.phone}
                                        </a>
                                    </li>
                                )}
                                <li className="flex items-center gap-3">
                                    <House className="size-4 shrink-0" />
                                    {deliveryModeSummary(deliveryMode)}
                                </li>
                            </ul>
                        </section>

                        {provider.acceptsOnlinePayment && (
                            <section className="flex items-start gap-3 rounded-2xl bg-forest p-4 text-white">
                                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-lime">
                                    <CreditCard className="size-4" />
                                </span>
                                <div className="text-sm">
                                    <p className="font-semibold">
                                        Pay with your Proxideck wallet
                                    </p>
                                    <p className="mt-0.5 text-white/75">
                                        Deposit held safely until your
                                        appointment.
                                    </p>
                                </div>
                            </section>
                        )}
                    </aside>
                </div>

                {nearbyProviders.length > 0 && (
                    <section aria-labelledby="venues-nearby" className="mt-16">
                        <SectionHeading id="venues-nearby">
                            Venues nearby
                        </SectionHeading>
                        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {nearbyProviders.map((venue, index) => (
                                <NearbyVenue
                                    key={venue.id}
                                    venue={venue}
                                    index={index}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {canBookProvider && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                {provider.businessName}
                            </p>
                            {lowestPrice !== null && (
                                <p className="text-sm text-moss">
                                    from {formatNaira(lowestPrice)}
                                </p>
                            )}
                        </div>
                        <Link
                            href={booking(provider.slug)}
                            className={cn(
                                primaryButtonClass,
                                'w-auto shrink-0',
                            )}
                        >
                            Book now
                        </Link>
                    </div>
                </div>
            )}

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
