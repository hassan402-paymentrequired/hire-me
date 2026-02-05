import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Edit2,
    Plus,
    Trash2,
    TrendingUp,
    LayoutGrid,
    Star,
    Search,
    Filter,
    Clock,
    Box,
    Check
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import business from '@/routes/business';
import { Spinner } from '@/components/ui/spinner';

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    category_id: string | null;
    category_name: string | null;
    status: 'active' | 'inactive';
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface StatsValue {
    value: number | string;
    change: string;
}

interface Props {
    services: Service[];
    categories: Category[];
    stats: {
        totalServices: StatsValue;
        activeCategories: number;
        mostBooked: {
            name: string;
            change: string;
        }
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/business',
    },
    {
        title: 'Services',
        href: '',
    },
];

export default function ServicesIndex({ services, categories, stats }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        price: '',
        duration_minutes: '',
        category_id: '',
    });

    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 (service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            const matchesCategory = selectedCategory === 'all' || service.category_id === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [services, searchQuery, selectedCategory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingService) {
            put(`/business/services/${editingService.id}`, {
                onSuccess: () => {
                    setEditingService(null);
                    reset();
                }
            });
        } else {
            post('/business/services', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setData({
            name: service.name,
            description: service.description || '',
            price: service.price.toString(),
            duration_minutes: service.duration_minutes.toString(),
            category_id: service.category_id || '',
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this service?')) {
            router.delete(`/business/services/${id}`);
        }
    };

    const toggleStatus = (id: string) => {
        router.post(`/business/services/${id}/toggle`);
    };

    const statsCard = [
        {
            name: 'Total Services',
            icon: Box,
            value: stats.totalServices.value,
            change: stats.totalServices.change,
            time: 'vs last month'
        },
        {
            name: 'Active Categories',
            icon: LayoutGrid,
            value: stats.activeCategories,
            change: '',
            time: 'categories listed'
        },
        {
            name: 'Most booked service',
            icon: Star,
            value: stats.mostBooked.name,
            change: stats.mostBooked.change,
            time: 'vs last month'
        }
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Management" />

            <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Services</h1>
                        <p className="text-muted-foreground">Manage and organize your service offerings.</p>
                    </div>
                    <Dialog open={isAddModalOpen || !!editingService} onOpenChange={(open) => {
                        if (!open) {
                            setIsAddModalOpen(false);
                            setEditingService(null);
                            reset();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsAddModalOpen(true)}>
                                <Plus className="size-5" />
                                Add New Service
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] max-h-[90dvh] overflow-auto "
                                       style={{ maxHeight: '90dvh' }} >
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 ">
                                <div className="space-y-2">
                                    <Label htmlFor="name" >Service Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="e.g. Premium House Cleaning"
                                    />
                                    {errors.name && <p className="text-xs text-destructive font-bold">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price" >Price (₦)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={data.price}
                                            onChange={e => setData('price', e.target.value)}
                                            placeholder="0.00"

                                        />
                                        {errors.price && <p className="text-xs text-destructive font-bold">{errors.price}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration" >Duration (Min)</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            value={data.duration_minutes}
                                            onChange={e => setData('duration_minutes', e.target.value)}
                                            placeholder="60"

                                        />
                                        {errors.duration_minutes && <p className="text-xs text-destructive font-bold">{errors.duration_minutes}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" >Category</Label>
                                    <Select value={data.category_id} onValueChange={val => setData('category_id', val)}>
                                        <SelectTrigger >
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="text-xs text-destructive font-bold">{errors.category_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" >Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Briefly describe the service..."
                                    />
                                    {errors.description && <p className="text-xs text-destructive font-bold">{errors.description}</p>}
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingService(null);
                                        reset();
                                    }}>Cancel</Button>
                                    <Button type="submit" disabled={processing} >
                                        {processing && <Spinner />} {editingService ? 'Update Service' : 'Create Service'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Section */}
                <div className="grid gap-6 md:grid-cols-3">
                    {statsCard.map((stat, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.name}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stat.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.change} {stat.time}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filtering Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <Button
                            size={"sm"}
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            className={cn("rounded-full px-6 transition-all", selectedCategory === 'all' && "shadow-sm shadow-primary/20")}
                            onClick={() => setSelectedCategory('all')}
                        >
                            All Categories
                        </Button>
                        {categories.map(cat => (
                            <Button
                                size={"sm"}
                                key={cat.id}
                                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                className={cn("rounded-full px-6 transition-all whitespace-nowrap", selectedCategory === cat.id && "shadow-sm shadow-primary/20")}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search services..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="rounded pl-12"
                            />
                        </div>
                    </div>
                </div>

                {/* Services Table */}
                <div className="bg-card rounded border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-b-2">
                                <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Service Name</TableHead>
                                <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Category</TableHead>
                                <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Duration</TableHead>
                                <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Price</TableHead>
                                <TableHead className="py-5 font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                                <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] text-right px-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody >
                            {filteredServices.map((service) => (
                                <TableRow key={service.id} className="group hover:bg-muted/5 transition-colors ">
                                    <TableCell className="py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                                <Box className="size-5" />
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-lg leading-tight capitalize">{service.name}</p>
                                                {service.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1 font-medium">{service.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground border-2 border-muted">
                                            {service.category_name || 'Uncategorized'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-muted-foreground font-bold">
                                            <Clock className="size-4" />
                                            <span className="text-sm">{service.duration_minutes}m</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-black text-lg">₦{Number(service.price).toLocaleString()}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div
                                                onClick={() => toggleStatus(service.id)}
                                                className={cn(
                                                    "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                                                    service.status === 'active' ? "bg-primary" : "bg-muted border-2"
                                                )}
                                            >
                                                <div className={cn(
                                                    "size-4 rounded-full bg-white absolute top-1 transition-all duration-300",
                                                    service.status === 'active' ? "left-7 shadow-sm" : "left-1"
                                                )} />
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                service.status === 'active' ? "text-primary" : "text-muted-foreground"
                                            )}>
                                                {service.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex items-center justify-end gap-2 ">
                                            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary rounded-xl" onClick={() => handleEdit(service)}>
                                                <Edit2 className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive rounded-xl" onClick={() => handleDelete(service.id)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredServices.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                            <Box className="size-16 mb-4 opacity-10" />
                            <p className="font-bold text-lg">No services found</p>
                            <p className="text-sm">Try adjusting your filters or add a new service.</p>
                        </div>
                    )}
                </div>


            </div>
        </AppLayout>
    );
}
