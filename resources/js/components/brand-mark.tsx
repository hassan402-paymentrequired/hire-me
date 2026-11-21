interface BrandMarkProps {
    className?: string;
    onDark?: boolean;
}

export default function BrandMark({
    className,
    onDark = false,
}: BrandMarkProps) {
    const colors = onDark
        ? { main: '#C8F169', dot: '#0E3B2E', soft: '#4F7A66' }
        : { main: '#0E3B2E', dot: '#C8F169', soft: '#A9C7B8' };

    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
            className={className}
        >
            <rect
                x="8"
                y="9"
                width="48"
                height="12"
                rx="6"
                fill={colors.soft}
            />
            <rect
                x="8"
                y="26"
                width="48"
                height="12"
                rx="6"
                fill={colors.main}
            />
            <circle cx="48" cy="32" r="3" fill={colors.dot} />
            <rect
                x="8"
                y="43"
                width="30"
                height="12"
                rx="6"
                fill={colors.soft}
            />
        </svg>
    );
}
