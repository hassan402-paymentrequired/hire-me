import { AppSelect } from '@/components/ui/app-select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
    SettingsField,
    SettingsSwitch,
    settingsInputClass,
    settingsOutlineButtonClass,
    settingsPrimaryButtonClass,
    settingsSelectTriggerClass,
} from '@/pages/client/settings/components/settings-field';
import { useJsApiLoader } from '@react-google-maps/api';
import { Loader2, LocateFixed, MapPin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const MAP_LIBRARIES: 'places'[] = ['places'];

const LABEL_PRESETS = ['Home', 'Office'];

export const NIGERIAN_STATES = [
    'Abia',
    'Abuja (FCT)',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
];

export interface AddressFormValues {
    label: string;
    address: string;
    city: string;
    state: string;
    latitude: number | null;
    longitude: number | null;
    makeActive: boolean;
}

export const emptyAddressForm: AddressFormValues = {
    label: 'Home',
    address: '',
    city: '',
    state: '',
    latitude: null,
    longitude: null,
    makeActive: true,
};

/**
 * Picks the city and state out of a Google geocoding result.
 */
function placeParts(components: google.maps.GeocoderAddressComponent[]): {
    city: string;
    state: string;
} {
    let city = '';
    let state = '';

    components.forEach((component) => {
        const types = component.types;

        if (
            !city &&
            (types.includes('locality') ||
                types.includes('sublocality_level_1') ||
                types.includes('administrative_area_level_2'))
        ) {
            city = component.long_name;
        }

        if (!state && types.includes('administrative_area_level_1')) {
            state = component.long_name.replace(/\s+State$/i, '');
        }
    });

    const matchedState =
        NIGERIAN_STATES.find((name) =>
            name.toLowerCase().startsWith(state.toLowerCase().slice(0, 4)),
        ) ?? state;

    return { city, state: state ? matchedState : '' };
}

export function AddressFormDialog({
    open,
    onOpenChange,
    mode,
    values,
    onChange,
    errors,
    isSaving,
    isActiveAlready,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    values: AddressFormValues;
    onChange: (values: AddressFormValues) => void;
    errors: Record<string, string>;
    isSaving: boolean;
    isActiveAlready?: boolean;
    onSubmit: () => void;
}) {
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey,
        libraries: MAP_LIBRARIES,
    });
    const mapsReady = Boolean(googleMapsApiKey) && isLoaded;

    const addressInput = useRef<HTMLInputElement | null>(null);
    const valuesRef = useRef(values);
    const [isLocating, setIsLocating] = useState(false);
    const [locateError, setLocateError] = useState<string | null>(null);
    const isCustomLabel = !LABEL_PRESETS.includes(values.label);

    useEffect(() => {
        valuesRef.current = values;
    }, [values]);

    const set = <K extends keyof AddressFormValues>(
        key: K,
        value: AddressFormValues[K],
    ) => onChange({ ...values, [key]: value });

    useEffect(() => {
        if (!mapsReady || !open) {
            return;
        }

        let cleanup = () => {};
        const timer = window.setTimeout(() => {
            if (!addressInput.current) {
                return;
            }

            const autocomplete = new window.google.maps.places.Autocomplete(
                addressInput.current,
                {
                    types: ['address'],
                    componentRestrictions: { country: 'ng' },
                    fields: [
                        'address_components',
                        'formatted_address',
                        'geometry',
                    ],
                },
            );

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();

                if (!place.formatted_address) {
                    return;
                }

                const parts = placeParts(place.address_components ?? []);
                onChange({
                    ...valuesRef.current,
                    address: place.formatted_address,
                    city: parts.city || valuesRef.current.city,
                    state: parts.state || valuesRef.current.state,
                    latitude: place.geometry?.location?.lat() ?? null,
                    longitude: place.geometry?.location?.lng() ?? null,
                });
            });

            cleanup = () =>
                window.google.maps.event.clearInstanceListeners(autocomplete);
        }, 0);

        return () => {
            window.clearTimeout(timer);
            cleanup();
        };
    }, [mapsReady, open, onChange]);

    const useCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocateError('Your browser can’t share your location.');

            return;
        }

        setIsLocating(true);
        setLocateError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                if (!mapsReady) {
                    onChange({
                        ...valuesRef.current,
                        latitude: location.lat,
                        longitude: location.lng,
                    });
                    setIsLocating(false);

                    return;
                }

                new window.google.maps.Geocoder().geocode(
                    { location },
                    (results, status) => {
                        setIsLocating(false);
                        const result = status === 'OK' ? results?.[0] : null;

                        if (!result) {
                            setLocateError(
                                'We couldn’t find an address here. Type it in instead.',
                            );

                            return;
                        }

                        const parts = placeParts(result.address_components);
                        onChange({
                            ...valuesRef.current,
                            address: result.formatted_address,
                            city: parts.city,
                            state: parts.state,
                            latitude: location.lat,
                            longitude: location.lng,
                        });
                    },
                );
            },
            () => {
                setIsLocating(false);
                setLocateError(
                    'Location access was blocked. Type your address instead.',
                );
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    }, [mapsReady, onChange]);

    const stateOptions = NIGERIAN_STATES.map((state) => ({
        value: state,
        label: state,
    }));

    if (values.state && !NIGERIAN_STATES.includes(values.state)) {
        stateOptions.unshift({ value: values.state, label: values.state });
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setLocateError(null);
                onOpenChange(next);
            }}
        >
            <DialogContent
                className="max-h-[92vh] gap-0 overflow-y-auto rounded-3xl p-0 sm:max-w-[560px]"
                onInteractOutside={(event) => {
                    const target = event.target as HTMLElement | null;

                    if (target?.closest('.pac-container')) {
                        event.preventDefault();
                    }
                }}
            >
                <div className="px-7 pt-7">
                    <span className="grid size-11 place-items-center rounded-xl bg-mint text-forest">
                        <MapPin className="size-5" />
                    </span>
                    <DialogTitle className="mt-4 text-xl font-bold">
                        {mode === 'create' ? 'Add an address' : 'Edit address'}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-moss">
                        Pros who come to you will use this address.
                    </DialogDescription>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit();
                    }}
                    noValidate
                >
                    <div className="space-y-5 px-7 pt-6 pb-7">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-ink">
                                Label
                            </span>
                            <div
                                role="radiogroup"
                                aria-label="Address label"
                                className="flex flex-wrap gap-2"
                            >
                                {[...LABEL_PRESETS, 'Other'].map((preset) => {
                                    const isActive =
                                        preset === 'Other'
                                            ? isCustomLabel
                                            : values.label === preset;

                                    return (
                                        <button
                                            key={preset}
                                            type="button"
                                            role="radio"
                                            aria-checked={isActive}
                                            onClick={() =>
                                                set(
                                                    'label',
                                                    preset === 'Other'
                                                        ? ''
                                                        : preset,
                                                )
                                            }
                                            className={cn(
                                                'h-10 rounded-full px-4 text-sm font-semibold transition',
                                                isActive
                                                    ? 'bg-forest text-white'
                                                    : 'border border-line bg-white text-ink hover:bg-paper',
                                            )}
                                        >
                                            {preset}
                                        </button>
                                    );
                                })}
                            </div>
                            {isCustomLabel && (
                                <input
                                    aria-label="Custom label"
                                    value={values.label}
                                    onChange={(event) =>
                                        set('label', event.target.value)
                                    }
                                    placeholder="e.g. Mum’s house, Gym"
                                    maxLength={100}
                                    aria-invalid={Boolean(errors.label)}
                                    className={cn(settingsInputClass, 'mt-1')}
                                    autoFocus
                                />
                            )}
                            {errors.label && (
                                <p className="text-xs font-medium text-red-600">
                                    {errors.label}
                                </p>
                            )}
                        </div>

                        <SettingsField
                            id="address-line"
                            label="Street address"
                            error={errors.address}
                            hint={
                                locateError ? (
                                    <span className="text-amber-700">
                                        {locateError}
                                    </span>
                                ) : undefined
                            }
                        >
                            <input
                                id="address-line"
                                ref={addressInput}
                                value={values.address}
                                onChange={(event) =>
                                    onChange({
                                        ...values,
                                        address: event.target.value,
                                        latitude: null,
                                        longitude: null,
                                    })
                                }
                                placeholder={
                                    mapsReady
                                        ? 'Start typing your address'
                                        : '14 Admiralty Way, Lekki Phase 1'
                                }
                                autoComplete="street-address"
                                aria-invalid={Boolean(errors.address)}
                                className={settingsInputClass}
                            />
                            <button
                                type="button"
                                onClick={useCurrentLocation}
                                disabled={isLocating}
                                className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-forest hover:underline disabled:opacity-60"
                            >
                                {isLocating ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <LocateFixed className="size-4" />
                                )}
                                Use my current location
                            </button>
                        </SettingsField>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <SettingsField
                                id="address-city"
                                label="Area / city"
                                error={errors.city}
                            >
                                <input
                                    id="address-city"
                                    value={values.city}
                                    onChange={(event) =>
                                        set('city', event.target.value)
                                    }
                                    placeholder="Lekki"
                                    autoComplete="address-level2"
                                    aria-invalid={Boolean(errors.city)}
                                    className={settingsInputClass}
                                />
                            </SettingsField>
                            <SettingsField
                                id="address-state"
                                label="State"
                                error={errors.state}
                            >
                                <AppSelect
                                    id="address-state"
                                    value={values.state}
                                    onChange={(value) => set('state', value)}
                                    options={stateOptions}
                                    placeholder="Select state"
                                    searchPlaceholder="Search states…"
                                    triggerClassName={
                                        settingsSelectTriggerClass
                                    }
                                />
                            </SettingsField>
                        </div>

                        {!isActiveAlready && (
                            <div className="flex items-center justify-between gap-4 rounded-2xl bg-paper px-4 py-3.5">
                                <div>
                                    <p className="text-[15px] font-semibold">
                                        Make this my active address
                                    </p>
                                    <p className="text-[13px] text-moss">
                                        We’ll use it by default when you book
                                        home services.
                                    </p>
                                </div>
                                <SettingsSwitch
                                    checked={values.makeActive}
                                    onChange={(checked) =>
                                        set('makeActive', checked)
                                    }
                                    label="Make this my active address"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 border-t border-line px-7 py-5">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className={settingsOutlineButtonClass}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={settingsPrimaryButtonClass}
                        >
                            {isSaving && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            {mode === 'create'
                                ? 'Save address'
                                : 'Save changes'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
