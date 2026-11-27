import { format, isToday, isTomorrow } from 'date-fns';

export const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return [hours ? `${hours} hr` : '', rest ? `${rest} min` : ''].filter(Boolean).join(' ') || '—';
};

export const initials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();

/** "Today 5:15", "Tomorrow 9:00" or "Tue 10:30". */
export const formatNextOpening = (iso: string): string => {
    const date = new Date(iso);
    const time = format(date, 'h:mm');

    if (isToday(date)) {
        return `Today ${time}`;
    }

    return isTomorrow(date) ? `Tomorrow ${time}` : `${format(date, 'EEE')} ${time}`;
};

/** Lowercase am/pm, as in "11:30 am". */
export const formatClock = (date: Date): string => format(date, 'h:mm aaa');

/** Straight-line distance in km between two coordinates. */
export const distanceInKm = (from: { lat: number; lng: number }, to: { lat: number; lng: number }): number => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(to.lat - from.lat);
    const dLng = toRadians(to.lng - from.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;

    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Rough city drive time; roads wind ~1.3× the straight line at ~25 km/h. */
export const estimateDriveMinutes = (km: number): number => Math.max(5, Math.round(((km * 1.3) / 25) * 60));
