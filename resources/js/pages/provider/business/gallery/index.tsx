import KeenIcon from '@/components/keen-icon';
import { EmptyState } from '@/components/site/empty-state';
import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import GalleryFormPanel, {
    type GalleryFormData,
} from './components/gallery-form-panel';

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
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [viewing, setViewing] = useState<GalleryItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

    const { data, setData, post, processing, errors, reset } =
        useForm<GalleryFormData>({
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

    const addFiles = (files: FileList | File[] | null) => {
        const images = Array.from(files ?? []).filter((file) =>
            file.type.startsWith('image/'),
        );

        if (images.length) {
            setData('images', [...data.images, ...images]);
        }
    };

    const closeAddForm = () => {
        setIsAddFormOpen(false);
        reset();
    };

    const openAddForm = () => {
        reset();
        setIsAddFormOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/business/gallery', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => closeAddForm(),
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(`/business/gallery/${deleteTarget.id}`, {
            preserveScroll: true,
        });
        setDeleteTarget(null);
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
                        onClick={openAddForm}
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#0E3B2E] px-[18px] text-sm font-semibold text-white hover:bg-[#0E3B2E]/90 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                    >
                        <KeenIcon name="plus" className="text-lg" />
                        Add gallery
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

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                    {isAddFormOpen && (
                        <div className="order-first lg:order-last">
                            <GalleryFormPanel
                                key="new-gallery"
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                previewUrls={previewUrls}
                                onSubmit={submit}
                                onClose={closeAddForm}
                                onAddFiles={addFiles}
                            />
                        </div>
                    )}

                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                        {items.length === 0 && (
                            <EmptyState
                                illustration="favourites"
                                title="No gallery albums yet"
                                description="Add photos of your work so clients know what to expect when they book you."
                                contextLabel="Gallery"
                                className="bg-card"
                                actions={
                                    <button
                                        type="button"
                                        onClick={openAddForm}
                                        className="flex h-12 items-center rounded-full bg-forest px-6 text-[15px] font-bold text-white dark:bg-lime dark:text-forest"
                                    >
                                        Add gallery
                                    </button>
                                }
                            />
                        )}

                        {items.length > 0 && (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
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
                                                        {item.images.length}{' '}
                                                        photo
                                                        {item.images.length ===
                                                        1
                                                            ? ''
                                                            : 's'}
                                                        {item.created_at &&
                                                            ` · ${new Date(item.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    aria-label={`Delete ${item.title}`}
                                                    onClick={() =>
                                                        setDeleteTarget(item)
                                                    }
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
                        )}
                    </div>
                </div>
            </div>

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

            <CustomAlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
                icon={
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        <KeenIcon name="trash" className="text-3xl" />
                    </span>
                }
                title={
                    deleteTarget
                        ? `Delete “${deleteTarget.title}”?`
                        : 'Delete album?'
                }
                description="This album and every photo in it will be removed from your public profile."
                acceptLabel="Delete"
                rejectLabel="Cancel"
                onAccept={confirmDelete}
                acceptVariant="destructive"
                rejectVariant="outline"
            />
        </AppLayout>
    );
}