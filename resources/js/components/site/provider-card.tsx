import { getProviderDefaultBanner } from '@/lib/provider-banner';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import favourite from '@/routes/favourite';
import { show as providerShow } from '@/routes/provider';
import { type Provider, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { BadgeCheck, Heart, Star } from 'lucide-react';
import { type ReactNode } from 'react';

interface ProviderCardProps {
    provider: Provider;
    isFavourite?: boolean;
    /** Extra content under the price line (e.g. "Book again"). */
    footer?: ReactNode;
}

export const formatNaira = (amount: number | string): string =>
    `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

export function ProviderCard({ provider, isFavourite = false, footer }: ProviderCardProps) {
    const { auth } = usePage<SharedData>().props;
    const cover = provider.banners?.[0] ?? getProviderDefaultBanner(provider.category, provider.id);
    const location = [provider.city ?? provider.address, provider.distance != null ? `${provider.distance} km` : null]
        .filter(Boolean)
        .join(' · ');

    const toggleFavourite = () => {
        if (!auth?.user) {
            router.visit(login());
            return;
        }

        router.post(favourite.update(), { id: provider.businessId }, { preserveScroll: true });
    };

    return (
        <article className="group flex flex-col gap-3 font-heading text-ink">
            <div className="relative h-55 overflow-hidden rounded-[20px] bg-mint">
                <Link href={providerShow(provider.slug)} aria-label={provider.businessName}>
                    <img
                        src={cover}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                </Link>
                {provider.isAvailableToday && (
                    <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-forest">
                        Open today
                    </span>
                )}
                <button
                    type="button"
                    onClick={toggleFavourite}
                    aria-label={isFavourite ? `Remove ${provider.businessName} from favourites` : `Save ${provider.businessName}`}
                    aria-pressed={isFavourite}
                    className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-white shadow-sm"
                >
                    <Heart className={cn('size-4.5 text-ink', isFavourite && 'fill-forest text-forest')} />
                </button>
            </div>

            <div className="flex items-baseline justify-between gap-2">
                <Link href={providerShow(provider.slug)} className="flex items-center gap-1.5 text-[17px] font-bold">
                    {provider.businessName}
                    {provider.isVerified && <BadgeCheck className="size-4 text-leaf" aria-label="Verified" />}
                </Link>
                {provider.reviewsCount > 0 && (
                    <span className="flex shrink-0 items-center gap-1 text-sm">
                        <strong>{provider.rating}</strong>
                        <Star className="size-3.5 fill-ink" />
                        <span className="text-moss">({provider.reviewsCount})</span>
                    </span>
                )}
            </div>

            <div className="-mt-1.5 text-sm text-moss">
                {location && `${location} · `}
                {Number(provider.minPrice) > 0 && (
                    <>
                        from <strong className="text-ink">{formatNaira(provider.minPrice)}</strong>
                    </>
                )}
            </div>

            {provider.services?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {provider.services.map((service) => (
                        <span key={service} className="rounded-full border border-[#DDE3DE] px-3 py-1.5 text-[13px] font-medium">
                            {service}
                        </span>
                    ))}
                </div>
            )}

            {footer}
        </article>
    );
}
