import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProviderProps {
    id: string;
    name: string;
    address: string;
    businessName: string;
    slug: string;
    logo?: string | null;
    distance?: number | null;
    servicesCount: number;
    rating: number;
    reviewsCount: number;
    minPrice: number | string;
    description?: string;
    services?: string[];
}

const BusinessCard = ({provider}: {provider: ProviderProps}) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    console.log(provider)

    const showImage = provider.logo && !imageError;

    return (
        <Link
            href={`/provider/${provider.slug}`}
            className="group flex flex-col space-y-1.5 transition-all"
            prefetch
        >
            {/* Card Image/Placeholder */}
            <div className="relative aspect-[4/3] overflow-hidden rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                {showImage ? (
                    <>
                        {!imageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                        )}
                        <img
                            src={provider.logo || undefined}
                            alt={provider.businessName}
                            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onError={() => {
                                setImageError(true);
                                setImageLoaded(false);
                            }}
                            onLoad={() => setImageLoaded(true)}
                        />
                    </>
                ) : (
                    <div className="text-center p-6">
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                            {provider.businessName}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-sm text-muted-foreground">
                                {provider.servicesCount} {provider.servicesCount === 1 ? 'service' : 'services'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Price Tag */}
                <div className="absolute bottom-2 left-2">
                    <Badge className="bg-background/90 backdrop-blur-sm text-foreground hover:bg-background border-none shadow-sm font-semibold">
                        Starting from ₦{Number(provider.minPrice).toLocaleString()}
                    </Badge>
                </div>

                {/* Top info badge when image exists */}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    {provider.distance !== null && provider.distance !== undefined && (
                        <Badge className="bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90 flex items-center gap-1 border-none shadow-sm">
                            <MapPin className="h-3 w-3 text-primary" />
                            {provider.distance}km
                        </Badge>
                    )}
                </div>
            </div>

            {/* Card Info */}
            <div className="flex items-start justify-between gap-3 pt-1">
                <div className="flex-1 min-w-0">
                    <h3 className="line-clamp-1 font-bold text-base text-foreground capitalize">
                        {provider.businessName}
                    </h3>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                        {provider.address}
                    </p>
                </div>

                <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{provider.rating ? provider.rating.toFixed(2) : '0.00'}</span>
                    <span className="text-muted-foreground text-xs">({provider.reviewsCount || 0})</span>
                </div>
            </div>
        </Link>
    );
};

export default BusinessCard;
