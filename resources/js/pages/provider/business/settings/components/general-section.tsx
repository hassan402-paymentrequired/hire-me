import { FormSelect } from '@/components/ui/form-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input
                        value={data.business_name}
                        onChange={(e) => setData('business_name', e.target.value)}
                    />
                    {errors.business_name && <p className="text-xs text-destructive">{errors.business_name}</p>}
                </div>
                <div className="space-y-2">
                    <FormSelect
                        label="Category"
                        options={categories}
                        value={data.category}
                        onChange={(value) => setData('category', value)}
                    />
                    {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Business Phone</Label>
                <Input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={5}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
        </div>
    );
}
