import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, MapPin, Heart, Info, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

interface Provider {
    id: string;
    name: string;
    businessName: string;
    slug: string;
    description: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    servicesCount: number;
    services: string[];
}

interface Props {
    providers: Provider[];
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const defaultCenter = {
    lat: 6.5244, // Default to a central location (you can adjust this)
    lng: 3.3792,
};

export default function MarketplaceMapView({ providers }: Props) {
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [mapZoom, setMapZoom] = useState(10);
    const mapRef = useRef<google.maps.Map | null>(null);

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    // Filter providers with valid coordinates
    const providersWithLocation = useMemo(() => {
        return providers.filter(
            (p) => p.latitude !== null && p.longitude !== null && p.latitude !== undefined && p.longitude !== undefined
        );
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

    // Calculate center from providers if available
    useEffect(() => {
        if (providersWithLocation.length > 0) {
            const avgLat = providersWithLocation.reduce((sum, p) => sum + (p.latitude || 0), 0) / providersWithLocation.length;
            const avgLng = providersWithLocation.reduce((sum, p) => sum + (p.longitude || 0), 0) / providersWithLocation.length;
            setMapCenter({ lat: avgLat, lng: avgLng });
        }
    }, [providersWithLocation]);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const handleProviderClick = (provider: Provider) => {
        setSelectedProvider(provider);
        if (provider.latitude && provider.longitude) {
            setMapCenter({ lat: provider.latitude, lng: provider.longitude });
            setMapZoom(15);
            mapRef.current?.panTo({ lat: provider.latitude, lng: provider.longitude });
        }
    };

    const handleMarkerClick = (provider: Provider) => {
        setSelectedProvider(provider);
    };

    if (!googleMapsApiKey) {
        return (
            <div className="rounded-lg border bg-muted/50 p-8 text-center">
                <p className="text-muted-foreground">Google Maps API key is not configured. Please configure it to use the map view.</p>
            </div>
        );
    }

    return (
        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-250px)] min-h-[600px]">
                {/* Left Sidebar - Provider List */}
                <div className="w-full lg:w-1/3 flex flex-col border rounded-lg bg-card">
                    {/* Search Bar */}
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search providers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {filteredProviders.length} {filteredProviders.length === 1 ? 'provider' : 'providers'} found
                        </p>
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
                                                : "bg-background border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground">{provider.businessName}</h3>
                                                <p className="text-xs text-muted-foreground">{provider.name}</p>
                                            </div>
                                        </div>

                                        {provider.address && (
                                            <div className="flex items-start gap-1 mb-2">
                                                <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                                <p className="text-xs text-muted-foreground line-clamp-1">{provider.address}</p>
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

                                        <Link href={`/provider/${provider.slug}`}>
                                            <Button size="sm" className="w-full text-xs h-7">
                                                View Profile & Book
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Side - Map */}
                <div className="flex-1 border rounded-lg overflow-hidden bg-muted/30">
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
                        {filteredProviders.map((provider) => {
                            if (!provider.latitude || !provider.longitude) return null;
                            
                            return (
                                <Marker
                                    key={provider.id}
                                    position={{ lat: provider.latitude, lng: provider.longitude }}
                                    onClick={() => handleMarkerClick(provider)}
                                    icon={{
                                        url: selectedProvider?.id === provider.id
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
                                            `),
                                        scaledSize: new google.maps.Size(selectedProvider?.id === provider.id ? 40 : 32, selectedProvider?.id === provider.id ? 40 : 32),
                                    }}
                                >
                                    {selectedProvider?.id === provider.id && (
                                        <InfoWindow
                                            position={{ lat: provider.latitude, lng: provider.longitude }}
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
        </LoadScript>
    );
}
