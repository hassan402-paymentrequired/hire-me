import { cn } from '@/lib/utils';

export default function KeenIcon({
    name,
    className,
}: {
    name: string;
    className?: string;
}) {
    return <i aria-hidden="true" className={cn('ki-outline', `ki-${name}`, className)} />;
}
