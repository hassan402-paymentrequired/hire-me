import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { useForm, usePage } from '@inertiajs/react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Building2, Save, Upload, MapPin, Settings as SettingsIcon, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { FormSelect } from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import AdvancedSettings from '@/pages/provider/business/components/advance-setting';
import { BreadcrumbItem } from '@/types';
import business from '@/routes/business';

const libraries: ("places")[] = ["places"];

interface Props {
    profile: any;
    categories: { value: string; label: string }[];
}

export default function BusinessSettings({ profile, categories }: Props) {
    const { flash } = usePage().props as any;
    const [activeTab, setActiveTab] = useState('general');
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(profile?.images?.find(img => img.is_logo)?.path || null);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    const { data, setData, post, processing, errors, transform } = useForm({
        business_name: profile?.business_name || '',
        description: profile?.description || '',
        address: profile?.address || '',
        city: profile?.city || '',
        state: profile?.state || '',
        zip_code: profile?.zip_code || '',
        phone: profile?.phone || '',
        category: profile?.category || '',
        latitude: profile?.latitude || null,
        longitude: profile?.longitude || null,
        settings: profile?.settings || {},
        logo: null as File | null,
        new_images: [] as File[],
        delete_image_ids: [] as string[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: business.dashboard().url },
        { title: 'Business', href: business.hours().url },
        { title: 'Settings', href: '' },
    ];

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
                    if (types.includes('locality')) city = component.long_name;
                    if (types.includes('administrative_area_level_1')) state = component.short_name;
                    if (types.includes('postal_code')) zipCode = component.long_name;
                });

                setData((prev) => ({
                    ...prev,
                    address: place.formatted_address || '',
                    city,
                    state,
                    zip_code: zipCode,
                    latitude: place.geometry?.location?.lat() || null,
                    longitude: place.geometry?.location?.lng() || null,
                }));
            }
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleNewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setData('new_images', [...data.new_images, ...files]);

            const newPreviews: string[] = [];
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string);
                    if (newPreviews.length === files.length) {
                        setNewImagePreviews(prev => [...prev, ...newPreviews]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeNewImage = (index: number) => {
        const newImages = data.new_images.filter((_, i) => i !== index);
        const newPreviews = newImagePreviews.filter((_, i) => i !== index);
        setData('new_images', newImages);
        setNewImagePreviews(newPreviews);
    };

    const toggleDeleteImage = (id: string) => {
        if (data.delete_image_ids.includes(id)) {
            setData('delete_image_ids', data.delete_image_ids.filter(i => i !== id));
        } else {
            setData('delete_image_ids', [...data.delete_image_ids, id]);
        }
    };

    const handleSettingsChange = (field: string, value: any) => {
        setData('settings', {
            ...data.settings,
            [field]: value
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(business.settings.update().url, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    const tabs = [
        { id: 'general', label: 'General Info', icon: Building2 },
        { id: 'location', label: 'Location', icon: MapPin },
        { id: 'advanced', label: 'Advanced Settings', icon: SettingsIcon },
        { id: 'appearance', label: 'Images & Logo', icon: ImageIcon },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <main className="flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Business Settings</h2>
                        <p className="text-sm text-muted-foreground">Manage your business profile and booking preferences.</p>
                    </div>
                    <Button onClick={submit} disabled={processing}>
                        {processing ? <Spinner className="mr-2" /> : <Save className="mr-2 w-4 h-4" />}
                        Save Changes
                    </Button>
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-success/10 rounded-lg border border-success/20">
                        <p className="text-sm font-medium text-success">{flash.success}</p>
                    </div>
                )}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                        <p className="text-sm font-medium text-destructive">Please fix the errors below.</p>
                    </div>
                )}

                <div className="flex overflow-x-auto gap-2 border-b border-border mb-6 no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-smooth border-b-2 whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Business Name</Label>
                                    <Input
                                        value={data.business_name}
                                        onChange={e => setData('business_name', e.target.value)}
                                    />
                                    {errors.business_name && <p className="text-xs text-destructive">{errors.business_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <FormSelect
                                        label="Category"
                                        options={categories}
                                        value={data.category}
                                        onChange={val => setData('category', val)}
                                    />
                                    {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Business Phone</Label>
                                <Input
                                    type="tel"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows={5}
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'location' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            {googleMapsApiKey ? (
                                <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
                                    <div className="space-y-2">
                                        <Label>Address</Label>
                                        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                                            <Input
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                placeholder="Start typing your address..."
                                                autoComplete="off"
                                            />
                                        </Autocomplete>
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input value={data.city} onChange={e => setData('city', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input value={data.state} onChange={e => setData('state', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Zip Code</Label>
                                    <Input value={data.zip_code} onChange={e => setData('zip_code', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <AdvancedSettings
                                settings={data.settings}
                                onSettingsChange={handleSettingsChange}
                            />
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                            {/* Logo Section */}
                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">Business Logo</Label>
                                <div className="flex items-center gap-6">
                                    <div className="w-32 h-32 rounded-lg border-2 border-border overflow-hidden bg-muted flex items-center justify-center relative group">
                                        {logoPreview ? (
                                            <img src={logoPreview} className="w-full h-full object-cover" alt="Logo" />
                                        ) : (
                                            <Building2 className="w-12 h-12 text-muted-foreground" />
                                        )}
                                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            <Upload className="text-white w-6 h-6" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                        </label>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Change Logo</p>
                                        <p className="text-xs text-muted-foreground mb-3">Recommended: Square image, max 2MB.</p>
                                        <Button type="button" variant="outline" size="sm" asChild>
                                            <label className="cursor-pointer">
                                                Choose File
                                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                            </label>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Images Section */}
                            <div className="space-y-4 pt-6 border-t border-border">
                                <Label className="text-lg font-semibold">Business Images</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Existing Images */}
                                    {profile?.images?.filter(img => !img.is_logo).map((img : any) => (
                                        <div key={img.id} className={`relative rounded-lg overflow-hidden h-32 border-2 transition-all ${data.delete_image_ids.includes(img.id) ? 'opacity-50 ring-2 ring-destructive' : 'border-border'}`}>
                                            <img src={Storage.url(img.path)} className="w-full h-full object-cover" alt="Business" />
                                            <button
                                                type="button"
                                                onClick={() => toggleDeleteImage(img.id)}
                                                className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${data.delete_image_ids.includes(img.id) ? 'bg-primary text-white' : 'bg-destructive/80 text-white hover:bg-destructive'}`}
                                            >
                                                {data.delete_image_ids.includes(img.id) ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                            {data.delete_image_ids.includes(img.id) && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <span className="bg-destructive text-[10px] text-white px-2 py-0.5 rounded font-bold">DELETING</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* New Images Previews */}
                                    {newImagePreviews.map((preview, idx) => (
                                        <div key={idx} className="relative rounded-lg overflow-hidden h-32 border-2 border-primary/30">
                                            <img src={preview} className="w-full h-full object-cover" alt="New" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(idx)}
                                                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="absolute top-2 left-2">
                                                <span className="bg-primary text-[10px] text-white px-2 py-0.5 rounded font-bold">NEW</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Image Button */}
                                    <label className="border-2 border-dashed border-border rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                                        <Upload className="w-8 h-8 text-muted-foreground mb-1" />
                                        <span className="text-xs font-medium text-muted-foreground">Add Images</span>
                                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleNewImagesChange} />
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground">You can upload multiple images. Max 5MB each.</p>
                            </div>
                        </div>
                    )}
                </form>
            </main>
        </AppLayout>
    );
}

// Helper to use Storage.url in frontend (since it's a Laravel helper)
const Storage = {
    url: (path: string) => path.startsWith('http') ? path : `/storage/${path}`
};
