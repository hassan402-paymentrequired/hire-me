import { cn } from '@/lib/utils';

import type { TimeSlot } from '../types';

interface SlotListProps {
    groups: { morning: TimeSlot[]; afternoon: TimeSlot[]; evening: TimeSlot[] };
    selectedSlot: string;
    onSelect: (datetime: string) => void;
    popularHours: number[];
    loading: boolean;
    emptyMessage: string | null;
}

const GROUP_LABELS = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' } as const;

/** Open times split into morning, afternoon and evening, tagging the hours customers book most. */
export function SlotList({ groups, selectedSlot, onSelect, popularHours, loading, emptyMessage }: SlotListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" aria-busy>
                {Array.from({ length: 8 }, (_, index) => (
                    <div key={index} className="h-13 animate-pulse rounded-[14px] bg-paper" />
                ))}
            </div>
        );
    }

    const isEmpty = !groups.morning.length && !groups.afternoon.length && !groups.evening.length;
    if (isEmpty) {
        return (
            <div className="rounded-[22px] bg-paper px-6 py-10 text-center">
                <p className="font-bold">No times left on this day</p>
                <p className="mt-1 text-sm text-moss">{emptyMessage || 'Try another day this week.'}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {(Object.keys(GROUP_LABELS) as (keyof typeof GROUP_LABELS)[])
                .filter((key) => groups[key].length > 0)
                .map((key) => (
                    <section key={key} className="flex flex-col gap-3">
                        <h3 className="text-[15px] font-bold text-moss">{GROUP_LABELS[key]}</h3>
                        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                            {groups[key].map((slot) => {
                                const active = slot.datetime === selectedSlot;
                                const isPopular = popularHours.includes(new Date(slot.datetime).getHours());

                                return (
                                    <button
                                        key={slot.datetime}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => onSelect(slot.datetime)}
                                        className={cn(
                                            'relative h-13 rounded-[14px] text-[15px] font-semibold hover:border-forest',
                                            active ? 'border-2 border-forest bg-mint' : 'border border-[#DDE3DE] bg-white',
                                        )}
                                    >
                                        {slot.display}
                                        {isPopular && (
                                            <span className="absolute -top-2 right-2 rounded-full bg-lime px-1.5 py-px text-[10px] font-bold text-forest">Popular</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                ))}
        </div>
    );
}
