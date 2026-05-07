import { ShieldExclamationIcon } from '@heroicons/react/24/solid';

interface BookingBlockedBannerProps {
    reason: string;
}

export function BookingBlockedBanner({ reason }: BookingBlockedBannerProps) {
    return (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
            <div className="flex items-start gap-3">
                <ShieldExclamationIcon className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div>
                    <p className="font-semibold">Booking unavailable</p>
                    <p className="mt-1 text-sm leading-6">{reason}</p>
                </div>
            </div>
        </div>
    );
}
