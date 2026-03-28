import { cn, isSameUrl } from '@/lib/utils';
import KeenIcon from '@/components/keen-icon';
import { Link } from '@inertiajs/react';
import { ArchiveIcon, Clock } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const items = [
    { title: 'Weekly Schedule', href: '/business/hours', icon: Clock },
    { title: 'Holidays', href: '/business/hours/holidays', icon: ArchiveIcon },
];

export default function BusinessHoursLayout({ children }: PropsWithChildren) {
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <main className="flex w-full flex-col p-4 md:p-6">
            <div className="mb-6 overflow-hidden rounded-3xl border border-border/70 bg-background">
                <div className="relative px-6 py-6 md:px-8 md:py-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.06),_transparent_26%),radial-gradient(circle_at_left,_rgba(16,185,129,0.05),_transparent_24%)]" />
                    <div className="relative flex flex-col gap-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/70">
                                <KeenIcon name="electronic-clock" className="text-sm text-sky-600 dark:text-sky-300" />
                                Availability manager
                            </span>
                        </div>

                        <div className="max-w-2xl space-y-2">
                            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                                Business Hours
                            </h2>
                            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                                Set your weekly schedule, plan special holiday exceptions, and make it clear when clients can actually book you.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                    <KeenIcon name="night-day" className="text-sm text-sky-600 dark:text-sky-300" />
                                    Weekly rhythm
                                </div>
                                <p className="mt-2 text-sm text-foreground">
                                    Keep your base availability accurate across all seven days.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                    <KeenIcon name="coffee" className="text-sm text-amber-600 dark:text-amber-300" />
                                    Break coverage
                                </div>
                                <p className="mt-2 text-sm text-foreground">
                                    Block breaks so clients only see truly bookable time windows.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                    <KeenIcon name="archive" className="text-sm text-emerald-600 dark:text-emerald-300" />
                                    Holiday exceptions
                                </div>
                                <p className="mt-2 text-sm text-foreground">
                                    Override normal hours for holidays, closures, and special operating days.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border no-scrollbar">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        prefetch
                        className={cn(
                            'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-smooth',
                            isSameUrl(currentPath, item.href)
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <item.icon size={18} />
                        {item.title}
                    </Link>
                ))}
            </div>

            <section className="space-y-6">{children}</section>
        </main>
    );
}
