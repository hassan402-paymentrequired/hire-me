import { Button } from '@/components/ui/button';
import KeenIcon from '@/components/keen-icon';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Building2, ImagePlus, Trash2, Upload, X } from 'lucide-react';
import type { ChangeEvent } from 'react';

const Storage = {
    url: (path: string) => (path?.startsWith('http') ? path : `/storage/${path}`),
};

export default function AppearanceSection({
    profile,
    data,
    maxBannerImages,
    logoPreview,
    newImagePreviews,
    handleLogoChange,
    handleNewImagesChange,
    removeNewImage,
    toggleDeleteImage,
}: {
    profile: any;
    data: any;
    maxBannerImages: number;
    logoPreview: string | null;
    newImagePreviews: string[];
    handleLogoChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleNewImagesChange: (e: ChangeEvent<HTMLInputElement>) => void;
    removeNewImage: (index: number) => void;
    toggleDeleteImage: (id: string) => void;
}) {
    const businessImages = profile?.images?.filter((img: any) => !img.is_logo) ?? [];
    // console.log(businessImages)
    const keptBannerCount = businessImages.filter(
        (img: any) => !data.delete_image_ids.includes(img.id),
    ).length;
    const totalBannerImages = keptBannerCount + newImagePreviews.length;
    const totalImages = businessImages.length + newImagePreviews.length + (logoPreview ? 1 : 0);

    return (
        <div className="space-y-8">
            <section className="overflow-hidden rounded-[28px] border border-border/70 bg-linear-to-br from-card via-card to-muted/25">
                <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="p-6 sm:p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                                <KeenIcon name="picture" className="text-lg" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    Brand presentation
                                </p>
                                <h3 className="text-xl font-semibold text-foreground">
                                    Make your business look intentional
                                </h3>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Logo
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {logoPreview ? 'Ready' : 'Missing'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Banner Images
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {totalBannerImages}/{maxBannerImages}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Assets
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-foreground">
                                    {totalImages}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 max-w-xl text-sm leading-6 text-muted-foreground">
                            This page is for the visual assets tied directly to your business profile. Keep the logo clean, and use a few strong banner images that represent your storefront, workspace, or service atmosphere.
                        </div>
                    </div>

                    <div className="border-t border-border/70 bg-muted/20 p-6 sm:p-8 lg:border-t-0 lg:border-l">
                        <div className="mb-4 flex items-center gap-2">
                            <KeenIcon name="home-2" className="text-base text-primary" />
                            <Label className="text-base font-semibold">Business Logo</Label>
                        </div>

                        <div className="relative overflow-hidden rounded-[24px] border border-border/70 bg-background">
                            <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-primary/8 to-transparent" />
                            <div className="relative px-6 py-6">
                                <div className="overflow-hidden rounded-[20px] border border-border/80 bg-muted">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            className="h-48 w-full object-cover"
                                            alt="Logo"
                                        />
                                    ) : (
                                        <div className="flex h-48 w-full items-center justify-center">
                                            <Building2 className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                <p className="mt-5 text-base font-semibold text-foreground text-center">
                                    {logoPreview ? 'Your current logo is ready' : 'Upload a logo that clients can remember'}
                                </p>
                                <p className="mt-2 text-center text-sm text-muted-foreground">
                                    Square logos work best across cards, profile headers, and booking surfaces.
                                </p>

                                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                                    <Button type="button" size="sm" className="rounded-full px-4" asChild>
                                        <label className="cursor-pointer">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload logo
                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                        </label>
                                    </Button>
                                    <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs text-muted-foreground">
                                        Max 2MB
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <KeenIcon name="picture" className="text-base text-primary" />
                            <Label className="text-lg font-semibold">Business Banner Images</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Add the supporting images used on your public business profile. This is separate from the provider gallery module.
                        </p>
                    </div>
                    <div className="rounded-full border border-border/70 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
                        {totalBannerImages} of {maxBannerImages} banner image{maxBannerImages === 1 ? '' : 's'} used
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="group relative flex min-h-[220px] cursor-pointer flex-col justify-between overflow-hidden rounded-[24px] border border-dashed border-border bg-linear-to-br from-muted/25 via-card to-muted/10 p-5 transition-all hover:border-primary/35">
                        <div className="absolute -top-10 -right-6 h-28 w-28 rounded-full bg-primary/7 blur-2xl transition-transform duration-300 group-hover:scale-110" />
                        <div className="relative flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                            <ImagePlus className="h-5 w-5" />
                        </div>
                        <div className="relative">
                            <p className="text-base font-semibold text-foreground">Add banner images</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Upload the images that help your business page feel complete and trustworthy at first glance.
                            </p>
                            <div className="mt-4 inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs text-muted-foreground">
                                {maxBannerImages} max, logo excluded
                            </div>
                        </div>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleNewImagesChange} />
                    </label>

                    {businessImages.map((img: any) => (
                        <div
                            key={img.id}
                            className={cn(
                                'group relative min-h-[220px] overflow-hidden rounded-[24px] border transition-all',
                                data.delete_image_ids.includes(img.id)
                                    ? 'border-destructive/40 opacity-60 ring-2 ring-destructive/20'
                                    : 'border-border/70 hover:border-primary/25',
                            )}
                        >
                            <img src={Storage.url(img.path)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" alt="Business" />
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                            <button
                                type="button"
                                onClick={() => toggleDeleteImage(img.id)}
                                className={cn(
                                    'absolute top-3 right-3 rounded-full p-2 text-white transition-colors',
                                    data.delete_image_ids.includes(img.id)
                                        ? 'bg-primary'
                                        : 'bg-black/50 hover:bg-destructive',
                                )}
                            >
                                {data.delete_image_ids.includes(img.id) ? <X className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                            {data.delete_image_ids.includes(img.id) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                    <span className="rounded-full bg-destructive px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-white uppercase">
                                        Marked for deletion
                                    </span>
                                </div>
                            )}

                            <div className="absolute right-4 bottom-4 left-4">
                                <div className="inline-flex rounded-full bg-white/14 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                                    Profile banner
                                </div>
                            </div>
                        </div>
                    ))}

                    {newImagePreviews.map((preview, idx) => (
                        <div key={idx} className="group relative min-h-[220px] overflow-hidden rounded-[24px] border border-primary/25">
                            <img src={preview} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" alt="New" />
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                            <button
                                type="button"
                                onClick={() => removeNewImage(idx)}
                                className="absolute top-3 right-3 rounded-full bg-black/55 p-2 text-white hover:bg-black/80"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <div className="absolute top-3 left-3">
                                <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-white uppercase">
                                    New
                                </span>
                            </div>
                            <div className="absolute right-4 bottom-4 left-4 text-sm font-medium text-white">
                                Ready to upload
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                    Keep this lean. These are your storefront assets, not your portfolio gallery.
                </div>
            </section>
        </div>
    );
}
