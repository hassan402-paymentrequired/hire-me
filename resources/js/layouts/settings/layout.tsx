import KeenIcon from '@/components/keen-icon';
import { cn, isSameUrl } from '@/lib/utils';
import account from '@/routes/business/account';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren, type ReactNode } from 'react';

const sidebarNavItems: Array<{ title: string; href: string; icon: string }> = [
    {
        title: 'Profile',
        href: account.profile().url,
        icon: 'security-user',
    },
    {
        title: 'Password',
        href: account.password().url,
        icon: 'lock',
    },
    {
        title: 'Two-factor auth',
        href: account.twoFactor().url,
        icon: 'shield-tick',
    },
];

export const settingsInputClass =
    'h-12 w-full rounded-xl border border-[#0E3B2E]/15 bg-card px-3.5 text-sm text-foreground shadow-none outline-none focus-visible:border-[#0E3B2E]/30 focus-visible:ring-[3px] focus-visible:ring-[#C8F169]/60 dark:border-white/15';

export const settingsPrimaryButtonClass =
    'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] px-[18px] text-sm font-bold text-white transition-colors hover:bg-[#0E3B2E]/90 disabled:opacity-60 dark:bg-[#C8F169] dark:text-[#0E3B2E]';

export const settingsSecondaryButtonClass =
    'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#0E3B2E]/15 bg-card px-[18px] text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-60 dark:border-white/15';

export const settingsDangerButtonClass =
    'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#B42318] px-[18px] text-sm font-bold text-white transition-colors hover:bg-[#B42318]/90 disabled:opacity-60';

interface SettingsSectionProps {
    title: string;
    description?: string;
    action?: ReactNode;
    tone?: 'default' | 'danger';
    className?: string;
}

/**
 * Card used for each block on the provider account settings pages, matching
 * the cards on the business settings pages.
 */
export function SettingsSection({
    title,
    description,
    action,
    tone = 'default',
    className,
    children,
}: PropsWithChildren<SettingsSectionProps>) {
    return (
        <section
            className={cn(
                'flex flex-col gap-5 rounded-[20px] border bg-card p-[22px] shadow-[0_1px_2px_rgba(19,32,27,0.04)]',
                tone === 'danger'
                    ? 'border-[#B42318]/20'
                    : 'border-[#0E3B2E]/10 dark:border-white/10',
                className,
            )}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <h2
                        className={cn(
                            'font-[Sora] text-lg font-semibold',
                            tone === 'danger'
                                ? 'text-[#B42318]'
                                : 'text-foreground',
                        )}
                    >
                        {title}
                    </h2>
                    {description && (
                        <span className="text-[13px] leading-relaxed text-muted-foreground">
                            {description}
                        </span>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
            {children}
        </section>
    );
}

export default function SettingsLayout({ children }: PropsWithChildren) {
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <main className="flex w-full flex-col gap-[22px] p-4 md:p-6">
            <header className="flex flex-col gap-1">
                <span className="text-[13px] text-muted-foreground">
                    Settings
                </span>
                <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                    Account & security
                </h1>
                <span className="text-sm text-muted-foreground">
                    Your personal login details. Changes also apply when you
                    book as a client.
                </span>
            </header>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <nav
                    aria-label="Account sections"
                    className="no-scrollbar flex gap-1 overflow-x-auto lg:sticky lg:top-4 lg:w-[220px] lg:shrink-0 lg:flex-col"
                >
                    {sidebarNavItems.map((item) => {
                        const isActive = isSameUrl(currentPath, item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                aria-current={isActive ? 'page' : undefined}
                                className={cn(
                                    'flex h-11 shrink-0 items-center gap-2.5 rounded-xl px-3.5 text-sm font-bold whitespace-nowrap transition-colors',
                                    isActive
                                        ? 'bg-[#0E3B2E] text-white dark:bg-[#C8F169] dark:text-[#0E3B2E]'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <KeenIcon
                                    name={item.icon}
                                    className={cn(
                                        'text-lg',
                                        isActive &&
                                            'text-[#C8F169] dark:text-[#0E3B2E]',
                                    )}
                                />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                <section className="flex max-w-3xl min-w-0 flex-1 flex-col gap-4">
                    {children}
                </section>
            </div>
        </main>
    );
}
