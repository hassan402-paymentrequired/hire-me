import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadScript } from '@react-google-maps/api';
import React from 'react';

const libraries: ('places')[] = ['places'];

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
    const [isScriptLoaded, setIsScriptLoaded] = React.useState(false);
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    const onPlaceChanged = React.useCallback(() => {
        if (!autocompleteRef.current) return;

        const place = autocompleteRef.current.getPlace();
        if (!place.address_components?.length) return;

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

        if (!place.formatted_address) return;

        setData('address', place.formatted_address);
        setData('city', city || data.city);
        setData('state', state || data.state);
        setData('zip_code', zipCode || data.zip_code);
        setData('latitude', place.geometry?.location?.lat() || null);
        setData('longitude', place.geometry?.location?.lng() || null);
    }, [data.city, data.state, data.zip_code, setData]);

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

    return (
        <div className="space-y-6">
            {googleMapsApiKey ? (
                <LoadScript
                    googleMapsApiKey={googleMapsApiKey}
                    libraries={libraries}
                    onLoad={() => setIsScriptLoaded(true)}
                >
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                            ref={inputRef}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Start typing your address..."
                            autoComplete="off"
                        />
                        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                    </div>
                </LoadScript>
            ) : (
                <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                    />
                    <p className="text-[10px] text-yellow-600">Google Maps API not configured.</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={data.city} onChange={(e) => setData('city', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>State</Label>
                    <Input value={data.state} onChange={(e) => setData('state', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Zip Code</Label>
                    <Input value={data.zip_code} onChange={(e) => setData('zip_code', e.target.value)} />
                </div>
            </div>
        </div>
    );
}
