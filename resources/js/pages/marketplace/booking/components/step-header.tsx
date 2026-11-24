import { cn } from '@/lib/utils';
import { Check, ChevronLeft, X } from 'lucide-react';

export interface BookingStep {
    key: string;
    label: string;
}

interface StepHeaderProps {
    steps: BookingStep[];
    /** Key of the current step, or null once every step is done. */
    current: string | null;
    onBack: () => void;
    onClose: () => void;
    onStepClick?: (key: string) => void;
}

/** Focused booking header: back, numbered step pills (earlier steps are clickable), close. */
export function StepHeader({ steps, current, onBack, onClose, onStepClick }: StepHeaderProps) {
    const currentIndex = current === null ? steps.length : steps.findIndex((step) => step.key === current);

    return (
        <header className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 pt-5 pb-3 sm:px-6">
            <button type="button" onClick={onBack} aria-label="Back" className="grid size-11 shrink-0 place-items-center rounded-full border border-[#DDE3DE] hover:bg-paper">
                <ChevronLeft className="size-4.5" />
            </button>
            <ol aria-label="Booking steps" className="flex items-center gap-1 rounded-full bg-[#F2F5F2] p-1.5">
                {steps.map((step, index) => {
                    const isDone = index < currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <li key={step.key}>
                            <button
                                type="button"
                                disabled={!isDone || !onStepClick}
                                onClick={() => onStepClick?.(step.key)}
                                aria-current={isCurrent ? 'step' : undefined}
                                className={cn(
                                    'flex items-center gap-2 rounded-full py-2 pr-2 pl-2 text-sm sm:pr-4',
                                    isCurrent && 'bg-white font-bold text-ink shadow-[0_1px_3px_rgba(19,32,27,0.12)]',
                                    isDone && 'font-semibold text-ink hover:bg-white/60',
                                    !isDone && !isCurrent && 'font-semibold text-[#99A58D]',
                                )}
                            >
                                <span
                                    className={cn(
                                        'grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold',
                                        isDone && 'bg-forest text-lime',
                                        isCurrent && 'bg-lime text-forest',
                                        !isDone && !isCurrent && 'bg-line text-[#99A58D]',
                                    )}
                                >
                                    {isDone ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
                                </span>
                                <span className={cn(!isCurrent && 'hidden sm:inline')}>{step.label}</span>
                            </button>
                        </li>
                    );
                })}
            </ol>
            <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-full border border-[#DDE3DE] hover:bg-paper">
                <X className="size-4.5" />
            </button>
        </header>
    );
}
