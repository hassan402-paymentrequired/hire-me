import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import onboarding from '@/routes/onboarding';

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
        <AppLayout breadcrumbs={[{ title: 'Onboarding', href: '#' }]}>
            <Head title="Add a Service" />
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Add your first service</CardTitle>
                        <CardDescription>What is the main service you offer?</CardDescription>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Service Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Standard Haircut"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₦)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="5000"
                                        required
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
                                    />
                                    {errors.duration_minutes && <p className="text-sm text-red-500">{errors.duration_minutes}</p>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button type="button" variant="ghost" onClick={skip}>
                                Skip for now
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Save & Finish
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
