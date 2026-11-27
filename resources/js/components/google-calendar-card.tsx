import {
    SettingsSection,
    settingsPrimaryButtonClass,
    settingsSecondaryButtonClass,
} from '@/layouts/settings/layout';
import { router } from '@inertiajs/react';
import { CalendarCheck2, CalendarX2, TriangleAlert } from 'lucide-react';

export interface GoogleCalendarData {
    connected: boolean;
    email: string | null;
    sync_enabled: boolean;
    last_synced_at: string | null;
    last_error: string | null;
}

function formatLastSynced(value: string | null): string | null {
    if (!value) {
        return null;
    }

    return new Date(value).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function GoogleCalendarCard({
    googleCalendar,
}: {
    googleCalendar: GoogleCalendarData;
}) {
    const lastSynced = formatLastSynced(googleCalendar.last_synced_at);

    const action = googleCalendar.connected ? (
        <button
            type="button"
            className={settingsSecondaryButtonClass}
            onClick={() => router.post('/settings/google-calendar/disconnect')}
        >
            Disconnect
        </button>
    ) : (
        <a
            href="/settings/google-calendar/redirect"
            className={settingsPrimaryButtonClass}
        >
            Connect Google Calendar
        </a>
    );

    return (
        <SettingsSection
            title="Calendar sync"
            description="Add booked appointments to your Google Calendar so your day stays in one place."
            action={action}
        >
            <div className="flex items-start gap-3 rounded-xl bg-muted/50 px-3.5 py-3">
                {googleCalendar.connected ? (
                    <CalendarCheck2 className="mt-0.5 size-5 shrink-0 text-[#0E3B2E] dark:text-[#C8F169]" />
                ) : (
                    <CalendarX2 className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                )}
                <div className="flex min-w-0 flex-col gap-0.5 text-[13px]">
                    {googleCalendar.connected ? (
                        <>
                            <span className="truncate font-semibold text-foreground">
                                Connected as {googleCalendar.email}
                            </span>
                            <span className="text-muted-foreground">
                                New bookings, reschedules and cancellations sync
                                to your primary calendar.
                                {lastSynced && ` Last synced ${lastSynced}.`}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="font-semibold text-foreground">
                                Not connected
                            </span>
                            <span className="text-muted-foreground">
                                Once connected, appointments booked through
                                Proxideck are added automatically.
                            </span>
                        </>
                    )}
                </div>
            </div>

            {googleCalendar.connected && googleCalendar.last_error && (
                <div className="flex items-start gap-2 rounded-xl bg-[#FFF8E6] px-3.5 py-3 text-[13px] text-[#7A5200] dark:bg-amber-500/10 dark:text-amber-200">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                    <span className="min-w-0 break-words">
                        Last sync issue: {googleCalendar.last_error}
                    </span>
                </div>
            )}
        </SettingsSection>
    );
}
