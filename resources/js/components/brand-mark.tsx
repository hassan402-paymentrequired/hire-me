interface BrandMarkProps {
    className?: string;
    onDark?: boolean;
}

/** The Horizon mark: a rising half-disc over two lines. */
export default function BrandMark({ className, onDark = false }: BrandMarkProps) {
    const color = onDark ? '#FFFFFF' : '#13201B';

    return (
        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
            <path d="M4 24a20 20 0 0 1 40 0z" fill={color} />
            <path d="M10 30H38" stroke={color} strokeWidth="5" strokeLinecap="round" />
            <path d="M16 38H32" stroke={color} strokeWidth="5" strokeLinecap="round" />
        </svg>
    );
}
