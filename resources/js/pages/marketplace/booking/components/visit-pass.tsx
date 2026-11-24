import { formatNaira } from '@/components/site/provider-card';
import { format } from 'date-fns';

import { formatClock, formatDuration, initials } from '../format';

export interface VisitSegment {
    id: string;
    name: string;
    proName: string;
    start: Date;
    duration: number;
    price: number;
}

interface VisitPassProps {
    businessName: string;
    start: Date;
    end: Date;
    segments: VisitSegment[];
    onChangeTime: () => void;
    onEditServices: () => void;
}

/** Ticket-style summary: date stub on the left, a timeline of who does what on the right. */
export function VisitPass({ businessName, start, end, segments, onChangeTime, onEditServices }: VisitPassProps) {
    const totalMinutes = segments.reduce((sum, segment) => sum + segment.duration, 0);

    return (
        <section aria-label="Your visit" className="relative flex overflow-hidden rounded-[26px] bg-forest text-white">
            <div className="flex w-[118px] shrink-0 flex-col justify-between gap-3 bg-lime p-4 text-forest sm:w-[170px] sm:p-5.5">
                <span className="text-xs font-bold">{format(start, 'EEE · MMM').toUpperCase()}</span>
                <span className="text-[56px] leading-[0.8] font-bold tracking-[-0.05em] sm:text-[80px]">{format(start, 'd')}</span>
                <span className="text-[13px] font-bold sm:text-sm">
                    {formatClock(start)} – {formatClock(end)}
                </span>
                <button type="button" onClick={onChangeTime} className="self-start rounded-full bg-forest/12 px-3 py-1.5 text-xs font-bold hover:bg-forest/20">
                    Change time
                </button>
            </div>
            <div aria-hidden className="relative w-0 border-l-2 border-dashed border-white/28">
                <span className="absolute -top-3.25 -left-3.5 size-6.5 rounded-full bg-white" />
                <span className="absolute -bottom-3.25 -left-3.5 size-6.5 rounded-full bg-white" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-5 sm:px-6.5 sm:py-5.5">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[13px] font-bold text-lime">
                        {businessName} · {formatDuration(totalMinutes)}
                    </span>
                    <button type="button" onClick={onEditServices} className="text-[13px] font-bold text-[#C9E2D3] hover:text-white">
                        Edit services
                    </button>
                </div>
                {segments.map((segment) => (
                    <div key={segment.id} className="grid min-h-13 grid-cols-[50px_18px_1fr] items-center gap-2.5 sm:grid-cols-[58px_18px_1fr_auto]">
                        <span className="text-sm font-bold tabular-nums">{format(segment.start, 'h:mm')}</span>
                        <span className="relative flex h-full justify-center">
                            <span className="absolute inset-y-0 w-0.5 bg-lime/25" />
                            <span className="relative mt-4.5 size-3 rounded-full border-3 border-forest bg-lime" />
                        </span>
                        <span className="flex min-w-0 items-center gap-2.5">
                            <span className="grid size-7.5 shrink-0 place-items-center rounded-full bg-lime/16 text-[11px] font-bold text-lime">{initials(segment.proName)}</span>
                            <span className="flex min-w-0 flex-col">
                                <span className="truncate text-[15px] font-bold capitalize">{segment.name}</span>
                                <span className="text-xs text-sage">
                                    with {segment.proName} · {formatDuration(segment.duration)}
                                    <span className="sm:hidden"> · {formatNaira(segment.price)}</span>
                                </span>
                            </span>
                        </span>
                        <span className="hidden text-[15px] font-bold sm:block">{formatNaira(segment.price)}</span>
                    </div>
                ))}
                <div className="grid grid-cols-[50px_18px_1fr] items-center gap-2.5 text-[13px] text-sage sm:grid-cols-[58px_18px_1fr]">
                    <span className="font-bold tabular-nums">{format(end, 'h:mm')}</span>
                    <span className="flex justify-center">
                        <span className="size-2.5 rounded-full border-2 border-lime" />
                    </span>
                    <span>All done</span>
                </div>
            </div>
        </section>
    );
}
