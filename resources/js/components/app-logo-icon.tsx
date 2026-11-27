import BrandMark from '@/components/brand-mark';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({ className }: { className?: string }) {
    return (
        <>
            <BrandMark className={cn('size-9 dark:hidden', className)} />
            <BrandMark onDark className={cn('hidden size-9 dark:block', className)} />
        </>
    );
}
