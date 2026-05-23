import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import {
    allowsHomeService,
    allowsVisitProvider,
    normalizeDeliveryMode,
    requiresClientServiceAddress,
    type ServiceDeliveryMode,
    VISIT_PROVIDER_CHOICE,
} from '@/lib/service-delivery-mode';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Building2, Check, LocateFixed, MapPin, MapPinned, Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const libraries: ('places')[] = ['places'];
const mapContainerStyle = { width: '100%', height: '360px' };
const defaultCenter = { lat: 6.5244, lng: 3.3792 };

export interface ClientAddressOption {
    id: string;
    label: string;
    address: string;
    city: string | null;
    state: string | null;
    latitude: string | number | null;
    longitude: string | number | null;
    is_active: boolean;
}

export interface BusinessAddressOption {
    label: string;
    address: string;
    city: string | null;
    state: string | null;
    latitude: string | number | null;
    longitude: string | number | null;
}

interface AddressFormState {
    label: string;
    address: string;
    city: string;
    state: string;
    latitude: number | null;
    longitude: number | null;
}

interface AddressDialogsProps {
    createOpen: boolean;
    onCreateOpenChange: (open: boolean) => void;
    selectionOpen: boolean;
    onSelectionOpenChange: (open: boolean) => void;
    addressForm: AddressFormState;
    onAddressFormChange: (next: AddressFormState) => void;
    creatingAddress: boolean;
    locatingAddress: boolean;
    onCreateAddress: () => void;
    clientAddresses: ClientAddressOption[];
    businessAddressOption?: BusinessAddressOption | null;
    selectedAddressChoice: string;
    onSelectedAddressChoiceChange: (next: string) => void;
    setAsActive: boolean;
    onSetAsActiveChange: (next: boolean) => void;
    onContinue: () => void;
    deliveryMode?: ServiceDeliveryMode;
    providerVisitOption?: {
        label: string;
        address: string;
        city?: string | null;
        state?: string | null;
    } | null;
}

export default function AddressDialogs({
    createOpen,
    onCreateOpenChange,
    selectionOpen,
    onSelectionOpenChange,
    addressForm,
    onAddressFormChange,
    creatingAddress,
    onCreateAddress,
    clientAddresses,
    businessAddressOption,
    selectedAddressChoice,
    onSelectedAddressChoiceChange,
    setAsActive,
    onSetAsActiveChange,
    onContinue,
    deliveryMode: deliveryModeProp,
    providerVisitOption,
}: AddressDialogsProps) {
    const hasBusinessAddressOption = Boolean(businessAddressOption?.address);
    const deliveryMode = deliveryModeProp ?? 'client_visits_provider';
    const showClientAddresses = allowsHomeService(deliveryMode);
    const showVisitProvider =
        allowsVisitProvider(deliveryMode) && Boolean(providerVisitOption?.address);
    const showSkipOption =
        deliveryMode === 'both' && !requiresClientServiceAddress(deliveryMode);
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    // useJsApiLoader is idempotent — won't re-inject the script on remount
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey,
        libraries,
    });

    const [mapOpen, setMapOpen] = useState(false);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);

    // Init geocoder once Maps is ready
    useEffect(() => {
        if (!isLoaded || geocoderRef.current) return;
        geocoderRef.current = new window.google.maps.Geocoder();
    }, [isLoaded]);

    const fillAddressFromPlace = useCallback(
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

            onAddressFormChange({
                ...addressForm,
                address: place.formatted_address,
                city: city || addressForm.city,
                state: state || addressForm.state,
                latitude: place.geometry?.location?.lat() ?? null,
                longitude: place.geometry?.location?.lng() ?? null,
            });

            return true;
        },
        [addressForm, onAddressFormChange],
    );

    const onPlaceChanged = useCallback(() => {
        if (!autocompleteRef.current) return;
        fillAddressFromPlace(autocompleteRef.current.getPlace());
    }, [fillAddressFromPlace]);

    // Re-bind autocomplete every time the dialog opens (handles remount correctly)
    useEffect(() => {
        if (!isLoaded || !createOpen || !inputRef.current) return;

        // Tear down any stale instance first
        if (autocompleteRef.current) {
            window.google?.maps?.event?.clearInstanceListeners?.(autocompleteRef.current);
            autocompleteRef.current = null;
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
    }, [isLoaded, createOpen, onPlaceChanged]);

    const openMapPicker = useCallback(() => {
        if (typeof addressForm.latitude === 'number' && typeof addressForm.longitude === 'number') {
            const current = { lat: addressForm.latitude, lng: addressForm.longitude };
            setMapCenter(current);
            setMarkerPosition(current);
        } else {
            setMapCenter(defaultCenter);
            setMarkerPosition(null);
        }
        setMapOpen(true);
    }, [addressForm.latitude, addressForm.longitude]);

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }, []);

    const handleUseMyLocation = useCallback(() => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setMarkerPosition(location);
                setMapCenter(location);
                setIsLocating(false);
            },
            () => setIsLocating(false),
        );
    }, []);

    const confirmMapLocation = useCallback(() => {
        if (!markerPosition || !geocoderRef.current) return;
        setIsReverseGeocoding(true);
        geocoderRef.current.geocode({ location: markerPosition }, (results, status) => {
            setIsReverseGeocoding(false);
            if (status === 'OK' && results?.[0]) {
                const place = results[0] as unknown as google.maps.places.PlaceResult;
                place.formatted_address = results[0].formatted_address;
                place.geometry = results[0].geometry as google.maps.places.PlaceResult['geometry'];
                fillAddressFromPlace(place);
            } else {
                onAddressFormChange({
                    ...addressForm,
                    latitude: markerPosition.lat,
                    longitude: markerPosition.lng,
                });
            }
            setMapOpen(false);
        });
    }, [addressForm, fillAddressFromPlace, markerPosition, onAddressFormChange]);

    return (
        <>
            {/* ── Create Address Dialog ── */}
            <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
                <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
                    {/* Header */}
                    <div className="border-b bg-muted/30 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background">
                                <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-semibold leading-tight">
                                    Add an address
                                </DialogTitle>
                                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                                    Save a location for faster booking next time.
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-5 px-6 py-6">
                        {/* Label */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="address-label"
                                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                            >
                                Label
                            </Label>
                            <Input
                                id="address-label"
                                placeholder="e.g. Home, Office, Mom's house"
                                value={addressForm.label}
                                onChange={(e) =>
                                    onAddressFormChange({ ...addressForm, label: e.target.value })
                                }
                                className="h-10"
                            />
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="address-line"
                                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                            >
                                Street address
                            </Label>
                            <Input
                                id="address-line"
                                ref={inputRef}
                                placeholder={
                                    googleMapsApiKey && !isLoaded
                                        ? 'Loading maps…'
                                        : '12 Admiralty Way, Lekki Phase 1'
                                }
                                disabled={Boolean(googleMapsApiKey) && !isLoaded}
                                value={addressForm.address}
                                onChange={(e) =>
                                    onAddressFormChange({ ...addressForm, address: e.target.value })
                                }
                                className="h-10"
                            />
                            {googleMapsApiKey && isLoaded && (
                                <button
                                    type="button"
                                    onClick={openMapPicker}
                                    className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                                >
                                    <MapPinned className="h-3.5 w-3.5" />
                                    Pick on map instead
                                </button>
                            )}
                        </div>

                        {/*
                         * City + State are populated silently from the autocomplete/map picker.
                         * They are intentionally not shown to the user.
                         */}
                        <input type="hidden" value={addressForm.city} />
                        <input type="hidden" value={addressForm.state} />

                        {/* Set as active */}
                        <div className="rounded-lg border bg-muted/20 divide-y">
                            <label
                                htmlFor="set-active-address"
                                className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
                            >
                                <Checkbox
                                    id="set-active-address"
                                    checked={setAsActive}
                                    onCheckedChange={(checked) => onSetAsActiveChange(checked === true)}
                                />
                                <p className="text-sm font-medium text-foreground">
                                    Set as my active address
                                </p>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onCreateOpenChange(false)}
                            className="text-muted-foreground"
                        >
                            Skip for now
                        </Button>
                        <Button
                            type="button"
                            onClick={onCreateAddress}
                            disabled={creatingAddress}
                            size="sm"
                        >
                            {creatingAddress ? (
                                <>
                                    <Spinner className="h-3.5 w-3.5" />
                                    Saving…
                                </>
                            ) : (
                                'Save address'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Selection Dialog ── */}
            <Dialog open={selectionOpen} onOpenChange={onSelectionOpenChange}>
                <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
                    {/* Header */}
                    <div className="border-b bg-muted/30 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background">
                                <MapPinned className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-semibold leading-tight">
                                    {requiresClientServiceAddress(deliveryMode)
                                        ? 'Where should we send the professional?'
                                        : 'Where will the service happen?'}
                                </DialogTitle>
                                <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                                    {requiresClientServiceAddress(deliveryMode)
                                        ? 'Add your service address so they know where to come.'
                                        : 'Choose your address or visit the provider.'}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Address list */}
                    <div className="max-h-[420px] overflow-y-auto px-6 py-5">
                        <div className="space-y-2.5">
                            {showVisitProvider &&
                                providerVisitOption &&
                                (() => {
                                    const isSelected =
                                        selectedAddressChoice === VISIT_PROVIDER_CHOICE;
                                    return (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSelectedAddressChoiceChange(
                                                    VISIT_PROVIDER_CHOICE,
                                                )
                                            }
                                            className={cn(
                                                'group relative w-full rounded-xl border p-4 text-left transition-all duration-150',
                                                isSelected
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-border bg-background hover:border-primary/40 hover:bg-muted/30',
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={cn(
                                                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                                                        isSelected
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-border bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    {isSelected ? (
                                                        <Check className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <Building2 className="h-3 w-3" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            Visit {providerVisitOption.label}
                                                        </span>
                                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                                            At their location
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm leading-snug text-foreground/80">
                                                        {providerVisitOption.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })()}

                            {showClientAddresses &&
                            clientAddresses.map((address) => {
                                const isSelected = selectedAddressChoice === address.id;
                                return (
                                    <button
                                        key={address.id}
                                        type="button"
                                        onClick={() => onSelectedAddressChoiceChange(address.id)}
                                        className={cn(
                                            'group relative w-full rounded-xl border p-4 text-left transition-all duration-150',
                                            isSelected
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-border bg-background hover:border-primary/40 hover:bg-muted/30',
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={cn(
                                                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-border bg-muted text-muted-foreground',
                                                )}
                                            >
                                                {isSelected
                                                    ? <Check className="h-3.5 w-3.5" />
                                                    : <MapPin className="h-3 w-3" />
                                                }
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {address.label}
                                                    </span>
                                                    {address.is_active && (
                                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm leading-snug text-foreground/80">
                                                    {address.address}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {[address.city, address.state].filter(Boolean).join(', ') || 'Saved address'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                            {showClientAddresses &&
                            hasBusinessAddressOption &&
                                businessAddressOption &&
                                (() => {
                                    const isSelected = selectedAddressChoice === '__business__';
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => onSelectedAddressChoiceChange('__business__')}
                                            className={cn(
                                                'group relative w-full rounded-xl border p-4 text-left transition-all duration-150',
                                                isSelected
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-border bg-background hover:border-primary/40 hover:bg-muted/30',
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={cn(
                                                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                                                        isSelected
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-border bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    {isSelected
                                                        ? <Check className="h-3.5 w-3.5" />
                                                        : <Building2 className="h-3 w-3" />
                                                    }
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {businessAddressOption.label}
                                                        </span>
                                                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                                            Business
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-sm leading-snug text-foreground/80">
                                                        {businessAddressOption.address}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {[businessAddressOption.city, businessAddressOption.state]
                                                            .filter(Boolean)
                                                            .join(', ') || 'Business location'}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })()}

                            {/* No address option — only when both modes allowed */}
                            {showSkipOption &&
                            (() => {
                                const isSelected = selectedAddressChoice === '__none__';
                                return (
                                    <button
                                        type="button"
                                        onClick={() => onSelectedAddressChoiceChange('__none__')}
                                        className={cn(
                                            'w-full rounded-xl border border-dashed p-4 text-left transition-all duration-150',
                                            isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-muted-foreground/40 hover:bg-muted/20',
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-border bg-muted',
                                                )}
                                            >
                                                {isSelected && <Check className="h-3.5 w-3.5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    Decide later
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    You can confirm the location with the provider after booking.
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Add new address strip */}
                    <div className="mx-6 mb-5 flex items-center justify-between gap-3 rounded-xl border border-dashed border-border/70 bg-muted/10 px-4 py-3">
                        <div>
                            <p className="text-xs font-semibold text-foreground">Need a different address?</p>
                            <p className="text-xs text-muted-foreground">Add one without leaving this flow.</p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onCreateOpenChange(true)}
                            className="h-8 shrink-0 gap-1.5 text-xs"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add new
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectionOpenChange(false)}
                            className="text-muted-foreground"
                        >
                            Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={onContinue}>
                            Continue
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Map Picker Dialog ── */}
            <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
                    <div className="flex items-center gap-3 border-b bg-muted/30 px-5 py-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Pin your address</p>
                            <p className="text-xs text-muted-foreground">
                                Click anywhere on the map to drop a pin, then confirm.
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        {isLoaded ? (
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
                                {markerPosition && <Marker position={markerPosition} />}
                            </GoogleMap>
                        ) : (
                            <div className="flex h-[360px] items-center justify-center bg-muted">
                                <Spinner />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={isLocating}
                            className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium shadow-md transition-colors hover:bg-muted disabled:opacity-60"
                        >
                            {isLocating
                                ? <Spinner className="h-3 w-3" />
                                : <LocateFixed className="h-3.5 w-3.5 text-primary" />
                            }
                            Use my location
                        </button>
                    </div>

                    <div className="flex items-center justify-between border-t bg-muted/20 px-5 py-4">
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
                                {isReverseGeocoding && <Spinner className="h-3 w-3" />}
                                Confirm location
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}