import React, { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLoading } from '@/contexts/loading-context';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import {
    Heart,
    MapPin,
    Phone,
    ExternalLink,
    Loader2,
    HeartOff,
    AlertCircle,
} from 'lucide-react';

interface BusinessProfile {
    id: string;
    business_name: string;
    category: string;
    description: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    phone: string;
    logo_path: string;
    slug: string;
    latitude: string;
    longitude: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface Favorite {
    id: string;
    user_id: string;
    business_profile_id: string;
    business_profile: BusinessProfile;
    created_at: string;
    updated_at: string;
}

const FavoriteSheet = () => {
    const { showFavoriteSheet, toggleFavoriteSheet } = useLoading();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsersFavoriteServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/service/favourite');
            setFavorites(response.data);
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
            setError('Failed to load favorites. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Only fetch when sheet is opened
    useEffect(() => {
        if (showFavoriteSheet) {
            fetchUsersFavoriteServices();
        }
    }, [showFavoriteSheet]);

    const handleRemoveFavorite = async (favoriteId: string) => {
        try {
            await axios.delete(`/service/favourite/${favoriteId}`);
            setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
        } catch (error) {
            console.error('Failed to remove favorite:', error);
        }
    };

    const FavoriteSkeleton = () => (
        <div className="space-y-4 grid sm:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                    <div className="flex gap-4 p-4">
                        <div className="w-24 h-24 bg-muted animate-pulse rounded-lg" />
                        <div className="flex-1 space-y-3">
                            <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                            <div className="h-4 bg-muted animate-pulse rounded w-full" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <HeartOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
                Start adding your favorite service providers to quickly access them later.
            </p>
        </div>
    );

    return (
        <Sheet open={showFavoriteSheet} onOpenChange={toggleFavoriteSheet}>
            <SheetContent side="bottom" className="h-[85vh]">
                <SheetHeader className="mb-2">
                    <SheetTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        Favorite Services
                    </SheetTitle>
                    <SheetDescription>
                        Your saved service providers for quick access
                    </SheetDescription>
                </SheetHeader>

                <div className="overflow-y-auto  h-[calc(85vh-120px)] pb-6 px-6">
                    {loading ? (
                        <FavoriteSkeleton />
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                                <AlertCircle className="w-10 h-10 text-destructive" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Failed to Load</h3>
                            <p className="text-sm text-muted-foreground mb-4">{error}</p>
                            <Button onClick={fetchUsersFavoriteServices} variant="outline">
                                <Loader2 className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    ) : favorites.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-4 grid sm:grid-cols-2 gap-4">
                            {favorites.map((favorite) => (
                                <Card key={favorite.id} className="py-0 overflow-hidden hover:shadow-lg transition-all group">
                                    <CardContent className="p-0">
                                        <div className="flex sm:flex-row flex-col gap-4 p-4">
                                            {/* Logo */}
                                            <div className="relative w-24 h-24 flex-shrink-0">
                                                {favorite.business_profile.logo_path ? (
                                                    <img
                                                        src={`/storage/${favorite.business_profile.logo_path}`}
                                                        alt={favorite.business_profile.business_name}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                                                        <span className="text-2xl font-bold text-primary">
                                                            {favorite.business_profile.business_name.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                                            {favorite.business_profile.business_name}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            by {favorite.business_profile.user.name}
                                                        </p>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleRemoveFavorite(favorite.id)}
                                                    >
                                                        <Heart className="w-5 h-5 fill-red-500" />
                                                    </Button>
                                                </div>

                                                <Badge variant="outline" className="mb-2 capitalize">
                                                    {favorite.business_profile.category.replace('-', ' ')}
                                                </Badge>

                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                                    {favorite.business_profile.description}
                                                </p>

                                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="line-clamp-1">
                                                            {favorite.business_profile.city}, {favorite.business_profile.state}
                                                        </span>
                                                    </div>
                                                    {favorite.business_profile.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{favorite.business_profile.phone}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/provider/${favorite.business_profile.slug}`}
                                                        className="flex-1"
                                                    >
                                                        <Button variant="default" size="sm" className="w-full">
                                                            <ExternalLink className="w-3 h-3 mr-2" />
                                                            View Profile
                                                        </Button>
                                                    </Link>
                                                    <Link
                                                        href={`/provider/${favorite.business_profile.slug}/book`}
                                                        className="flex-1"
                                                    >
                                                        <Button variant="outline" size="sm" className="w-full">
                                                            Book Now
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default FavoriteSheet;
