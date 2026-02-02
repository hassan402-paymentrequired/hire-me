import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, MapPin, X, Filter, Navigation, Compass, Phone, BookmarkPlus, Share2, Star, ChevronLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useLocationPermissionContext } from '@/contexts/location-permission-context';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

interface Provider {
    id: string;
    name: string;
    businessName: string;
    slug: string;
    description: string;
    address?: string;
    phone?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    servicesCount: number;
    services: string[];
    rating?: number | null;
    reviewsCount?: number;
    images?: string[];
}

interface Props {
    providers: Provider[];
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

// Nigeria geographic center – default view shows the country
const defaultCenter = {
    lat:6.610162,
    lng: 3.336111,
}; 

export default function FindOnMap({ providers }: Props) {
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [mapZoom, setMapZoom] = useState(6);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const mapRef = useRef<any>(null);
    const { hasPermission, position, requestLocation, isGeolocationAvailable } = useLocationPermissionContext();

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 1023px)');
        setIsMobile(mq.matches);
        const listener = () => setIsMobile(mq.matches);
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
    }, []);

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    // Filter providers with valid numeric coordinates only (avoids InvalidValueError)
    const providersWithLocation = useMemo(() => {
        return providers.filter((p) => {
            const lat = p.latitude;
            const lng = p.longitude;
            return (
                lat != null &&
                lng != null &&
                typeof lat === 'number' &&
                typeof lng === 'number' &&
                !Number.isNaN(lat) &&
                !Number.isNaN(lng)
            );
        });
    }, [providers]);

    // Filter providers based on search query
    const filteredProviders = useMemo(() => {
        if (!searchQuery.trim()) return providersWithLocation;
        
        const query = searchQuery.toLowerCase();
        return providersWithLocation.filter(
            (p) =>
                p.businessName.toLowerCase().includes(query) ||
                p.name.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.address?.toLowerCase().includes(query) ||
                p.services.some((s) => s.toLowerCase().includes(query))
        );
    }, [providersWithLocation, searchQuery]);

    // Request user location once on mount so initial map view can center on them
    useEffect(() => {
        if (isGeolocationAvailable && !position) {
            requestLocation().catch(() => {});
        }
    }, [isGeolocationAvailable, position, requestLocation]);

    // Center map on user when we have position, otherwise on providers or default
    useEffect(() => {
        setMapCenter({ lat: defaultCenter.lat , lng: defaultCenter.lng });      
        setMapZoom(12)
        // if (hasPermission && position) {
        //     setMapCenter({ lat: defaultCenter.lat , lng: defaultCenter.lng });
        //     setMapZoom(12);
        // } else if (providersWithLocation.length > 0) {
        //     const avgLat = providersWithLocation.reduce((sum, p) => sum + Number(p.latitude), 0) / providersWithLocation.length;
        //     const avgLng = providersWithLocation.reduce((sum, p) => sum + Number(p.longitude), 0) / providersWithLocation.length;
        //     if (!Number.isNaN(avgLat) && !Number.isNaN(avgLng)) {
        //         setMapCenter({ lat: avgLat, lng: avgLng });
        //     }
        // }
    }, [hasPermission, position, providersWithLocation]);

    const onMapLoad = useCallback((map: any) => {
        mapRef.current = map;
        setIsScriptLoaded(true);
    }, []);

    const handleRequestLocation = async () => {
        try {
            await requestLocation();
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    const handleCenterOnUserLocation = () => {
        if (hasPermission && position && mapRef.current) {
            const userLocation = { lat: position.latitude, lng: position.longitude };
            setMapCenter(userLocation);
            setMapZoom(12);
            mapRef.current.panTo(userLocation);
        }
    };

    const handleProviderClick = (provider: Provider) => {
        setSelectedProvider(provider);
        const lat = Number(provider.latitude);
        const lng = Number(provider.longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            const pos = { lat, lng };
            setMapCenter(pos);
            setMapZoom(15);
            mapRef.current?.panTo(pos);
        }
    };

    const handleMarkerClick = (provider: Provider) => {
        setSelectedProvider(provider);
    };

    const openDirections = (provider: Provider) => {
        const lat = provider.latitude;
        const lng = provider.longitude;
        if (lat != null && lng != null) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            window.open(url, '_blank');
        }
    };

    const shareProvider = (provider: Provider) => {
        const url = `${window.location.origin}/provider/${provider.slug}`;
        if (navigator.share) {
            navigator.share({ url, title: provider.businessName }).catch(() => {
                navigator.clipboard.writeText(url);
            });
        } else {
            navigator.clipboard.writeText(url);
        }
    };

    const ratingDisplay = (rating: number | null | undefined) => {
        if (rating == null) return null;
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return (
            <span className="flex items-center gap-0.5 text-amber-500" aria-label={`${rating} stars`}>
                {Array.from({ length: full }, (_, i) => <Star key={`f-${i}`} className="h-4 w-4 fill-current" />)}
                {half ? <Star key="h" className="h-4 w-4 fill-current opacity-70" /> : null}
                {Array.from({ length: empty }, (_, i) => <Star key={`e-${i}`} className="h-4 w-4" />)}
            </span>
        );
    };

    if (!googleMapsApiKey) {
        return (
            <GuestLayout>
                <Head title="Find on Map" />
                <div className="rounded-lg border bg-muted/50 p-8 text-center">
                    <p className="text-muted-foreground">Google Maps API key is not configured. Please configure it to use the map view.</p>
                </div>
            </GuestLayout>
        );
    }

    const mapLoadingElement = (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] min-h-[600px] bg-muted/30">
            <div className="hidden lg:flex w-full lg:w-[400px] flex-col border-r bg-background animate-pulse rounded-none" aria-hidden />
            <div className="flex-1 flex items-center justify-center min-h-[50vh] lg:min-h-[400px]">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Spinner className="size-10" />
                    <p className="text-sm font-medium">Loading map…</p>
                </div>
            </div>
        </div>
    );

    return (
        <GuestLayout>
            <Head title="Find on Map" />
            <LoadScript
                googleMapsApiKey={googleMapsApiKey}
                libraries={libraries}
                loadingElement={mapLoadingElement}
            >
                <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] min-h-[600px]">
                    {/* Left Sidebar - Provider List (desktop only) */}
                    <div className="hidden lg:flex w-full lg:w-[400px] flex-col border-r bg-background">
                        {/* Search Bar */}
                        <div className="p-4 border-b bg-muted/30">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="relative flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Find a provider"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-8"
                                    />
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                        >
                                            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    )}
                                </div>
                                <Button variant="outline" size="icon" className="shrink-0">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-muted-foreground">
                                    {filteredProviders.length} {filteredProviders.length === 1 ? 'provider' : 'providers'} found
                                </p>
                                {isGeolocationAvailable && !hasPermission && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRequestLocation}
                                        className="text-xs h-6 gap-1"
                                    >
                                        <Navigation className="h-3 w-3" />
                                        Use My Location
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Provider List */}
                        <ScrollArea className="flex-1">
                            <div className="p-2 space-y-2">
                                {filteredProviders.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>No providers found matching your search.</p>
                                    </div>
                                ) : (
                                    filteredProviders.map((provider) => (
                                        <div
                                            key={provider.id}
                                            onClick={() => handleProviderClick(provider)}
                                            className={cn(
                                                "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                                                selectedProvider?.id === provider.id
                                                    ? "bg-primary/10 border-primary shadow-md"
                                                    : "bg-card border-border hover:border-primary/50"
                                            )}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-foreground text-sm">{provider.businessName}</h3>
                                                    <p className="text-xs text-muted-foreground">{provider.name}</p>
                                                </div>
                                            </div>

                                            {provider.address && (
                                                <div className="flex items-start gap-1 mb-2">
                                                    <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{provider.address}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">
                                                    {provider.servicesCount} {provider.servicesCount === 1 ? 'service' : 'services'}
                                                </span>
                                            </div>

                                            {provider.services.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {provider.services.slice(0, 2).map((service, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full"
                                                            >
                                                                {service}
                                                            </span>
                                                        ))}
                                                        {provider.services.length > 2 && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                +{provider.services.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedProvider?.id === provider.id ? (
                                                <Link href={`/provider/${provider.slug}`}>
                                                    <Button size="sm" className="w-full text-xs h-8 bg-primary hover:bg-primary/90">
                                                        View Profile & Book
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Link href={`/provider/${provider.slug}`}>
                                                    <Button size="sm" variant="outline" className="w-full text-xs h-8">
                                                        View Profile
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Side - Map */}
                    <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
                        {/* Mobile header overlay */}
                        <div className="lg:hidden absolute top-0 left-0 right-0 z-20 flex items-center justify-between gap-2 px-3 py-3 bg-background/95 backdrop-blur border-b">
                            <Link
                                href="/"
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80"
                                aria-label="Back"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                            <span className="flex-1 text-center font-semibold truncate">
                                {selectedProvider ? selectedProvider.businessName : 'Find on Map'}
                            </span>
                            {isGeolocationAvailable && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-10 h-10 shrink-0"
                                    onClick={hasPermission && position ? handleCenterOnUserLocation : handleRequestLocation}
                                    title="Center on my location"
                                >
                                    <Navigation className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        {hasPermission && position && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCenterOnUserLocation}
                                className="absolute top-4 right-4 z-10 bg-background shadow-lg hidden lg:flex"
                                title="Center on my location"
                            >
                                <Navigation className="h-4 w-4" />
                            </Button>
                        )}
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={mapZoom}
                            onLoad={onMapLoad}
                            options={{
                                disableDefaultUI: false,
                                zoomControl: true,
                                streetViewControl: false,
                                mapTypeControl: false,
                                fullscreenControl: true,
                            }}
                        >
                            {isScriptLoaded && filteredProviders.map((provider) => {
                                const lat = Number(provider.latitude);
                                const lng = Number(provider.longitude);
                                if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
                                
                                const isSelected = selectedProvider?.id === provider.id;
                                const iconUrl = isSelected
                                    ? 'data:image/svg+xml;base64,' + btoa(`
                                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="2"/>
                                            <circle cx="20" cy="20" r="8" fill="white"/>
                                        </svg>
                                    `)
                                    : 'data:image/svg+xml;base64,' + btoa(`
                                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="16" cy="16" r="14" fill="#10B981" stroke="white" stroke-width="2"/>
                                            <circle cx="16" cy="16" r="6" fill="white"/>
                                        </svg>
                                    `);

                                // Build icon config safely - only after script is loaded
                                const iconConfig: any = {
                                    url: iconUrl,
                                };

                                // Add scaledSize if google.maps is available
                                if (typeof window !== 'undefined' && window.google?.maps?.Size) {
                                    try {
                                        iconConfig.scaledSize = new window.google.maps.Size(isSelected ? 40 : 32, isSelected ? 40 : 32);
                                    } catch (e) {
                                        // Ignore if Size is not available
                                    }
                                }
                                
                                return (
                                    <Marker
                                        key={provider.id}
                                        position={{ lat, lng }}
                                        onClick={() => handleMarkerClick(provider)}
                                        icon={iconConfig}
                                    >
                                        {selectedProvider?.id === provider.id && (
                                            <InfoWindow
                                                position={{ lat, lng }}
                                                onCloseClick={() => setSelectedProvider(null)}
                                            >
                                                <div className="p-2 max-w-[200px]">
                                                    <h3 className="font-semibold text-sm mb-1">{provider.businessName}</h3>
                                                    {provider.address && (
                                                        <p className="text-xs text-muted-foreground mb-2">{provider.address}</p>
                                                    )}
                                                    <Link href={`/provider/${provider.slug}`}>
                                                        <Button size="sm" className="w-full text-xs h-6">
                                                            View Profile
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </InfoWindow>
                                        )}
                                    </Marker>
                                );
                            })}
                        </GoogleMap>
                    </div>
                </div>

                {/* Mobile bottom sheet - business details */}
                <Sheet
                    open={!!selectedProvider && isMobile}
                    onOpenChange={(open) => !open && setSelectedProvider(null)}
                >
                    <SheetContent
                        side="bottom"
                        className="rounded-t-2xl border-t max-h-[70vh] p-0 flex flex-col overflow-hidden"
                    >
                        {selectedProvider && (
                            <>
                                <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h2 className="text-lg font-bold text-foreground">{selectedProvider.businessName}</h2>
                                            {selectedProvider.rating != null && (
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {ratingDisplay(selectedProvider.rating)}
                                                    {selectedProvider.reviewsCount != null && selectedProvider.reviewsCount > 0 && (
                                                        <span className="text-sm text-muted-foreground">
                                                            ({selectedProvider.reviewsCount})
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex gap-2 p-4">
                                    <Button
                                        className="flex-1 bg-primary hover:bg-primary/90 gap-2"
                                        onClick={() => openDirections(selectedProvider)}
                                        disabled={selectedProvider.latitude == null || selectedProvider.longitude == null}
                                    >
                                        <Compass className="h-4 w-4" />
                                        Direction
                                    </Button>
                                    {selectedProvider.phone && (
                                        <Button variant="outline" size="icon" asChild>
                                            <a href={`tel:${selectedProvider.phone}`} title="Call">
                                                <Phone className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="outline" size="icon" asChild>
                                        <Link href={`/provider/${selectedProvider.slug}`} title="Save / View">
                                            <BookmarkPlus className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => shareProvider(selectedProvider)} title="Share">
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <ScrollArea className="flex-1 min-h-0">
                                    {selectedProvider.description && (
                                        <div className="px-4 pb-3">
                                            <p className="text-sm text-muted-foreground">{selectedProvider.description}</p>
                                        </div>
                                    )}
                                    {selectedProvider.images && selectedProvider.images.length > 0 && (
                                        <div className="px-4 pb-4">
                                            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1">
                                                {selectedProvider.images.slice(0, 6).map((src, i) => (
                                                    <a
                                                        key={i}
                                                        href={src}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="shrink-0 w-24 h-24 rounded-lg overflow-hidden border bg-muted"
                                                    >
                                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-4 pt-0">
                                        <Link href={`/provider/${selectedProvider.slug}`}>
                                            <Button className="w-full">View Profile & Book</Button>
                                        </Link>
                                    </div>
                                </ScrollArea>
                            </>
                        )}
                    </SheetContent>
                </Sheet>
            </LoadScript>
        </GuestLayout>
    );
}
