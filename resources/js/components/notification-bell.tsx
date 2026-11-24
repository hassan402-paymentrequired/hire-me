import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { cn, formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/site/empty-state';
import notificationPreferences from '@/routes/notification-preferences';
import notifications from '@/routes/notifications';
import { Link, router } from '@inertiajs/react';
import { Bell, Check, Clock, type LucideIcon, Star, Wallet, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const NOTIFICATIONS_POLL_INTERVAL_MS = 60_000;

interface NotificationItem {
    id: string;
    type: string;
    data: { title?: string; message?: string; action_url?: string };
    read_at: string | null;
    created_at: string;
}

interface NotificationsResponse {
    data: { data: NotificationItem[] };
    unread_count: number;
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

async function fetchNotifications(): Promise<NotificationsResponse> {
    const res = await fetch('/notifications?per_page=15', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
}

async function markAsRead(id: string): Promise<void> {
    router.post(notifications.read(id).url, {}, {
        preserveScroll: true,
    });
}

async function markAllAsRead(): Promise<void> {
    router.post(notifications.readAll().url, {}, {
        preserveScroll: true,
    });
}

const groupLabel = (createdAt: string): string =>
    new Date(createdAt).toDateString() === new Date().toDateString() ? 'Today' : 'Earlier';

/** Pick an icon and colour from the notification class name. */
function notificationKind(type: string): { icon: LucideIcon; className: string } {
    if (/Cancel/i.test(type)) return { icon: X, className: 'bg-[#FFF1F0] text-[#B42318]' };
    if (/Confirmed|Booked/i.test(type)) return { icon: Check, className: 'bg-lime text-forest' };
    if (/Completed|Awaiting/i.test(type)) return { icon: Star, className: 'bg-[#FFF4D6] text-[#7A5200]' };
    if (/Balance|Refund|Wallet/i.test(type)) return { icon: Wallet, className: 'bg-mint text-leaf' };
    if (/Recurring|Updated|Urgent|Delayed/i.test(type)) return { icon: Clock, className: 'bg-mint text-forest' };

    return { icon: Bell, className: 'bg-mint text-forest' };
}

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchNotifications();
            setNotifications(data.data.data);
            setUnreadCount(data.unread_count);
        } catch {
            setError('Could not load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!open) return;
        const t = setInterval(load, NOTIFICATIONS_POLL_INTERVAL_MS);
        return () => clearInterval(t);
    }, [open, load]);

    const handleMarkAsRead = useCallback(async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? { ...n, read_at: new Date().toISOString() }
                        : n,
                ),
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch {
            // ignore
        }
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({
                    ...n,
                    read_at: n.read_at ?? new Date().toISOString(),
                })),
            );
            setUnreadCount(0);
        } catch {
            // ignore
        }
    }, []);

    const visible = filter === 'unread' ? notifications.filter((n) => !n.read_at) : notifications;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} new` : 'Notifications'}
                className="relative grid size-11 place-items-center rounded-full border border-[#DDE3DE] bg-transparent transition hover:bg-black/5"
            >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 size-2.5 rounded-full border-2 border-white bg-[#E5484D]" />
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-[26rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-line p-0 font-heading text-ink shadow-[0_24px_60px_rgba(19,32,27,0.16)]"
            >
                <div className="flex flex-col gap-3.5 px-5.5 pt-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Notifications</h2>
                        <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                            className="text-sm font-bold text-forest disabled:text-sage"
                        >
                            Mark all as read
                        </button>
                    </div>
                    <div role="tablist" aria-label="Filter notifications" className="flex gap-1 border-b border-line">
                        {(['all', 'unread'] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                role="tab"
                                aria-selected={filter === tab}
                                onClick={() => setFilter(tab)}
                                className={cn(
                                    '-mb-px flex h-10 items-center gap-1.5 border-b-2 px-3 text-sm capitalize',
                                    filter === tab ? 'border-forest font-bold' : 'border-transparent text-moss',
                                )}
                            >
                                {tab}
                                {tab === 'unread' && unreadCount > 0 && (
                                    <span className="rounded-full bg-lime px-1.5 text-xs font-bold text-forest">{unreadCount}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && notifications.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Spinner className="size-6" />
                    </div>
                ) : error ? (
                    <p className="px-6 py-10 text-center text-sm text-moss">{error}</p>
                ) : visible.length === 0 ? (
                    <EmptyState
                        illustration="notifications"
                        title="You're all caught up"
                        description="Booking confirmations, reminders and refunds will appear here."
                        className="border-0 px-6 py-9"
                    />
                ) : (
                    <ScrollArea className="max-h-[470px]">
                        <ul className="p-2">
                            {visible.map((n, index) => {
                                const group = groupLabel(n.created_at);
                                const showGroup = index === 0 || groupLabel(visible[index - 1].created_at) !== group;
                                const isUnread = !n.read_at;
                                const kind = notificationKind(n.type);
                                const content = (
                                    <span className={cn('flex gap-3 rounded-2xl px-3.5 py-3 text-left hover:bg-paper', isUnread && 'bg-[#F3FAF5]')}>
                                        <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', kind.className)}>
                                            <kind.icon className="size-4.5" />
                                        </span>
                                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <span className={cn('text-[15px]', isUnread ? 'font-bold' : 'font-semibold')}>
                                                {n.data?.title || 'Notification'}
                                            </span>
                                            {n.data?.message && <span className="line-clamp-2 text-sm leading-snug text-moss">{n.data.message}</span>}
                                            <span className="mt-0.5 text-xs text-moss">{formatDate(n.created_at)}</span>
                                        </span>
                                        {isUnread && <span aria-label="Unread" className="mt-1.5 size-2.5 shrink-0 rounded-full bg-leaf" />}
                                    </span>
                                );
                                const markRead = () => isUnread && handleMarkAsRead(n.id);

                                return (
                                    <li key={n.id}>
                                        {showGroup && <div className="px-3.5 pt-3 pb-1.5 text-xs font-bold text-moss">{group}</div>}
                                        {n.data?.action_url ? (
                                            <Link
                                                href={n.data.action_url}
                                                className="block"
                                                onClick={() => {
                                                    setOpen(false);
                                                    markRead();
                                                }}
                                            >
                                                {content}
                                            </Link>
                                        ) : (
                                            <button type="button" className="block w-full" onClick={markRead}>
                                                {content}
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </ScrollArea>
                )}

                <div className="flex items-center justify-between border-t border-line px-5.5 py-3.5">
                    <span className="text-sm text-moss">{unreadCount > 0 ? `${unreadCount} unread` : 'Nothing new'}</span>
                    <Link href={notificationPreferences.edit()} onClick={() => setOpen(false)} className="text-sm font-bold text-forest">
                        Notification settings
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
