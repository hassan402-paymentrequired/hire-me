import { Bell, Check } from 'lucide-react';

interface WaitlistCalloutProps {
    dayLabel: string;
    joined: boolean;
    joining: boolean;
    onJoin: () => void;
}

/** Offers a heads-up when a slot frees up on the chosen day. */
export function WaitlistCallout({ dayLabel, joined, joining, onJoin }: WaitlistCalloutProps) {
    return (
        <div className="flex flex-wrap items-center gap-3.5 rounded-[18px] bg-paper px-4.5 py-4">
            {joined ? <Check className="size-5 shrink-0 text-leaf" strokeWidth={2.5} /> : <Bell className="size-5 shrink-0 text-leaf" />}
            <span className="min-w-0 flex-1 text-sm text-moss">
                {joined ? (
                    <>
                        <strong className="text-ink">You’re on the waitlist for {dayLabel}.</strong> We’ll tell you if a slot opens up.
                    </>
                ) : (
                    <>
                        Can’t find a time? <strong className="text-ink">Join the waitlist</strong> and we’ll tell you if a slot opens up on {dayLabel}.
                    </>
                )}
            </span>
            {!joined && (
                <button
                    type="button"
                    onClick={onJoin}
                    disabled={joining}
                    className="h-9.5 rounded-full border border-forest bg-white px-4 text-[13px] font-bold text-forest hover:bg-mint disabled:opacity-60"
                >
                    {joining ? 'Joining…' : 'Join waitlist'}
                </button>
            )}
        </div>
    );
}
