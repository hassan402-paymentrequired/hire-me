import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { LoadScript } from '@react-google-maps/api';
import OnboardingLayout from '@/layouts/onboarding-layout';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { getStepsWithStatus } from './onboarding-steps';

interface BusinessProfileProps {
    categories: { value: string; label: string }[];
}

const libraries: ("places")[] = ["places"];

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

    const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isScriptLoaded, setIsScriptLoaded] = React.useState(false);

    const onLoad = React.useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocompleteInstance;
    }, []);

    const onPlaceChanged = React.useCallback(() => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();

            if (place.address_components && place.address_components.length > 0) {
                let city = '';
                let state = '';
                let zipCode = '';

                // Extract address components - handle multiple possible types
                place.address_components.forEach((component) => {
                    const types = component.types;
                    
                    // City can be in different fields depending on location
                    if (!city) {
                        if (types.includes('locality')) {
                            city = component.long_name;
                        } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                            city = component.long_name;
                        } else if (types.includes('administrative_area_level_2')) {
                            city = component.long_name;
                        }
                    }
                    
                    // State/Province
                    if (!state) {
                        if (types.includes('administrative_area_level_1')) {
                            state = component.short_name || component.long_name;
                        }
                    }
                    
                    // Zip Code
                    if (!zipCode) {
                        if (types.includes('postal_code')) {
                            zipCode = component.long_name;
                        }
                    }
                });

                // Only update if we got valid data from Google
                if (place.formatted_address) {
                    setData({
                        ...data,
                        address: place.formatted_address,
                        city: city || data.city, // Keep existing if Google didn't provide
                        state: state || data.state, // Keep existing if Google didn't provide
                        zip_code: zipCode || data.zip_code, // Keep existing if Google didn't provide
                        latitude: place.geometry?.location?.lat() || null,
                        longitude: place.geometry?.location?.lng() || null,
                    });
                }
            }
        }
    }, [data, setData]);

    // Initialize Autocomplete when script loads and input is available
    React.useEffect(() => {
        if (isScriptLoaded && inputRef.current && !autocompleteRef.current && window.google?.maps?.places) {
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['address'],
                componentRestrictions: undefined, // Allow all countries
                fields: ['address_components', 'formatted_address', 'geometry'],
            });
            
            // Add place_changed listener
            autocomplete.addListener('place_changed', () => {
                onPlaceChanged();
            });
            
            autocompleteRef.current = autocomplete;
        }

        return () => {
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners?.(autocompleteRef.current);
                autocompleteRef.current = null;
            }
        };
    }, [isScriptLoaded, onPlaceChanged]);

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newImages = [...data.images, ...files].slice(0, 3);
            setData('images', newImages);

            const newPreviews: string[] = [];
            newImages.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                    if (newPreviews.length === newImages.length) {
                        setImagePreviews(newPreviews);
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
            logo_index: data.logo_index >= newImages.length ? 0 : data.logo_index
        });
        setImagePreviews(newPreviews);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/onboarding/business-profile', {
            forceFormData: true,
        });
    };

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    return (
        <OnboardingLayout title="Business Profile" steps={getStepsWithStatus('profile')} currentStepId="profile">
            <div className="space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Tell us about your business</h2>
                    <p className="text-sm text-muted-foreground">
                        This information will be visible to clients on your public profile.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Images Upload */}
                    <div className="space-y-3">
                        <div>
                            <Label className="text-sm font-medium">Business Images (Min 2, Max 3)</Label>
                            <p className="text-xs text-muted-foreground mt-1">Upload at least 2 images. Select one to use as your business logo.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className={`relative group  h-[150px] rounded overflow-hidden border-2 transition-all ${data.logo_index === index ? 'border-primary shadow-md' : 'border-border'}`}>
                                    <img src={preview} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            type="button"
                                            variant={data.logo_index === index ? "default" : "secondary"}
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
                                <label className=" rounded h-[150px] border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
                                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                    <span className="text-xs font-medium text-muted-foreground">Add Image</span>
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

                    {/* Business Name & Category */}
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
                            <div>
                                <Label className="text-sm font-medium">
                                    Business Category <span className="text-destructive">*</span>
                                </Label>
                            </div>
                            <SearchableSelect
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
                    {/* Description */}
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

                    {/* Address - Google Maps Autocomplete */}
                    <div className="space-y-1.5">
                        {googleMapsApiKey ? (
                            <LoadScript 
                                googleMapsApiKey={googleMapsApiKey} 
                                libraries={libraries}
                                onLoad={() => setIsScriptLoaded(true)}
                            >
                                <div>
                                    <Label className="text-sm font-medium">
                                        Business Address <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        ref={inputRef}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Start typing your address..."
                                        autoComplete="off"
                                        className="h-10"
                                        required
                                    />
                                    {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                                </div>
                            </LoadScript>
                        ) : (
                            <div>
                                <Label className="text-sm font-medium">
                                    Business Address <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Enter your address"
                                    className="h-10"
                                    required
                                />
                                {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                                <p className="text-xs text-muted-foreground mt-1">Google Maps API key not configured</p>
                            </div>
                        )}
                    </div>

                    {/* City, State (Auto-filled from Google Maps or manual) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">City</Label>
                            <Input
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                placeholder="Type here..."
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">State</Label>
                            <Input
                                value={data.state}
                                onChange={(e) => setData('state', e.target.value)}
                                placeholder="Type here..."
                                className="h-10"
                            />
                        </div>
                    </div>

                    {/* Phone */}
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

                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button type="submit" size="lg" disabled={processing} className="w-full sm:w-auto min-w-[120px]">
                            {processing && <Spinner className="mr-2" />}
                            Continue
                        </Button>
                    </div>
                </form>
            </div>
        </OnboardingLayout>
    );
}
