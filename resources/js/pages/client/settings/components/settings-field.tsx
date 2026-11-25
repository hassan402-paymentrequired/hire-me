import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export const settingsInputClass =
    'h-[50px] w-full rounded-xl border border-[#0E3B2E]/15 bg-white px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-sage hover:border-[#0E3B2E]/30 focus:border-[#0E3B2E] focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 aria-invalid:border-red-500 disabled:cursor-not-allowed disabled:bg-paper';

/** Extra classes that make AppSelect's trigger match settingsInputClass. */
export const settingsSelectTriggerClass =
    'min-h-[50px] rounded-xl bg-white px-4 text-[15px] text-ink';

export const settingsDangerButtonClass =
    'inline-flex h-12 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-6 text-[15px] font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50';

export const settingsPrimaryButtonClass =
    'inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest px-6 text-[15px] font-bold text-white transition hover:bg-forest-deep disabled:cursor-not-allowed disabled:bg-forest/40';

export const settingsOutlineButtonClass =
    'inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-6 text-[15px] font-semibold text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50';

export function SettingsField({
    id,
    label,
    error,
    hint,
    className,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    hint?: ReactNode;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <label htmlFor={id} className="text-sm font-semibold text-ink">
                {label}
            </label>
            {children}
            {error ? (
                <p className="text-xs font-medium text-red-600">{error}</p>
            ) : (
                hint && <div className="text-xs">{hint}</div>
            )}
        </div>
    );
}

export function SettingsSwitch({
    checked,
    onChange,
    label,
    disabled,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 focus-visible:outline-none disabled:opacity-50',
                checked
                    ? 'justify-end bg-forest'
                    : 'justify-start bg-[#D5DDD8]',
            )}
        >
            <span
                className={cn(
                    'size-6 rounded-full shadow-sm',
                    checked ? 'bg-lime' : 'bg-white',
                )}
            />
        </button>
    );
}

/**
 * A settings row: title and description on the left, an action on the right.
 */
export function SettingsRow({
    icon,
    title,
    badge,
    description,
    action,
    children,
}: {
    icon?: ReactNode;
    title: string;
    badge?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3.5">
                {icon && (
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint text-forest">
                        {icon}
                    </span>
                )}
                <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[15px] font-bold">
                        {title}
                        {badge}
                    </p>
                    {description && (
                        <div className="mt-0.5 text-sm text-moss">
                            {description}
                        </div>
                    )}
                    {children}
                </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

export function SettingsBadge({
    tone = 'muted',
    children,
}: {
    tone?: 'success' | 'muted' | 'warning';
    children: ReactNode;
}) {
    return (
        <span
            className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                tone === 'success' && 'bg-mint text-leaf',
                tone === 'muted' && 'bg-paper text-moss',
                tone === 'warning' && 'bg-amber-100 text-amber-800',
            )}
        >
            {children}
        </span>
    );
}

export function SettingsSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section>
            <h2 className="text-lg font-bold">{title}</h2>
            {description && (
                <p className="mt-1 text-sm text-moss">{description}</p>
            )}
            <div className="mt-5">{children}</div>
        </section>
    );
}
