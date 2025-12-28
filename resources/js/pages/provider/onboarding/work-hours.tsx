import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import onboarding from '@/routes/onboarding';

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
        <AppLayout breadcrumbs={[{ title: 'Onboarding', href: '#' }]}>
            <Head title="Set Work Hours" />
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>When are you available?</CardTitle>
                        <CardDescription>We'll set you up with standard hours to start. You can customize this later.</CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="space-y-4 text-center py-8">
                            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                <Clock className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium">Standard Schedule</h3>
                            <p className="text-muted-foreground">Monday - Friday</p>
                            <p className="text-2xl font-bold">9:00 AM - 5:00 PM</p>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button type="button" variant="ghost" onClick={skip}>
                                Skip for now
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Use Standard Hours
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
