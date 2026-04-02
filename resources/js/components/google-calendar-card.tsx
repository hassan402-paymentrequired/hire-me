import KeenIcon from '@/components/keen-icon';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

interface GoogleCalendarData {
    connected: boolean;
    email: string | null;
    sync_enabled: boolean;
    last_synced_at: string | null;
    last_error: string | null;
}

export default function GoogleCalendarCard({
    googleCalendar,
}: {
    googleCalendar: GoogleCalendarData;
}) {
    return (
        <div className="space-y-4 rounded-3xl border border-border/70 bg-card p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        <KeenIcon name="book-square" className="text-sm" />
                        Google Calendar
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">
                            Calendar sync
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Add booked appointments to your Google Calendar automatically so your day stays in sync.
                        </p>
                    </div>
                </div>

                {googleCalendar.connected ? (
                    <Button
                        variant="outline"
                        onClick={() =>
                            router.post('/settings/google-calendar/disconnect')
                        }
                    >
                        Disconnect
                    </Button>
                ) : (
                    <Button
                        onClick={() => {
                            window.location.href = '/settings/google-calendar/redirect';
                        }}
                    >
                        Connect Google Calendar
                    </Button>
                )}
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                {googleCalendar.connected ? (
                    <div className="space-y-2 text-sm">
                        <p className="font-medium text-foreground">
                            Connected as {googleCalendar.email}
                        </p>
                        <p className="text-muted-foreground">
                            New bookings, reschedules, and cancellations will sync to your primary Google Calendar.
                        </p>
                        {googleCalendar.last_error && (
                            <p className="text-xs text-amber-600">
                                Last sync issue: {googleCalendar.last_error}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Not connected yet. Once connected, appointments you book through proxideck will be pushed to Google Calendar automatically.
                    </p>
                )}
            </div>
        </div>
    );
}
