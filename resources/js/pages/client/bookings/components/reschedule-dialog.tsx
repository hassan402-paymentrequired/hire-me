import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { SlotList } from '@/pages/marketplace/booking/components/slot-list';
import { WeekStrip } from '@/pages/marketplace/booking/components/week-strip';
import { useBookingSlots } from '@/pages/marketplace/booking/hooks/use-booking-slots';
import { useWeekAvailability } from '@/pages/marketplace/booking/hooks/use-booking-availability';
import type { ProviderSettings, ServiceTeamMembers } from '@/pages/marketplace/booking/types';
import { router } from '@inertiajs/react';
import { addDays, format, isSameDay, startOfDay, startOfWeek } from 'date-fns';
import { gooeyToast as toast } from 'goey-toast';
import { useEffect, useMemo, useState } from 'react';

interface RescheduleDialogProps {
    bookingId: string;
    providerId: string;
    serviceIds: string[];
    serviceTeamMembers: ServiceTeamMembers;
    teamMemberId?: string | null;
    notes: string | null;
    currentStartTime: string;
    settings: ProviderSettings;
    closedDays: string[];
    popularHours: number[];
    onClose: () => void;
}

export function RescheduleDialog({
    bookingId,
    providerId,
    serviceIds,
    serviceTeamMembers,
    teamMemberId,
    notes,
    currentStartTime,
    settings,
    closedDays,
    popularHours,
    onClose,
}: RescheduleDialogProps) {
    const today = startOfDay(new Date());
    const maxBookingDate = addDays(today, Number(settings.advanceBooking) || 30);

    const isDayUnavailable = (date: Date) =>
        date < today ||
        date > maxBookingDate ||
        (!settings.allowSameDay && isSameDay(date, today)) ||
        closedDays.includes(format(date, 'EEEE'));

    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const current = startOfDay(new Date(currentStartTime));
        if (!isDayUnavailable(current)) {
            return current;
        }
        for (let offset = settings.allowSameDay ? 0 : 1; offset < 60; offset++) {
            const day = addDays(today, offset);
            if (!closedDays.includes(format(day, 'EEEE'))) {
                return day;
            }
        }

        return today;
    });
    const [weekStart, setWeekStart] = useState(() => startOfWeek(selectedDate, { weekStartsOn: 1 }));
    const [selectedSlot, setSelectedSlot] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const slots = useBookingSlots({
        providerId,
        serviceIds,
        selectedDate,
        serviceTeamMembers,
        rescheduleId: bookingId,
    });
    const weekAvailability = useWeekAvailability({
        providerId,
        serviceIds,
        serviceTeamMembers,
        weekStart,
        rescheduleId: bookingId,
    });

    useEffect(() => {
        if (!slots.loading && slots.availableSlots.length > 0 && !selectedSlot) {
            const existing = slots.availableSlots.find((slot) => slot.datetime === currentStartTime);
            if (existing) {
                setSelectedSlot(existing.datetime);
            }
        }
    }, [slots.loading, slots.availableSlots, currentStartTime, selectedSlot]);

    const resolveTeamMemberId = useMemo(() => {
        const pros = serviceIds.map((id) => serviceTeamMembers[id] || '');
        const shared = pros.every((pro) => pro === pros[0]) ? pros[0] || '' : '';

        return shared || teamMemberId || null;
    }, [serviceIds, serviceTeamMembers, teamMemberId]);

    const submit = () => {
        if (!selectedSlot) {
            toast.error('Please select a time slot.');

            return;
        }

        setSubmitting(true);
        router.put(
            `/appointments/${bookingId}`,
            {
                service_ids: serviceIds,
                start_time: selectedSlot,
                notes: notes ?? '',
                team_member_id: resolveTeamMemberId,
            },
            {
                preserveScroll: true,
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    toast.error(typeof first === 'string' ? first : 'We could not reschedule this booking. Please try another time.');
                },
                onSuccess: onClose,
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto rounded-3xl p-7 font-heading sm:max-w-lg">
                <DialogTitle className="text-[22px] font-bold">Pick a new time</DialogTitle>
                <DialogDescription className="text-[15px] leading-relaxed text-moss">
                    Your services, professional, and payment stay the same — only the date and time change.
                </DialogDescription>

                <div className="mt-2 flex flex-col gap-5">
                    <WeekStrip
                        compact
                        weekStart={weekStart}
                        onWeekChange={setWeekStart}
                        selectedDate={selectedDate}
                        onSelect={(date) => {
                            setSelectedDate(date);
                            setSelectedSlot('');
                        }}
                        isDisabled={isDayUnavailable}
                        maxDate={maxBookingDate}
                        availability={weekAvailability}
                    />

                    <SlotList
                        groups={slots.categorizedSlots}
                        selectedSlot={selectedSlot}
                        onSelect={setSelectedSlot}
                        popularHours={popularHours}
                        loading={slots.loading}
                        emptyMessage={slots.apiMessage}
                    />

                    <div className="flex gap-2.5 pt-1">
                        <button type="button" onClick={onClose} className="h-12 flex-1 rounded-full border border-[#DDE3DE] text-[15px] font-bold">
                            Keep current time
                        </button>
                        <button
                            type="button"
                            disabled={submitting || !selectedSlot}
                            onClick={submit}
                            className={cn(
                                'h-12 flex-1 rounded-full bg-lime text-[15px] font-bold text-forest',
                                (submitting || !selectedSlot) && 'opacity-50',
                            )}
                        >
                            {submitting ? 'Saving…' : 'Confirm new time'}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}