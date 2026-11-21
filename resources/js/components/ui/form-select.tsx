import { AppSelect } from '@/components/ui/app-select';

interface FormSelectProps {
    label?: string;
    options: Array<{ value: string; label: string }>;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onValueChange?: (value: string) => void;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    error?: string;
}

/** Kept for existing pages. New code can use AppSelect directly. */
export function FormSelect({ onChange, onValueChange, ...props }: FormSelectProps) {
    return (
        <AppSelect
            {...props}
            onChange={(value) => {
                onChange?.(value);
                onValueChange?.(value);
            }}
        />
    );
}
