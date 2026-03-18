import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VerifiedProviderBadge from '@/components/verified-provider-badge';
// import {  } "@/heroicons/react/24/solid"

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

    // Generate initials from business name or owner name
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
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
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
                            loading='lazy'
                        />
                    </>
                ) : (
                    <div className="text-center p-6">
                        <h3 className="text-2xl font-bold text-foreground mb-2 line-clamp-2">
                            {provider.businessName}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-sm text-muted-foreground">
                                {provider.servicesCount} {provider.servicesCount === 1 ? 'service' : 'services'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Hover Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Category Badge - Top Left */}
                {provider.category && (
                    <div className="absolute top-2 left-2">
                        <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm border-none shadow-lg text-xs font-semibold">
                            {provider.category}
                        </Badge>
                    </div>
                )}

                {/* Distance Badge - Top Right */}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
                    {provider.distance !== null && provider.distance !== undefined && (
                        <Badge className="bg-background/90 backdrop-blur-sm text-foreground hover:bg-background/95 flex items-center gap-1 border-none shadow-lg text-xs font-medium">
                            <MapPin className="h-3 w-3 text-primary" />
                            {provider.distance.toFixed(1)}km
                        </Badge>
                    )}
                </div>

                {/* Price Tag - Bottom Left */}
                <div className="absolute bottom-2 left-2">
                    <Badge className="bg-background/95 backdrop-blur-sm text-foreground hover:bg-background border-none shadow-lg font-semibold text-sm">
                        From ₦{Number(provider.minPrice).toLocaleString()}
                    </Badge>
                </div>
            </div>

            {/* Card Info */}
            <div>
                {/* Business Name + Avatar + Verified Badge */}
                <div className="flex items-start gap-2">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 border-2 border-border  shrink-0 mt-0.5">
                        {provider.avatar && (
                            <AvatarImage src={provider.avatar} alt={provider.name} />
                        )}
                        <AvatarFallback className="text-primary bg-muted font-semibold text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    {/* Business Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                            <h3 className="line-clamp-1 font-bold text-base text-foreground capitalize">
                                {provider.businessName}
                            </h3>
                            {provider.isVerified && (
                                <VerifiedProviderBadge className="shrink-0" />
                            )}
                        </div>
                        <span className="line-clamp-1 text-xs text-muted-foreground ">
                            {provider.address}
                        </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 text-sm font-semibold shrink-0">
                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        <span>{provider.rating ? provider.rating.toFixed(1) : '0.0'}</span>
                        <span className="text-muted-foreground text-xs font-normal">
                            ({provider.reviewsCount || 0})
                        </span>
                    </div>
                </div>
                
            </div>
        </Link>
    );
};

export default BusinessCard;
