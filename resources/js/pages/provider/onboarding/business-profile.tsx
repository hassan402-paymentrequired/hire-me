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

const BUSINESS_CATEGORIES = [
    { value: 'salon', label: 'Salon & Barber' },
    { value: 'spa', label: 'Spa & Wellness' },
    { value: 'fitness', label: 'Fitness & Training' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'home_services', label: 'Home Services' },
    { value: 'professional', label: 'Professional Services' },
    { value: 'other', label: 'Other' },
];

const libraries: ("places")[] = ["places"];

export default function BusinessProfile() {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        description: '',
        logo: null as File | null,
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
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

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

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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
                    {/* Logo Upload */}
                    <div>
                        <label className="text-sm font-medium leading-none mb-2 block">
                            Business Logo
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="w-24 h-24 rounded-lg object-cover border-2 border-border"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="block "
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    PNG, JPG up to 2MB
                                </p>
                            </div>
                        </div>
                        {errors.logo && <p className="text-sm text-destructive mt-1">{errors.logo}</p>}
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
                        options={BUSINESS_CATEGORIES}
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
