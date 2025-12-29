import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Service {
    id: string;
    name: string;
    description: string;
    duration_minutes: number;
    price: string | number;
}

interface ServicesManagerProps {
    services: Service[];
}

export default function ServicesManager({ services }: ServicesManagerProps) {
    const [isCreating, setIsCreating] = useState(true);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        name: '',
        description: '',
        duration_minutes: '60',
        price: '',
    });

    const handleCreate = () => {
        setIsCreating(true);
        setEditingService(null);
        reset();
        clearErrors();
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setIsCreating(true);
        setData({
            name: service.name,
            description: service.description || '',
            duration_minutes: String(service.duration_minutes),
            price: String(service.price),
        });
        clearErrors();
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingService(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingService) {
            put(`/business/services/${editingService.id}`, {
                onSuccess: () => setIsCreating(false),
            });
        } else {
            post('/business/services', {
                onSuccess: () => setIsCreating(false),
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            destroy(`/business/services/${id}`);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* List Services */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Your Services</CardTitle>
                            <CardDescription>Manage the services you offer to clients.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {services.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service Name</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-medium">
                                                <div>{service.name}</div>
                                                {service.description && (
                                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {service.description}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>{service.duration_minutes} mins</TableCell>
                                            <TableCell>₦{Number(service.price).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(service.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                                No services added yet. Add your first service to start accepting bookings.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Form */}

                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>{editingService ? 'Edit Service' : 'Add New Service'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Service Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Wash & Style"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Service details..."
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price (₦)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            required
                                        />
                                        {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Mins</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            value={data.duration_minutes}
                                            onChange={(e) => setData('duration_minutes', e.target.value)}
                                            required
                                        />
                                        {errors.duration_minutes && <p className="text-sm text-red-500">{errors.duration_minutes}</p>}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                                    <Button type="submit" disabled={processing}>
                                        {editingService ? 'Update Service' : 'Add Service'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

        </div>
    );
}
