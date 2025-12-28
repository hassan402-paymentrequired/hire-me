import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export default function BusinessProfile() {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(onboarding.businessProfile.store());
    };

    const skip = () => {
        post(onboarding.skip());
    };

    return (
        <OnboardingLayout title="Business Profile" steps={STEPS} currentStepId="profile">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tell us about your business</h2>
                    <p className="text-muted-foreground mt-2">
                        This information will be displayed on your public booking page.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="business_name">Business Name</Label>
                            <Input
                                id="business_name"
                                value={data.business_name}
                                onChange={(e) => setData('business_name', e.target.value)}
                                placeholder="e.g. Hassan's Barbershop"
                                required
                                className="h-11"
                            />
                            {errors.business_name && <p className="text-sm text-red-500">{errors.business_name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Briefly describe what you do..."
                                className="min-h-[120px] resize-none"
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" size="lg" disabled={processing} className="w-full md:w-auto">
                            Save & Continue
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
