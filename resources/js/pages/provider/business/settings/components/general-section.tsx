import KeenIcon from '@/components/keen-icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
    return (
        <div className="space-y-8">
            <div className="rounded-2xl border border-border/70 bg-linear-to-br from-card via-card to-muted/20 p-5">
                <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                        <KeenIcon name="home-2" className="text-lg" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">How your business appears</h3>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            These details shape the first impression clients get when they discover your business.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Business Name</Label>
                    <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground transition-colors group-focus-within:text-primary">
                            <KeenIcon name="home-2" className="text-base" />
                        </div>
                        <Input
                            value={data.business_name}
                            onChange={(e) => setData('business_name', e.target.value)}
                            className="h-12 pl-11"
                            placeholder="e.g. Proxideck Grooming Studio"
                        />
                    </div>
                    {errors.business_name && <p className="text-xs text-destructive">{errors.business_name}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-muted-foreground transition-colors group-focus-within:text-primary">
                            <KeenIcon name="menu" className="text-base" />
                        </div>
                        <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                            <SelectTrigger className="h-12 pl-11">
                                <SelectValue placeholder="Choose business category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Business Phone</Label>
                <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground transition-colors group-focus-within:text-primary">
                        <KeenIcon name="phone" className="text-base" />
                    </div>
                    <Input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="h-12 pl-11"
                        placeholder="+234 800 000 0000"
                    />
                </div>
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <KeenIcon name="text" className="text-sm text-primary" />
                    <Label>Description</Label>
                </div>
                <div className="overflow-hidden rounded-mdthe g border border-border/70 bg-card">
                    <Textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={6}
                        className="min-h-[150px] rounded-none border-0 bg-transparent px-4 py-4 shadow-none focus-visible:ring-0"
                        placeholder="Describe the experience, specialties, and tone clients should expect from your business."
                    />
                    <div className="border-t border-border/60 bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
                        A clear, warm description builds trust faster than a long generic one.
                    </div>
                </div>
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
        </div>
    );
}
