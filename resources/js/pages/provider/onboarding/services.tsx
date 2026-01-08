import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OnboardingLayout from '@/layouts/onboarding-layout';
import onboarding from '@/routes/onboarding';
import { useForm } from '@inertiajs/react';
import { Building2, Clock, Scissors, ShieldCheck } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';

const STEPS = [
    {
        id: 'profile',
        title: 'Business Profile',
        description: 'Set up your business identity and public details.',
        icon: Building2,
        status: 'completed' as const,
    },
    {
        id: 'hours',
        title: 'Work Hours',
        description: 'Define when you are available for bookings.',
        icon: Clock,
        status: 'completed' as const,
    },
    {
        id: 'services',
        title: 'Services',
        description: 'Add the services you offer to clients.',
        icon: Scissors,
        status: 'current' as const,
    },
];

export default function Services() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        price: '',
        duration_minutes: '60',
        description: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(onboarding.services.store().url);
    };

    const skip = () => {
         post(onboarding.skip().url);
    };

    return (
        <OnboardingLayout
            title="Add Services"
            steps={STEPS}
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

                <form onSubmit={submit} className="space-y-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Service Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g. Standard Haircut"
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Service Description
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder={'Tell users about ' + data.name}
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₦)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData('price', e.target.value)
                                    }
                                    placeholder={'How much is ' + data.name}
                                    required
                                />
                                {errors.price && (
                                    <p className="text-sm text-red-500">
                                        {errors.price}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">
                                    Duration (mins)
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
                                    placeholder={'how many minutes does it take to complete ' + data.name }
                                    required
                                />
                                {errors.duration_minutes && (
                                    <p className="text-sm text-red-500">
                                        {errors.duration_minutes}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                            className="w-full md:w-auto"
                        >
                            {processing && <Spinner />} Save & Finish
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
