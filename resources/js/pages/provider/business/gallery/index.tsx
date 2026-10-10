import KeenIcon from '@/components/keen-icon';
import { Button } from '@/components/ui/button';
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
import { EmptyCard } from '@/components/ui/empty-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

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
    const fileRef = useRef(null);

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

    const handleImageClick = () => {
        fileRef?.current?.click();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gallery" />

            <div className="flex w-full flex-col gap-6 p-4">
                <section className="overflow-hidden rounded-3xl border border-border/70 bg-background">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.06),_transparent_24%),radial-gradient(circle_at_left,_rgba(16,185,129,0.06),_transparent_24%)]" />
                        <div className="relative flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-8">
                            <div className="max-w-2xl space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-foreground/70 uppercase">
                                        <KeenIcon
                                            name="picture"
                                            className="text-sm text-sky-600 dark:text-sky-300"
                                        />
                                        Portfolio gallery
                                    </span>
                                    <span className="inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                                        {items.length} gallery{' '}
                                        {items.length === 1
                                            ? 'entry'
                                            : 'entries'}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                                        Gallery
                                    </h1>
                                    <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                                        Curate your best work, organize it into
                                        clean visual stories, and give clients a
                                        better feel for the quality of your
                                        business.
                                    </p>
                                </div>
                            </div>

                            <Dialog
                                open={isAddOpen}
                                onOpenChange={setIsAddOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => setIsAddOpen(true)}
                                        className="px -5 group"
                                    >
                                        <Plus className="size-5" />
                                        <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-in-out group-hover:max-w-40 group-hover:opacity-100">
                                            {' '}
                                            Add gallery item
                                        </span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-[650px]">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-semibold">
                                            Add gallery item
                                        </DialogTitle>
                                    </DialogHeader>

                                    <form
                                        onSubmit={submit}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Title</Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={(e) =>
                                                    setData(
                                                        'title',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Bridal makeup look"
                                            />
                                            {errors.title && (
                                                <p className="text-xs text-destructive">
                                                    {errors.title}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) =>
                                                    setData(
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Add context, what was done, what to expect..."
                                            />
                                            {errors.description && (
                                                <p className="text-xs font-bold text-destructive">
                                                    {errors.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Images</Label>
                                            <div className="space-y-4">
                                                {/* Dropzone */}
                                                <div
                                                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/40"
                                                    onClick={handleImageClick}
                                                >
                                                    <svg
                                                        className="w-16 shrink-0 text-muted-foreground"
                                                        width="73"
                                                        height="47"
                                                        viewBox="0 0 73 47"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M54.519 40.4773V6.76876C54.519 3.92686 52.2121 1.62305 49.3664 1.62305H22.7076C19.8619 1.62305 17.555 3.92686 17.555 6.76876V40.4773M54.519 40.4773C54.519 43.3192 52.2121 45.6231 49.3664 45.6231H22.7076C19.8619 45.6231 17.555 43.3192 17.555 40.4773M54.519 40.4773L54.5189 34.6563L48.6564 28.3566L43.2612 34.6373C42.4421 35.5908 40.9662 35.5955 40.141 34.6472L30.3406 23.3844L17.555 36.9154V40.4773M6.20483 9.59424L17.707 7.6798V42.5188L12.6457 43.5828C9.25658 44.2954 5.94238 42.0892 5.29702 38.691L1.14643 16.8357C0.500082 13.4322 2.78322 10.1637 6.20483 9.59424ZM65.8691 9.59424L54.3669 7.6798V42.5188L59.4282 43.5828C62.8173 44.2954 66.1316 42.0892 66.7769 38.691L70.9274 16.8357C71.5738 13.4322 69.2907 10.1637 65.8691 9.59424ZM45.0584 15.3561C45.0584 17.7228 43.1372 19.6413 40.7673 19.6413C38.3974 19.6413 36.4762 17.7228 36.4762 15.3561C36.4762 12.9894 38.3974 11.0708 40.7673 11.0708C43.1372 11.0708 45.0584 12.9894 45.0584 15.3561Z"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        />
                                                    </svg>

                                                    <div className="mt-4 flex flex-wrap justify-center text-sm/6">
                                                        <span className="pe-1 font-medium text-foreground">
                                                            Drop your files here
                                                            or
                                                        </span>
                                                        <span className="font-semibold text-primary hover:underline">
                                                            browse
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Pick files up to 2MB
                                                        each.
                                                    </p>

                                                    <Input
                                                        ref={fileRef}
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const files =
                                                                Array.from(
                                                                    e.target
                                                                        .files ||
                                                                        [],
                                                                );
                                                            setData(
                                                                'images',
                                                                files,
                                                            );
                                                        }}
                                                    />
                                                </div>

                                                {/* Previews */}
                                                {data.images.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="font-medium">
                                                                {
                                                                    data.images
                                                                        .length
                                                                }{' '}
                                                                image
                                                                {data.images
                                                                    .length > 1
                                                                    ? 's'
                                                                    : ''}{' '}
                                                                selected
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="text-muted-foreground transition-colors hover:text-destructive"
                                                                onClick={() => {
                                                                    setData(
                                                                        'images',
                                                                        [],
                                                                    );
                                                                    if (
                                                                        fileRef.current
                                                                    )
                                                                        fileRef.current.value =
                                                                            '';
                                                                }}
                                                            >
                                                                Clear all
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                            {previewUrls.map(
                                                                (url, idx) => (
                                                                    <div
                                                                        key={
                                                                            url
                                                                        }
                                                                        className="relative aspect-square overflow-hidden rounded-lg border bg-muted/20"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                url
                                                                            }
                                                                            alt={
                                                                                data
                                                                                    .images[
                                                                                    idx
                                                                                ]
                                                                                    ?.name ??
                                                                                'Preview'
                                                                            }
                                                                            className="size-full object-cover"
                                                                        />

                                                                        <button
                                                                            type="button"
                                                                            aria-label="Remove image"
                                                                            className="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-destructive"
                                                                            onClick={() =>
                                                                                setData(
                                                                                    'images',
                                                                                    data.images.filter(
                                                                                        (
                                                                                            _,
                                                                                            i,
                                                                                        ) =>
                                                                                            i !==
                                                                                            idx,
                                                                                    ),
                                                                                )
                                                                            }
                                                                        >
                                                                            <X className="size-3.5" />
                                                                        </button>

                                                                        <div className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pt-6 pb-1.5 text-xs text-white">
                                                                            {
                                                                                data
                                                                                    .images[
                                                                                    idx
                                                                                ]
                                                                                    ?.name
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.images && (
                                                <p className="mt-2 text-xs text-destructive">
                                                    {errors.images}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={closeModal}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? 'Creating...'
                                                    : 'Create'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </section>

                {items.length === 0 ? (
                    // <Card className="rounded-3xl border border-border/70">
                    //     <CardHeader>
                    //         <CardTitle>No gallery items yet</CardTitle>
                    //     </CardHeader>
                    //     <CardContent className="text-muted-foreground">
                    //         Add your first gallery item to show clients your work.
                    //     </CardContent>
                    // </Card>
                    <EmptyCard
                        title="No gallery items yet"
                        description="Add your first gallery item to show clients your work."
                        buttonText="Add to gallery"
                        image="https://images.unsplash.com/photo-1615243639681-1208d685758a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
                        className="h-36 w-48 rounded-xl"
                        buttonOnClick={() => setIsAddOpen(true)}
                    />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => {
                            const cover = item.images[0]?.url;
                            return (
                                <Card
                                    key={item.id}
                                    className="group overflow-hidden rounded-3xl border border-border/70 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm"
                                >
                                    <div
                                        className={cn(
                                            'relative h-64 w-full bg-muted/30',
                                            !cover &&
                                                'flex items-center justify-center',
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
                                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-white uppercase backdrop-blur-sm">
                                                        <KeenIcon
                                                            name="picture"
                                                            className="text-xs"
                                                        />
                                                        Gallery entry
                                                    </span>
                                                </div>
                                                <div className="absolute right-4 bottom-4">
                                                    <span className="inline-flex rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                        {item.images.length}{' '}
                                                        image
                                                        {item.images.length ===
                                                        1
                                                            ? ''
                                                            : 's'}
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
                                                    <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                                                        Added{' '}
                                                        {new Date(
                                                            item.created_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 rounded-full hover:bg-destructive/10"
                                                onClick={() =>
                                                    deleteItem(item.id)
                                                }
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm font-medium text-foreground/80">
                                                <KeenIcon
                                                    name="picture"
                                                    className="text-sm text-muted-foreground"
                                                />
                                                {item.images.length} image
                                                {item.images.length === 1
                                                    ? ''
                                                    : 's'}
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-sm font-medium text-foreground/80">
                                                <KeenIcon
                                                    name="abstract-26"
                                                    className="text-sm text-muted-foreground"
                                                />
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
