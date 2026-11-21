/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils';

export default function AppLogoIcon({ className, ...props }: any) {
    return (
        <>
            <img
                {...props}
                src="/brand/logo/proxideck-logo-primary.svg"
                alt="Proxideck"
                className={cn('size-9 dark:hidden', className)}
            />
            <img
                {...props}
                src="/brand/logo/proxideck-logo-reversed.svg"
                alt="Proxideck"
                className={cn('hidden size-9 dark:block', className)}
            />
        </>
    );
}
