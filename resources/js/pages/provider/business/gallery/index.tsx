import { Button } from '@/components/ui/button';
import KeenIcon from '@/components/keen-icon';
import {
    Card,
    CardContent,
    CardDescription,
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
                <section className="overflow-hidden rounded-3xl border border-border/70 bg-background">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.06),_transparent_24%),radial-gradient(circle_at_left,_rgba(16,185,129,0.06),_transparent_24%)]" />
                        <div className="relative flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-8">
                            <div className="max-w-2xl space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70">
                                        <KeenIcon name="picture" className="text-sm text-sky-600 dark:text-sky-300" />
                                        Portfolio gallery
                                    </span>
                                    <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                                        {items.length} gallery {items.length === 1 ? 'entry' : 'entries'}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                                        Gallery
                                    </h1>
                                    <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                                        Curate your best work, organize it into clean visual stories, and give clients a better feel for the quality of your business.
                                    </p>
                                </div>
                            </div>

                            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => setIsAddOpen(true)} className="rounded-full px-5">
                                        <Plus className="size-5" />
                                        Add gallery item
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[650px] max-h-[90dvh] overflow-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-semibold">
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
                    </div>
                </section>

                {items.length === 0 ? (
                    <Card className="rounded-3xl border border-border/70">
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
                                <Card key={item.id} className="group overflow-hidden rounded-3xl border border-border/70 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm">
                                    <div
                                        className={cn(
                                            'relative h-64 w-full bg-muted/30',
                                            !cover && 'flex items-center justify-center',
                                        )}
                                    >
                                        {cover ? (
                                            <>
                                                <img
                                                    src={cover}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                                                <div className="absolute top-4 left-4">
                                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                                                        <KeenIcon name="picture" className="text-xs" />
                                                        Gallery entry
                                                    </span>
                                                </div>
                                                <div className="absolute right-4 bottom-4">
                                                    <span className="inline-flex rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                        {item.images.length} image{item.images.length === 1 ? '' : 's'}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <ImagePlus className="h-10 w-10 text-muted-foreground" />
                                        )}
                                    </div>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 space-y-2">
                                                <CardTitle className="truncate text-lg">
                                                    {item.title}
                                                </CardTitle>
                                                {item.description && (
                                                    <CardDescription className="line-clamp-2 text-sm leading-6">
                                                        {item.description}
                                                    </CardDescription>
                                                )}
                                                {item.created_at ? (
                                                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                                        Added {new Date(item.created_at).toLocaleDateString()}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 rounded-full hover:bg-destructive/10"
                                                onClick={() => deleteItem(item.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm font-medium text-foreground/80">
                                                <KeenIcon name="picture" className="text-sm text-muted-foreground" />
                                                {item.images.length} image{item.images.length === 1 ? '' : 's'}
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm font-medium text-foreground/80">
                                                <KeenIcon name="abstract-26" className="text-sm text-muted-foreground" />
                                                Portfolio ready
                                            </span>
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
