import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, formatDate } from '@/lib/utils';
import notifications from '@/routes/notifications';
import { Link, router } from '@inertiajs/react';
import { Bell } from 'lucide-react';
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
    data: NotificationItem[];
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

export function NotificationBell() {
    const [open, setOpen] = useState(false);
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

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    'relative h-10 w-10 rounded-2xl border border-border/70 bg-background shadow-none transition-all hover:bg-muted/60',
                                    unreadCount > 0 && 'border-primary/30 bg-primary/5 text-primary',
                                )}
                            >
                                <Bell className={cn('size-4', unreadCount > 0 && 'fill-current/10')} />
                                {unreadCount > 0 ? (
                                    <>
                                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-primary px-1 text-[10px] font-semibold text-primary-foreground shadow-sm">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                        <span className="absolute inset-0 rounded-2xl ring-1 ring-primary/20" />
                                    </>
                                ) : (
                                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-muted-foreground/20" />
                                )}
                            </Button>
                        </TooltipTrigger>
                    </DropdownMenuTrigger>
                    <TooltipContent>
                        <p>Notifications</p>
                    </TooltipContent>

                    <DropdownMenuContent
                        align="end"
                        className="w-[26rem] rounded-3xl border border-border/70 p-0 font-heading shadow-none"
                    >
                        <div className="border-b border-border/70 bg-muted/30 px-4 py-3">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 bg-background text-foreground">
                                        <Bell className="size-4" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Notifications</p>
                                        <p className="text-xs text-muted-foreground">
                                            {unreadCount > 0
                                                ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}`
                                                : 'You are all caught up'}
                                        </p>
                                    </div>
                                </div>

                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 rounded-full px-3 text-xs"
                                        onClick={handleMarkAllAsRead}
                                    >
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                        </div>

                        {loading && notifications.length === 0 ? (
                            <div className="flex justify-center py-10">
                                <Spinner className="size-6" />
                            </div>
                        ) : error ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                {error}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl border border-border/70 bg-muted/30 text-muted-foreground">
                                    <Bell className="size-5" />
                                </div>
                                <p className="text-sm font-medium text-foreground">No notifications yet</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    New booking updates and system alerts will appear here.
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[360px]">
                                <ul className="p-2">
                                    {notifications.map((n) => {
                                        const data = n.data || {};
                                        const title = data.title || 'Notification';
                                        const message = data.message || '';
                                        const actionUrl = data.action_url;
                                        const isUnread = !n.read_at;

                                        const itemContent = (
                                            <div
                                                className={cn(
                                                    'relative flex gap-3 rounded-2xl px-3 py-3 text-left transition-colors',
                                                    isUnread
                                                        ? 'bg-primary/[0.04] hover:bg-primary/[0.07]'
                                                        : 'hover:bg-muted/50',
                                                )}
                                            >
                                                <div className="pt-1">
                                                    <span
                                                        className={cn(
                                                            'block h-2.5 w-2.5 rounded-full',
                                                            isUnread ? 'bg-primary' : 'bg-muted-foreground/25',
                                                        )}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p
                                                            className={cn(
                                                                'line-clamp-1 text-sm',
                                                                isUnread
                                                                    ? 'font-semibold text-foreground'
                                                                    : 'font-medium text-foreground/85',
                                                            )}
                                                        >
                                                            {title}
                                                        </p>
                                                        <span className="shrink-0 text-[11px] text-muted-foreground">
                                                            { formatDate(n.created_at)}
                                                        </span>
                                                    </div>
                                                    {message && (
                                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                                            {message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );

                                        return (
                                            <li key={n.id} className="py-1">
                                                {actionUrl ? (
                                                    <Link
                                                        href={actionUrl}
                                                        className="block"
                                                        onClick={() => {
                                                            setOpen(false);
                                                            if (isUnread) {
                                                                handleMarkAsRead(n.id);
                                                            }
                                                        }}
                                                    >
                                                        {itemContent}
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="block w-full"
                                                        onClick={() => {
                                                            if (isUnread) {
                                                                handleMarkAsRead(n.id);
                                                            }
                                                        }}
                                                    >
                                                        {itemContent}
                                                    </button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </ScrollArea>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </Tooltip>
        </TooltipProvider>
    );
}
