/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Calendar as DateCalendar } from '@/components/ui/calendar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog';
import GuestLayout from '@/layouts/guest-layout';
import { cn, formatDate, formatTime } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import {
    AlertCircle,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import appointments from '@/routes/appointments';

interface Service {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
}

interface Provider {
    id: string;
    name: string;
    businessName: string;
    address: string;
    slug: string;
    logo: string | null;
}

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'staff';
}

interface TimeSlot {
    start: string;
    end: string;
    display: string;
    datetime: string;
}

interface ProviderSettings {
    advanceBooking: string | number; // days
    minNotice: string | number | null; // hours
    allowSameDay: boolean;
    autoConfirm?: boolean;
    max_bookings_per_week: string | number | null;
    max_bookings_per_month: string | number | null;
}

interface AppointmentPayload {
    id: string;
    start_time: string;
    end_time?: string | null;
    notes?: string | null;
    price: number;
    service_ids: string[];
    team_member_id?: string | null;
}

interface Props {
    appointment: AppointmentPayload;
    provider: Provider;
    services: Service[];
    teamMembers: TeamMember[];
    walletBalance?: number | null;
    settings?: ProviderSettings;
}

export default function EditAppointment() {
    const { props } = usePage<{
        appointment: AppointmentPayload;
        provider: Provider;
        services: Service[];
        teamMembers: TeamMember[];
        walletBalance?: number | null;
        settings?: ProviderSettings;
    }>();
    const {
        appointment,
        provider,
        services,
        teamMembers,
        walletBalance,
        settings,
    } = props;

    const [selectedDate, setSelectedDate] = useState<Date>(new Date(appointment.start_time));
    const [selectedSlot, setSelectedSlot] = useState<string>(appointment.start_time);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(appointment.service_ids || []);
    const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string>(
        appointment.team_member_id || '',
    );
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [notes, setNotes] = useState<string>(appointment.notes || '');
    const [loading, setLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState<string | null>(null);
    const [insufficientBalanceDialogOpen, setInsufficientBalanceDialogOpen] = useState(false);
    const [paymentConfirmDialogOpen, setPaymentConfirmDialogOpen] = useState(false);
    const [pendingShortfall, setPendingShortfall] = useState<number>(0);

    const providerSettings: ProviderSettings = settings || {
        advanceBooking: 30,
        minNotice: null,
        allowSameDay: false,
        autoConfirm: false,
        max_bookings_per_week: null,
        max_bookings_per_month: null,
    };

    useEffect(() => {
        if (selectedDate && selectedServiceIds.length > 0) {
            fetchAvailableSlots();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, selectedServiceIds, selectedTeamMemberId]);

    const fetchAvailableSlots = async () => {
        setLoading(true);
        setApiMessage(null);
        try {
            const response = await axios.get('/appointments/slots', {
                params: {
                    provider_id: provider.id,
                    service_ids: selectedServiceIds,
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    team_member_id: selectedTeamMemberId || undefined,
                    reschedule_id: appointment.id,
                },
            });
            const slots: TimeSlot[] = response.data.slots || [];
            setAvailableSlots(slots);
            setApiMessage(response.data.message || null);

            // Ensure current slot is selected if still available
            if (appointment.start_time) {
                const existing = slots.find(
                    (slot) => slot.datetime === appointment.start_time,
                );
                if (existing) {
                    setSelectedSlot(existing.datetime);
                }
            }
        } catch (error: any) {
            console.error('Failed to fetch slots:', error);
            setAvailableSlots([]);
            const msg = error?.response?.data?.message;
            setApiMessage(
                msg ||
                    'We could not load available slots. Please check your connection and try again, or select a different date.',
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleService = (id: string) => {
        setSelectedServiceIds((prev) =>
            prev.includes(id)
                ? prev.filter((serviceId) => serviceId !== id)
                : [...prev, id],
        );
        setSelectedSlot('');
    };

    const selectedServices = services.filter((s) =>
        selectedServiceIds.includes(s.id),
    );

    const newTotalPrice = selectedServices.reduce(
        (sum, s) => sum + Number(s.price),
        0,
    );
    const originalPrice = Number(appointment.price);
    const priceDifference = newTotalPrice - originalPrice;

    const categorizedSlots = useMemo(() => {
        const categories = {
            morning: [] as TimeSlot[],
            afternoon: [] as TimeSlot[],
            evening: [] as TimeSlot[],
        };

        availableSlots.forEach((slot) => {
            const hour = parseInt(slot.start.split(':')[0], 10);
            if (hour < 12) categories.morning.push(slot);
            else if (hour < 17) categories.afternoon.push(slot);
            else categories.evening.push(slot);
        });

        return categories;
    }, [availableSlots]);

    const handleUpdate = () => {
        if (!selectedDate || !selectedSlot || selectedServiceIds.length === 0)
            return;

        // Only require extra balance if new total price is higher than original
        if (
            priceDifference > 0 &&
            walletBalance !== null &&
            walletBalance !== undefined &&
            walletBalance < priceDifference
        ) {
            setPendingShortfall(priceDifference - walletBalance);
            setInsufficientBalanceDialogOpen(true);
            return;
        }

        setPaymentConfirmDialogOpen(true);
    };

    const submitUpdate = () => {
        const payload: any = {
            service_ids: selectedServiceIds,
            start_time: selectedSlot,
            notes,
            team_member_id: selectedTeamMemberId || null,
        };

        router.put(`/appointments/${appointment.id}`, payload);
    };

    return (
        <GuestLayout>
            <Head title="Edit Appointment" />

            {/* Insufficient balance dialog */}
            <CustomAlertDialog
                open={insufficientBalanceDialogOpen}
                onOpenChange={setInsufficientBalanceDialogOpen}
                icon={<Wallet className="size-12 text-amber-500" />}
                title="Insufficient Wallet Balance"
                description={`You need ₦${pendingShortfall.toLocaleString()} more to update this appointment because the new total is higher. Would you like to top up your wallet?`}
                acceptLabel="Top Up Wallet"
                rejectLabel="Cancel"
                onAccept={() => router.visit('/wallet')}
            />

            {/* Payment confirmation dialog */}
            <CustomAlertDialog
                open={paymentConfirmDialogOpen}
                onOpenChange={setPaymentConfirmDialogOpen}
                icon={<CheckCircle2 className="size-12 text-primary" />}
                title="Confirm Changes"
                description={
                    priceDifference > 0
                        ? `Your new total will be ₦${newTotalPrice.toLocaleString()}, which is ₦${priceDifference.toLocaleString()} more than the original amount. This difference will be held securely in escrow. Continue?`
                        : priceDifference < 0
                        ? `Your new total will be ₦${newTotalPrice.toLocaleString()}, which is ₦${Math.abs(priceDifference).toLocaleString()} less than the original amount. The difference will be refunded to your wallet. Continue?`
                        : `Your total amount remains ₦${newTotalPrice.toLocaleString()}. We will update the appointment details and keep your payment held in escrow. Continue?`
                }
                acceptLabel="Save Changes"
                rejectLabel="Cancel"
                onAccept={submitUpdate}
            />

            <div className="mx-auto min-h-screen max-w-6xl bg-background pb-20">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-base font-bold tracking-tight sm:text-2xl">
                                Edit your appointment
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Adjust your services or time. Updates are only
                                allowed up to 5 hours before the original start
                                time.
                            </p>
                        </div>
                        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            <div className="mb-1 flex items-center gap-1 font-medium">
                                <AlertCircle className="h-3 w-3" />
                                Original time
                            </div>
                            <div>
                                {formatDate(appointment.start_time)} at{' '}
                                {formatTime(appointment.start_time)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
                        {/* Left Content: Calendar & Services */}
                        <div className="space-y-12 lg:col-span-2">
                            {/* Calendar & Slots Card */}
                            <div className="overflow-hidden rounded border bg-card">
                                <div className="grid grid-cols-1 sm:h-[360px] md:grid-cols-2">
                                    <div className="flex justify-center border-b p-3 md:border-b-0 md:border-r">
                                        <DateCalendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setSelectedDate(date);
                                                    setSelectedSlot('');
                                                }
                                            }}
                                            disabled={(date) => {
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                const selected = new Date(date);
                                                selected.setHours(0, 0, 0, 0);

                                                // Can't select past dates
                                                if (selected < today) return true;

                                                // Check same-day booking
                                                if (
                                                    !providerSettings.allowSameDay &&
                                                    selected.getTime() ===
                                                        today.getTime()
                                                ) {
                                                    return true;
                                                }

                                                // Check advance booking window
                                                const advanceDays =
                                                    Number(
                                                        providerSettings.advanceBooking,
                                                    ) || 30;
                                                const maxDate = new Date(today);
                                                maxDate.setDate(
                                                    maxDate.getDate() + advanceDays,
                                                );

                                                if (selected > maxDate) return true;

                                                return false;
                                            }}
                                            className="h-full w-full rounded-md"
                                        />
                                    </div>

                                    <div className="space-y-3 bg-muted/5 p-4 sm:h-full sm:w-full sm:overflow-hidden sm:overflow-y-auto">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold tracking-tighter uppercase md:text-xl">
                                                {format(
                                                    selectedDate,
                                                    'EEEE, MMM d',
                                                )}
                                            </h3>
                                        </div>

                                        {loading ? (
                                            <div className="flex h-64 items-center justify-center">
                                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                                            </div>
                                        ) : availableSlots.length === 0 ? (
                                            <div className="flex h-64 flex-col items-center justify-center px-8 text-center text-muted-foreground">
                                                <p className="py-2 text-sm font-medium">
                                                    {apiMessage ||
                                                        'No availability for this date'}
                                                </p>
                                                <p className="text-xs">
                                                    Try selecting fewer services or
                                                    picking another date.
                                                </p>
                                            </div>
                                        ) : (
                                            <ScrollArea className="h-96 pr-4">
                                                <div className="space-y-8">
                                                    {(
                                                        ['morning', 'afternoon', 'evening'] as const
                                                    ).map((cat) => {
                                                        const slots =
                                                            categorizedSlots[cat];
                                                        if (slots.length === 0)
                                                            return null;
                                                        return (
                                                            <div
                                                                key={cat}
                                                                className="space-y-4"
                                                            >
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                                                    {cat}
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                                    {slots.map(
                                                                        (slot) => (
                                                                            <Button
                                                                                key={
                                                                                    slot.datetime
                                                                                }
                                                                                size="sm"
                                                                                variant={
                                                                                    selectedSlot ===
                                                                                    slot.datetime
                                                                                        ? 'default'
                                                                                        : 'outline'
                                                                                }
                                                                                className={cn(
                                                                                    'rounded text-xs font-bold transition-all sm:text-sm',
                                                                                    selectedSlot ===
                                                                                        slot.datetime
                                                                                        ? 'scale-[1.05] border-primary'
                                                                                        : 'hover:border-primary/30 hover:bg-primary/5',
                                                                                )}
                                                                                onClick={() =>
                                                                                    setSelectedSlot(
                                                                                        slot.datetime,
                                                                                    )
                                                                                }
                                                                            >
                                                                                {
                                                                                    slot.display
                                                                                }
                                                                            </Button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ScrollArea>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Services Selection */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black tracking-tight">
                                    Update services
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {services.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => toggleService(s.id)}
                                            className={cn(
                                                'flex cursor-pointer items-start gap-2 rounded border p-2',
                                                selectedServiceIds.includes(s.id)
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border bg-card hover:border-primary/20',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'flex size-8 shrink-0 items-center justify-center rounded border-2',
                                                    selectedServiceIds.includes(
                                                        s.id,
                                                    )
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-muted bg-muted/50',
                                                )}
                                            >
                                                {selectedServiceIds.includes(
                                                    s.id,
                                                ) ? (
                                                    <Check className="size-5" />
                                                ) : (
                                                    <FileText className="size-5" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="truncate text-base capitalize">
                                                        {s.name}
                                                    </h4>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-black">
                                                        ₦
                                                        {Number(
                                                            s.price,
                                                        ).toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-muted px-2 py-1 text-[9px] font-black uppercase text-muted-foreground sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[10px]">
                                                        <Clock className="size-3" />
                                                        {s.duration} mins
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <h3 className="text-xl font-black tracking-tight">
                                    Notes for provider
                                </h3>
                                <Textarea
                                    placeholder="Update any special requests or information for the provider..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="text-sm"
                                />
                            </div>

                            {teamMembers.length > 0 && (
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight">
                                            Team member
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Optional. Leave this set to provider
                                            if you do not want a specific team
                                            member.
                                        </p>
                                    </div>
                                    <Select
                                        value={selectedTeamMemberId || 'provider'}
                                        onValueChange={(value) => {
                                            setSelectedTeamMemberId(
                                                value === 'provider' ? '' : value,
                                            );
                                            setSelectedSlot('');
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a team member (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="provider">
                                                Provider
                                            </SelectItem>
                                            {teamMembers.map((member) => (
                                                <SelectItem
                                                    key={member.id}
                                                    value={member.id}
                                                >
                                                    {member.name} ({member.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* Right Content: Summary */}
                        <div className="order-first border lg:sticky lg:top-8 lg:order-last">
                            <div className="flex flex-col overflow-hidden rounded bg-card">
                                <div className="border-b bg-muted/5 p-4">
                                    <h2 className="text-center text-xl font-black tracking-tight sm:text-left sm:text-2xl">
                                        Updated Summary
                                    </h2>
                                </div>

                                <div className="space-y-4 p-4">
                                    <div className="space-y-4 divide-y divide-dashed border-dashed border-muted">
                                        {selectedServices.map((s) => (
                                            <div
                                                key={s.id}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex flex-col items-start">
                                                    <span className="line-clamp-2 text-sm capitalize text-muted-foreground/60">
                                                        {s.name}
                                                    </span>
                                                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                                                        {s.duration} mins
                                                    </p>
                                                </div>
                                                <span className="text-sm">
                                                    ₦
                                                    {Number(
                                                        s.price,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t-2 border-dashed border-muted" />

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                <CheckCircle2 className="size-4 text-primary" />
                                                Professional
                                            </span>
                                            <span className="text-sm font-black">
                                                {provider.businessName}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                <CheckCircle2 className="size-4 text-primary" />
                                                Date
                                            </span>
                                            <span className="text-sm font-black">
                                                {format(
                                                    selectedDate,
                                                    'MMM d, yyyy',
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                <CheckCircle2 className="size-4 text-primary" />
                                                Time
                                            </span>
                                            <span className="text-sm font-black">
                                                {selectedSlot
                                                    ? format(
                                                          new Date(selectedSlot),
                                                          'h:mm a',
                                                      )
                                                    : '--:--'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t-2 border-dashed border-muted" />

                                    {/* Price difference */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                Original total
                                            </span>
                                            <span>
                                                ₦
                                                {originalPrice.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                                New total
                                            </span>
                                            <span className="font-bold text-primary">
                                                ₦
                                                {newTotalPrice.toLocaleString()}
                                            </span>
                                        </div>
                                        {priceDifference !== 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">
                                                    Difference
                                                </span>
                                                <span
                                                    className={
                                                        priceDifference > 0
                                                            ? 'font-bold text-destructive'
                                                            : 'font-bold text-green-600 dark:text-green-400'
                                                    }
                                                >
                                                    {priceDifference > 0
                                                        ? '+'
                                                        : '-'}
                                                    ₦
                                                    {Math.abs(
                                                        priceDifference,
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Wallet info */}
                                    {walletBalance !== null &&
                                        walletBalance !== undefined && (
                                            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span className="text-muted-foreground">
                                                        Wallet balance
                                                    </span>
                                                    <span className="font-bold">
                                                        ₦
                                                        {walletBalance.toLocaleString()}
                                                    </span>
                                                </div>
                                                {priceDifference > 0 &&
                                                    walletBalance <
                                                        priceDifference && (
                                                        <p className="mt-1 text-destructive">
                                                            You need an
                                                            additional ₦
                                                            {(
                                                                priceDifference -
                                                                walletBalance
                                                            ).toLocaleString()}{' '}
                                                            to cover the
                                                            increase.
                                                        </p>
                                                    )}
                                            </div>
                                        )}

                                    <Button
                                        className="w-full"
                                        disabled={
                                            !selectedSlot ||
                                            selectedServiceIds.length === 0
                                        }
                                        onClick={handleUpdate}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
