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
import { Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const NOTIFICATIONS_POLL_INTERVAL_MS = 60_000;

function getCsrfToken(): string | null {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

interface NotificationItem {
    id: string;
    type: string;
    data: { title?: string; message?: string; action_url?: string };
    read_at: string | null;
    created_at: string;
}

interface NotificationsResponse {
    data: {
        data: NotificationItem[];
        unread_count: number;
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
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
    const token = getCsrfToken();
    await fetch(`/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(token && { 'X-XSRF-TOKEN': token }),
            ...(token && { 'X-CSRF-TOKEN': token }),
        },
        body: JSON.stringify({}),
    });
}

async function markAllAsRead(): Promise<void> {
    const token = getCsrfToken();
    await fetch('/notifications/read-all', {
        method: 'POST',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(token && { 'X-XSRF-TOKEN': token }),
            ...(token && { 'X-CSRF-TOKEN': token }),
        },
        body: JSON.stringify({}),
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
            const { data } = await fetchNotifications();
            setNotifications(data.data);
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
                                variant="outline"
                                size="icon"
                                className="relative rounded-full shadow-none"
                            >
                                <Bell className="size-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </Button>
                        </TooltipTrigger>
                    </DropdownMenuTrigger>
                    <TooltipContent>
                        <p>Notifications</p>
                    </TooltipContent>
                    <DropdownMenuContent align="end" className="w-80 p-0">
                        <div className="flex items-center justify-between border-b px-3 py-2">
                            <span className="font-medium">Notifications</span>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={handleMarkAllAsRead}
                                >
                                    Mark all read
                                </Button>
                            )}
                        </div>
                        {loading && notifications.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <Spinner className="size-6" />
                            </div>
                        ) : error ? (
                            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                {error}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                No notifications yet
                            </div>
                        ) : (
                            <ScrollArea className="h-[280px]">
                                <ul className="py-1">
                                    {notifications.map((n) => {
                                        const data = n.data || {};
                                        const title =
                                            data.title || 'Notification';
                                        const message = data.message || '';
                                        const actionUrl = data.action_url;
                                        const isUnread = !n.read_at;
                                        return (
                                            <li
                                                key={n.id}
                                                className="border-b last:border-0"
                                            >
                                                {actionUrl ? (
                                                    <Link
                                                        href={actionUrl}
                                                        className="block px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                                                        onClick={() => {
                                                            setOpen(false);
                                                            if (isUnread)
                                                                handleMarkAsRead(
                                                                    n.id,
                                                                );
                                                        }}
                                                    >
                                                        <div
                                                            className={
                                                                isUnread
                                                                    ? 'font-medium'
                                                                    : 'text-muted-foreground'
                                                            }
                                                        >
                                                            {title}
                                                        </div>
                                                        {message && (
                                                            <div className="mt-0.5 truncate text-xs text-muted-foreground">
                                                                {message}
                                                            </div>
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="block w-full px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                                                        onClick={() => {
                                                            if (isUnread)
                                                                handleMarkAsRead(
                                                                    n.id,
                                                                );
                                                        }}
                                                    >
                                                        <div
                                                            className={
                                                                isUnread
                                                                    ? 'font-medium'
                                                                    : 'text-muted-foreground'
                                                            }
                                                        >
                                                            {title}
                                                        </div>
                                                        {message && (
                                                            <div className="mt-0.5 truncate text-xs text-muted-foreground">
                                                                {message}
                                                            </div>
                                                        )}
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
