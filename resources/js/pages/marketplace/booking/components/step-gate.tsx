import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StepGateProps {
    enabled: boolean;
    hint?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function StepGate({ enabled, hint, children, className }: StepGateProps) {
    return (
        <div
            aria-disabled={!enabled || undefined}
            className={cn(
                'space-y-4 transition',
                !enabled && 'pointer-events-none opacity-60 select-none',
                className,
            )}
        >
            {!enabled && hint && (
                <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    {hint}
                </p>
            )}
            <div
                className={cn(!enabled && 'pointer-events-none')}
                {...(!enabled ? { inert: true } : {})}
            >
                {children}
            </div>
        </div>
    );
}
