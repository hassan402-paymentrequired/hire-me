import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StepHeadingProps {
    step: number;
    title: string;
    description?: ReactNode;
    optional?: boolean;
    className?: string;
}

export function StepHeading({
    step,
    title,
    description,
    optional,
    className,
}: StepHeadingProps) {
    return (
        <div className={cn('space-y-1', className)}>
            <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Step {step}
                </span>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {title}
                </h3>
                {optional && (
                    <span className="text-xs font-normal text-muted-foreground">
                        (optional)
                    </span>
                )}
            </div>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
}
