import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { EmptyCard } from '@/components/ui/empty-card';
import GuestLayout from '@/layouts/guest-layout';
import { cn, formatDate } from '@/lib/utils';
import { Head, InfiniteScroll } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
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

interface Provider {
    id: string;
    name: string;
    businessName: string;
    slug: string;
    logo: string | null;
}

interface Props {
    provider: Provider;
    items: {
        data: GalleryItem[];
        next_page_url: string | null;
        current_page: number;
    };
}

export default function ProviderGallery({ provider, items }: Props) {
    const flat = useMemo(() => {
        const images: Array<{
            itemIndex: number;
            imageIndex: number;
            item: GalleryItem;
            image: GalleryImage;
        }> = [];
        items.data.forEach((item, itemIndex) => {
            item.images.forEach((image, imageIndex) => {
                images.push({ itemIndex, imageIndex, item, image });
            });
        });
        return images;
    }, [items.data]);

    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<number>(0);

    const masonryRef = useRef<HTMLDivElement | null>(null);
    const [columnCount, setColumnCount] = useState(1);

    useEffect(() => {
        const el = masonryRef.current;
        if (!el) return;

        const compute = () => {
            const viewportWidth =
                typeof window !== 'undefined'
                    ? window.innerWidth
                    : el.clientWidth;

            // Keep images visually large: never go beyond 3 columns, and if there
            // are only a few images, cap at 2 columns.
            const minColWidth = 360;
            const maxColsByWidth = Math.max(
                1,
                Math.floor(el.clientWidth / minColWidth),
            );

            let maxCols = Math.min(3, maxColsByWidth);
            if (viewportWidth < 640) maxCols = 1;
            if (flat.length <= 4) maxCols = Math.min(maxCols, 2);

            // Never allocate more columns than we have items, otherwise we leave empty space.
            const next = Math.max(1, Math.min(maxCols, flat.length || 1));
            setColumnCount((prev) => (prev === next ? prev : next));
        };

        compute();

        const onResize = () => compute();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', onResize);
        }

        let ro: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(() => compute());
            ro.observe(el);
        }

        return () => {
            ro?.disconnect();
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', onResize);
            }
        };
    }, [flat.length]);

    const masonryColumns = useMemo(() => {
        const cols: Array<Array<{ entry: (typeof flat)[number]; idx: number }>> =
            Array.from({ length: columnCount }, () => []);

        flat.forEach((entry, idx) => {
            cols[idx % columnCount].push({ entry, idx });
        });

        return cols;
    }, [flat, columnCount]);

    const activeEntry = flat[active];
    const canPrev = active > 0;
    const canNext = active < flat.length - 1;

    useEffect(() => {
        if (active >= flat.length && flat.length > 0) {
            setActive(flat.length - 1);
        }
        if (flat.length === 0) {
            setActive(0);
        }
    }, [active, flat.length]);

    return (
        <GuestLayout>
            <Head title={`${provider.businessName} Gallery`} />

            <div className="mx-auto w-full max-w-7xl px-4 py-8">
                <div className="relative mb-6 overflow-hidden">
                    <img
                        src="/assets/gifs/empty.svg"
                        alt=""
                        className="pointer-events-none absolute -top-10 -right-10 hidden w-[520px] rotate-2 opacity-[0.08] md:block"
                        aria-hidden="true"
                    />

                    <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            {provider.logo ? (
                                <img
                                    src={provider.logo}
                                    alt={`${provider.businessName} logo`}
                                    className="h-12 w-12 rounded-md border object-cover"
                                    loading='lazy'
                                />
                            ) : null}
                            <div>
                                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                                    {provider.businessName} gallery
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Browse photos shared by the provider.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {flat.length === 0 ? (
                    <EmptyCard
                        title={provider.businessName + " has'nt upload any images yet."}
                        image="/assets/gifs/empty.svg"
                        className="size-74"
                    />
                ) : (
                    <InfiniteScroll
                        data="items"
                        buffer={400}
                        next={({ loading, hasNext }) =>
                            hasNext && (
                                <div className="mt-8 flex h-10 items-center justify-center">
                                    {loading && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                            Loading more...
                                        </div>
                                    )}
                                </div>
                            )
	                        }
	                    >
	                        <div ref={masonryRef} className="w-full">
	                            <div
	                                className={cn(
	                                    'flex w-full items-start gap-4',
	                                    columnCount === 1 && 'flex-col',
	                                )}
	                            >
	                                {masonryColumns.map((col, colIdx) => (
	                                    <div
	                                        key={colIdx}
	                                        className={cn(
	                                            'flex min-w-0 flex-1 flex-col gap-4',
	                                            columnCount === 1 && 'w-full',
	                                        )}
	                                    >
	                                        {col.map(({ entry, idx }) => (
	                                            <button
	                                                key={`${entry.image.id}-${idx}`}
	                                                type="button"
	                                                className="w-full overflow-hidden rounded-lg border bg-muted/10 text-left hover:opacity-95"
	                                                onClick={() => {
	                                                    setActive(idx);
	                                                    setOpen(true);
	                                                }}
	                                                title={entry.item.title}
	                                            >
	                                                <img
	                                                    src={entry.image.url}
	                                                    alt={entry.item.title}
	                                                    className="h-auto w-full object-cover"
	                                                    loading="lazy"
	                                                />
	                                            </button>
	                                        ))}
	                                    </div>
	                                ))}
	                            </div>
	                        </div>
	                    </InfiniteScroll>
	                )}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="h-[85dvh] max-h-[85dvh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-hidden p-0 sm:h-[80vh] sm:max-h-[80vh] sm:!w-[80vw] sm:!max-w-[80vw]">
                        {activeEntry && (
                            <div className="flex h-full min-h-0 flex-col md:grid md:grid-cols-[1fr_380px]">
                                <div className="relative flex-1 min-h-0 bg-black md:h-full md:flex-none">
                                    <button
                                        type="button"
                                        className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                                        onClick={() => setOpen(false)}
                                        title="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>

                                    <img
                                        src={activeEntry.image.url}
                                        alt={activeEntry.item.title}
                                        className="h-full w-full object-contain"
                                    />

                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

                                    <div className="absolute inset-y-0 left-0 flex items-center">
                                        <button
                                            type="button"
                                            className={cn(
                                                'm-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80',
                                                !canPrev &&
                                                    'pointer-events-none opacity-30',
                                            )}
                                            onClick={() =>
                                                setActive((v) =>
                                                    Math.max(0, v - 1),
                                                )
                                            }
                                            title="Previous"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="absolute inset-y-0 right-0 flex items-center">
                                        <button
                                            type="button"
                                            className={cn(
                                                'm-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80',
                                                !canNext &&
                                                    'pointer-events-none opacity-30',
                                            )}
                                            onClick={() =>
                                                setActive((v) =>
                                                    Math.min(
                                                        flat.length - 1,
                                                        v + 1,
                                                    ),
                                                )
                                            }
                                            title="Next"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[34dvh] max-h-[34dvh] shrink-0 overflow-auto border-t p-4 md:h-auto md:max-h-none md:border-t-0 md:p-6">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-black">
                                            {activeEntry.item.title}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {activeEntry.item.created_at
                                                ? formatDate(
                                                      activeEntry.item
                                                          .created_at,
                                                  )
                                                : null}
                                        </DialogDescription>
                                    </DialogHeader>

                                    {activeEntry.item.description && (
                                        <p className="mt-4 text-sm whitespace-pre-line text-muted-foreground">
                                            {activeEntry.item.description}
                                        </p>
                                    )}

                                    <div className="mt-6">
                                        <p className="mb-2 text-xs font-black tracking-widest text-muted-foreground uppercase">
                                            More in this item
                                        </p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {activeEntry.item.images.map(
                                                (img, imageIndex) => {
                                                    const targetIndex =
                                                        flat.findIndex(
                                                            (x) =>
                                                                x.itemIndex ===
                                                                    activeEntry.itemIndex &&
                                                                x.imageIndex ===
                                                                    imageIndex,
                                                        );
                                                    return (
                                                        <button
                                                            key={img.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setActive(
                                                                    targetIndex,
                                                                )
                                                            }
                                                            className={cn(
                                                                'overflow-hidden rounded border bg-muted/10',
                                                                targetIndex ===
                                                                    active &&
                                                                    'ring-2 ring-primary',
                                                            )}
                                                            title="View"
                                                        >
                                                            <img
                                                                src={img.url}
                                                                alt="Thumbnail"
                                                                className="h-16 w-full object-cover"
                                                            />
                                                        </button>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </GuestLayout>
    );
}
