import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export type EmptyStateIllustration = 'bookings' | 'favourites' | 'search' | 'wallet' | 'notifications' | 'reviews';

const ink = '#0E3B2E';

const illustrations: Record<EmptyStateIllustration, ReactNode> = {
    bookings: (
        <>
            <rect x="44" y="34" width="52" height="46" rx="9" fill="#fff" stroke={ink} strokeWidth="4" />
            <path d="M44 48H96M57 26v14M83 26v14" stroke={ink} strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="64" r="6" fill="#C8F169" stroke={ink} strokeWidth="3" />
        </>
    ),
    favourites: (
        <>
            <path
                d="M70 84s-24-14.5-29.5-29.5C37 44 44.5 34 55 34c6.3 0 11.5 3.5 15 8.6C73.5 37.5 78.7 34 85 34c10.5 0 18 10 14.5 20.5C94 69.5 70 84 70 84z"
                fill="#fff"
                stroke={ink}
                strokeWidth="4"
                strokeLinejoin="round"
            />
            <path d="M100 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#C8F169" stroke={ink} strokeWidth="2" />
        </>
    ),
    search: (
        <>
            <circle cx="64" cy="52" r="20" fill="#fff" stroke={ink} strokeWidth="4" />
            <path d="M79 67l16 16" stroke={ink} strokeWidth="6" strokeLinecap="round" />
            <path d="M56 52h16" stroke="#C8F169" strokeWidth="5" strokeLinecap="round" />
        </>
    ),
    wallet: (
        <>
            <rect x="40" y="36" width="60" height="42" rx="10" fill="#fff" stroke={ink} strokeWidth="4" />
            <path d="M40 48H100" stroke={ink} strokeWidth="4" />
            <rect x="78" y="56" width="22" height="12" rx="6" fill="#C8F169" stroke={ink} strokeWidth="3" />
        </>
    ),
    notifications: (
        <>
            <path d="M50 70c4-4 4-10 4-18a16 16 0 0132 0c0 8 0 14 4 18z" fill="#fff" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
            <path d="M64 78a6 6 0 0012 0" stroke={ink} strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 52l7 7 13-13" stroke="#1F6B43" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
    ),
    reviews: (
        <path
            d="M70 30l7.5 15.5 17 2-12.5 11.8 3.3 16.9L70 68l-15.3 8.2 3.3-16.9-12.5-11.8 17-2z"
            fill="#C8F169"
            stroke={ink}
            strokeWidth="4"
            strokeLinejoin="round"
        />
    ),
};

interface EmptyStateProps {
    illustration: EmptyStateIllustration;
    title: string;
    description: string;
    /** Buttons or links; keep it to one or two actions. */
    actions?: ReactNode;
    className?: string;
}

/** Empty screen: what will appear, why it's empty, and the next step. Sits on the logo's Horizon lines. */
export function EmptyState({ illustration, title, description, actions, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center gap-3.5 rounded-[28px] border border-line px-9 py-12 text-center font-heading', className)}>
            <svg width="140" height="120" viewBox="0 0 140 120" aria-hidden="true">
                <circle cx="70" cy="56" r="48" fill="#E6F4EC" />
                {illustrations[illustration]}
                <path d="M30 104H110" stroke={ink} strokeWidth="5" strokeLinecap="round" />
                <path d="M48 114H92" stroke="#A9C7B8" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <h2 className="mt-1.5 text-[22px] font-bold text-ink">{title}</h2>
            <p className="max-w-80 text-[15px] leading-relaxed text-moss">{description}</p>
            {actions && <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div>}
        </div>
    );
}
