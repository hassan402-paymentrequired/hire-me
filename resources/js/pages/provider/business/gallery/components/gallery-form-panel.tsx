import KeenIcon from '@/components/keen-icon';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

const inputClass =
    'h-12 w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-3.5 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15';

export interface GalleryFormData {
    title: string;
    description: string;
    images: File[];
}

export default function GalleryFormPanel({
    data,
    setData,
    errors,
    processing,
    previewUrls,
    onSubmit,
    onClose,
    onAddFiles,
}: {
    data: GalleryFormData;
    setData: <K extends keyof GalleryFormData>(
        key: K,
        value: GalleryFormData[K],
    ) => void;
    errors: Partial<Record<keyof GalleryFormData, string>>;
    processing: boolean;
    previewUrls: string[];
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    onAddFiles: (files: FileList | File[] | null) => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        titleRef.current?.focus();
    }, []);

    return (
        <aside
            aria-label="New gallery album"
            className="flex w-full shrink-0 flex-col rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] lg:sticky lg:top-4 lg:w-[420px] dark:border-white/10"
        >
            <div className="flex items-center justify-between gap-3 border-b border-[#0E3B2E]/[0.08] px-7 py-5 dark:border-white/10">
                <h2 className="font-[Sora] text-xl font-semibold text-foreground">
                    New album
                </h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground hover:bg-muted/70"
                >
                    <KeenIcon name="cross" className="text-sm" />
                </button>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col">
                <div className="flex flex-col gap-4 px-7 py-6">
                    <label className="flex flex-col gap-2">
                        <span className="text-[15px] font-bold text-foreground">
                            Album title
                        </span>
                        <input
                            ref={titleRef}
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Bridal braids"
                            className={cn(inputClass, 'h-14 text-base')}
                        />
                        {errors.title && (
                            <span className="text-xs font-bold text-destructive">
                                {errors.title}
                            </span>
                        )}
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-[15px] font-bold text-foreground">
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
                            onAddFiles(e.dataTransfer.files);
                        }}
                        className={cn(
                            'flex flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed p-[22px] text-center transition-colors',
                            isDragging
                                ? 'border-[#0E3B2E] bg-[#E6F4EC] dark:border-[#C8F169] dark:bg-[#0E3B2E]'
                                : 'border-[#0E3B2E]/25 bg-muted/40 dark:border-white/20',
                        )}
                    >
                        <span className="flex size-11 items-center justify-center rounded-xl bg-[#C8F169] text-[#0E3B2E]">
                            <KeenIcon name="picture" className="text-[22px]" />
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
                            onAddFiles(e.target.files);
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
                                                    (_, idx) => idx !== index,
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

                <div className="mt-auto border-t border-[#0E3B2E]/[0.08] px-7 pt-4 pb-7 dark:border-white/10">
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
        </aside>
    );
}