import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import onboarding from '@/routes/onboarding';

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
        <AppLayout breadcrumbs={[{ title: 'Onboarding', href: '#' }]}>
            <Head title="Setup Business Profile" />
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Welcome! Let's set up your business.</CardTitle>
                        <CardDescription>Tell us a bit about what you do so clients can find you.</CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="business_name">Business Name</Label>
                                <Input
                                    id="business_name"
                                    value={data.business_name}
                                    onChange={(e) => setData('business_name', e.target.value)}
                                    placeholder="e.g. Hassan's Barbershop"
                                    required
                                />
                                {errors.business_name && <p className="text-sm text-red-500">{errors.business_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe your services..."
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button type="button" variant="ghost" onClick={skip}>
                                Skip for now
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Save & Continue
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
