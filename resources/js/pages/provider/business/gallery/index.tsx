import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BreadcrumbItem } from '@/types';

interface GalleryImage {
    id: string;
    url: string;
    sort_order: number;
}

interface GalleryItem {
    id: string;
    title: string;
    description: string | null;
    created_at: string | null;
    images: GalleryImage[];
}

interface Props {
    items: GalleryItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/business' },
    { title: 'Gallery', href: '' },
];

export default function GalleryIndex({ items }: Props) {
    const [isAddOpen, setIsAddOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        title: string;
        description: string;
        images: File[];
    }>({
        title: '',
        description: '',
        images: [],
    });

    const previewUrls = useMemo(() => {
        return data.images.map((f) => URL.createObjectURL(f));
    }, [data.images]);

    const closeModal = () => {
        setIsAddOpen(false);
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/business/gallery', {
            forceFormData: true,
            onSuccess: () => closeModal(),
        });
    };

    const deleteItem = (id: string) => {
        if (!confirm('Delete this gallery item?')) return;
        router.delete(`/business/gallery/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gallery" />

            <div className="flex flex-col gap-6 p-4 w-full">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Gallery
                        </h1>
                        <p className="text-muted-foreground">
                            Create gallery entries and show your best work to clients.
                        </p>
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsAddOpen(true)}>
                                <Plus className="size-5" />
                                Add gallery item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[650px] max-h-[90dvh] overflow-auto">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">
                                    Add gallery item
                                </DialogTitle>
                            </DialogHeader>

                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="e.g. Bridal makeup look"
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-destructive font-bold">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData('description', e.target.value)
                                        }
                                        placeholder="Add context, what was done, what to expect..."
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-destructive font-bold">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Images</Label>
                                    <div className="rounded-lg border border-dashed p-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-2">
                                                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    Upload 1 to 10 images
                                                </p>
                                            </div>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(
                                                        e.target.files || [],
                                                    );
                                                    setData('images', files);
                                                }}
                                            />
                                        </div>

                                        {errors.images && (
                                            <p className="mt-2 text-xs text-destructive font-bold">
                                                {errors.images}
                                            </p>
                                        )}

                                        {data.images.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                {previewUrls.map((url, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="overflow-hidden rounded border bg-muted/20"
                                                    >
                                                        <img
                                                            src={url}
                                                            alt="Preview"
                                                            className="h-36 w-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {items.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No gallery items yet</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground">
                            Add your first gallery item to show clients your work.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => {
                            const cover = item.images[0]?.url;
                            return (
                                <Card key={item.id} className="overflow-hidden">
                                    <div
                                        className={cn(
                                            'h-56 w-full bg-muted/30 ',
                                            !cover && 'flex items-center justify-center',
                                        )}
                                    >
                                        {cover ? (
                                            <img
                                                src={cover}
                                                alt={item.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <ImagePlus className="h-10 w-10 text-muted-foreground" />
                                        )}
                                    </div>
                                    <CardHeader className="pb-2 pt-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <CardTitle className="truncate">
                                                    {item.title}
                                                </CardTitle>
                                                {item.description && (
                                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0"
                                                onClick={() => deleteItem(item.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-muted-foreground">
                                            {item.images.length} image
                                            {item.images.length === 1 ? '' : 's'}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
