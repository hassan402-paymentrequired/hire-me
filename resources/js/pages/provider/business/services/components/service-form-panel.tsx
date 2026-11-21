import KeenIcon from '@/components/keen-icon';
import { AppSelect } from '@/components/ui/app-select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface ServiceFormData {
    service_category_id: string;
    name: string;
    description: string;
    price: string;
    duration_minutes: string;
    status: 'active' | 'inactive';
}

const durationPresets = [30, 45, 60, 90, 120];

export const formatDuration = (minutes: number) => {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return rest ? `${hours} hr ${rest}` : `${hours} hr`;
};

const inputClass =
    'h-12 w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15';

function FieldError({ message }: { message?: string }) {
    return message ? (
        <p className="text-xs font-bold text-destructive">{message}</p>
    ) : null;
}

export default function ServiceFormPanel({
    isEditing,
    data,
    setData,
    errors,
    processing,
    categories,
    onSubmit,
    onClose,
}: {
    isEditing: boolean;
    data: ServiceFormData;
    setData: <K extends keyof ServiceFormData>(
        key: K,
        value: ServiceFormData[K],
    ) => void;
    errors: Partial<Record<keyof ServiceFormData, string>>;
    processing: boolean;
    categories: { id: string; name: string }[];
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}) {
    const durationIsPreset = durationPresets.includes(
        Number(data.duration_minutes),
    );
    const [isCustomDuration, setIsCustomDuration] = useState(
        data.duration_minutes !== '' && !durationIsPreset,
    );


    const isAvailable = data.status === 'active';
    const chip =
        'h-[46px] rounded-xl px-4 text-[15px] font-bold transition-colors';
    const chipIdle =
        'border border-[#0E3B2E]/15 text-foreground hover:bg-muted dark:border-white/15';
    const chipActive =
        'bg-[#0E3B2E] text-white dark:bg-[#C8F169] dark:text-[#0E3B2E]';

    return (
        <aside
            aria-label={isEditing ? 'Edit service' : 'New service'}
            className="flex w-full shrink-0 flex-col rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] lg:sticky lg:top-4 lg:w-[420px] dark:border-white/10"
        >
            <div className="flex items-center justify-between gap-3 border-b border-[#0E3B2E]/[0.08] px-7 py-5 dark:border-white/10">
                <h2 className="font-[Sora] text-xl font-semibold text-foreground">
                    {isEditing ? 'Edit service' : 'New service'}
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
                <div className="flex flex-col gap-5 px-7 py-6">
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="service-name"
                            className="text-[15px] font-bold text-foreground"
                        >
                            Service name
                        </label>
                        <input
                            id="service-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Braids (medium)"
                            className={cn(inputClass, 'h-14 text-base')}
                        />
                        <FieldError message={errors.name} />
                    </div>

                    <AppSelect
                        id="service-category"
                        label={<span className="text-[15px]">Category</span>}
                        value={data.service_category_id}
                        onChange={(value) =>
                            setData('service_category_id', value)
                        }
                        options={categories.map((category) => ({
                            value: category.id,
                            label: category.name,
                        }))}
                        placeholder="Choose a category"
                        error={errors.service_category_id}
                        triggerClassName="min-h-14 text-base"
                    />

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="service-price"
                            className="text-[15px] font-bold text-foreground"
                        >
                            Price
                        </label>
                        <div className="flex h-14 items-center overflow-hidden rounded-xl border border-[#0E3B2E]/15 focus-within:ring-[3px] focus-within:ring-[#C8F169]/60 dark:border-white/15">
                            <span className="flex h-full items-center border-r border-[#0E3B2E]/10 bg-muted px-4 font-bold text-[#0E3B2E] dark:border-white/10 dark:text-[#C8F169]">
                                ₦
                            </span>
                            <input
                                id="service-price"
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={data.price}
                                onChange={(e) =>
                                    setData('price', e.target.value)
                                }
                                placeholder="15000"
                                className="h-full min-w-0 flex-1 bg-transparent px-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                        <FieldError message={errors.price} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-[15px] font-bold text-foreground">
                            Duration
                        </span>
                        <div
                            role="radiogroup"
                            aria-label="Duration"
                            className="flex flex-wrap gap-2"
                        >
                            {durationPresets.map((minutes) => {
                                const isSelected =
                                    !isCustomDuration &&
                                    Number(data.duration_minutes) === minutes;

                                return (
                                    <button
                                        key={minutes}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => {
                                            setIsCustomDuration(false);
                                            setData(
                                                'duration_minutes',
                                                String(minutes),
                                            );
                                        }}
                                        className={cn(
                                            chip,
                                            isSelected ? chipActive : chipIdle,
                                        )}
                                    >
                                        {formatDuration(minutes)}
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                role="radio"
                                aria-checked={isCustomDuration}
                                onClick={() => {
                                    setIsCustomDuration(true);
                                    if (durationIsPreset) {
                                        setData('duration_minutes', '');
                                    }
                                }}
                                className={cn(
                                    chip,
                                    isCustomDuration ? chipActive : chipIdle,
                                )}
                            >
                                Custom
                            </button>
                        </div>
                        {isCustomDuration && (
                            <div className="flex h-12 items-center overflow-hidden rounded-xl border border-[#0E3B2E]/15 focus-within:ring-[3px] focus-within:ring-[#C8F169]/60 dark:border-white/15">
                                <input
                                    type="number"
                                    min="5"
                                    autoFocus
                                    value={data.duration_minutes}
                                    onChange={(e) =>
                                        setData(
                                            'duration_minutes',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. 150"
                                    aria-label="Custom duration in minutes"
                                    className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                />
                                <span className="flex h-full items-center bg-muted px-4 text-xs font-bold text-muted-foreground">
                                    minutes
                                </span>
                            </div>
                        )}
                        <FieldError message={errors.duration_minutes} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="service-description"
                            className="text-[15px] font-bold text-foreground"
                        >
                            Description{' '}
                            <span className="font-normal text-muted-foreground">
                                (optional)
                            </span>
                        </label>
                        <textarea
                            id="service-description"
                            rows={3}
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="What’s included?"
                            className="min-h-[104px] w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15"
                        />
                        <FieldError message={errors.description} />
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/70 px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[15px] font-bold text-foreground">
                                Available for booking
                            </span>
                            <span className="text-[13px] text-muted-foreground">
                                {isAvailable
                                    ? 'Clients can see and book it'
                                    : 'Hidden from clients'}
                            </span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isAvailable}
                            aria-label="Available for booking"
                            onClick={() =>
                                setData(
                                    'status',
                                    isAvailable ? 'inactive' : 'active',
                                )
                            }
                            className={cn(
                                'flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors',
                                isAvailable
                                    ? 'justify-end bg-[#0E3B2E]'
                                    : 'justify-start bg-[#D5DDD8] dark:bg-white/15',
                            )}
                        >
                            <span
                                className={cn(
                                    'size-6 rounded-full',
                                    isAvailable ? 'bg-[#C8F169]' : 'bg-white',
                                )}
                            />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 border-t border-[#0E3B2E]/[0.08] px-7 py-5 dark:border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-14 flex-1 rounded-xl border border-[#0E3B2E]/15 text-base font-bold text-foreground hover:bg-muted dark:border-white/15"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex h-14 flex-[1.85] items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] text-base font-bold text-white hover:bg-[#0E3B2E]/90 disabled:opacity-70 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                    >
                        {processing && <Spinner />}
                        {isEditing ? 'Save changes' : 'Save service'}
                    </button>
                </div>
            </form>
        </aside>
    );
}
