import { Bell, Clock, Lock } from 'lucide-react';

interface BookingAssurancesProps {
    freeCancelUntil: string | null;
    isPaidUpfront: boolean;
}

/** Three reassurances under the confirm step: cancellation window, payment protection, reminders. */
export function BookingAssurances({ freeCancelUntil, isPaidUpfront }: BookingAssurancesProps) {
    const items = [
        {
            icon: Clock,
            title: freeCancelUntil ? 'Free to cancel' : 'Late to cancel',
            text: freeCancelUntil ? `until ${freeCancelUntil}` : 'A late-cancellation fee may apply',
        },
        {
            icon: Lock,
            title: isPaidUpfront ? 'Payment protected' : 'Nothing paid upfront',
            text: isPaidUpfront ? 'Released only after your visit' : 'You pay at the visit',
        },
        { icon: Bell, title: 'We’ll remind you', text: 'The day before, and 2 hrs before' },
    ];

    return (
        <div className="grid gap-2.5 sm:grid-cols-3">
            {items.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-2.5 rounded-2xl bg-paper p-3.5">
                    <Icon className="size-4.5 shrink-0 text-leaf" strokeWidth={2.2} aria-hidden />
                    <span className="text-[13px] leading-[1.45] text-moss">
                        <strong className="block text-ink">{title}</strong>
                        {text}
                    </span>
                </div>
            ))}
        </div>
    );
}
