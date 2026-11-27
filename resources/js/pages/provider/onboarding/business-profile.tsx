import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import OnboardingLayout from '@/layouts/onboarding-layout';
import { cn } from '@/lib/utils';
import { useForm, usePage } from '@inertiajs/react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ImagePlus,
    LocateFixed,
    Map,
    MapPin,
    PencilLine,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getStepsWithStatus } from './onboarding-steps';

interface BusinessProfileProps {
    categories: { value: string; label: string }[];
    businessProfile?: {
        business_name: string;
        description: string;
        address: string;
        city: string;
        state: string;
        zip_code: string;
        phone: string;
        category: string;
        latitude: number | null;
        longitude: number | null;
        images: { id: string; image_path: string; is_logo: boolean }[];
    } | null;
}

const libraries: 'places'[] = ['places'];

function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="grid gap-5 border-t border-line pt-8 first:border-t-0 first:pt-0 lg:grid-cols-[220px_1fr] lg:gap-10 dark:border-white/10">
            <div>
                <h2 className="font-['Sora'] text-base font-bold">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="min-w-0 space-y-4">{children}</div>
        </section>
    );
}

type AddressMode = 'autocomplete' | 'manual' | 'map';
type AddressAutocompleteUi = 'new' | 'legacy';

const mapContainerStyle = { width: '100%', height: 'min(400px, 55dvh)' };
const defaultCenter = { lat: 6.5244, lng: 3.3792 };

export default function BusinessProfile({
    categories,
    businessProfile,
}: BusinessProfileProps) {
    const { data, setData, post, processing, errors } = useForm({
        business_name: businessProfile?.business_name || '',
        description: businessProfile?.description || '',
        images: [] as File[],
        cover_index: 0,
        address: businessProfile?.address || '',
        city: businessProfile?.city || '',
        state: businessProfile?.state || '',
        zip_code: businessProfile?.zip_code || '',
        phone: businessProfile?.phone || '',
        category: businessProfile?.category || '',
        latitude: businessProfile?.latitude ?? null,
        longitude: businessProfile?.longitude ?? null,
    });

    const { map_enabled } = usePage().props;

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    // ── useJsApiLoader is idempotent — won't re-inject the script on remount ──
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey,
        libraries,
    });

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(
        null,
    );
    const inputRef = useRef<HTMLInputElement | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const placeAutocompleteContainerRef = useRef<HTMLDivElement | null>(null);
    const placeAutocompleteElRef = useRef<HTMLElement | null>(null);

    const [imagePreviews, setImagePreviews] = useState<string[]>(
        businessProfile?.images?.map((img) => img.image_path) || [],
    );
    const [addressAutocompleteUi, setAddressAutocompleteUi] =
        useState<AddressAutocompleteUi>('legacy');
    const [addressDraft, setAddressDraft] = useState(
        businessProfile?.address || '',
    );
    const [phoneLocalError, setPhoneLocalError] = useState<string | null>(null);

    const [addressMode, setAddressMode] = useState<AddressMode>(
        businessProfile?.address ? 'manual' : 'autocomplete',
    );
    const [googleResolved, setGoogleResolved] = useState(
        !!businessProfile?.latitude,
    );
    const [showFallbackHint, setShowFallbackHint] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(
        null,
    );
    const [mapPickedLabel, setMapPickedLabel] = useState<string | null>(null);
    const [autocompleteResetKey, setAutocompleteResetKey] = useState(0);

    const advancedMarkerRef = useRef<any>(null);
    const advancedMarkerListenerRef = useRef<any>(null);
    const classicMarkerRef = useRef<google.maps.Marker | null>(null);
    const addressTypedRef = useRef(false);
    const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reverseGeocodeSeqRef = useRef(0);
    const reverseGeocodeResultRef = useRef<google.maps.GeocoderResult | null>(
        null,
    );

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
            if (fallbackTimerRef.current)
                clearTimeout(fallbackTimerRef.current);
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
                    else if (
                        types.includes('sublocality') ||
                        types.includes('sublocality_level_1')
                    )
                        city = component.long_name;
                    else if (types.includes('administrative_area_level_2'))
                        city = component.long_name;
                }
                if (!state && types.includes('administrative_area_level_1'))
                    state = component.short_name || component.long_name;
                if (!zipCode && types.includes('postal_code'))
                    zipCode = component.long_name;
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
                setAddressDraft(place.formatted_address);
                setGoogleResolved(true);
                setShowFallbackHint(false);
                setAddressMode('autocomplete');
                // Force the new PlaceAutocompleteElement to remount with the
                // resolved value (Web Components don't react to setData).
                setAutocompleteResetKey((k) => k + 1);
                return true;
            }
            return false;
        },
        [setData],
    );

    const fillAddressFromNewPlace = useCallback(
        (place: any) => {
            const components = Array.isArray(place?.addressComponents)
                ? place.addressComponents
                : [];
            if (!components.length) return false;
            let city = '';
            let state = '';
            let zipCode = '';
            components.forEach((component: any) => {
                const types: string[] = component?.types || [];
                const longName =
                    component?.longText ?? component?.long_name ?? '';
                const shortName =
                    component?.shortText ?? component?.short_name ?? longName;
                if (!city) {
                    if (types.includes('locality')) city = longName;
                    else if (
                        types.includes('sublocality') ||
                        types.includes('sublocality_level_1')
                    )
                        city = longName;
                    else if (types.includes('administrative_area_level_2'))
                        city = longName;
                }
                if (!state && types.includes('administrative_area_level_1'))
                    state = shortName || longName;
                if (!zipCode && types.includes('postal_code'))
                    zipCode = longName;
            });
            const formattedAddress =
                place?.formattedAddress || place?.formatted_address;
            if (!formattedAddress) return false;
            const loc = place?.location;
            const lat =
                typeof loc?.lat === 'function'
                    ? loc.lat()
                    : typeof loc?.lat === 'number'
                      ? loc.lat
                      : null;
            const lng =
                typeof loc?.lng === 'function'
                    ? loc.lng()
                    : typeof loc?.lng === 'number'
                      ? loc.lng
                      : null;
            setData((prev: typeof data) => ({
                ...prev,
                address: formattedAddress,
                city: city || prev.city,
                state: state || prev.state,
                zip_code: zipCode || prev.zip_code,
                latitude: lat,
                longitude: lng,
            }));
            setAddressDraft(formattedAddress);
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
        const target = e.target.value;
        setData('address', target);
        setAddressDraft(target);
        setGoogleResolved(false);
        addressTypedRef.current = true;
        scheduleFallbackHint(target);
    };

    const handleAddressBlur = () => {
        if (
            addressTypedRef.current &&
            !googleResolved &&
            data.address.length > 3
        ) {
            if (fallbackTimerRef.current)
                clearTimeout(fallbackTimerRef.current);
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
                el.value = data.address;
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
                        await place.fetchFields({
                            fields: [
                                'formattedAddress',
                                'location',
                                'addressComponents',
                            ],
                        });
                        if (!isActive) return;
                        const resolved = fillAddressFromNewPlace(place);
                        if (!resolved) setShowFallbackHint(true);
                        setAddressDraft(
                            place?.formattedAddress ||
                                place?.formatted_address ||
                                '',
                        );
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
                    } catch {
                        /* ignore */
                    }
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
                    window.google?.maps?.event?.clearInstanceListeners?.(
                        autocompleteRef.current,
                    );
                    autocompleteRef.current = null;
                }
                return;
            }

            // Legacy autocomplete fallback
            setAddressAutocompleteUi('legacy');
            if (
                inputRef.current &&
                !autocompleteRef.current &&
                window.google?.maps?.places?.Autocomplete
            ) {
                const autocomplete = new window.google.maps.places.Autocomplete(
                    inputRef.current,
                    {
                        types: ['address'],
                        fields: [
                            'address_components',
                            'formatted_address',
                            'geometry',
                        ],
                    },
                );
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
                window.google?.maps?.event?.clearInstanceListeners?.(
                    autocompleteRef.current,
                );
                autocompleteRef.current = null;
            }
            if (fallbackTimerRef.current)
                clearTimeout(fallbackTimerRef.current);
        };
    }, [
        isLoaded,
        onPlaceChanged,
        fillAddressFromNewPlace,
        scheduleFallbackHint,
        autocompleteResetKey,
    ]);

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
                const location = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setMarkerPosition(location);
                setMapCenter(location);
                setIsLocating(false);
            },
            () => setIsLocating(false),
        );
    };

    const applyMapPickResult = useCallback(
        (
            result: google.maps.GeocoderResult | null,
            marker: { lat: number; lng: number },
        ) => {
            if (result) {
                const place =
                    result as unknown as google.maps.places.PlaceResult;
                place.formatted_address = result.formatted_address;
                place.geometry =
                    result.geometry as google.maps.places.PlaceResult['geometry'];
                fillAddressFromPlace(place);
                setData((prev: typeof data) => ({
                    ...prev,
                    latitude: marker.lat,
                    longitude: marker.lng,
                }));
            } else {
                setData((prev: typeof data) => ({
                    ...prev,
                    latitude: marker.lat,
                    longitude: marker.lng,
                }));
                setAddressMode('manual');
            }
            setMapOpen(false);
            setShowFallbackHint(false);
            setGoogleResolved(true);
        },
        [fillAddressFromPlace, setData],
    );

    const confirmMapLocation = async () => {
        if (!markerPosition) return;

        // Prefer the result we already fetched while the user was placing
        // the pin — saves a round-trip and keeps the visible label and the
        // committed address consistent.
        const cached = reverseGeocodeResultRef.current;
        if (cached) {
            applyMapPickResult(cached, markerPosition);
            return;
        }

        if (!geocoderRef.current) {
            applyMapPickResult(null, markerPosition);
            return;
        }

        setIsReverseGeocoding(true);
        geocoderRef.current.geocode(
            { location: markerPosition },
            (results, status) => {
                setIsReverseGeocoding(false);
                applyMapPickResult(
                    status === 'OK' && results?.[0] ? results[0] : null,
                    markerPosition,
                );
            },
        );
    };

    // Live reverse-geocode the pin while the modal is open so the user sees
    // the actual address they're picking, not just lat/lng.
    useEffect(() => {
        if (!mapOpen) {
            reverseGeocodeSeqRef.current++;
            reverseGeocodeResultRef.current = null;
            setMapPickedLabel(null);
            return;
        }
        if (!markerPosition || !geocoderRef.current) {
            reverseGeocodeResultRef.current = null;
            setMapPickedLabel(null);
            return;
        }
        const seq = ++reverseGeocodeSeqRef.current;
        reverseGeocodeResultRef.current = null;
        setMapPickedLabel(null);
        geocoderRef.current.geocode(
            { location: markerPosition },
            (results, status) => {
                if (seq !== reverseGeocodeSeqRef.current) return;
                if (status === 'OK' && results?.[0]) {
                    reverseGeocodeResultRef.current = results[0];
                    setMapPickedLabel(results[0].formatted_address || null);
                    return;
                }
                reverseGeocodeResultRef.current = null;
                // ZERO_RESULTS just means no nearby address — don't shout. Any
                // other status (REQUEST_DENIED, OVER_QUERY_LIMIT, INVALID_REQUEST,
                // ...) is almost always a misconfigured API key or the Geocoding
                // API not being enabled, and silently failing makes that look
                // like an autofill bug.
                if (status !== 'ZERO_RESULTS') {
                    console.warn(
                        '[BusinessProfile] Reverse geocoding failed:',
                        status,
                        '— make sure the Geocoding API is enabled for your Google Maps key.',
                    );
                    setMapPickedLabel(
                        "Couldn't resolve address — confirm to use coordinates only",
                    );
                } else {
                    setMapPickedLabel(null);
                }
            },
        );
    }, [mapOpen, markerPosition]);

    // ─── Advanced / classic marker sync ──────────────────────────────────────────

    useEffect(() => {
        if (!isLoaded || !mapInstance) return;
        let cancelled = false;

        const sync = async () => {
            try {
                const g: any = window.google;
                if (!g?.maps) return;

                const cleanupAdvanced = () => {
                    if (advancedMarkerListenerRef.current?.remove)
                        advancedMarkerListenerRef.current.remove();
                    advancedMarkerListenerRef.current = null;
                    if (advancedMarkerRef.current)
                        advancedMarkerRef.current.map = null;
                    advancedMarkerRef.current = null;
                };

                const cleanupClassic = () => {
                    if (classicMarkerRef.current)
                        classicMarkerRef.current.setMap(null);
                    classicMarkerRef.current = null;
                };

                if (!markerPosition) {
                    cleanupAdvanced();
                    cleanupClassic();
                    return;
                }

                if (cancelled) return;

                const mapId = (import.meta as any).env?.VITE_GOOGLE_MAP_ID as
                    | string
                    | undefined;
                const canTryAdvanced = Boolean(mapId && g.maps.importLibrary);

                if (canTryAdvanced) {
                    try {
                        await g.maps.importLibrary('marker');
                        if (cancelled) return;
                        const AdvancedMarkerElement =
                            g.maps.marker?.AdvancedMarkerElement;
                        if (AdvancedMarkerElement) {
                            cleanupClassic();
                            if (!advancedMarkerRef.current) {
                                const marker = new AdvancedMarkerElement({
                                    map: mapInstance,
                                    position: markerPosition,
                                    gmpDraggable: true,
                                });
                                advancedMarkerRef.current = marker;
                                const listener = marker.addListener?.(
                                    'dragend',
                                    (e: any) => {
                                        const ll = e?.latLng || marker.position;
                                        if (!ll) return;
                                        const lat =
                                            typeof ll.lat === 'function'
                                                ? ll.lat()
                                                : ll.lat;
                                        const lng =
                                            typeof ll.lng === 'function'
                                                ? ll.lng()
                                                : ll.lng;
                                        if (
                                            typeof lat === 'number' &&
                                            typeof lng === 'number'
                                        )
                                            setMarkerPosition({ lat, lng });
                                    },
                                );
                                advancedMarkerListenerRef.current =
                                    listener || null;
                            } else {
                                advancedMarkerRef.current.map = mapInstance;
                                advancedMarkerRef.current.position =
                                    markerPosition;
                            }
                            return;
                        }
                    } catch {
                        /* fall through */
                    }
                }

                // Classic marker fallback
                cleanupAdvanced();
                if (!classicMarkerRef.current) {
                    const classicMarker: google.maps.Marker = new g.maps.Marker(
                        {
                            map: mapInstance,
                            position: markerPosition,
                            draggable: true,
                        },
                    );
                    classicMarkerRef.current = classicMarker;
                    classicMarker.addListener('dragend', () => {
                        const pos = classicMarkerRef.current?.getPosition?.();
                        if (!pos) return;
                        setMarkerPosition({ lat: pos.lat(), lng: pos.lng() });
                    });
                } else {
                    classicMarkerRef.current.setMap(mapInstance);
                    classicMarkerRef.current.setPosition(markerPosition);
                }
            } catch {
                /* ignore */
            }
        };

        sync();

        return () => {
            cancelled = true;
            if (advancedMarkerListenerRef.current?.remove)
                advancedMarkerListenerRef.current.remove();
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
            cover_index: Math.min(
                prev.cover_index,
                Math.max(0, merged.length - 1),
            ),
        }));
        Promise.all(
            merged.map(
                (file) =>
                    new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                            resolve(String(reader.result || ''));
                        reader.readAsDataURL(file);
                    }),
            ),
        ).then((previews) => setImagePreviews(previews));
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        const nextCoverIndex =
            data.cover_index === index
                ? 0
                : data.cover_index > index
                  ? data.cover_index - 1
                  : data.cover_index;
        setData({
            ...data,
            images: newImages,
            cover_index: Math.min(
                nextCoverIndex,
                Math.max(0, newImages.length - 1),
            ),
        });
        setImagePreviews(newPreviews);
    };

    // ─── Submit ───────────────────────────────────────────────────────────────────

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // if (data.phone && !isValidNgE164(data.phone)) {
        //     setPhoneLocalError('Enter a valid Nigerian phone number.');
        //     return;
        // }
        post('/onboarding/business-profile', { forceFormData: true });
    };

    // ─── Derived ─────────────────────────────────────────────────────────────────

    const isManualMode = addressMode === 'manual';
    const selectedIndex = Math.min(
        Math.max(0, data.cover_index ?? 0),
        Math.max(0, imagePreviews.length - 1),
    );
    const otherThumbs = imagePreviews
        .map((src, i) => ({ src, i }))
        .filter((x) => x.i !== selectedIndex);
    const shouldShowFallbackActions =
        !googleResolved &&
        !isManualMode &&
        addressDraft.trim().length > 0 &&
        (showFallbackHint || addressDraft.trim().length > 3);

    // ─── Render ──────────────────────────────────────────────────────────────────

    return (
        <OnboardingLayout
            title="Business Profile"
            steps={getStepsWithStatus('profile')}
            currentStepId="profile"
        >
            <div className="min-w-0 space-y-10">
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-leaf dark:text-lime">
                        Step 1 · Business profile
                    </span>
                    <h1 className="font-['Sora'] text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
                        Tell clients who you are
                    </h1>
                    <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                        This is what clients see on your public listing. You can
                        change any of it later from your dashboard.
                    </p>
                </div>

                <form onSubmit={submit} className="grid min-w-0 gap-10">
                    {/* ── Images Upload ─────────────────────────────────────────── */}
                    <FormSection
                        title="Photos"
                        description="Up to 3 banner photos for your public listing. Pick which one clients see first as the cover."
                    >
                        <div
                            className={cn(
                                'relative overflow-hidden rounded-3xl',
                                imagePreviews.length === 0
                                    ? 'border-2 border-dashed border-line bg-paper dark:border-white/15 dark:bg-white/[0.03]'
                                    : 'border border-line dark:border-white/10',
                            )}
                        >
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
                                    onClick={() =>
                                        imageInputRef.current?.click()
                                    }
                                    className="flex h-[200px] w-full flex-col items-center justify-center gap-3 px-4 text-center transition-colors hover:bg-mint/50 sm:h-[260px] sm:px-6 dark:hover:bg-white/[0.05]"
                                >
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-forest text-lime">
                                        <ImagePlus className="size-6" />
                                    </div>
                                    <div className="font-['Sora'] text-base font-bold">
                                        Add photos of your work or space
                                    </div>
                                    <div className="max-w-sm text-sm text-muted-foreground">
                                        JPG or PNG. Photos of your work or space
                                        help your listing stand out.
                                    </div>
                                </button>
                            ) : (
                                <div className="relative h-[200px] sm:h-[360px]">
                                    <img
                                        src={imagePreviews[selectedIndex]}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent" />
                                    <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1.5 sm:top-3 sm:left-3 sm:gap-2">
                                        {imagePreviews.length < 3 && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
                                                onClick={() =>
                                                    imageInputRef.current?.click()
                                                }
                                            >
                                                Add image
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            className="h-7 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
                                            onClick={() =>
                                                removeImage(selectedIndex)
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-2 left-2 rounded-full bg-lime px-3 py-1 text-xs font-bold text-forest sm:bottom-3 sm:left-3">
                                        Cover photo
                                    </div>
                                    {otherThumbs.length > 0 && (
                                        <div className="absolute right-2 bottom-2 flex max-w-[55%] items-end gap-1.5 overflow-x-auto sm:right-3 sm:bottom-3 sm:max-w-none sm:gap-2">
                                            {otherThumbs.map(({ src, i }) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() =>
                                                        setData('cover_index', i)
                                                    }
                                                    className="group relative overflow-hidden rounded-xl border border-white/20 bg-black/30 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5"
                                                    aria-label="Set as cover photo"
                                                >
                                                    <img
                                                        src={src}
                                                        alt=""
                                                        className="h-14 w-16 object-cover sm:h-16 sm:w-20"
                                                    />
                                                    <div className="absolute inset-0 bg-black/35 opacity-0 transition-opacity group-hover:opacity-100" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {errors.images && (
                            <p className="mt-1 text-sm text-destructive">
                                {errors.images}
                            </p>
                        )}
                        {errors.cover_index && (
                            <p className="mt-1 text-sm text-destructive">
                                {errors.cover_index}
                            </p>
                        )}
                    </FormSection>

                    {/* ── Business Name & Category ──────────────────────────────── */}
                    <FormSection
                        title="About your business"
                        description="Your name, what you do and a short pitch in your own words."
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Business Name{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    value={data.business_name}
                                    onChange={(e) =>
                                        setData('business_name', e.target.value)
                                    }
                                    placeholder="What's your business name?"
                                    required
                                    className="h-10"
                                />
                                {errors.business_name && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {errors.business_name}
                                    </p>
                                )}
                            </div>

                            <SearchableSelect
                                label="Business Category"
                                required={true}
                                options={categories}
                                value={data.category}
                                onChange={(value: string) =>
                                    setData('category', value)
                                }
                                placeholder="Select a category"
                                searchPlaceholder="Search categories..."
                                error={errors.category}
                            />
                        </div>

                        {/* ── Description ──────────────────────────────────────────── */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Description
                            </Label>
                            <Textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                rows={6}
                                placeholder="What do you specialise in, how long have you been doing it, and what should clients expect?"
                                className="field-sizing-fixed max-h-60 min-h-36 resize-none overflow-auto whitespace-pre-wrap"
                            />
                            {errors.description && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.description}
                                </p>
                            )}
                        </div>
                    </FormSection>

                    {/* ── Address Block ─────────────────────────────────────────── */}
                    <FormSection
                        title="Location"
                        description="Where clients come to you, or the area you work from if you do home service."
                    >
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                                    <Label className="text-sm font-medium">
                                        Business Address{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>

                                    {googleResolved && (
                                        <span className="flex items-center gap-1 text-xs font-semibold text-leaf dark:text-lime">
                                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                            Location confirmed
                                        </span>
                                    )}

                                    {isManualMode && !googleResolved && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAddressMode('autocomplete');
                                                setShowFallbackHint(false);
                                            }}
                                            className="w-fit text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                                        >
                                            Use autocomplete instead
                                        </button>
                                    )}
                                </div>

                                {/* Address input */}
                                {map_enabled ? (
                                    <div className="relative">
                                        <MapPin
                                            className={cn(
                                                'pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transition-colors',
                                                googleResolved
                                                    ? 'text-leaf dark:text-lime'
                                                    : 'text-muted-foreground',
                                            )}
                                        />

                                        {/* New PlaceAutocompleteElement container */}
                                        <div
                                            className={cn(
                                                'flex h-10 items-center rounded-md border bg-background pr-3 pl-9',
                                                googleResolved &&
                                                    'border-leaf focus-visible:ring-leaf/30 dark:border-lime dark:focus-visible:ring-lime/30',
                                                (!isLoaded ||
                                                    addressAutocompleteUi !==
                                                        'new') &&
                                                    'hidden',
                                            )}
                                            style={{
                                                colorScheme: 'only light',
                                            }}
                                        >
                                            <div
                                                ref={
                                                    placeAutocompleteContainerRef
                                                }
                                                className="w-full"
                                            />
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
                                            disabled={
                                                Boolean(googleMapsApiKey) &&
                                                !isLoaded
                                            }
                                            autoComplete="off"
                                            className={cn(
                                                'h-10 pr-4 pl-9',
                                                googleResolved &&
                                                    'border-leaf focus-visible:ring-leaf/30 dark:border-lime dark:focus-visible:ring-lime/30',
                                                isLoaded &&
                                                    addressAutocompleteUi ===
                                                        'new' &&
                                                    'hidden',
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <Input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                        placeholder="Start typing your address?"
                                        required
                                        className="h-10"
                                    />
                                )}

                                {errors.address && (
                                    <p className="mt-1 text-xs text-destructive">
                                        {errors.address}
                                    </p>
                                )}
                            </div>

                            {/* ── Fallback hint ──────────────────────────────────────── */}
                            {shouldShowFallbackActions && !isManualMode && (
                                <Alert className="border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/20">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                    <AlertDescription className="ml-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                        <span className="font-heading text-xs leading-snug text-amber-700 dark:text-amber-300">
                                            Can't find your address? Enter it
                                            manually or{' '}
                                            <span className="font-medium">
                                                pin it on a map.
                                            </span>
                                        </span>
                                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-8 w-full gap-1.5 border-amber-300 text-xs hover:bg-amber-100 sm:h-7 sm:w-auto dark:hover:bg-amber-900"
                                                onClick={() => {
                                                    setAddressMode('manual');
                                                    setShowFallbackHint(false);
                                                }}
                                            >
                                                <PencilLine className="h-3 w-3" />
                                                Type manually
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="h-8 w-full gap-1.5 text-xs sm:h-7 sm:w-auto"
                                                onClick={openMapPicker}
                                            >
                                                <Map className="h-3 w-3" />
                                                Pick on map
                                            </Button>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* ── City / State (manual or after resolve) ──────────────── */}
                            <div
                                className={cn(
                                    'grid grid-cols-1 gap-3 overflow-hidden transition-all duration-300 ease-in-out md:grid-cols-2',
                                    isManualMode ||
                                        googleResolved ||
                                        !map_enabled
                                        ? 'max-h-40 opacity-100'
                                        : 'pointer-events-none max-h-0 opacity-0',
                                )}
                            >
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">
                                        City
                                    </Label>
                                    <Input
                                        value={data.city}
                                        onChange={(e) =>
                                            setData('city', e.target.value)
                                        }
                                        placeholder="City"
                                        className={cn(
                                            'h-10',
                                            googleResolved &&
                                                !isManualMode &&
                                                'cursor-default bg-muted/50 text-muted-foreground',
                                        )}
                                        readOnly={
                                            googleResolved && !isManualMode
                                        }
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">
                                        State
                                    </Label>
                                    <Input
                                        value={data.state}
                                        onChange={(e) =>
                                            setData('state', e.target.value)
                                        }
                                        placeholder="State"
                                        className={cn(
                                            'h-10',
                                            googleResolved &&
                                                !isManualMode &&
                                                'cursor-default bg-muted/50 text-muted-foreground',
                                        )}
                                        readOnly={
                                            googleResolved && !isManualMode
                                        }
                                    />
                                </div>
                            </div>

                            {googleResolved && (
                                <button
                                    type="button"
                                    onClick={() => setAddressMode('manual')}
                                    className="w-fit text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
                                >
                                    Edit city / state
                                </button>
                            )}
                        </div>
                    </FormSection>

                    {/* ── Phone ─────────────────────────────────────────────────── */}
                    {/* <div className="space-y-1.5">
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
                    </div> */}

                    {/* ── Submit ────────────────────────────────────────────────── */}
                    <div className="sticky bottom-0 z-20 -mx-5 flex flex-col-reverse items-stretch gap-3 border-t border-line bg-background/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 dark:border-white/10">
                        <p className="text-center text-sm text-muted-foreground sm:text-left">
                            Next: set the hours you take bookings.
                        </p>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex h-12 items-center justify-center gap-2 rounded-full bg-forest px-6 font-bold text-white transition hover:bg-forest-deep disabled:opacity-70 dark:bg-lime dark:text-forest dark:hover:brightness-95"
                        >
                            {processing && <Spinner className="size-4" />}
                            Continue to work hours
                            {!processing && <ArrowRight className="size-4" />}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Map Picker Dialog ─────────────────────────────────────────────── */}
            <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                <DialogContent
                    className="flex max-h-[95dvh] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:w-full sm:max-w-2xl"
                    aria-describedby="for map"
                >
                    <DialogHeader className="border-b px-5 py-4">
                        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                            <MapPin className="h-4 w-4 text-primary" />
                            Pin your business location
                        </DialogTitle>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Click anywhere on the map to drop a pin, then
                            confirm.
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
                                    mapId: (import.meta as any).env
                                        ?.VITE_GOOGLE_MAP_ID,
                                }}
                            />
                        ) : (
                            <div
                                className="flex items-center justify-center bg-muted"
                                style={{ height: 'min(400px, 55dvh)' }}
                            >
                                <Spinner />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={isLocating}
                            className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium shadow-md transition-colors hover:bg-muted disabled:opacity-60"
                        >
                            {isLocating ? (
                                <Spinner className="h-3 w-3" />
                            ) : (
                                <LocateFixed className="h-3.5 w-3.5 text-primary" />
                            )}
                            Use my location
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 border-t bg-muted/30 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
                        <div className="min-w-0 flex-1">
                            {markerPosition ? (
                                <>
                                    <p className="line-clamp-2 text-sm font-medium text-foreground">
                                        {mapPickedLabel || 'Resolving address…'}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                                        {markerPosition.lat.toFixed(5)},{' '}
                                        {markerPosition.lng.toFixed(5)}
                                    </p>
                                </>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    No pin dropped yet — tap the map to place
                                    one
                                </p>
                            )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none"
                                onClick={() => setMapOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                disabled={!markerPosition || isReverseGeocoding}
                                onClick={confirmMapLocation}
                                className="flex-1 gap-1.5 sm:flex-none"
                            >
                                {isReverseGeocoding && (
                                    <Spinner className="h-3 w-3" />
                                )}
                                Confirm location
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </OnboardingLayout>
    );
}
