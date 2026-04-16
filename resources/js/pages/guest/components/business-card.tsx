import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { MapPin, Star } from 'lucide-react';
import { useState } from 'react';

interface ProviderProps {
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
    description?: string;
    services?: string[];
    category?: string;
    isVerified?: boolean;
}

const BusinessCard = ({ provider }: { provider: ProviderProps }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const showImage = provider.logo && !imageError;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .slice(0, 2)
            .map((word) => word[0])
            .join('')
            .toUpperCase();
    };

    const initials = getInitials(provider.businessName || provider.name);

    return (
        <Link
            href={`/provider/${provider.slug}`}
            className="group flex flex-col space-y-3 font-heading transition-all hover:scale-[1.02] active:scale-[0.98]"
            prefetch
        >
            {/* Card Image/Placeholder */}
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-primary/20 to-primary/5">
                {showImage ? (
                    <>
                        {!imageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                        )}
                        <img
                            src={provider.logo || undefined}
                            alt={provider.businessName}
                            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${
                                imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            onError={() => {
                                setImageError(true);
                                setImageLoaded(false);
                            }}
                            onLoad={() => setImageLoaded(true)}
                            loading="lazy"
                        />
                    </>
                ) : (
                    <div className="p-6 text-center">
                        <h3 className="mb-2 line-clamp-2 text-2xl font-bold text-foreground">
                            {provider.businessName}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-sm text-muted-foreground">
                                {provider.servicesCount}{' '}
                                {provider.servicesCount === 1
                                    ? 'service'
                                    : 'services'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Hover Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Category Badge - Top Left */}
                {provider.category && (
                    <div className="absolute top-2 left-2">
                        <Badge className="border-none bg-primary/90 text-xs font-semibold text-primary-foreground shadow-lg backdrop-blur-sm">
                            {provider.category}
                        </Badge>
                    </div>
                )}

                {/* Distance Badge - Top Right */}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
                    {provider.distance !== null &&
                        provider.distance !== undefined && (
                            <Badge className="flex items-center gap-1 border-none bg-background/90 text-xs font-medium text-foreground shadow-lg backdrop-blur-sm hover:bg-background/95">
                                <MapPin className="h-3 w-3 text-primary" />
                                {provider.distance.toFixed(1)}km
                            </Badge>
                        )}
                </div>

                {/* Price Tag - Bottom Left */}
                <div className="absolute bottom-2 left-2">
                    <Badge className="border-none bg-background/95 text-sm font-semibold text-foreground shadow-lg backdrop-blur-sm hover:bg-background">
                        From ₦{Number(provider.minPrice).toLocaleString()}
                    </Badge>
                </div>
            </div>

            {/* Card Info */}
            <div>
                {/* Business Name + Avatar + Verified Badge */}
                <div className="flex items-start gap-2">
                    {/* Avatar */}
                    <Avatar className="mt-0.5 h-10 w-10 shrink-0 border-2 border-border">
                        {provider.avatar && (
                            <AvatarImage
                                src={provider.avatar}
                                alt={provider.name}
                            />
                        )}
                        <AvatarFallback className="bg-muted text-xs font-semibold text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    {/* Business Info */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                            <h3 className="line-clamp-1 text-base font-bold text-foreground capitalize">
                                {provider.businessName}
                            </h3>
                            {provider.isVerified && (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                                    />
                                </svg>
                            )}
                        </div>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                            {provider.address}
                        </span>
                    </div>

                    {/* Rating */}
                    <div className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        <span>
                            {provider.rating
                                ? provider.rating.toFixed(1)
                                : '0.0'}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                            ({provider.reviewsCount || 0})
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BusinessCard;
