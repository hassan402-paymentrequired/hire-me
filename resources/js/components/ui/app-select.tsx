import KeenIcon from '@/components/keen-icon';
import { cn } from '@/lib/utils';
import { Popover } from 'radix-ui';
import * as React from 'react';

export interface AppSelectOption {
    value: string;
    label: string;
    /** Smaller second line under the label. */
    description?: string;
    /** KeenIcons outline name, e.g. "calendar". */
    icon?: string;
    /** Options with the same group are listed under one heading. */
    group?: string;
    disabled?: boolean;
}

interface BaseProps {
    options: AppSelectOption[];
    label?: React.ReactNode;
    /** Helper text under the field. */
    hint?: React.ReactNode;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    /** Show a search box. Defaults to on when there are more than 8 options. */
    searchable?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
    /** Show a × button to clear the value. */
    clearable?: boolean;
    size?: 'sm' | 'md';
    /** Adds a hidden input so the value posts with a normal <form>. */
    name?: string;
    id?: string;
    /** Accessible name when there is no visible label. */
    ariaLabel?: string;
    className?: string;
    triggerClassName?: string;
}

interface SingleProps extends BaseProps {
    multiple?: false;
    value?: string | null;
    defaultValue?: string;
    onChange?: (value: string) => void;
}

interface MultipleProps extends BaseProps {
    multiple: true;
    value?: string[];
    defaultValue?: string[];
    onChange?: (value: string[]) => void;
    /** Most options that can be picked. */
    max?: number;
}

export type AppSelectProps = SingleProps | MultipleProps;

const normalize = (text: string) =>
    text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');

export function AppSelect(props: AppSelectProps) {
    const {
        options,
        label,
        hint,
        error,
        placeholder = 'Select…',
        required,
        disabled,
        searchPlaceholder = 'Search…',
        emptyMessage = 'No matches found',
        clearable,
        size = 'md',
        name,
        className,
        triggerClassName,
        ariaLabel,
    } = props;

    const generatedId = React.useId();
    const id = props.id ?? generatedId;
    const listId = `${id}-list`;
    const searchable = props.searchable ?? options.length > 8;

    // Controlled or uncontrolled value, kept as an array internally.
    const [internal, setInternal] = React.useState<string[]>(() => {
        const initial = props.defaultValue;

        return Array.isArray(initial) ? initial : initial ? [initial] : [];
    });
    const isControlled = props.value !== undefined;
    const selected: string[] = isControlled ? (Array.isArray(props.value) ? props.value : props.value ? [props.value] : []) : internal;

    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [activeIndex, setActiveIndex] = React.useState(0);
    const listRef = React.useRef<HTMLDivElement>(null);
    const searchRef = React.useRef<HTMLInputElement>(null);

    const filtered = React.useMemo(() => {
        const term = normalize(query.trim());

        return term ? options.filter((option) => normalize(`${option.label} ${option.description ?? ''}`).includes(term)) : options;
    }, [options, query]);

    const selectable = filtered.filter((option) => !option.disabled);
    const selectedOptions = options.filter((option) => selected.includes(option.value));
    const atMax = props.multiple && props.max !== undefined && selected.length >= props.max;

    const commit = (next: string[]) => {
        if (!isControlled) {
            setInternal(next);
        }

        if (props.multiple) {
            props.onChange?.(next);
        } else {
            props.onChange?.(next[0] ?? '');
        }
    };

    const choose = (option: AppSelectOption) => {
        if (option.disabled) {
            return;
        }

        if (props.multiple) {
            const isSelected = selected.includes(option.value);

            if (!isSelected && atMax) {
                return;
            }

            commit(isSelected ? selected.filter((value) => value !== option.value) : [...selected, option.value]);
            return;
        }

        commit([option.value]);
        setOpen(false);
    };

    const handleOpenChange = (next: boolean) => {
        setOpen(next);

        if (next) {
            setQuery('');
            const currentIndex = selectable.findIndex((option) => selected.includes(option.value));
            setActiveIndex(Math.max(currentIndex, 0));
        }
    };

    // Keep the highlighted option in view.
    React.useEffect(() => {
        if (!open) {
            return;
        }

        const active = selectable[activeIndex];
        const node = active ? listRef.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(active.value)}"]`) : null;
        node?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, open, selectable]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, selectable.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === 'Home') {
            event.preventDefault();
            setActiveIndex(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            setActiveIndex(selectable.length - 1);
        } else if (event.key === 'Enter' && selectable[activeIndex]) {
            event.preventDefault();
            choose(selectable[activeIndex]);
        }
    };

    const groups = React.useMemo(() => {
        const map = new Map<string, AppSelectOption[]>();

        filtered.forEach((option) => {
            const key = option.group ?? '';
            map.set(key, [...(map.get(key) ?? []), option]);
        });

        return Array.from(map.entries());
    }, [filtered]);

    const triggerText = props.multiple ? null : selectedOptions[0]?.label;
    const activeOption = selectable[activeIndex];
    const optionId = (value: string) => `${id}-opt-${value.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {label && (
                <label htmlFor={id} className={cn('text-[13px] font-bold', error ? 'text-destructive' : 'text-foreground')}>
                    {label}
                    {required && <span className="ml-0.5 text-destructive">*</span>}
                </label>
            )}

            <Popover.Root open={open} onOpenChange={handleOpenChange}>
                <Popover.Trigger asChild disabled={disabled}>
                    <button
                        id={id}
                        type="button"
                        role="combobox"
                        aria-label={ariaLabel}
                        aria-expanded={open}
                        aria-controls={listId}
                        aria-haspopup="listbox"
                        aria-invalid={Boolean(error)}
                        aria-required={required}
                        onKeyDown={(event) => {
                            if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
                                event.preventDefault();
                                handleOpenChange(true);
                            }
                        }}
                        className={cn(
                            'group flex w-full items-center gap-2 rounded-xl border bg-card px-3.5 text-left text-sm text-foreground transition-colors outline-none',
                            'focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 disabled:cursor-not-allowed disabled:opacity-60',
                            size === 'sm' ? 'min-h-10' : 'min-h-12',
                            props.multiple && selectedOptions.length ? 'py-1.5' : '',
                            error
                                ? 'border-destructive'
                                : open
                                  ? 'border-[#0E3B2E] dark:border-[#C8F169]'
                                  : 'border-[#0E3B2E]/15 hover:border-[#0E3B2E]/30 dark:border-white/15 dark:hover:border-white/30',
                            triggerClassName,
                        )}
                    >
                        {!props.multiple && selectedOptions[0]?.icon && (
                            <KeenIcon name={selectedOptions[0].icon} className="text-base text-[#0E3B2E] dark:text-[#C8F169]" />
                        )}

                        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                            {props.multiple && selectedOptions.length > 0 ? (
                                selectedOptions.map((option) => (
                                    <span
                                        key={option.value}
                                        className="inline-flex items-center gap-1 rounded-full bg-[#E6F4EC] py-0.5 pr-1 pl-2.5 text-xs font-bold text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]"
                                    >
                                        {option.label}
                                        <span
                                            role="button"
                                            tabIndex={-1}
                                            aria-label={`Remove ${option.label}`}
                                            onPointerDown={(event) => event.stopPropagation()}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                commit(selected.filter((value) => value !== option.value));
                                            }}
                                            className="flex size-5 items-center justify-center rounded-full hover:bg-[#0E3B2E]/10 dark:hover:bg-white/10"
                                        >
                                            <KeenIcon name="cross" className="text-[10px]" />
                                        </span>
                                    </span>
                                ))
                            ) : (
                                <span className={cn('truncate', !triggerText && 'text-muted-foreground')}>{triggerText ?? placeholder}</span>
                            )}
                        </span>

                        {clearable && selected.length > 0 && !disabled && (
                            <span
                                role="button"
                                tabIndex={-1}
                                aria-label="Clear selection"
                                onPointerDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    commit([]);
                                }}
                                className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <KeenIcon name="cross" className="text-xs" />
                            </span>
                        )}
                        <KeenIcon name="down" className={cn('text-sm text-muted-foreground transition-transform', open && 'rotate-180')} />
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        align="start"
                        sideOffset={6}
                        collisionPadding={12}
                        onOpenAutoFocus={(event) => {
                            event.preventDefault();
                            (searchable ? searchRef.current : listRef.current)?.focus();
                        }}
                        className={cn(
                            'z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] overflow-hidden rounded-2xl border border-[#0E3B2E]/10 bg-popover p-1.5 text-popover-foreground shadow-[0_20px_50px_rgba(14,59,46,0.18)] dark:border-white/10',
                            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                        )}
                    >
                        {searchable && (
                            <div className="mb-1.5 flex h-10 items-center gap-2 rounded-[10px] bg-muted px-3 text-muted-foreground">
                                <KeenIcon name="magnifier" className="text-sm" />
                                <input
                                    ref={searchRef}
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value);
                                        setActiveIndex(0);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder={searchPlaceholder}
                                    aria-label={searchPlaceholder}
                                    aria-controls={listId}
                                    aria-activedescendant={activeOption ? optionId(activeOption.value) : undefined}
                                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                />
                            </div>
                        )}

                        <div
                            ref={listRef}
                            id={listId}
                            role="listbox"
                            aria-multiselectable={props.multiple || undefined}
                            tabIndex={searchable ? -1 : 0}
                            onKeyDown={handleKeyDown}
                            aria-activedescendant={!searchable && activeOption ? optionId(activeOption.value) : undefined}
                            className="max-h-[280px] overflow-y-auto outline-none"
                        >
                            {filtered.length === 0 && (
                                <div className="flex flex-col items-center gap-1.5 px-3 py-6 text-center text-sm text-muted-foreground">
                                    <KeenIcon name="magnifier" className="text-xl opacity-60" />
                                    {emptyMessage}
                                </div>
                            )}

                            {groups.map(([group, groupOptions]) => (
                                <div key={group || 'default'} role={group ? 'group' : undefined} aria-label={group || undefined}>
                                    {group && <div className="px-2.5 pt-2 pb-1 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase">{group}</div>}
                                    {groupOptions.map((option) => {
                                        const isSelected = selected.includes(option.value);
                                        const isActive = activeOption?.value === option.value;
                                        const isBlocked = option.disabled || (!isSelected && atMax);

                                        return (
                                            <div
                                                key={option.value}
                                                id={optionId(option.value)}
                                                data-value={option.value}
                                                role="option"
                                                aria-selected={isSelected}
                                                aria-disabled={isBlocked || undefined}
                                                onPointerMove={() => {
                                                    const index = selectable.findIndex((item) => item.value === option.value);
                                                    if (index !== -1 && index !== activeIndex) {
                                                        setActiveIndex(index);
                                                    }
                                                }}
                                                onClick={() => !isBlocked && choose(option)}
                                                className={cn(
                                                    'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-sm select-none',
                                                    isActive && !isBlocked && 'bg-muted',
                                                    isSelected && 'font-semibold',
                                                    isBlocked && 'cursor-not-allowed opacity-50',
                                                )}
                                            >
                                                {props.multiple && (
                                                    <span
                                                        className={cn(
                                                            'flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px]',
                                                            isSelected
                                                                ? 'border-[#0E3B2E] bg-[#0E3B2E] text-[#C8F169] dark:border-[#C8F169] dark:bg-[#C8F169] dark:text-[#0E3B2E]'
                                                                : 'border-[#A9C7B8]',
                                                        )}
                                                    >
                                                        {isSelected && <KeenIcon name="check" className="text-[10px]" />}
                                                    </span>
                                                )}
                                                {option.icon && (
                                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                                        <KeenIcon name={option.icon} className="text-base" />
                                                    </span>
                                                )}
                                                <span className="flex min-w-0 flex-1 flex-col">
                                                    <span className="truncate text-foreground">{option.label}</span>
                                                    {option.description && <span className="truncate text-xs font-normal text-muted-foreground">{option.description}</span>}
                                                </span>
                                                {!props.multiple && isSelected && <KeenIcon name="check" className="text-sm text-[#0E3B2E] dark:text-[#C8F169]" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {props.multiple && selected.length > 0 && (
                            <div className="mt-1.5 flex items-center justify-between border-t border-[#0E3B2E]/[0.08] px-2 pt-2 pb-0.5 text-xs dark:border-white/10">
                                <span className="text-muted-foreground">
                                    {selected.length} selected{props.max ? ` of ${props.max}` : ''}
                                </span>
                                <button type="button" onClick={() => commit([])} className="font-bold text-[#0E3B2E] dark:text-[#C8F169]">
                                    Clear all
                                </button>
                            </div>
                        )}
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>

            {name && (props.multiple ? selected.map((value) => <input key={value} type="hidden" name={`${name}[]`} value={value} />) : <input type="hidden" name={name} value={selected[0] ?? ''} />)}

            {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
    );
}

export default AppSelect;
