import KeenIcon from '@/components/keen-icon';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
    const fileRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [viewing, setViewing] = useState<GalleryItem | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<{
        title: string;
        description: string;
        images: File[];
    }>({
        title: '',
        description: '',
        images: [],
    });

    const previewUrls = useMemo(
        () => data.images.map((file) => URL.createObjectURL(file)),
        [data.images],
    );

    useEffect(
        () => () => previewUrls.forEach((url) => URL.revokeObjectURL(url)),
        [previewUrls],
    );

    const totalPhotos = items.reduce(
        (sum, item) => sum + item.images.length,
        0,
    );
    const card =
        'rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10';
    const inputClass =
        'h-12 w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-3.5 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15';

    const addFiles = (files: FileList | File[] | null) => {
        const images = Array.from(files ?? []).filter((file) =>
            file.type.startsWith('image/'),
        );

        if (images.length) {
            setData('images', [...data.images, ...images]);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/business/gallery', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const deleteItem = (id: string) => {
        if (!confirm('Delete this album and all its photos?')) {
            return;
        }

        router.delete(`/business/gallery/${id}`, { preserveScroll: true });
    };

    const focusNewAlbum = () => {
        titleRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
        titleRef.current?.focus();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gallery" />

            <div className="flex w-full flex-col gap-[22px] p-4 md:p-6">
                <header className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-[1_1_300px] flex-col gap-1">
                        <span className="text-[13px] text-muted-foreground">
                            Business
                        </span>
                        <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                            Gallery
                        </h1>
                        <span className="text-sm text-muted-foreground">
                            Show clients your best work. Albums appear on your
                            public profile.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={focusNewAlbum}
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#0E3B2E] px-[18px] text-sm font-semibold text-white hover:bg-[#0E3B2E]/90 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                    >
                        <KeenIcon name="plus" className="text-lg" />
                        New album
                    </button>
                </header>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                    {[
                        { label: 'Albums', value: items.length },
                        { label: 'Photos', value: totalPhotos },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className={cn(
                                card,
                                'flex items-center gap-3.5 p-[18px]',
                            )}
                        >
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                <KeenIcon
                                    name="picture"
                                    className="text-[22px]"
                                />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[13px] text-muted-foreground">
                                    {stat.label}
                                </span>
                                <span className="font-[Sora] text-[22px] font-bold text-foreground">
                                    {stat.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-start gap-6">
                    {/* Albums */}
                    <div className="grid min-w-0 flex-[999_1_520px] grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                        {items.length === 0 && (
                            <div
                                className={cn(
                                    card,
                                    'col-span-full flex flex-col items-center gap-2 border-dashed py-16 text-center',
                                )}
                            >
                                <KeenIcon
                                    name="picture"
                                    className="text-4xl text-[#A9C7B8]"
                                />
                                <span className="text-sm font-semibold text-foreground">
                                    No albums yet
                                </span>
                                <span className="text-[13px] text-muted-foreground">
                                    Create your first album to show clients your
                                    work.
                                </span>
                            </div>
                        )}

                        {items.map((item) => {
                            const [first, second, third] = item.images;
                            const extra = item.images.length - 3;

                            return (
                                <article
                                    key={item.id}
                                    className={cn(
                                        card,
                                        'flex flex-col overflow-hidden',
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setViewing(item)}
                                        aria-label={`Open ${item.title}`}
                                        className="grid h-[200px] grid-cols-[2fr_1fr] grid-rows-2 gap-1 p-1.5"
                                    >
                                        {first ? (
                                            <img
                                                src={first.url}
                                                alt=""
                                                className="row-span-2 h-full w-full rounded-l-[14px] rounded-r-md object-cover"
                                            />
                                        ) : (
                                            <span className="row-span-2 rounded-l-[14px] rounded-r-md bg-muted" />
                                        )}
                                        {second ? (
                                            <img
                                                src={second.url}
                                                alt=""
                                                className="h-full w-full rounded-l-md rounded-tr-[14px] rounded-br-md object-cover"
                                            />
                                        ) : (
                                            <span className="rounded-l-md rounded-tr-[14px] rounded-br-md bg-muted" />
                                        )}
                                        <span className="relative">
                                            {third ? (
                                                <img
                                                    src={third.url}
                                                    alt=""
                                                    className="h-full w-full rounded-l-md rounded-tr-md rounded-br-[14px] object-cover"
                                                />
                                            ) : (
                                                <span className="block h-full rounded-l-md rounded-tr-md rounded-br-[14px] bg-muted" />
                                            )}
                                            {extra > 0 && (
                                                <span className="absolute inset-0 flex items-center justify-center rounded-l-md rounded-tr-md rounded-br-[14px] bg-[#0E3B2E]/65 font-[Sora] text-base font-bold text-white">
                                                    +{extra}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                    <div className="flex items-center gap-2.5 px-4 pt-3 pb-4">
                                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <span className="truncate font-[Sora] text-base font-semibold text-foreground">
                                                {item.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {item.images.length} photo
                                                {item.images.length === 1
                                                    ? ''
                                                    : 's'}
                                                {item.created_at &&
                                                    ` · ${new Date(item.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label={`Delete ${item.title}`}
                                            onClick={() => deleteItem(item.id)}
                                            className="flex size-10 items-center justify-center rounded-[10px] border border-[#0E3B2E]/12 text-red-700 hover:bg-red-50 dark:border-white/15 dark:text-red-300 dark:hover:bg-red-950/30"
                                        >
                                            <KeenIcon
                                                name="trash"
                                                className="text-base"
                                            />
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* New album */}
                    <form
                        onSubmit={submit}
                        className={cn(
                            card,
                            'flex max-w-[400px] flex-[1_1_320px] flex-col overflow-hidden',
                        )}
                    >
                        <div className="border-b border-[#0E3B2E]/[0.08] px-[22px] py-[18px] font-[Sora] text-[17px] font-semibold text-foreground dark:border-white/10">
                            New album
                        </div>
                        <div className="flex flex-col gap-4 px-[22px] py-5">
                            <label className="flex flex-col gap-2">
                                <span className="text-[13px] font-bold text-foreground">
                                    Album title
                                </span>
                                <input
                                    ref={titleRef}
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="e.g. Bridal braids"
                                    className={inputClass}
                                />
                                {errors.title && (
                                    <span className="text-xs font-bold text-destructive">
                                        {errors.title}
                                    </span>
                                )}
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-[13px] font-bold text-foreground">
                                    Description{' '}
                                    <span className="font-medium text-muted-foreground">
                                        (optional)
                                    </span>
                                </span>
                                <textarea
                                    rows={2}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-3.5 py-3 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15"
                                />
                                {errors.description && (
                                    <span className="text-xs font-bold text-destructive">
                                        {errors.description}
                                    </span>
                                )}
                            </label>

                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    addFiles(e.dataTransfer.files);
                                }}
                                className={cn(
                                    'flex flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed p-[22px] text-center transition-colors',
                                    isDragging
                                        ? 'border-[#0E3B2E] bg-[#E6F4EC] dark:border-[#C8F169] dark:bg-[#0E3B2E]'
                                        : 'border-[#0E3B2E]/25 bg-muted/40 dark:border-white/20',
                                )}
                            >
                                <span className="flex size-11 items-center justify-center rounded-xl bg-[#C8F169] text-[#0E3B2E]">
                                    <KeenIcon
                                        name="picture"
                                        className="text-[22px]"
                                    />
                                </span>
                                <span className="text-sm font-bold text-foreground">
                                    Drop photos here or{' '}
                                    <span className="text-[#2F7D4F] underline dark:text-[#C8F169]">
                                        browse
                                    </span>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Images up to 2 MB each
                                </span>
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    addFiles(e.target.files);
                                    e.target.value = '';
                                }}
                            />
                            {errors.images && (
                                <span className="text-xs font-bold text-destructive">
                                    {errors.images}
                                </span>
                            )}

                            {previewUrls.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {previewUrls.map((url, index) => (
                                        <div
                                            key={url}
                                            className="relative aspect-square overflow-hidden rounded-[10px]"
                                        >
                                            <img
                                                src={url}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                aria-label="Remove photo"
                                                onClick={() =>
                                                    setData(
                                                        'images',
                                                        data.images.filter(
                                                            (_, idx) =>
                                                                idx !== index,
                                                        ),
                                                    )
                                                }
                                                className="absolute top-1 right-1 flex size-[26px] items-center justify-center rounded-full bg-white/90 text-[#13201B]"
                                            >
                                                <KeenIcon
                                                    name="cross"
                                                    className="text-xs"
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-auto border-t border-[#0E3B2E]/[0.08] px-[22px] pt-4 pb-[22px] dark:border-white/10">
                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.title.trim() ||
                                    data.images.length === 0
                                }
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] text-[15px] font-bold text-white hover:bg-[#0E3B2E]/90 disabled:opacity-60 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                            >
                                {processing && <Spinner />}
                                Create album
                                {data.images.length > 0
                                    ? ` · ${data.images.length} photo${data.images.length === 1 ? '' : 's'}`
                                    : ''}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Album viewer */}
            <Dialog
                open={viewing !== null}
                onOpenChange={(open) => !open && setViewing(null)}
            >
                <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="font-[Sora]">
                            {viewing?.title}
                        </DialogTitle>
                        {viewing?.description && (
                            <DialogDescription>
                                {viewing.description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {viewing?.images.map((image) => (
                            <img
                                key={image.id}
                                src={image.url}
                                alt=""
                                className="aspect-square w-full rounded-xl object-cover"
                            />
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
