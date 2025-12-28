import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OnboardingLayout from '@/layouts/onboarding-layout';
import onboarding from '@/routes/onboarding';
import { useForm } from '@inertiajs/react';
import { Building2, Clock, Scissors } from 'lucide-react';

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
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(onboarding.services.store());
    };

    const skip = () => {
         post(onboarding.skip());
    };

    return (
        <OnboardingLayout title="Add Services" steps={STEPS} currentStepId="services">
             <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Add your first service</h2>
                    <p className="text-muted-foreground mt-2">
                        Create a service so clients can start booking you immediately.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Service Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Standard Haircut"
                                required
                                className="h-11"
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₦)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    placeholder="5000"
                                    required
                                    className="h-11"
                                />
                                {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (mins)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={data.duration_minutes}
                                    onChange={(e) => setData('duration_minutes', e.target.value)}
                                    placeholder="60"
                                    required
                                    className="h-11"
                                />
                                {errors.duration_minutes && <p className="text-sm text-red-500">{errors.duration_minutes}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" size="lg" disabled={processing} className="w-full md:w-auto">
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
