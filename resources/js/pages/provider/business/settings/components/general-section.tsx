/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppSelect } from '@/components/ui/app-select';
import { Label } from '@/components/ui/label';

const card =
    'flex flex-col gap-4 rounded-[20px] border border-[#0E3B2E]/10 bg-card p-[22px] shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10';
const inputClass =
    'h-12 w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-3.5 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15';

export default function GeneralSection({
    data,
    setData,
    errors,
    categories,
}: {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
    categories: { value: string; label: string }[];
}) {
    const descriptionLength = (data.description || '').length;

    return (
        <section className={card}>
            <div className="flex flex-col gap-0.5">
                <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                    Business details
                </h2>
                <span className="text-[13px] text-muted-foreground">
                    This is the first thing clients see when they find you.
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="business_name">Business name</Label>
                    <input
                        id="business_name"
                        value={data.business_name}
                        onChange={(e) =>
                            setData('business_name', e.target.value)
                        }
                        placeholder="e.g. Proxideck Grooming Studio"
                        className={inputClass}
                    />
                    {errors.business_name && (
                        <p className="text-xs text-destructive">
                            {errors.business_name}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Business phone</Label>
                    <input
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="+234 800 000 0000"
                        className={inputClass}
                    />
                    {errors.phone && (
                        <p className="text-xs text-destructive">
                            {errors.phone}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="category">Category</Label>
                <AppSelect
                    id="category"
                    value={data.category}
                    onChange={(value) => setData('category', value)}
                    placeholder="Choose business category"
                    options={categories}
                />
                {errors.category && (
                    <p className="text-xs text-destructive">
                        {errors.category}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    rows={5}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Describe the experience, specialties, and tone clients should expect from your business."
                    className="w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-3.5 py-3 text-sm leading-relaxed text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15"
                />
                <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                    <span>
                        A clear, warm description builds trust faster than a
                        long generic one.
                    </span>
                    <span>{descriptionLength} characters</span>
                </div>
                {errors.description && (
                    <p className="text-xs text-destructive">
                        {errors.description}
                    </p>
                )}
            </div>
        </section>
    );
}
