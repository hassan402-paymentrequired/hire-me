import {
    SettingsBadge,
    SettingsRow,
    settingsOutlineButtonClass,
} from '@/pages/client/settings/components/settings-field';
import { router } from '@inertiajs/react';
import { CalendarSync } from 'lucide-react';
import { useState } from 'react';

export interface GoogleCalendarStatus {
    connected: boolean;
    email: string | null;
    sync_enabled: boolean;
    last_synced_at: string | null;
    last_error: string | null;
}

export function CalendarSyncRow({
    googleCalendar,
}: {
    googleCalendar: GoogleCalendarStatus;
}) {
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    return (
        <SettingsRow
            icon={<CalendarSync className="size-5" />}
            title="Google Calendar"
            badge={
                googleCalendar.connected ? (
                    <SettingsBadge tone="success">Connected</SettingsBadge>
                ) : undefined
            }
            description={
                googleCalendar.connected
                    ? `Your bookings sync to ${googleCalendar.email ?? 'your calendar'}.`
                    : 'Add your bookings to Google Calendar automatically.'
            }
            action={
                googleCalendar.connected ? (
                    <button
                        type="button"
                        disabled={isDisconnecting}
                        onClick={() =>
                            router.post(
                                '/settings/google-calendar/disconnect',
                                {},
                                {
                                    preserveScroll: true,
                                    onStart: () => setIsDisconnecting(true),
                                    onFinish: () => setIsDisconnecting(false),
                                },
                            )
                        }
                        className={settingsOutlineButtonClass}
                    >
                        Disconnect
                    </button>
                ) : (
                    <a
                        href="/settings/google-calendar/redirect"
                        className={settingsOutlineButtonClass}
                    >
                        Connect
                    </a>
                )
            }
        >
            {googleCalendar.connected && googleCalendar.last_error && (
                <p className="mt-1.5 text-xs text-amber-700">
                    Last sync failed: {googleCalendar.last_error}
                </p>
            )}
        </SettingsRow>
    );
}
