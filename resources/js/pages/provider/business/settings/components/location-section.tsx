import KeenIcon from '@/components/keen-icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import React from 'react';

const libraries: ('places')[] = ['places'];
const mapContainerStyle = { width: '100%', height: '400px' };
const defaultCenter = { lat: 6.5244, lng: 3.3792 };

export default function LocationSection({
    data,
    setData,
    errors,
}: {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}) {
    const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const geocoderRef = React.useRef<google.maps.Geocoder | null>(null);
    const advancedMarkerRef = React.useRef<any>(null);
    const advancedMarkerListenerRef = React.useRef<any>(null);
    const classicMarkerRef = React.useRef<google.maps.Marker | null>(null);

    const [isScriptLoaded, setIsScriptLoaded] = React.useState(false);
    const [mapOpen, setMapOpen] = React.useState(false);
    const [mapCenter, setMapCenter] = React.useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = React.useState<{ lat: number; lng: number } | null>(null);
    const [mapInstance, setMapInstance] = React.useState<google.maps.Map | null>(null);
    const [isReverseGeocoding, setIsReverseGeocoding] = React.useState(false);
    const [isLocating, setIsLocating] = React.useState(false);

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    const fillAddressFromPlace = React.useCallback(
        (place: google.maps.places.PlaceResult) => {
            if (!place.address_components?.length || !place.formatted_address) return false;

            let city = '';
            let state = '';

            place.address_components.forEach((component) => {
                const types = component.types;

                if (!city) {
                    if (types.includes('locality')) city = component.long_name;
                    else if (types.includes('sublocality') || types.includes('sublocality_level_1')) city = component.long_name;
                    else if (types.includes('administrative_area_level_2')) city = component.long_name;
                }

                if (!state && types.includes('administrative_area_level_1')) {
                    state = component.short_name || component.long_name;
                }
            });

            setData('address', place.formatted_address);
            setData('city', city || data.city);
            setData('state', state || data.state);
            setData('latitude', place.geometry?.location?.lat() || null);
            setData('longitude', place.geometry?.location?.lng() || null);

            return true;
        },
        [data.city, data.state, setData],
    );

    const onPlaceChanged = React.useCallback(() => {
        if (!autocompleteRef.current) return;
        fillAddressFromPlace(autocompleteRef.current.getPlace());
    }, [fillAddressFromPlace]);

    React.useEffect(() => {
        if (!isScriptLoaded || !window.google?.maps || geocoderRef.current) return;
        geocoderRef.current = new window.google.maps.Geocoder();
    }, [isScriptLoaded]);

    React.useEffect(() => {
        if (!isScriptLoaded || !inputRef.current || autocompleteRef.current || !window.google?.maps?.places) {
            return;
        }

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            fields: ['address_components', 'formatted_address', 'geometry'],
        });

        autocomplete.addListener('place_changed', onPlaceChanged);
        autocompleteRef.current = autocomplete;

        return () => {
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners?.(autocompleteRef.current);
                autocompleteRef.current = null;
            }
        };
    }, [isScriptLoaded, onPlaceChanged]);

    const openMapPicker = React.useCallback(() => {
        if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
            const current = { lat: data.latitude, lng: data.longitude };
            setMapCenter(current);
            setMarkerPosition(current);
        } else {
            setMapCenter(defaultCenter);
            setMarkerPosition(null);
        }

        setMapOpen(true);
    }, [data.latitude, data.longitude]);

    const handleMapClick = React.useCallback((e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }, []);

    const handleUseMyLocation = React.useCallback(() => {
        if (!navigator.geolocation) return;

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const next = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setMarkerPosition(next);
                setMapCenter(next);
                setIsLocating(false);
            },
            () => setIsLocating(false),
        );
    }, []);

    const confirmMapLocation = React.useCallback(() => {
        if (!markerPosition || !geocoderRef.current) return;

        setIsReverseGeocoding(true);
        geocoderRef.current.geocode({ location: markerPosition }, (results, status) => {
            setIsReverseGeocoding(false);

            if (status === 'OK' && results?.[0]) {
                const place = results[0] as unknown as google.maps.places.PlaceResult;
                place.formatted_address = results[0].formatted_address;
                place.geometry = results[0].geometry as google.maps.places.PlaceResult['geometry'];
                fillAddressFromPlace(place);
                setData('latitude', markerPosition.lat);
                setData('longitude', markerPosition.lng);
            } else {
                setData('latitude', markerPosition.lat);
                setData('longitude', markerPosition.lng);
            }

            setMapOpen(false);
        });
    }, [fillAddressFromPlace, markerPosition, setData]);

    React.useEffect(() => {
        if (!isScriptLoaded || !mapInstance) return;

        let cancelled = false;

        const syncMarker = async () => {
            try {
                const g: any = window.google;
                if (!g?.maps) return;

                const cleanupAdvanced = () => {
                    if (advancedMarkerListenerRef.current?.remove) {
                        advancedMarkerListenerRef.current.remove();
                    }
                    advancedMarkerListenerRef.current = null;
                    if (advancedMarkerRef.current) {
                        advancedMarkerRef.current.map = null;
                    }
                    advancedMarkerRef.current = null;
                };

                const cleanupClassic = () => {
                    if (classicMarkerRef.current) {
                        classicMarkerRef.current.setMap(null);
                    }
                    classicMarkerRef.current = null;
                };

                if (!markerPosition) {
                    cleanupAdvanced();
                    cleanupClassic();
                    return;
                }

                const mapId = (import.meta as any).env?.VITE_GOOGLE_MAP_ID as string | undefined;
                const canTryAdvanced = Boolean(mapId && g.maps.importLibrary);

                if (canTryAdvanced) {
                    try {
                        await g.maps.importLibrary('marker');
                        if (cancelled) return;

                        const AdvancedMarkerElement = g.maps.marker?.AdvancedMarkerElement;
                        if (AdvancedMarkerElement) {
                            cleanupClassic();

                            if (!advancedMarkerRef.current) {
                                const marker = new AdvancedMarkerElement({
                                    map: mapInstance,
                                    position: markerPosition,
                                    gmpDraggable: true,
                                });
                                advancedMarkerRef.current = marker;

                                const listener = marker.addListener?.('dragend', (e: any) => {
                                    const ll = e?.latLng || marker.position;
                                    if (!ll) return;
                                    const lat = typeof ll.lat === 'function' ? ll.lat() : ll.lat;
                                    const lng = typeof ll.lng === 'function' ? ll.lng() : ll.lng;
                                    if (typeof lat === 'number' && typeof lng === 'number') {
                                        setMarkerPosition({ lat, lng });
                                    }
                                });
                                advancedMarkerListenerRef.current = listener || null;
                            } else {
                                advancedMarkerRef.current.map = mapInstance;
                                advancedMarkerRef.current.position = markerPosition;
                            }

                            return;
                        }
                    } catch {
                        // fall through to classic marker
                    }
                }

                cleanupAdvanced();
                if (!classicMarkerRef.current) {
                    classicMarkerRef.current = new g.maps.Marker({
                        map: mapInstance,
                        position: markerPosition,
                        draggable: true,
                    });
                    classicMarkerRef.current.addListener('dragend', () => {
                        const pos = classicMarkerRef.current?.getPosition?.();
                        if (!pos) return;
                        setMarkerPosition({ lat: pos.lat(), lng: pos.lng() });
                    });
                } else {
                    classicMarkerRef.current.setMap(mapInstance);
                    classicMarkerRef.current.setPosition(markerPosition);
                }
            } catch {
                // ignore marker sync errors
            }
        };

        syncMarker();

        return () => {
            cancelled = true;
            if (advancedMarkerListenerRef.current?.remove) {
                advancedMarkerListenerRef.current.remove();
            }
            advancedMarkerListenerRef.current = null;
            if (advancedMarkerRef.current) {
                advancedMarkerRef.current.map = null;
            }
            advancedMarkerRef.current = null;
            if (classicMarkerRef.current) {
                classicMarkerRef.current.setMap(null);
            }
            classicMarkerRef.current = null;
        };
    }, [isScriptLoaded, mapInstance, markerPosition]);

    const addressField = (
        <div className="space-y-2">
            <Label>Address</Label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                    <KeenIcon name="geolocation" className="text-sm" />
                </div>
                <Input
                    ref={inputRef}
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder="Start typing your business address..."
                    autoComplete="off"
                    className="pl-10"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {googleMapsApiKey && (
                    <Button type="button" variant="outline" size="sm" onClick={openMapPicker} className="gap-2">
                        <KeenIcon name="map" className="text-sm" />
                        Pick on map
                    </Button>
                )}

                {typeof data.latitude === 'number' && typeof data.longitude === 'number' && (
                    <span className="text-xs text-muted-foreground">
                        Pin saved at {data.latitude.toFixed(5)}, {data.longitude.toFixed(5)}
                    </span>
                )}
            </div>

            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
        </div>
    );

    return (
        <>
            <div className="space-y-6">
                {googleMapsApiKey ? (
                    <LoadScript
                        googleMapsApiKey={googleMapsApiKey}
                        libraries={libraries}
                        onLoad={() => setIsScriptLoaded(true)}
                    >
                        {addressField}
                    </LoadScript>
                ) : (
                    <div className="space-y-2">
                        {addressField}
                        <p className="text-[10px] text-yellow-600">Google Maps API not configured.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>City</Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                <KeenIcon name="home-2" className="text-sm" />
                            </div>
                            <Input
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                placeholder="Enter city"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>State</Label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
                                <KeenIcon name="map" className="text-sm" />
                            </div>
                            <Input
                                value={data.state}
                                onChange={(e) => setData('state', e.target.value)}
                                placeholder="Enter state"
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl" aria-describedby="pick your business location on the map">
                    <DialogHeader className="border-b px-5 py-4">
                        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                            <KeenIcon name="map" className="text-sm text-primary" />
                            Pick your business location
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground">
                            Click on the map to drop a pin, then confirm your location.
                        </p>
                    </DialogHeader>

                    <div className="relative">
                        {isScriptLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={mapCenter}
                                zoom={14}
                                onClick={handleMapClick}
                                onLoad={(map) => setMapInstance(map)}
                                onUnmount={() => setMapInstance(null)}
                                options={{
                                    disableDefaultUI: false,
                                    zoomControl: true,
                                    streetViewControl: false,
                                    mapTypeControl: false,
                                    fullscreenControl: false,
                                    mapId: (import.meta as any).env?.VITE_GOOGLE_MAP_ID,
                                }}
                            />
                        ) : (
                            <div className="flex h-[400px] items-center justify-center bg-muted">
                                <Spinner />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={isLocating}
                            className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium shadow-md transition-colors hover:bg-muted disabled:opacity-60"
                        >
                            {isLocating ? <Spinner className="h-3 w-3" /> : <KeenIcon name="geolocation" className="text-sm text-primary" />}
                            Use my location
                        </button>
                    </div>

                    <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-4">
                        <p className="text-xs text-muted-foreground">
                            {markerPosition
                                ? `Pin at ${markerPosition.lat.toFixed(5)}, ${markerPosition.lng.toFixed(5)}`
                                : 'No pin placed yet. Click anywhere on the map.'}
                        </p>

                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setMapOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                disabled={!markerPosition || isReverseGeocoding}
                                onClick={confirmMapLocation}
                            >
                                {isReverseGeocoding && <Spinner className="mr-2 h-3 w-3" />}
                                Confirm location
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
