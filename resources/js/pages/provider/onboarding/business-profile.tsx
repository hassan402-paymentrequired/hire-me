import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import OnboardingLayout from '@/layouts/onboarding-layout';
import { Button } from '@/components/ui/button';
import { X, MapPin, PencilLine, Map, AlertCircle, CheckCircle2, LocateFixed } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { getStepsWithStatus } from './onboarding-steps';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';

interface BusinessProfileProps {
    categories: { value: string; label: string }[];
}

const libraries: ('places')[] = ['places'];

// Address resolution mode
type AddressMode = 'autocomplete' | 'manual' | 'map';

const mapContainerStyle = { width: '100%', height: '400px' };
const defaultCenter = { lat: 6.5244, lng: 3.3792 }; // Lagos as default; adjustable

export default function BusinessProfile({ categories }: BusinessProfileProps) {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        description: '',
        images: [] as File[],
        logo_index: 0,
        address: '',
        city: '',
        state: '',
        zip_code: '',
        phone: '',
        category: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    // Address UX state
    const [addressMode, setAddressMode] = useState<AddressMode>('autocomplete');
    const [googleResolved, setGoogleResolved] = useState(false); // did Google fill the address?
    const [showFallbackHint, setShowFallbackHint] = useState(false); // show the "enter manually / pick on map" prompt
    const [mapOpen, setMapOpen] = useState(false);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    // Track if user typed something but Google never confirmed
    const addressTypedRef = useRef(false);
    const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─── Google Autocomplete ────────────────────────────────────────────────────

    const fillAddressFromPlace = useCallback(
        (place: google.maps.places.PlaceResult) => {
            if (!place.address_components?.length) return false;

            let city = '';
            let state = '';
            let zipCode = '';

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
                if (!zipCode && types.includes('postal_code')) {
                    zipCode = component.long_name;
                }
            });

            if (place.formatted_address) {
                setData((prev: typeof data) => ({
                    ...prev,
                    address: place.formatted_address!,
                    city: city || prev.city,
                    state: state || prev.state,
                    zip_code: zipCode || prev.zip_code,
                    latitude: place.geometry?.location?.lat() ?? null,
                    longitude: place.geometry?.location?.lng() ?? null,
                }));
                setGoogleResolved(true);
                setShowFallbackHint(false);
                setAddressMode('autocomplete');
                return true;
            }
            return false;
        },
        [setData]
    );

    const onPlaceChanged = useCallback(() => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            const resolved = fillAddressFromPlace(place);
            if (!resolved) {
                setShowFallbackHint(true);
            }
        }
    }, [fillAddressFromPlace]);

    // Show fallback hint if user stops typing and hasn't selected a suggestion
    const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('address', e.target.value);
        setGoogleResolved(false);
        addressTypedRef.current = true;

        // Reset fallback hint while actively typing
        setShowFallbackHint(false);

        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        if (e.target.value.length > 5) {
            fallbackTimerRef.current = setTimeout(() => {
                if (!googleResolved) {
                    setShowFallbackHint(true);
                }
            }, 2500);
        }
    };

    const handleAddressBlur = () => {
        if (addressTypedRef.current && !googleResolved && data.address.length > 3) {
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
            setShowFallbackHint(true);
        }
    };

    // Init autocomplete once script loads
    useEffect(() => {
        if (isScriptLoaded && inputRef.current && !autocompleteRef.current && window.google?.maps?.places) {
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['address'],
                fields: ['address_components', 'formatted_address', 'geometry'],
            });
            autocomplete.addListener('place_changed', onPlaceChanged);
            autocompleteRef.current = autocomplete;

            // Init geocoder for reverse geocoding
            geocoderRef.current = new window.google.maps.Geocoder();
        }
        return () => {
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners?.(autocompleteRef.current);
                autocompleteRef.current = null;
            }
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        };
    }, [isScriptLoaded, onPlaceChanged]);

    // ─── Map Picker ─────────────────────────────────────────────────────────────

    const openMapPicker = () => {
        // If we already have a lat/lng, center there; otherwise use default
        if (data.latitude && data.longitude) {
            const pos = { lat: data.latitude, lng: data.longitude };
            setMapCenter(pos);
            setMarkerPosition(pos);
        }
        setMapOpen(true);
    };

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarkerPosition(pos);
    }, []);

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setMarkerPosition(location);
                setMapCenter(location);
                setIsLocating(false);
            },
            () => setIsLocating(false)
        );
    };

    const confirmMapLocation = async () => {
        if (!markerPosition || !geocoderRef.current) return;
        setIsReverseGeocoding(true);

        geocoderRef.current.geocode({ location: markerPosition }, (results, status) => {
            setIsReverseGeocoding(false);
            if (status === 'OK' && results?.[0]) {
                const place = results[0] as unknown as google.maps.places.PlaceResult;
                place.formatted_address = results[0].formatted_address;
                place.geometry = results[0].geometry as google.maps.places.PlaceResult['geometry'];
                fillAddressFromPlace(place);
                // Override lat/lng with exact pin position
                setData((prev: typeof data) => ({
                    ...prev,
                    latitude: markerPosition.lat,
                    longitude: markerPosition.lng,
                }));
            } else {
                // Fallback: just save lat/lng and show manual fields
                setData((prev: typeof data) => ({
                    ...prev,
                    latitude: markerPosition.lat,
                    longitude: markerPosition.lng,
                }));
                setAddressMode('manual');
            }
            setMapOpen(false);
            setShowFallbackHint(false);
            setGoogleResolved(true);
        });
    };

    // ─── Manual Mode ────────────────────────────────────────────────────────────

    const switchToManual = () => {
        setAddressMode('manual');
        setShowFallbackHint(false);
    };

    // ─── Images ──────────────────────────────────────────────────────────────────

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newImages = [...data.images, ...files].slice(0, 3);
            setData('images', newImages);

            const newPreviews: string[] = [];
            newImages.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                    if (newPreviews.length === newImages.length) {
                        setImagePreviews([...newPreviews]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setData({
            ...data,
            images: newImages,
            logo_index: data.logo_index >= newImages.length ? 0 : data.logo_index,
        });
        setImagePreviews(newPreviews);
    };

    // ─── Submit ──────────────────────────────────────────────────────────────────

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/onboarding/business-profile', { forceFormData: true });
    };

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    // ─── Render ──────────────────────────────────────────────────────────────────

    const isManualMode = addressMode === 'manual';

    return (
        <OnboardingLayout title="Business Profile" steps={getStepsWithStatus('profile')} currentStepId="profile">
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Tell us about your business</h2>
                    <p className="text-sm text-muted-foreground">
                        This information will be visible to clients on your public profile.
                    </p>
                </div>

                <form onSubmit={submit} className="gap-4 grid">
                    {/* ── Images Upload ────────────────────────────────────────── */}
                    <div className="space-y-3">
                        <div>
                            <h6 className="text-base font-medium">Business Images (Min 2, Max 3)</h6>
                            <p className="text-xs text-muted-foreground mt-1">
                                Upload at least 2 images. Select one to use as your business logo.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {imagePreviews.map((preview, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'relative group h-[150px] rounded overflow-hidden border-2 transition-all',
                                        data.logo_index === index
                                            ? 'border-primary shadow-md'
                                            : 'border-border'
                                    )}
                                >
                                    <img src={preview} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            type="button"
                                            variant={data.logo_index === index ? 'default' : 'secondary'}
                                            size="sm"
                                            onClick={() => setData('logo_index', index)}
                                        >
                                            {data.logo_index === index ? 'Logo' : 'Set as Logo'}
                                        </Button>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                                            aria-label="Remove image"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    {data.logo_index === index && (
                                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                            LOGO
                                        </div>
                                    )}
                                </div>
                            ))}

                            {imagePreviews.length < 3 && (
                                <label className="rounded h-[150px] w-full border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
                                    <CloudArrowUpIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                    <span className="text-xs font-medium font-buttons text-muted-foreground">
                                        Add Image
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImagesChange}
                                    />
                                </label>
                            )}
                        </div>
                        {errors.images && <p className="text-sm text-destructive mt-1">{errors.images}</p>}
                        {errors.logo_index && <p className="text-sm text-destructive mt-1">{errors.logo_index}</p>}
                    </div>

                    {/* ── Business Name & Category ──────────────────────────────── */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Business Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="text"
                                value={data.business_name}
                                onChange={(e) => setData('business_name', e.target.value)}
                                placeholder="What's your business name?"
                                required
                                className="h-10"
                            
                            />
                            {errors.business_name && (
                                <p className="text-xs text-destructive mt-1">{errors.business_name}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <SearchableSelect
                                label="Business Category"
                                required={true}
                                options={categories}
                                value={data.category}
                                onChange={(value: string) => setData('category', value)}
                                placeholder="Select a category"
                                searchPlaceholder="Search categories..."
                                error={errors.category}
                            />
                        </div>
                    </div>

                    {/* ── Description ──────────────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Description</Label>
                        <Textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                            placeholder="Tell clients about your business..."
                            className="resize-none"
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive mt-1">{errors.description}</p>
                        )}
                    </div>

                    {/* ── Address Block ─────────────────────────────────────────── */}
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                    Business Address <span className="text-destructive">*</span>
                                </Label>

                                {/* Resolved badge */}
                                {googleResolved && (
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Location confirmed
                                    </span>
                                )}

                                {/* Manual mode badge — allows going back */}
                                {isManualMode && !googleResolved && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAddressMode('autocomplete');
                                            setShowFallbackHint(false);
                                        }}
                                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                                    >
                                        Use autocomplete instead
                                    </button>
                                )}
                            </div>

                            {/* Address input with map pin icon */}
                            <div className="relative">
                                {googleMapsApiKey ? (
                                    <LoadScript
                                        googleMapsApiKey={googleMapsApiKey}
                                        libraries={libraries}
                                        onLoad={() => setIsScriptLoaded(true)}
                                    >
                                        <>
                                            <MapPin
                                                className={cn(
                                                    'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors',
                                                    googleResolved
                                                        ? 'text-emerald-500'
                                                        : 'text-muted-foreground'
                                                )}
                                            />
                                            <Input
                                                ref={inputRef}
                                                value={data.address}
                                                onChange={handleAddressInput}
                                                onBlur={handleAddressBlur}
                                                placeholder="Start typing your address..."
                                                autoComplete="off"
                                                className={cn(
                                                    'h-10 pl-9 pr-4',
                                                    googleResolved && 'border-emerald-500 focus-visible:ring-emerald-500/30'
                                                )}
                                                required
                                            />
                                        </>
                                    </LoadScript>
                                ) : (
                                    <>
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                        <Input
                                            value={data.address}
                                            onChange={handleAddressInput}
                                            onBlur={handleAddressBlur}
                                            placeholder="Enter your address"
                                            className="h-10 pl-9"
                                            required
                                        />
                                    </>
                                )}
                            </div>
                            {errors.address && (
                                <p className="text-xs text-destructive mt-1">{errors.address}</p>
                            )}
                        </div>

                        {/* ── Fallback Hint ────────────────────────────────────── */}
                        {showFallbackHint && !googleResolved && (
                            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 py-3 px-4">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 ml-2">
                                    <span className="text-xs font-heading text-amber-700 dark:text-amber-300 leading-snug">
                                        Can't find your address? Enter it manually or{' '}
                                        <span className="font-medium">pin it on a map.</span>
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 gap-1.5"
                                            onClick={switchToManual}
                                        >
                                            <PencilLine className="w-3 h-3" />
                                            Type manually
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-7 text-xs gap-1.5"
                                            onClick={openMapPicker}
                                        >
                                            <Map className="w-3 h-3" />
                                            Pick on map
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* ── Manual fields (city / state / zip) ───────────────── */}
                        {/* Only visible in manual mode OR after Google resolved (read-only confirmation) */}
                        <div
                            className={cn(
                                'grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden transition-all duration-300 ease-in-out',
                                isManualMode || googleResolved
                                    ? 'max-h-40 opacity-100'
                                    : 'max-h-0 opacity-0 pointer-events-none'
                            )}
                        >
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">City</Label>
                                <Input
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="City"
                                    className={cn('h-10', googleResolved && !isManualMode && 'bg-muted/50 text-muted-foreground cursor-default')}
                                    readOnly={googleResolved && !isManualMode}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">State</Label>
                                <Input
                                    value={data.state}
                                    onChange={(e) => setData('state', e.target.value)}
                                    placeholder="State"
                                    className={cn('h-10', googleResolved && !isManualMode && 'bg-muted/50 text-muted-foreground cursor-default')}
                                    readOnly={googleResolved && !isManualMode}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">ZIP / Postal Code</Label>
                                <Input
                                    value={data.zip_code}
                                    onChange={(e) => setData('zip_code', e.target.value)}
                                    placeholder="ZIP code"
                                    className={cn('h-10', googleResolved && !isManualMode && 'bg-muted/50 text-muted-foreground cursor-default')}
                                    readOnly={googleResolved && !isManualMode}
                                />
                            </div>
                        </div>

                        {/* When Google resolves, show a subtle "edit fields" link */}
                        {googleResolved && (
                            <button
                                type="button"
                                onClick={() => setAddressMode('manual')}
                                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors w-fit"
                            >
                                Edit city / state / ZIP
                            </button>
                        )}
                    </div>

                    {/* ── Phone ─────────────────────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Business Phone</Label>
                        <Input
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="(+234) 123-4567..."
                            className="h-10"
                        />
                        {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                    </div>

                    {/* ── Submit ────────────────────────────────────────────────── */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                            className="w-full sm:w-auto min-w-[120px]"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Continue
                        </Button>
                    </div>
                </form>
            </div>

            {/* ── Map Picker Dialog ──────────────────────────────────────────────── */}
            <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden gap-0" aria-describedby="for map">
                    <DialogHeader className="px-5 py-4 border-b">
                        <DialogTitle className="text-base font-semibold flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            Pin your business location
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Click anywhere on the map to drop a pin, then confirm.
                        </p>
                    </DialogHeader>

                    <div className="relative">
                        {isScriptLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={mapCenter}
                                zoom={14}
                                onClick={handleMapClick}
                                options={{
                                    disableDefaultUI: false,
                                    zoomControl: true,
                                    streetViewControl: false,
                                    mapTypeControl: false,
                                    fullscreenControl: false,
                                }}
                            >
                                {markerPosition && (
                                    <Marker
                                        position={markerPosition}
                                        draggable
                                        onDragEnd={(e) => {
                                            if (e.latLng) {
                                                setMarkerPosition({
                                                    lat: e.latLng.lat(),
                                                    lng: e.latLng.lng(),
                                                });
                                            }
                                        }}
                                    />
                                )}
                            </GoogleMap>
                        ) : (
                            <div className="flex items-center justify-center h-[400px] bg-muted">
                                <Spinner />
                            </div>
                        )}

                        {/* Use my location button overlaid on map */}
                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={isLocating}
                            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-background border border-border shadow-md rounded-md px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-60"
                        >
                            {isLocating ? (
                                <Spinner className="w-3 h-3" />
                            ) : (
                                <LocateFixed className="w-3.5 h-3.5 text-primary" />
                            )}
                            Use my location
                        </button>
                    </div>

                    <div className="flex items-center justify-between px-5 py-4 border-t bg-muted/30">
                        <p className="text-xs text-muted-foreground">
                            {markerPosition
                                ? `📍 ${markerPosition.lat.toFixed(5)}, ${markerPosition.lng.toFixed(5)}`
                                : 'No pin dropped yet — click the map to place one'}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setMapOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                disabled={!markerPosition || isReverseGeocoding}
                                onClick={confirmMapLocation}
                                className="gap-1.5"
                            >
                                {isReverseGeocoding && <Spinner className="w-3 h-3" />}
                                Confirm location
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </OnboardingLayout>
    );
}