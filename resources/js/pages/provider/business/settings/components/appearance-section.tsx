import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Building2, Trash2, Upload, X } from 'lucide-react';
import type { ChangeEvent } from 'react';

const Storage = {
    url: (path: string) => (path.startsWith('http') ? path : `/storage/${path}`),
};

export default function AppearanceSection({
    profile,
    data,
    logoPreview,
    newImagePreviews,
    handleLogoChange,
    handleNewImagesChange,
    removeNewImage,
    toggleDeleteImage,
}: {
    profile: any;
    data: any;
    logoPreview: string | null;
    newImagePreviews: string[];
    handleLogoChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleNewImagesChange: (e: ChangeEvent<HTMLInputElement>) => void;
    removeNewImage: (index: number) => void;
    toggleDeleteImage: (id: string) => void;
}) {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <Label className="text-lg font-semibold">Business Logo</Label>
                <div className="flex items-center gap-6">
                    <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border-2 border-border bg-muted">
                        {logoPreview ? (
                            <img src={logoPreview} className="h-full w-full object-cover" alt="Logo" />
                        ) : (
                            <Building2 className="h-12 w-12 text-muted-foreground" />
                        )}
                        <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                            <Upload className="h-6 w-6 text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                        </label>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Change Logo</p>
                        <p className="mb-3 text-xs text-muted-foreground">Recommended: Square image, max 2MB.</p>
                        <Button type="button" variant="outline" size="sm" asChild>
                            <label className="cursor-pointer">
                                Choose File
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                            </label>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 border-t border-border pt-6">
                <Label className="text-lg font-semibold">Business Images</Label>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {profile?.images?.filter((img: any) => !img.is_logo).map((img: any) => (
                        <div
                            key={img.id}
                            className={`relative h-32 overflow-hidden rounded-lg border-2 transition-all ${data.delete_image_ids.includes(img.id) ? 'opacity-50 ring-2 ring-destructive' : 'border-border'}`}
                        >
                            <img src={Storage.url(img.path)} className="h-full w-full object-cover" alt="Business" />
                            <button
                                type="button"
                                onClick={() => toggleDeleteImage(img.id)}
                                className={`absolute top-2 right-2 rounded-full p-1.5 transition-colors ${data.delete_image_ids.includes(img.id) ? 'bg-primary text-white' : 'bg-destructive/80 text-white hover:bg-destructive'}`}
                            >
                                {data.delete_image_ids.includes(img.id) ? <X className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                            {data.delete_image_ids.includes(img.id) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <span className="rounded bg-destructive px-2 py-0.5 text-[10px] font-bold text-white">DELETING</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {newImagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative h-32 overflow-hidden rounded-lg border-2 border-primary/30">
                            <img src={preview} className="h-full w-full object-cover" alt="New" />
                            <button
                                type="button"
                                onClick={() => removeNewImage(idx)}
                                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <div className="absolute top-2 left-2">
                                <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>
                            </div>
                        </div>
                    ))}

                    <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:bg-muted/50">
                        <Upload className="mb-1 h-8 w-8 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Add Images</span>
                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleNewImagesChange} />
                    </label>
                </div>
                <p className="text-xs text-muted-foreground">You can upload multiple images. Max 5MB each.</p>
            </div>
        </div>
    );
}
