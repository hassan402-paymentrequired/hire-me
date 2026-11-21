import KeenIcon from '@/components/keen-icon';
import { cn, isSameUrl } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const items = [
    { title: 'General', href: '/business/settings', icon: 'element-8' },
    {
        title: 'Booking rules',
        href: '/business/settings/advanced',
        icon: 'setting',
    },
];

export default function BusinessSettingsLayout({
    children,
}: PropsWithChildren) {
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
                    Business settings
                </h1>
                <span className="text-sm text-muted-foreground">
                    How your business appears to clients and how bookings work.
                </span>
            </header>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <nav
                    aria-label="Settings sections"
                    className="no-scrollbar flex gap-1 overflow-x-auto lg:sticky lg:top-4 lg:w-[220px] lg:shrink-0 lg:flex-col"
                >
                    {items.map((item) => {
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

                <section className="flex min-w-0 flex-1 flex-col gap-4">
                    {children}
                </section>
            </div>
        </main>
    );
}
