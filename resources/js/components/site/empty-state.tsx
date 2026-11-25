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
    /** Small caption under the actions, e.g. "My bookings". */
    contextLabel?: string;
    className?: string;
}

/** Empty screen: what will appear, why it's empty, and the next step. Sits on the logo's Horizon lines. */
export function EmptyState({ illustration, title, description, actions, contextLabel, className }: EmptyStateProps) {
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
            {contextLabel && <span className="mt-1 text-[12px] text-moss">{contextLabel}</span>}
        </div>
    );
}

const compactBookingsIllustration = (
    <svg width="56" height="56" viewBox="0 0 48 48" className="shrink-0" aria-hidden="true">
        <circle cx="24" cy="22" r="20" fill="#E6F4EC" />
        <rect x="14" y="13" width="20" height="17" rx="4" fill="#fff" stroke={ink} strokeWidth="2.5" />
        <path d="M14 19h20" stroke={ink} strokeWidth="2.5" />
        <path d="M12 40h24" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </svg>
);

const compactNotificationsIllustration = (
    <svg width="56" height="56" viewBox="0 0 48 48" className="shrink-0" aria-hidden="true">
        <circle cx="24" cy="22" r="20" fill="#E6F4EC" />
        <path
            d="M16 28c2-2 2-5 2-9a8 8 0 0116 0c0 4 0 7 2 9z"
            fill="#fff"
            stroke={ink}
            strokeWidth="2.2"
            strokeLinejoin="round"
        />
        <path d="M22 33a4 4 0 008 0" stroke={ink} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M20 24l4 4 8-8" stroke="#1F6B43" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M12 40h24" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </svg>
);

const compactSearchIllustration = (
    <svg width="56" height="56" viewBox="0 0 48 48" className="shrink-0" aria-hidden="true">
        <circle cx="24" cy="22" r="20" fill="#E6F4EC" />
        <circle cx="22" cy="20" r="9" fill="#fff" stroke={ink} strokeWidth="2.2" />
        <path d="M29 27l6 6" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        <path d="M19 20h6" stroke="#C8F169" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 40h24" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </svg>
);

const compactReviewsIllustration = (
    <svg width="56" height="56" viewBox="0 0 48 48" className="shrink-0" aria-hidden="true">
        <circle cx="24" cy="22" r="20" fill="#E6F4EC" />
        <path
            d="M24 12l3.5 7 7.5 1.1-5.4 5.2 1.3 7.5L24 29l-7.3 3.8 1.3-7.5-5.4-5.2 7.5-1.1z"
            fill="#C8F169"
            stroke={ink}
            strokeWidth="2"
            strokeLinejoin="round"
        />
        <path d="M12 40h24" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </svg>
);

const compactIllustrations = {
    bookings: compactBookingsIllustration,
    notifications: compactNotificationsIllustration,
    search: compactSearchIllustration,
    reviews: compactReviewsIllustration,
} as const;

export type EmptyStateCompactIllustration = keyof typeof compactIllustrations;

interface EmptyStateCompactProps {
    title: string;
    description: string;
    actions?: ReactNode;
    illustration?: EmptyStateCompactIllustration;
    className?: string;
}

/** Inline empty row for a filtered section that is empty while the account still has data elsewhere. */
export function EmptyStateCompact({ title, description, actions, illustration = 'bookings', className }: EmptyStateCompactProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-stretch gap-4 rounded-[22px] bg-[#F7FAF7] p-6 sm:flex-row sm:items-center sm:gap-5 sm:px-7 sm:py-6',
                className,
            )}
        >
            {compactIllustrations[illustration]}
            <div className="min-w-0 flex-1 text-left">
                <div className="text-[17px] font-bold text-ink">{title}</div>
                <p className="mt-0.5 text-[14px] leading-snug text-moss">{description}</p>
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{actions}</div>}
        </div>
    );
}

export function emptyStatePrimaryActionClassName() {
    return 'flex h-12 items-center justify-center rounded-full bg-forest px-6 text-[15px] font-bold text-white';
}

export function emptyStateCompactActionClassName() {
    return 'flex h-11 items-center justify-center rounded-full bg-forest px-5 text-[14px] font-bold text-white';
}

interface EmptyStateInsetProps {
    title: string;
    description: string;
    illustration?: EmptyStateCompactIllustration;
    className?: string;
    /** Top border when the block sits under a section heading inside a card. */
    borderTop?: boolean;
}

/** Centered empty block inside an existing card — no extra panel background. */
export function EmptyStateInset({
    title,
    description,
    illustration = 'bookings',
    className,
    borderTop = false,
}: EmptyStateInsetProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center gap-2 py-10 text-center',
                borderTop && 'border-t border-line dark:border-white/10',
                className,
            )}
        >
            {compactIllustrations[illustration]}
            <span className="text-sm font-semibold text-foreground">{title}</span>
            <span className="max-w-xs text-[13px] leading-snug text-muted-foreground">{description}</span>
        </div>
    );
}
