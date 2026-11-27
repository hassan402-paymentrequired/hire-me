import BrandMark from '@/components/brand-mark';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
    onDark?: boolean;
    className?: string;
}

/** Horizon mark + "Proxideck" wordmark lockup. */
export default function BrandLogo({ onDark = false, className }: BrandLogoProps) {
    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <BrandMark onDark={onDark} className="size-7 shrink-0" />
            <span className={cn('font-wordmark text-2xl font-[650] tracking-[-0.02em]', onDark ? 'text-white' : 'text-ink')}>Proxideck</span>
        </span>
    );
}
