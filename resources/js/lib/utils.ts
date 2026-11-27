import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInHours, isToday, isTomorrow, format, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function normalizePathname(url: string): string {
    const path = url.split('?')[0].split('#')[0];

    if (!path || path === '/') {
        return '/';
    }

    return path.replace(/\/+$/, '');
}

export function navPathMatches(pagePath: string, itemPath: string): boolean {
    if (pagePath === itemPath) {
        return true;
    }

    return pagePath.startsWith(`${itemPath}/`);
}

export function resolveActiveNavPath(
    pageUrl: string,
    itemHrefs: Array<NonNullable<InertiaLinkProps['href']>>,
): string | null {
    const pagePath = normalizePathname(pageUrl);

    let bestPath: string | null = null;
    let bestLength = -1;

    for (const href of itemHrefs) {
        const itemPath = normalizePathname(resolveUrl(href));

        if (!navPathMatches(pagePath, itemPath)) {
            continue;
        }

        if (itemPath.length > bestLength) {
            bestPath = itemPath;
            bestLength = itemPath.length;
        }
    }

    return bestPath;
}

// Format date nicely
export function formatDate(dateString: string | Date): string {
    if (!dateString) return 'Date TBA';

    const parsedDate =
        typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const fallbackDate =
        typeof dateString === 'string' ? new Date(dateString) : dateString;
    const date = isValid(parsedDate) ? parsedDate : fallbackDate;

    if (!isValid(date)) {
        return typeof dateString === 'string' ? dateString : 'Date TBA';
    }

    if (isToday(date)) {
        return "Today";
    } else if (isTomorrow(date)) {
        return "Tomorrow";
    } else {
        return format(date, 'MMM d, yyyy');
    }
}

// Format time
export function formatTime(dateString: string | Date): string {
    if (!dateString) return 'Time TBA';

    const parsedDate =
        typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const fallbackDate =
        typeof dateString === 'string' ? new Date(dateString) : dateString;
    const date = isValid(parsedDate) ? parsedDate : fallbackDate;

    if (!isValid(date)) {
        return typeof dateString === 'string' ? dateString : 'Time TBA';
    }

    return format(date, 'h:mm a');
}

// Format price
export function formatPrice(price: number | string | null | undefined): string {
    if (!price && price !== 0) return '₦0';

    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    // Format with currency (change currency symbol as needed)
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numPrice);
}

// Format status text
export function formatStatus(status: string): string {
    if (!status) return 'Unknown';
    const statusMap: Record<string, string> = {
        'confirmed': 'Confirmed',
        'pending': 'Pending',
        'pending_completion': 'Pending Completion',
        'cancelled': 'Cancelled',
        'completed': 'Completed',
        'no_show': 'No Show',
        'rescheduled': 'Rescheduled',
    };

    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
}

// Get status badge variant
export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "primary" {
    switch (status?.toLowerCase()) {
        case 'confirmed':
            return 'default'; // Green/Success - create custom variant if needed
        case 'pending':
            return 'secondary'; // Yellow/Warning
        case 'cancelled':
        case 'no_show':
            return 'destructive'; 
        case 'completed':
            return 'primary'; 
        case 'rescheduled':
        case 'pending_completion':
            return 'secondary';
        default:
            return 'default';
    }
}

// Check if appointment is upcoming (within next 24 hours)
export function isUpcoming(dateString: string | Date): boolean {
    if (!dateString) return false;

    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const now = new Date();
    const hoursDiff = differenceInHours(date, now);

    return hoursDiff > 0 && hoursDiff <= 24;
}

/** Resolve a path or partial URL to a full string suitable for sharing or copying. */
export function toAbsoluteUrl(url: string): string {
    const trimmed = url.trim();

    if (!trimmed) {
        return '';
    }

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    if (typeof window === 'undefined') {
        return trimmed;
    }

    return new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, window.location.origin).href;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
    const value = text.trim();

    if (!value) {
        return false;
    }

    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(value);

            return true;
        } catch {
            // Fall through to execCommand.
        }
    }

    try {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);

        return copied;
    } catch {
        return false;
    }
}
