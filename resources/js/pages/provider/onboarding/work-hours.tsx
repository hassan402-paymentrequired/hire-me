import { Button } from '@/components/ui/button';
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
        status: 'current' as const,
    },
    {
        id: 'services',
        title: 'Services',
        description: 'Add the services you offer to clients.',
        icon: Scissors,
        status: 'upcoming' as const,
    },
];

export default function WorkHours() {
    const { post, processing } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(onboarding.workHours.store());
    };

    const skip = () => {
         post(onboarding.skip());
    };

    return (
        <OnboardingLayout title="Work Hours" steps={STEPS} currentStepId="hours">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Set your availability</h2>
                    <p className="text-muted-foreground mt-2">
                        We'll start you with standard business hours. You can customize specific days later in your dashboard.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    <div className="p-6 border rounded-lg bg-muted/20">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Standard Schedule</h3>
                                <div className="text-muted-foreground mt-1">Monday - Friday</div>
                                <div className="text-2xl font-bold mt-2">9:00 AM - 5:00 PM</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" size="lg" disabled={processing} className="w-full md:w-auto">
                            Use Standard Hours
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
