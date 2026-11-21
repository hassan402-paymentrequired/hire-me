import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProviderDefaultBanner } from '@/lib/provider-banner';
import { login } from '@/routes';
import favourite from '@/routes/favourite';
import { show as providerShow } from '@/routes/provider';
import type { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { BadgeCheck, Heart, MapPin, Star } from 'lucide-react';
import { useState } from 'react';

interface ProviderProps {
    id: string | number;
    name: string;
    address: string;
    businessName: string;
    slug: string;
    businessId?: string;
    logo?: string | null;
    avatar?: string | null;
    banners?: string[];
    distance?: number | null;
    city?: string | null;
    isAvailableToday?: boolean;
    servicesCount: number;
    rating: number;
    reviewsCount: number;
    minPrice: number | string;
    services?: string[];
    category?: string | null;
    isVerified?: boolean;
}

const getStableIndex = (value: string | number, length: number): number => {
    const hash = Array.from(String(value)).reduce(
        (total, character) => (total * 31 + character.charCodeAt(0)) >>> 0,
        0,
    );

    return hash % length;
};

const getInitials = (name: string): string =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();

const BusinessCard = ({
    provider,
    favoriteBusinessIds,
}: {
    provider: ProviderProps;
    favoriteBusinessIds?: string[];
}) => {
    const { auth } = usePage<SharedData>().props;
    const defaultBanner = getProviderDefaultBanner(
        provider.category,
        provider.id,
    );
    const uploadedBanners = provider.banners ?? [];
    const bannerIndex = getStableIndex(
        provider.id,
        Math.max(uploadedBanners.length, 1),
    );
    const [bannerSource, setBannerSource] = useState(
        uploadedBanners[bannerIndex] ?? defaultBanner,
    );
    const [isFavorite, setIsFavorite] = useState(
        favoriteBusinessIds?.includes(provider.businessId ?? '') ?? false,
    );

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
            favourite.update.url(),
            { id: provider.businessId },
            {
                preserveScroll: true,
                onError: () => setIsFavorite(!nextFavoriteState),
            },
        );
    };

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border/70 bg-card text-card-foreground transition duration-200 hover:shadow-lg">
            <div className="relative h-40 shrink-0 overflow-hidden bg-muted sm:h-44">
                <Link
                    href={providerShow(provider.slug)}
                    className="absolute inset-0"
                    prefetch
                    aria-label={`View ${provider.businessName}`}
                >
                    <img
                        src={bannerSource}
                        alt={`${provider.businessName} banner`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        onError={() => {
                            if (bannerSource !== defaultBanner) {
                                setBannerSource(defaultBanner);
                            }
                        }}
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
                    {provider.category && (
                        <span className="absolute top-4 left-4 max-w-[65%] truncate rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-emerald-950 shadow-sm backdrop-blur-sm">
                            {provider.category}
                        </span>
                    )}
                    {provider.isAvailableToday && (
                        <span className="absolute right-4 bottom-4 rounded-full bg-lime-300 px-3.5 py-1.5 text-xs font-bold text-emerald-950 shadow-sm sm:text-sm">
                            Available today
                        </span>
                    )}
                </Link>
                <button
                    type="button"
                    onClick={toggleFavorite}
                    aria-label={
                        isFavorite
                            ? `Remove ${provider.businessName} from favorites`
                            : `Add ${provider.businessName} to favorites`
                    }
                    aria-pressed={isFavorite}
                    disabled={!provider.businessId}
                    className="absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition hover:scale-105 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <Heart
                        className={`size-5 transition-colors ${
                            isFavorite
                                ? 'fill-rose-500 text-rose-500'
                                : 'text-emerald-950'
                        }`}
                    />
                </button>
            </div>

            <Link
                href={providerShow(provider.slug)}
                className="flex flex-1 flex-col px-5 pb-5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
                prefetch
            >
                <div className="-mt-9 mb-3 flex items-end justify-between">
                    <Avatar className="size-[72px] border-4 border-card bg-emerald-50 shadow-sm dark:bg-emerald-950">
                        <AvatarImage
                            src={provider.logo ?? provider.avatar ?? undefined}
                            alt={provider.businessName}
                        />
                        <AvatarFallback className="bg-emerald-50 text-lg font-bold text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">
                            {getInitials(
                                provider.businessName || provider.name,
                            )}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h3 className="line-clamp-1 text-lg leading-tight font-bold text-foreground capitalize">
                            {provider.businessName}
                        </h3>
                        {provider.isVerified && (
                            <BadgeCheck
                                aria-label="Verified artisan"
                                className="size-[18px] shrink-0 fill-emerald-900 text-lime-300"
                            />
                        )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            {provider.reviewsCount
                                ? provider.rating.toFixed(1)
                                : 'New'}
                        </span>
                        <span>({provider.reviewsCount || 0})</span>
                        <span aria-hidden="true">·</span>
                        <MapPin className="size-3.5 text-emerald-800 dark:text-emerald-300" />
                        {provider.distance !== null &&
                        provider.distance !== undefined
                            ? `${provider.distance.toFixed(1)} km`
                            : null}
                        {provider.distance !== null &&
                            provider.distance !== undefined &&
                            (provider.city || provider.address) && (
                                <span aria-hidden="true">·</span>
                            )}
                        {provider.city || provider.address ? (
                            <span className="line-clamp-1">
                                {provider.city || provider.address}
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="mt-4 flex min-h-8 flex-wrap gap-2">
                    {(provider.services ?? []).slice(0, 3).map((service) => (
                        <span
                            key={service}
                            className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100"
                        >
                            {service}
                        </span>
                    ))}
                    {provider.servicesCount > 3 && (
                        <span className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
                            +{provider.servicesCount - 3}
                        </span>
                    )}
                </div>

                <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/70 pt-4">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Starting from
                        </p>
                        <p className="text-2xl leading-tight font-bold text-emerald-950 dark:text-emerald-100">
                            ₦{Number(provider.minPrice).toLocaleString()}
                        </p>
                    </div>
                    <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-950 px-5 text-sm font-semibold text-white transition-colors group-hover:bg-emerald-800 dark:bg-emerald-700 dark:group-hover:bg-emerald-600">
                        Book now
                    </span>
                </div>
            </Link>
        </article>
    );
};

export default BusinessCard;
