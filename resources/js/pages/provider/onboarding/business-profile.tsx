import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import OnboardingLayout from '@/layouts/onboarding-layout';
import { Button } from '@/components/ui/button';
import { Building2, Clock, Scissors, Upload } from 'lucide-react';
import { FormSelect } from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const STEPS = [
    {
        id: 'profile',
        title: 'Business Profile',
        description: 'Set up your business identity and public details.',
        icon: Building2,
        status: 'current' as const,
    },
    {
        id: 'hours',
        title: 'Work Hours',
        description: 'Define when you are available for bookings.',
        icon: Clock,
        status: 'upcoming' as const,
    },
    {
        id: 'services',
        title: 'Services',
        description: 'Add the services you offer to clients.',
        icon: Scissors,
        status: 'upcoming' as const,
    },
];

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

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();

            if (place.address_components) {
                let city = '';
                let state = '';
                let zipCode = '';

                place.address_components.forEach((component) => {
                    const types = component.types;
                    if (types.includes('locality')) {
                        city = component.long_name;
                    }
                    if (types.includes('administrative_area_level_1')) {
                        state = component.short_name;
                    }
                    if (types.includes('postal_code')) {
                        zipCode = component.long_name;
                    }
                });

                setData({
                    ...data,
                    address: place.formatted_address || '',
                    city,
                    state,
                    zip_code: zipCode,
                    latitude: place.geometry?.location?.lat() || null,
                    longitude: place.geometry?.location?.lng() || null,
                });
            }
        }
    };

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
        <OnboardingLayout title="Business Profile" steps={STEPS} currentStepId="profile">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tell us about your business</h2>
                    <p className="text-muted-foreground ">
                        This information will be visible to clients on your public profile.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Images Upload */}
                    <div className="space-y-4">
                        <Label className="text-base">Business Images (Min 2, Max 3)</Label>
                        <p className="text-sm text-muted-foreground">Upload at least 2 images. Select one to use as your business logo.</p>
                        
                        <div className="grid grid-cols-3 gap-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${data.logo_index === index ? 'border-primary shadow-md' : 'border-border'}`}>
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
                                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                                        >
                                            <Upload className="w-3 h-3 rotate-45" />
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
                                <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
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

                    {/* Business Name */}
                    <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <Label >Business Name <span className="text-destructive">*</span></Label>
                        <Input
                            type="text"
                            value={data.business_name}
                            onChange={(e) => setData('business_name', e.target.value)}
                            placeholder="What's your business name?"
                            required
                        />
                        {errors.business_name && <p className="text-sm text-destructive mt-1">{errors.business_name}</p>}
                    </div>

                    {/* Category */}
                    <FormSelect
                        required={true}
                        label="Business Category"
                        options={categories}
                        value={data.category}
                        onChange={(value) => setData('category', value)}
                        placeholder="Select a category"
                    />
                    </div>
                    {/* Description */}
                    <div>
                        <Label>
                            Description
                        </Label>
                        <Textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={6}
                            placeholder="Tell clients about your business..."
                        />
                        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                    </div>

                    {/* Address - Google Maps Autocomplete */}
                    {googleMapsApiKey ? (
                        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
                            <div>
                                <Label>
                                    Business Address
                                </Label>
                                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                                    <Input
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Start typing your address..."
                                        autoComplete={"off"}
                                    />
                                </Autocomplete>
                                {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                            </div>
                        </LoadScript>
                    ) : (
                        <div>
                            <Label>
                                Business Address
                            </Label>
                            <Input
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Enter your address"
                            />
                            <p className="text-xs text-warning mt-1">Google Maps API key not configured</p>
                        </div>
                    )}

                    {/* City, State, Zip (Auto-filled from Google Maps or manual) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>City</Label>
                            <Input
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                                placeholder="Type here..."
                            />
                        </div>
                        <div>
                            <Label>State</Label>
                            <Input
                                value={data.state}
                                onChange={(e) => setData('state', e.target.value)}
                                placeholder="Type here..."
                            />
                        </div>
                        <div>
                            <Label>Zip Code</Label>
                            <Input
                                value={data.zip_code}
                                onChange={(e) => setData('zip_code', e.target.value)}
                                placeholder="Type here..."
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <Label>
                            Business Phone
                        </Label>
                        <Input
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="(+234) 123-4567..."
                        />
                        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" size="lg" disabled={processing} className="w-full md:w-auto">
                            Continue
                        </Button>
                    </div>
                </form>
            </div>
        </OnboardingLayout>
    );
}
