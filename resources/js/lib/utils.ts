import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInHours, isPast, isToday, isTomorrow, format, parseISO } from 'date-fns';

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



// Format date nicely
export function formatDate(dateString: string | Date): string {
    if (!dateString) return 'Date TBA';

    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;

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

    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
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
        'cancelled': 'Cancelled',
        'completed': 'Completed',
        'no_show': 'No Show',
        'rescheduled': 'Rescheduled',
    };

    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
}

// Get status badge variant
export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status?.toLowerCase()) {
        case 'confirmed':
            return 'default'; // Green/Success - create custom variant if needed
        case 'pending':
            return 'secondary'; // Yellow/Warning
        case 'cancelled':
        case 'no_show':
            return 'destructive'; // Red
        case 'completed':
            return 'outline'; // Gray/Muted
        case 'rescheduled':
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
