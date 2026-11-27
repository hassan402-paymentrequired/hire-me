import KiroChat from '@/components/kiro/kiro-chat';
import { ReviewSection } from '@/components/reviews/review-section';
import { SiteNav } from '@/components/site/site-nav';
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
import { OpeningHoursChart } from '@/pages/marketplace/components/opening-hours-chart';
import ReviewDrawal from '@/pages/marketplace/components/review-drawal';
import { home, login } from '@/routes';
import explore from '@/routes/explore';
import favourite from '@/routes/favourite';
import { booking } from '@/routes/marketplace';
import { gallery, show as providerShow } from '@/routes/provider';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock,
    CreditCard,
    Heart,
    House,
    LayoutGrid,
    MapPin,
    Phone,
    Plus,
    Share,
    ShieldCheck,
    Star,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

const PROFILE_SECTIONS = [
    { id: 'services', label: 'Services' },
    { id: 'team', label: 'Team' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'about', label: 'About' },
] as const;

interface Service {
    id: string;
    name: string;
    description: string;
    duration_minutes: number;
    price: number;
    price_is_starting?: boolean;
    service_category_id?: string | null;
    service_category_name?: string | null;
}

interface Provider {
    id: string;
    name: string;
    avatar?: string | null;
    logo?: string | null;
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
    busyFrom?: string | null;
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

const heroOverlayButtonClass =
    'grid size-11 place-items-center rounded-full border-0 bg-white shadow-md transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest';

const plusButtonClass =
    'grid size-11 shrink-0 place-items-center rounded-full border border-line bg-white transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest disabled:cursor-not-allowed disabled:opacity-50';

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
    closesAt?: string | null;
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
            return {
                isOpen: true,
                detail: `until ${formatTime(current.end)}`,
                closesAt: formatTime(current.end),
            };
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
                            ? 'fill-forest text-forest'
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
            className="scroll-mt-28 text-[22px] font-bold tracking-tight md:scroll-mt-24 md:text-[28px]"
        >
            {children}
        </h2>
    );
}

function ProviderProfileAvatar({
    businessName,
    photoUrl,
    className,
}: {
    businessName: string;
    photoUrl?: string | null;
    className?: string;
}) {
    return (
        <Avatar
            className={cn(
                'size-14 shrink-0 border-2 border-white shadow-[0_4px_16px_rgba(19,32,27,0.12)] sm:size-[72px]',
                className,
            )}
        >
            <AvatarImage
                src={photoUrl ?? undefined}
                alt=""
                className="object-cover"
            />
            <AvatarFallback className="bg-forest text-base font-bold text-lime sm:text-lg">
                {tileLettersFrom(businessName)}
            </AvatarFallback>
        </Avatar>
    );
}

function TeamAvatar({ member, index }: { member: TeamMember; index: number }) {
    return (
        <li className="flex w-20 shrink-0 flex-col items-center text-center md:w-24">
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
    const [activeSection, setActiveSection] = useState('services');

    if (profileKey !== provider.id) {
        setProfileKey(provider.id);
        setActiveTab(FEATURED_TAB);
        setShowAllServices(false);
        setIsFavorite(isFavourite);
        setActiveSection('services');
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

    const photoCount = galleryTotal > 0 ? galleryTotal : heroImages.length;

    const gallerySlots = useMemo(() => {
        if (!heroImages.length) {
            return [
                getProviderDefaultBanner(
                    provider.category,
                    provider.id,
                ).replace('-light.jpg', '-dark.jpg'),
            ];
        }

        const slots = [...heroImages];

        while (slots.length < 3) {
            slots.push(slots[0]);
        }

        return slots.slice(0, 3);
    }, [heroImages, provider.category, provider.id]);

    const visibleSections = useMemo(
        () =>
            PROFILE_SECTIONS.filter(
                (section) => section.id !== 'team' || teamMembers.length > 0,
            ),
        [teamMembers.length],
    );

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        document
            .getElementById(sectionId)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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

    const hoursHeadline = openStatus.isOpen
        ? `Open now${openStatus.closesAt ? ` · closes ${openStatus.closesAt}` : ''}`
        : `Closed${openStatus.detail ? ` ${openStatus.detail}` : ''}`;

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
                <span className="font-normal text-moss">
                    {openStatus.isOpen
                        ? ` ${openStatus.detail}`
                        : ` ${openStatus.detail}`}
                </span>
            )}
        </span>
    );

    const mobileHeroImage = heroImages[0];
    const locationLabel = provider.city || fullAddress;
    const profilePhoto = provider.logo ?? provider.avatar ?? null;

    return (
        <GuestLayout nav="none">
            <Head title={provider.businessName} />
            <div className="hidden md:block">
                <SiteNav />
            </div>
            <div
                className={cn(
                    'mx-auto w-full max-w-[1240px] px-4 sm:px-6',
                    canBookProvider ? 'pb-28 md:pb-20' : 'pb-20',
                    'pt-0 md:pt-5',
                )}
            >
                <div className="relative -mx-4 h-[300px] overflow-hidden bg-mint md:hidden">
                    <img
                        src={mobileHeroImage}
                        alt=""
                        className="size-full object-cover"
                    />
                    <div className="absolute inset-x-0 top-4 flex items-center justify-between px-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            aria-label="Go back"
                            className={heroOverlayButtonClass}
                        >
                            <ArrowLeft className="size-4" />
                        </button>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleShare}
                                aria-label="Share profile"
                                className={heroOverlayButtonClass}
                            >
                                <Share className="size-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleFavourite}
                                aria-label={
                                    isFavorite
                                        ? 'Remove from saved'
                                        : 'Save venue'
                                }
                                aria-pressed={isFavorite}
                                className={heroOverlayButtonClass}
                            >
                                <Heart
                                    className={cn(
                                        'size-4',
                                        isFavorite && 'fill-forest text-forest',
                                    )}
                                />
                            </button>
                        </div>
                    </div>
                    {photoCount > 0 && (
                        <Link
                            href={gallery(provider.slug)}
                            className="absolute right-4 bottom-4 rounded-full bg-ink/70 px-2.5 py-1.5 text-xs font-semibold text-white"
                        >
                            1 / {photoCount}
                        </Link>
                    )}
                </div>

                <div className="pt-5 md:hidden">
                    <div className="-mt-16 mb-3 flex items-end gap-3.5">
                        <ProviderProfileAvatar
                            businessName={provider.businessName}
                            photoUrl={profilePhoto}
                        />
                        <div className="min-w-0 flex-1 pb-0.5">
                            <h1 className="text-[28px] leading-tight font-bold tracking-tight">
                                {provider.businessName}
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-sm">
                        <strong>{ratingLabel}</strong>
                        <Star className="size-3.5 fill-ink text-ink" />
                        <a
                            href="#reviews"
                            className="font-semibold text-forest underline underline-offset-2"
                            onClick={(event) => {
                                event.preventDefault();
                                scrollToSection('reviews');
                            }}
                        >
                            ({provider.reviews_count.toLocaleString()})
                        </a>
                        {provider.isVerified && (
                            <>
                                <span className="text-sage" aria-hidden>
                                    •
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-xs font-semibold text-forest">
                                    <ShieldCheck className="size-3" />
                                    Verified
                                </span>
                            </>
                        )}
                    </div>
                    {(openStatusNode || locationLabel) && (
                        <p className="mt-2 text-sm text-moss">
                            {openStatusNode}
                            {openStatusNode && locationLabel && (
                                <span className="text-sage"> · </span>
                            )}
                            {locationLabel}
                        </p>
                    )}
                </div>

                <nav
                    aria-label="Page sections"
                    className="sticky top-0 z-30 -mx-4 mt-5 flex gap-6 overflow-x-auto border-b border-line bg-white/95 px-4 pb-px backdrop-blur md:hidden"
                >
                    {visibleSections.map((section) => {
                        const isActive = activeSection === section.id;

                        return (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => scrollToSection(section.id)}
                                className={cn(
                                    'shrink-0 border-b-2 py-3 text-[15px] transition',
                                    isActive
                                        ? 'border-forest font-bold text-ink'
                                        : 'border-transparent text-moss',
                                )}
                            >
                                {section.label}
                            </button>
                        );
                    })}
                </nav>

                <nav
                    aria-label="Breadcrumb"
                    className="hidden text-xs text-moss md:block"
                >
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

                <header className="mt-4 hidden flex-wrap items-end justify-between gap-4 md:flex">
                    <div className="flex min-w-0 items-end gap-4">
                        <ProviderProfileAvatar
                            businessName={provider.businessName}
                            photoUrl={profilePhoto}
                        />
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

                <div className="relative mt-5 hidden h-80 grid-cols-[2fr_1fr] grid-rows-2 gap-2 overflow-hidden rounded-[20px] sm:h-[440px] md:grid">
                    {gallerySlots.map((url, index) => (
                        <div
                            key={`${url}-${index}`}
                            className={cn(
                                'overflow-hidden bg-mint',
                                index === 0 && 'row-span-2',
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

                <div className="mt-6 grid items-start gap-10 md:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-12">
                    <div className="min-w-0 space-y-10 md:space-y-14">
                        <section
                            aria-labelledby="services-heading"
                            id="services"
                        >
                            <SectionHeading id="services-heading">
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
                                                    'h-[38px] shrink-0 rounded-full px-4 text-sm font-medium transition',
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
                                <ul className="mt-4 divide-y divide-line md:overflow-hidden md:rounded-2xl md:border md:border-line">
                                    {visibleServices.map((service) => (
                                        <li
                                            key={service.id}
                                            className="flex items-center justify-between gap-3 py-4 md:gap-4 md:px-5"
                                        >
                                            <div className="min-w-0">
                                                <h3 className="text-base font-semibold">
                                                    {service.name}
                                                </h3>
                                                {service.duration_minutes >
                                                    0 && (
                                                    <p className="mt-0.5 text-[13px] text-moss md:inline-flex md:items-center md:gap-1 md:text-xs">
                                                        <Clock className="hidden size-3 md:inline" />
                                                        {formatDuration(
                                                            service.duration_minutes,
                                                        )}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-sm font-semibold">
                                                    {service.price_is_starting &&
                                                        'from '}
                                                    {formatNaira(service.price)}
                                                </p>
                                            </div>
                                            {canBookProvider ? (
                                                <>
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
                                                        className={cn(
                                                            pillButtonClass,
                                                            'hidden md:inline-flex',
                                                        )}
                                                        aria-label={`Book ${service.name}`}
                                                    >
                                                        Book
                                                    </Link>
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
                                                        className={cn(
                                                            plusButtonClass,
                                                            'md:hidden',
                                                        )}
                                                        aria-label={`Add ${service.name}`}
                                                    >
                                                        <Plus className="size-4" />
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        disabled
                                                        title={
                                                            bookingBlockedReason
                                                        }
                                                        className={cn(
                                                            pillButtonClass,
                                                            'hidden cursor-not-allowed opacity-50 md:inline-flex',
                                                        )}
                                                    >
                                                        Book
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled
                                                        title={
                                                            bookingBlockedReason
                                                        }
                                                        className={cn(
                                                            plusButtonClass,
                                                            'md:hidden',
                                                        )}
                                                    >
                                                        <Plus className="size-4" />
                                                    </button>
                                                </>
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

                        {teamMembers.length > 0 && (
                            <section aria-labelledby="team-heading" id="team">
                                <div className="flex items-center justify-between gap-3">
                                    <SectionHeading id="team-heading">
                                        Team
                                    </SectionHeading>
                                    {teamMembers.length >= 5 && (
                                        <span className="shrink-0 text-sm font-semibold text-forest underline underline-offset-2">
                                            See all
                                        </span>
                                    )}
                                </div>
                                <ul className="mt-6 flex gap-4 overflow-x-auto pb-1 md:mt-8 md:flex-wrap md:justify-between md:gap-x-4 md:gap-y-8 md:overflow-visible md:pb-0 lg:gap-x-6">
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

                        <section aria-labelledby="reviews-heading" id="reviews">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <SectionHeading id="reviews-heading">
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

                            <div className="mt-5 grid gap-4 rounded-2xl bg-paper p-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center sm:gap-6 sm:p-6">
                                <div className="flex items-center gap-3.5 sm:block">
                                    <p className="text-4xl leading-none font-bold tracking-tight sm:text-5xl">
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
                                <dl className="hidden space-y-1.5 sm:block">
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
                                <ul className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:gap-x-10">
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
                                                    className="mt-2.5 sm:mt-3"
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

                        <section aria-labelledby="about-heading" id="about">
                            <SectionHeading id="about-heading">
                                <span className="md:hidden">About</span>
                                <span className="hidden md:inline">
                                    About & visit
                                </span>
                            </SectionHeading>
                            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink/90 md:text-sm">
                                {provider.description ||
                                    'This provider has not added a description yet.'}
                            </p>

                            {(hasWorkHours ||
                                goodToKnow.length > 0 ||
                                hasLocation) && (
                                <div
                                    className={cn(
                                        'mt-6 grid gap-4',
                                        hasLocation &&
                                            (hasWorkHours ||
                                                goodToKnow.length > 0) &&
                                            'md:grid-cols-2',
                                    )}
                                >
                                    {(hasWorkHours ||
                                        goodToKnow.length > 0) && (
                                        <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_30px_rgba(19,32,27,0.06)]">
                                            {hasWorkHours && (
                                                <>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-moss">
                                                                Hours this week
                                                            </p>
                                                            <h3
                                                                className={cn(
                                                                    'mt-0.5 text-lg leading-snug font-bold',
                                                                    openStatus.isOpen
                                                                        ? 'text-forest'
                                                                        : 'text-ink',
                                                                )}
                                                            >
                                                                {hoursHeadline}
                                                            </h3>
                                                        </div>
                                                        {openStatus.isOpen &&
                                                            provider.busyFrom && (
                                                                <span className="shrink-0 rounded-full bg-lime px-2.5 py-1 text-[11px] font-semibold text-forest">
                                                                    Busy after{' '}
                                                                    {
                                                                        provider.busyFrom
                                                                    }
                                                                </span>
                                                            )}
                                                    </div>
                                                    <OpeningHoursChart
                                                        workHours={workHours}
                                                        todayName={today}
                                                        now={now}
                                                    />
                                                </>
                                            )}

                                            {goodToKnow.length > 0 && (
                                                <ul
                                                    aria-label="Good to know"
                                                    className={cn(
                                                        'flex flex-wrap gap-2',
                                                        hasWorkHours &&
                                                            'mt-5 border-t border-line pt-5',
                                                    )}
                                                >
                                                    {goodToKnow.map((item) => (
                                                        <li
                                                            key={item}
                                                            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium"
                                                        >
                                                            <span
                                                                aria-hidden
                                                                className="size-1.5 rounded-full bg-leaf"
                                                            />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    {hasLocation && (
                                        <div className="h-64 overflow-hidden rounded-2xl bg-mint md:h-auto md:min-h-80">
                                            <iframe
                                                title={`${provider.businessName} map`}
                                                src={`https://www.google.com/maps?q=${provider.latitude},${provider.longitude}&z=15&output=embed`}
                                                className="size-full border-0"
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block">
                        <section className="rounded-2xl border border-line bg-white p-6 shadow-[0_8px_30px_rgba(19,32,27,0.08)]">
                            <div className="flex flex-wrap items-center gap-3">
                                <ProviderProfileAvatar
                                    businessName={provider.businessName}
                                    photoUrl={profilePhoto}
                                    className="size-12 border-line shadow-none"
                                />
                                <h2 className="text-xl font-bold tracking-tight">
                                    {provider.businessName}
                                </h2>
                                {provider.isVerified && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-forest">
                                        <ShieldCheck className="size-3" />
                                        Verified
                                    </span>
                                )}
                            </div>
                            <p className="mt-1.5 flex items-center gap-1 text-sm">
                                <strong>{ratingLabel}</strong>
                                <Star
                                    className="size-3.5 fill-forest text-forest"
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
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-5 py-3.5 shadow-[0_-8px_24px_rgba(19,32,27,0.06)] backdrop-blur md:hidden">
                    <div className="mx-auto flex max-w-6xl items-center gap-4">
                        <div className="min-w-0 flex-1">
                            <p className="text-[13px] text-moss">
                                {services.length}{' '}
                                {services.length === 1 ? 'service' : 'services'}{' '}
                                available
                            </p>
                            {lowestPrice !== null && (
                                <p className="text-[15px] font-bold">
                                    from {formatNaira(lowestPrice)}
                                </p>
                            )}
                        </div>
                        <Link
                            href={booking(provider.slug)}
                            className={cn(
                                primaryButtonClass,
                                'h-[52px] w-auto shrink-0 px-7',
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
