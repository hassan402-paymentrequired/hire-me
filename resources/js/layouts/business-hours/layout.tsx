import KeenIcon from '@/components/keen-icon';
import { cn, isSameUrl } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const items = [
    { title: 'Weekly hours', href: '/business/hours', icon: 'night-day' },
    { title: 'Holidays', href: '/business/hours/holidays', icon: 'calendar' },
];

export default function BusinessHoursLayout({ children }: PropsWithChildren) {
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <main className="flex w-full flex-col gap-[22px] p-4 md:p-6">
            <header className="flex flex-wrap items-end gap-3.5">
                <div className="flex flex-[1_1_300px] flex-col gap-1">
                    <span className="text-[13px] text-muted-foreground">
                        Schedule
                    </span>
                    <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                        Business hours
                    </h1>
                    <span className="text-sm text-muted-foreground">
                        Set when clients can book you. Changes apply to new
                        bookings only.
                    </span>
                </div>

                <nav
                    aria-label="Business hours sections"
                    className="flex gap-1 rounded-xl border border-[#0E3B2E]/10 bg-card p-1 dark:border-white/10"
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
                                    'flex h-10 items-center gap-2 rounded-[9px] px-3.5 text-sm font-bold whitespace-nowrap transition-colors',
                                    isActive
                                        ? 'bg-[#0E3B2E] text-white dark:bg-[#C8F169] dark:text-[#0E3B2E]'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <KeenIcon
                                    name={item.icon}
                                    className="text-base"
                                />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            <section className="flex flex-col gap-6">{children}</section>
        </main>
    );
}
