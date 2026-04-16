import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import OnboardingLayout from '@/layouts/onboarding-layout';
import { Button } from '@/components/ui/button';
import { MapPin, PencilLine, Map, AlertCircle, CheckCircle2, LocateFixed } from 'lucide-react';
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

type AddressMode = 'autocomplete' | 'manual' | 'map';
type AddressAutocompleteUi = 'new' | 'legacy';

const mapContainerStyle = { width: '100%', height: '400px' };
const defaultCenter = { lat: 6.5244, lng: 3.3792 };

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

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    // ── useJsApiLoader is idempotent — won't re-inject the script on remount ──
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey,
        libraries,
    });

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const placeAutocompleteContainerRef = useRef<HTMLDivElement | null>(null);
    const placeAutocompleteElRef = useRef<HTMLElement | null>(null);

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [addressAutocompleteUi, setAddressAutocompleteUi] = useState<AddressAutocompleteUi>('legacy');
    const [addressDraft, setAddressDraft] = useState('');
    const [phoneDisplay, setPhoneDisplay] = useState('');
    const [phoneLocalError, setPhoneLocalError] = useState<string | null>(null);

    const [addressMode, setAddressMode] = useState<AddressMode>('autocomplete');
    const [googleResolved, setGoogleResolved] = useState(false);
    const [showFallbackHint, setShowFallbackHint] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

    const advancedMarkerRef = useRef<any>(null);
    const advancedMarkerListenerRef = useRef<any>(null);
    const classicMarkerRef = useRef<google.maps.Marker | null>(null);
    const addressTypedRef = useRef(false);
    const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isValidNgE164 = (phone: string) => /^\+234\d{10}$/.test(phone);

    const formatNgPhoneForInput = (raw: string) => {
        const digits = raw.replace(/\D/g, '');
        if (!digits) return { display: '', e164: '' };
        let national = digits;
        if (national.startsWith('234')) national = national.slice(3);
        if (national.startsWith('0')) national = national.slice(1);
        national = national.slice(0, 10);
        const e164 = national ? `+234${national}` : '';
        const a = national.slice(0, 3);
        const b = national.slice(3, 6);
        const c = national.slice(6, 10);
        const displayParts = ['+234'];
        if (a) displayParts.push(a);
        if (b) displayParts.push(b);
        if (c) displayParts.push(c);
        return { display: displayParts.join(' '), e164 };
    };

    const scheduleFallbackHint = useCallback(
        (value: string) => {
            setShowFallbackHint(false);
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
            if (value.length > 5) {
                fallbackTimerRef.current = setTimeout(() => {
                    if (!googleResolved) setShowFallbackHint(true);
                }, 2500);
            }
        },
        [googleResolved],
    );

    // ─── Address helpers ─────────────────────────────────────────────────────────

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
                if (!state && types.includes('administrative_area_level_1')) state = component.short_name || component.long_name;
                if (!zipCode && types.includes('postal_code')) zipCode = component.long_name;
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
        [setData],
    );

    const fillAddressFromNewPlace = useCallback(
        (place: any) => {
            const components = Array.isArray(place?.addressComponents) ? place.addressComponents : [];
            if (!components.length) return false;
            let city = '';
            let state = '';
            let zipCode = '';
            components.forEach((component: any) => {
                const types: string[] = component?.types || [];
                const longName = component?.longText ?? component?.long_name ?? '';
                const shortName = component?.shortText ?? component?.short_name ?? longName;
                if (!city) {
                    if (types.includes('locality')) city = longName;
                    else if (types.includes('sublocality') || types.includes('sublocality_level_1')) city = longName;
                    else if (types.includes('administrative_area_level_2')) city = longName;
                }
                if (!state && types.includes('administrative_area_level_1')) state = shortName || longName;
                if (!zipCode && types.includes('postal_code')) zipCode = longName;
            });
            const formattedAddress = place?.formattedAddress || place?.formatted_address;
            if (!formattedAddress) return false;
            const loc = place?.location;
            const lat = typeof loc?.lat === 'function' ? loc.lat() : typeof loc?.lat === 'number' ? loc.lat : null;
            const lng = typeof loc?.lng === 'function' ? loc.lng() : typeof loc?.lng === 'number' ? loc.lng : null;
            setData((prev: typeof data) => ({
                ...prev,
                address: formattedAddress,
                city: city || prev.city,
                state: state || prev.state,
                zip_code: zipCode || prev.zip_code,
                latitude: lat,
                longitude: lng,
            }));
            setGoogleResolved(true);
            setShowFallbackHint(false);
            setAddressMode('autocomplete');
            return true;
        },
        [setData],
    );

    const onPlaceChanged = useCallback(() => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            const resolved = fillAddressFromPlace(place);
            if (!resolved) setShowFallbackHint(true);
        }
    }, [fillAddressFromPlace]);

    const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('address', e.target.value);
        setAddressDraft(e.target.value);
        setGoogleResolved(false);
        addressTypedRef.current = true;
        scheduleFallbackHint(e.target.value);
    };

    const handleAddressBlur = () => {
        if (addressTypedRef.current && !googleResolved && data.address.length > 3) {
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
            setShowFallbackHint(true);
        }
    };

    // ─── Setup geocoder once Maps is ready ───────────────────────────────────────
    useEffect(() => {
        if (!isLoaded || geocoderRef.current) return;
        geocoderRef.current = new window.google.maps.Geocoder();
    }, [isLoaded]);

    // ─── Setup autocomplete whenever Maps loads OR address field mounts ───────────
    useEffect(() => {
        if (!isLoaded || !window.google?.maps) return;

        let isActive = true;
        let newElCleanup: (() => void) | null = null;

        const trySetupNewAutocomplete = async () => {
            try {
                const g = window.google;
                const container = placeAutocompleteContainerRef.current;
                if (!container || placeAutocompleteElRef.current) return false;

                const placesLib = g.maps.importLibrary
                    ? ((await g.maps.importLibrary('places')) as any)
                    : null;

                const PlaceAutocompleteElement =
                    placesLib?.PlaceAutocompleteElement ||
                    g.maps.places?.PlaceAutocompleteElement;

                if (!PlaceAutocompleteElement) return false;

                const el: any = new PlaceAutocompleteElement();
                el.placeholder = 'Start typing your address...';
                el.style.width = '100%';
                el.style.colorScheme = 'only light';
                el.style.backgroundColor = 'transparent';
                el.style.border = '0';

                const onSelect = async (ev: any) => {
                    try {
                        const prediction = ev?.placePrediction;
                        if (!prediction) return;
                        const place = await prediction.toPlace();
                        await place.fetchFields({ fields: ['formattedAddress', 'location', 'addressComponents'] });
                        if (!isActive) return;
                        const resolved = fillAddressFromNewPlace(place);
                        if (!resolved) setShowFallbackHint(true);
                        setAddressDraft(place?.formattedAddress || place?.formatted_address || '');
                    } catch {
                        if (!isActive) return;
                        setShowFallbackHint(true);
                    }
                };

                const onTyping = () => {
                    try {
                        const next = String((el as any).value ?? '');
                        if (next) {
                            addressTypedRef.current = true;
                            setGoogleResolved(false);
                            setAddressDraft(next);
                            scheduleFallbackHint(next);
                        }
                    } catch { /* ignore */ }
                };

                el.addEventListener('gmp-select', onSelect);
                el.addEventListener('gmp-placeselect', onSelect);
                el.addEventListener('input', onTyping);
                el.addEventListener('change', onTyping);
                container.replaceChildren(el);
                placeAutocompleteElRef.current = el as HTMLElement;

                newElCleanup = () => {
                    el.removeEventListener('gmp-select', onSelect);
                    el.removeEventListener('gmp-placeselect', onSelect);
                    el.removeEventListener('input', onTyping);
                    el.removeEventListener('change', onTyping);
                };

                return true;
            } catch {
                return false;
            }
        };

        const setup = async () => {
            const didSetupNew = await trySetupNewAutocomplete();
            if (!isActive) return;

            if (didSetupNew) {
                setAddressAutocompleteUi('new');
                if (autocompleteRef.current) {
                    window.google?.maps?.event?.clearInstanceListeners?.(autocompleteRef.current);
                    autocompleteRef.current = null;
                }
                return;
            }

            // Legacy autocomplete fallback
            setAddressAutocompleteUi('legacy');
            if (inputRef.current && !autocompleteRef.current && window.google?.maps?.places?.Autocomplete) {
                const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                    types: ['address'],
                    fields: ['address_components', 'formatted_address', 'geometry'],
                });
                autocomplete.addListener('place_changed', onPlaceChanged);
                autocompleteRef.current = autocomplete;
            }
        };

        setup();

        return () => {
            isActive = false;
            if (newElCleanup) newElCleanup();
            placeAutocompleteElRef.current = null;
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners?.(autocompleteRef.current);
                autocompleteRef.current = null;
            }
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        };
    }, [isLoaded, onPlaceChanged, fillAddressFromNewPlace, scheduleFallbackHint]);

    // ─── Map Picker ───────────────────────────────────────────────────────────────

    const openMapPicker = () => {
        if (data.latitude && data.longitude) {
            const pos = { lat: data.latitude, lng: data.longitude };
            setMapCenter(pos);
            setMarkerPosition(pos);
        }
        setMapOpen(true);
    };

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
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
            () => setIsLocating(false),
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
                setData((prev: typeof data) => ({
                    ...prev,
                    latitude: markerPosition.lat,
                    longitude: markerPosition.lng,
                }));
            } else {
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

    // ─── Advanced / classic marker sync ──────────────────────────────────────────

    useEffect(() => {
        if (!isLoaded || !mapInstance) return;
        let cancelled = false;

        const sync = async () => {
            try {
                const g: any = window.google;
                if (!g?.maps) return;

                const cleanupAdvanced = () => {
                    if (advancedMarkerListenerRef.current?.remove) advancedMarkerListenerRef.current.remove();
                    advancedMarkerListenerRef.current = null;
                    if (advancedMarkerRef.current) advancedMarkerRef.current.map = null;
                    advancedMarkerRef.current = null;
                };

                const cleanupClassic = () => {
                    if (classicMarkerRef.current) classicMarkerRef.current.setMap(null);
                    classicMarkerRef.current = null;
                };

                if (!markerPosition) {
                    cleanupAdvanced();
                    cleanupClassic();
                    return;
                }

                if (cancelled) return;

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
                                const marker = new AdvancedMarkerElement({ map: mapInstance, position: markerPosition, gmpDraggable: true });
                                advancedMarkerRef.current = marker;
                                const listener = marker.addListener?.('dragend', (e: any) => {
                                    const ll = e?.latLng || marker.position;
                                    if (!ll) return;
                                    const lat = typeof ll.lat === 'function' ? ll.lat() : ll.lat;
                                    const lng = typeof ll.lng === 'function' ? ll.lng() : ll.lng;
                                    if (typeof lat === 'number' && typeof lng === 'number') setMarkerPosition({ lat, lng });
                                });
                                advancedMarkerListenerRef.current = listener || null;
                            } else {
                                advancedMarkerRef.current.map = mapInstance;
                                advancedMarkerRef.current.position = markerPosition;
                            }
                            return;
                        }
                    } catch { /* fall through */ }
                }

                // Classic marker fallback
                cleanupAdvanced();
                if (!classicMarkerRef.current) {
                    classicMarkerRef.current = new g.maps.Marker({ map: mapInstance, position: markerPosition, draggable: true });
                    classicMarkerRef.current.addListener('dragend', () => {
                        const pos = classicMarkerRef.current?.getPosition?.();
                        if (!pos) return;
                        setMarkerPosition({ lat: pos.lat(), lng: pos.lng() });
                    });
                } else {
                    classicMarkerRef.current.setMap(mapInstance);
                    classicMarkerRef.current.setPosition(markerPosition);
                }
            } catch { /* ignore */ }
        };

        sync();

        return () => {
            cancelled = true;
            if (advancedMarkerListenerRef.current?.remove) advancedMarkerListenerRef.current.remove();
            advancedMarkerListenerRef.current = null;
            if (advancedMarkerRef.current) advancedMarkerRef.current.map = null;
            advancedMarkerRef.current = null;
            if (classicMarkerRef.current) classicMarkerRef.current.setMap(null);
            classicMarkerRef.current = null;
        };
    }, [isLoaded, mapInstance, markerPosition]);

    // ─── Images ──────────────────────────────────────────────────────────────────

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const merged = [...data.images, ...files].slice(0, 3);
        setData((prev: typeof data) => ({
            ...prev,
            images: merged,
            logo_index: Math.min(prev.logo_index, Math.max(0, merged.length - 1)),
        }));
        Promise.all(
            merged.map(
                (file) =>
                    new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(String(reader.result || ''));
                        reader.readAsDataURL(file);
                    }),
            ),
        ).then((previews) => setImagePreviews(previews));
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        const nextLogoIndex =
            data.logo_index === index ? 0 : data.logo_index > index ? data.logo_index - 1 : data.logo_index;
        setData({ ...data, images: newImages, logo_index: Math.min(nextLogoIndex, Math.max(0, newImages.length - 1)) });
        setImagePreviews(newPreviews);
    };

    // ─── Submit ───────────────────────────────────────────────────────────────────

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.phone && !isValidNgE164(data.phone)) {
            setPhoneLocalError('Enter a valid Nigerian phone number.');
            return;
        }
        post('/onboarding/business-profile', { forceFormData: true });
    };

    // ─── Derived ─────────────────────────────────────────────────────────────────

    const isManualMode = addressMode === 'manual';
    const selectedIndex = Math.min(Math.max(0, data.logo_index ?? 0), Math.max(0, imagePreviews.length - 1));
    const otherThumbs = imagePreviews.map((src, i) => ({ src, i })).filter((x) => x.i !== selectedIndex);
    const shouldShowFallbackActions =
        !googleResolved && !isManualMode && addressDraft.trim().length > 0 && (showFallbackHint || addressDraft.trim().length > 3);

    // ─── Render ──────────────────────────────────────────────────────────────────

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
                    {/* ── Images Upload ─────────────────────────────────────────── */}
                    <div className="space-y-3">
                        <div className="relative overflow-hidden rounded-2xl border bg-muted/15">
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImagesChange}
                            />

                            {imagePreviews.length === 0 ? (
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="flex h-[220px] w-full flex-col items-center justify-center gap-2 px-6 text-center transition-colors hover:bg-muted/25 sm:h-[260px]"
                                >
                                    <div className="flex size-14 items-center justify-center rounded-2xl border bg-background/60">
                                        <CloudArrowUpIcon className="h-7 w-7 text-muted-foreground" />
                                    </div>
                                    <div className="text-sm font-semibold">Upload your banner</div>
                                    <div className="max-w-md text-xs text-muted-foreground">
                                        Click to upload up to 3 images. After uploading, pick the one you want clients to see first as your logo.
                                    </div>
                                </button>
                            ) : (
                                <div className="relative h-[220px] sm:h-[360px]">
                                    <img src={imagePreviews[selectedIndex]} alt="" className="h-full w-full object-cover" />
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent" />
                                    <div className="absolute left-3 top-3 flex items-center gap-2">
                                        {imagePreviews.length < 3 && (
                                            <Button type="button" size="sm" className="h-8" onClick={() => imageInputRef.current?.click()}>
                                                Add image
                                            </Button>
                                        )}
                                        <Button type="button" size="sm" variant="secondary" className="h-8" onClick={() => removeImage(selectedIndex)}>
                                            Remove
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
                                        LOGO
                                    </div>
                                    {otherThumbs.length > 0 && (
                                        <div className="absolute bottom-3 right-3 flex items-end gap-2">
                                            {otherThumbs.map(({ src, i }) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setData('logo_index', i)}
                                                    className="group relative overflow-hidden rounded-xl border border-white/20 bg-black/30 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5"
                                                    aria-label="Set as logo"
                                                >
                                                    <img src={src} alt="" className="h-14 w-16 object-cover sm:h-16 sm:w-20" />
                                                    <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-black/35" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
                            {errors.business_name && <p className="text-xs text-destructive mt-1">{errors.business_name}</p>}
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
                        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
                    </div>

                    {/* ── Address Block ─────────────────────────────────────────── */}
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                    Business Address <span className="text-destructive">*</span>
                                </Label>

                                {googleResolved && (
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Location confirmed
                                    </span>
                                )}

                                {isManualMode && !googleResolved && (
                                    <button
                                        type="button"
                                        onClick={() => { setAddressMode('autocomplete'); setShowFallbackHint(false); }}
                                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                                    >
                                        Use autocomplete instead
                                    </button>
                                )}
                            </div>

                            {/* Address input */}
                            <div className="relative">
                                <MapPin
                                    className={cn(
                                        'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors z-10',
                                        googleResolved ? 'text-emerald-500' : 'text-muted-foreground',
                                    )}
                                />

                                {/* New PlaceAutocompleteElement container */}
                                <div
                                    className={cn(
                                        'h-10 rounded-md border bg-background pl-9 pr-3 flex items-center',
                                        googleResolved && 'border-emerald-500 focus-visible:ring-emerald-500/30',
                                        (!isLoaded || addressAutocompleteUi !== 'new') && 'hidden',
                                    )}
                                    style={{ colorScheme: 'only light' }}
                                >
                                    <div ref={placeAutocompleteContainerRef} className="w-full" />
                                </div>

                                {/* Legacy autocomplete / no-Maps fallback */}
                                <Input
                                    ref={inputRef}
                                    value={data.address}
                                    onChange={handleAddressInput}
                                    onBlur={handleAddressBlur}
                                    placeholder={
                                        googleMapsApiKey && !isLoaded
                                            ? 'Loading maps…'
                                            : 'Start typing your address...'
                                    }
                                    disabled={Boolean(googleMapsApiKey) && !isLoaded}
                                    autoComplete="off"
                                    className={cn(
                                        'h-10 pl-9 pr-4',
                                        googleResolved && 'border-emerald-500 focus-visible:ring-emerald-500/30',
                                        isLoaded && addressAutocompleteUi === 'new' && 'hidden',
                                    )}
                                    required
                                />
                            </div>

                            {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                        </div>

                        {/* ── Fallback hint ──────────────────────────────────────── */}
                        {shouldShowFallbackActions && !isManualMode && (
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
                                            onClick={() => { setAddressMode('manual'); setShowFallbackHint(false); }}
                                        >
                                            <PencilLine className="w-3 h-3" />
                                            Type manually
                                        </Button>
                                        <Button type="button" size="sm" className="h-7 text-xs gap-1.5" onClick={openMapPicker}>
                                            <Map className="w-3 h-3" />
                                            Pick on map
                                        </Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* ── City / State (manual or after resolve) ──────────────── */}
                        <div
                            className={cn(
                                'grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden transition-all duration-300 ease-in-out',
                                isManualMode || googleResolved ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
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
                        </div>

                        {googleResolved && (
                            <button
                                type="button"
                                onClick={() => setAddressMode('manual')}
                                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors w-fit"
                            >
                                Edit city / state
                            </button>
                        )}
                    </div>

                    {/* ── Phone ─────────────────────────────────────────────────── */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Business Phone</Label>
                        <Input
                            type="tel"
                            inputMode="numeric"
                            value={phoneDisplay}
                            onChange={(e) => {
                                const { display, e164 } = formatNgPhoneForInput(e.target.value);
                                setPhoneDisplay(display);
                                setData('phone', e164);
                                setPhoneLocalError(null);
                            }}
                            onBlur={() => {
                                if (data.phone && !isValidNgE164(data.phone)) {
                                    setPhoneLocalError('Enter a valid Nigerian phone number.');
                                }
                            }}
                            placeholder="+234 801 234 5678"
                            className="h-10"
                        />
                        {phoneLocalError && <p className="text-xs text-destructive mt-1">{phoneLocalError}</p>}
                        {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                    </div>

                    {/* ── Submit ────────────────────────────────────────────────── */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button type="submit" size="lg" disabled={processing} className="w-full sm:w-auto min-w-[120px]">
                            {processing && <Spinner className="mr-2" />}
                            Continue
                        </Button>
                    </div>
                </form>
            </div>

            {/* ── Map Picker Dialog ─────────────────────────────────────────────── */}
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
                        {isLoaded ? (
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
                            <div className="flex items-center justify-center h-[400px] bg-muted">
                                <Spinner />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={isLocating}
                            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-background border border-border shadow-md rounded-md px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-60"
                        >
                            {isLocating ? <Spinner className="w-3 h-3" /> : <LocateFixed className="w-3.5 h-3.5 text-primary" />}
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
                            <Button type="button" variant="outline" size="sm" onClick={() => setMapOpen(false)}>
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