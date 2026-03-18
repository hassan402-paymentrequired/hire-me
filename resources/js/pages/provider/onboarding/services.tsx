import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OnboardingLayout from '@/layouts/onboarding-layout';
import onboarding from '@/routes/onboarding';
import { useForm } from '@inertiajs/react';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { getStepsWithStatus } from './onboarding-steps';

interface ServicesProps {
    businessCategory: { id: string; name: string } | null;
}

export default function Services({ businessCategory }: ServicesProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        price: '',
        duration_minutes: '60',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(onboarding.services.store().url);
    };

    const skip = () => {
         post(onboarding.skip('services').url);
    };

    return (
        <OnboardingLayout
            title="Add Services"
            steps={getStepsWithStatus('services')}
            currentStepId="services"
        >
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Add your first service
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Create a service so clients can start booking you
                        immediately.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Keep category wired in the background (auto-derived from business profile). */}
                        <div className="hidden">
                            <div>{businessCategory?.id}</div>
                            <div>{businessCategory?.name}</div>
                        </div>

                        {errors.category_id && (
                            <p className="text-xs text-destructive">
                                {errors.category_id}
                            </p>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Service Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g. Standard Haircut"
                                required
                                className="h-10"
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-sm font-medium">
                                Service Description
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder={data.name ? `Tell users about ${data.name}` : 'Describe your service...'}
                                rows={4}
                                className="resize-none"
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="price" className="text-sm font-medium">
                                    Price (₦) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData('price', e.target.value)
                                    }
                                    placeholder="0.00"
                                    required
                                    className="h-10"
                                    min="0"
                                    step="0.01"
                                />
                                {errors.price && (
                                    <p className="text-xs text-destructive mt-1">
                                        {errors.price}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="duration" className="text-sm font-medium">
                                    Duration (minutes) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={data.duration_minutes}
                                    onChange={(e) =>
                                        setData(
                                            'duration_minutes',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="60"
                                    required
                                    className="h-10"
                                    min="15"
                                    step="15"
                                />
                                {errors.duration_minutes && (
                                    <p className="text-xs text-destructive mt-1">
                                        {errors.duration_minutes}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                            className="w-full sm:w-auto min-w-[120px]"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Save & Finish
                        </Button>
                        <Button type="button" variant="ghost" onClick={skip}>
                            Skip for now
                        </Button>
                    </div>
                </form>
            </div>
        </OnboardingLayout>
    );
}
