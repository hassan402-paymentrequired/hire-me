import { AppSelect } from '@/components/ui/app-select';
import * as React from 'react';

interface SearchableSelectProps {
    label?: string | React.ReactNode;
    options: Array<{ value: string; label: string }>;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onValueChange?: (value: string) => void;
    required?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    className?: string;
    error?: string;
    emptyMessage?: string;
}

/** Kept for existing pages. New code can use AppSelect with `searchable`. */
export function SearchableSelect({ onChange, onValueChange, ...props }: SearchableSelectProps) {
    return (
        <AppSelect
            {...props}
            searchable
            onChange={(value) => {
                onChange?.(value);
                onValueChange?.(value);
            }}
        />
    );
}

export default SearchableSelect;
