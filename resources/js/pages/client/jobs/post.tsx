import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function PostJob({ categories }: { categories: any[] }) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing, errors } = useForm({
        category: '',
        title: '',
        description: '',
        budget_min: '',
        budget_max: '',
        address: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });

    // Google Maps Autocomplete
    useEffect(() => {
        if (step === 4) {
            const input = document.getElementById(
                'address',
            ) as HTMLInputElement;
            if (input && window.google) {
                const autocomplete = new window.google.maps.places.Autocomplete(
                    input,
                );
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.geometry?.location) {
                        setData({
                            ...data,
                            address: place.formatted_address || input.value,
                            latitude: place.geometry.location.lat(),
                            longitude: place.geometry.location.lng(),
                        });
                    }
                });
            }
        }
    }, [step]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('jobs.store'), {
            onSuccess: () => {
                // Redirect handled by backend
            },
        });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <AppLayout>
            <Head title="Post a Job" />
            <div className="mx-auto max-w-3xl px-4 py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Post a Job</CardTitle>
                        <CardDescription>
                            Describe what you need and let providers come to you
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Progress Indicator */}
                        <div className="mb-8 flex justify-between">
                            {[1, 2, 3, 4].map((s) => (
                                <div
                                    key={s}
                                    className={`mx-1 h-2 flex-1 rounded ${
                                        s <= step ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Step 1: Category */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Select Category
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.slug}
                                                type="button"
                                                onClick={() => {
                                                    setData(
                                                        'category',
                                                        cat.slug,
                                                    );
                                                    nextStep();
                                                }}
                                                className={`rounded-lg border p-4 transition hover:border-primary ${
                                                    data.category === cat.slug
                                                        ? 'border-primary bg-primary/5'
                                                        : ''
                                                }`}
                                            >
                                                <div className="mb-2 text-2xl">
                                                    {cat.icon}
                                                </div>
                                                <div className="font-medium">
                                                    {cat.name}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Details */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Job Details
                                    </h3>
                                    <div>
                                        <Label htmlFor="title">Job Title</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData('title', e.target.value)
                                            }
                                            placeholder="e.g., Kitchen Renovation"
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Describe what you need done..."
                                            rows={5}
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Budget */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Budget (Optional)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="budget_min">
                                                Minimum
                                            </Label>
                                            <Input
                                                id="budget_min"
                                                type="number"
                                                value={data.budget_min}
                                                onChange={(e) =>
                                                    setData(
                                                        'budget_min',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="budget_max">
                                                Maximum
                                            </Label>
                                            <Input
                                                id="budget_max"
                                                type="number"
                                                value={data.budget_max}
                                                onChange={(e) =>
                                                    setData(
                                                        'budget_max',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="1000"
                                            />
                                        </div>
                                    </div>
                                    {errors.budget_max && (
                                        <p className="text-sm text-red-500">
                                            {errors.budget_max}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Step 4: Location */}
                            {step === 4 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">
                                        Location
                                    </h3>
                                    <div>
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData(
                                                    'address',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Start typing your address..."
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="mt-8 flex justify-between">
                                {step > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                    >
                                        Back
                                    </Button>
                                )}
                                {step < 4 ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="ml-auto"
                                        disabled={
                                            (step === 1 && !data.category) ||
                                            (step === 2 &&
                                                (!data.title ||
                                                    !data.description))
                                        }
                                    >
                                        Next
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="ml-auto"
                                    >
                                        {processing && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Post Job
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
