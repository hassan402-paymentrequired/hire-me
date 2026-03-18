import { cn } from '@/lib/utils';
import { useId } from 'react';

type Size = 'sm' | 'md' | 'lg';
type Tone = 'default' | 'onDark';

export default function VerifiedProviderBadge({
    className,
    size = 'sm',
    tone = 'default',
}: {
    className?: string;
    size?: Size;
    tone?: Tone;
}) {
    const uid = useId();
    const rimId = `vp_rim_${uid}`;
    const edgeId = `vp_edge_${uid}`;
    const innerId = `vp_inner_${uid}`;
    const shineId = `vp_shine_${uid}`;

    const dims =
        size === 'lg'
            ? 'h-9 w-9'
            : size === 'md'
              ? 'h-7 w-7'
              : 'h-5.5 w-5.5';

    return (
        <span
            className={cn(
                'relative inline-flex items-center justify-center select-none',
                // Keep it crisp and “collectible”.
                tone === 'onDark'
                    ? 'drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]'
                    : 'drop-shadow-[0_6px_14px_rgba(0,0,0,0.10)]',
                dims,
                className,
            )}
            title="Verified provider"
            aria-label="Verified provider"
        >
            <svg
                viewBox="0 0 64 64"
                className="h-full w-full"
                aria-hidden="true"
                focusable="false"
            >
                <defs>
                    <linearGradient id={rimId} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#34D399" />
                        <stop offset="0.55" stopColor="#10B981" />
                        <stop offset="1" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id={edgeId} x1="0" y1="1" x2="1" y2="0">
                        <stop offset="0" stopColor="#F59E0B" stopOpacity="0.85" />
                        <stop offset="1" stopColor="#FDE68A" stopOpacity="0.85" />
                    </linearGradient>
                    <radialGradient id={innerId} cx="30%" cy="25%" r="75%">
                        <stop offset="0" stopColor="#0B2F26" stopOpacity="0.75" />
                        <stop offset="0.55" stopColor="#06211B" stopOpacity="0.95" />
                        <stop offset="1" stopColor="#041813" stopOpacity="1" />
                    </radialGradient>
                    <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                        <stop offset="0.45" stopColor="#FFFFFF" stopOpacity={tone === 'onDark' ? 0.22 : 0.14} />
                        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Ribbons */}
                <path
                    d="M22 40l-7 20 8-4 6 4 0-20z"
                    fill="#0F172A"
                    opacity={tone === 'onDark' ? 0.55 : 0.25}
                />
                <path
                    d="M42 40l7 20-8-4-6 4 0-20z"
                    fill="#0F172A"
                    opacity={tone === 'onDark' ? 0.55 : 0.25}
                />

                {/* Outer medal */}
                <circle cx="32" cy="30" r="21" fill={`url(#${rimId})`} />
                <circle
                    cx="32"
                    cy="30"
                    r="19"
                    fill="none"
                    stroke={`url(#${edgeId})`}
                    strokeWidth="2"
                    opacity={tone === 'onDark' ? 0.95 : 0.7}
                />

                {/* Inner plate */}
                <circle cx="32" cy="30" r="15.5" fill={`url(#${innerId})`} />

                {/* Tiny notches around the rim */}
                <circle
                    cx="32"
                    cy="30"
                    r="17.3"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                    strokeDasharray="1.2 3.6"
                    opacity={tone === 'onDark' ? 0.14 : 0.10}
                />

                {/* Shine */}
                <path
                    d="M16 24c7-10 22-13 34-7"
                    fill="none"
                    stroke={`url(#${shineId})`}
                    strokeWidth="6"
                    strokeLinecap="round"
                />

                {/* Center check */}
                <path
                    d="M26 31.5l4 4.2L40.5 25.8"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}
