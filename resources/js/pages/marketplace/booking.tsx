import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import GuestLayout from '@/layouts/guest-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';
import { addMonths, format } from 'date-fns';
import { Box, Check, CheckCircle2, Clock, Repeat, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog';
import {ShieldExclamationIcon} from "@heroicons/react/24/solid"
import appointments from '@/routes/appointments';
import VerifiedProviderBadge from '@/components/verified-provider-badge';

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
    isVerified?: boolean;
}

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'staff';
    avatar?: string | null;
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
    allowOffHoursRequests?: boolean;
    max_bookings_per_week: string | number | null;
    max_bookings_per_month: string | number | null;
    accept_online_payment?: boolean;
    accept_offline_booking?: boolean;
}

interface Props {
    provider: Provider;
    services: Service[];
    teamMembers: TeamMember[];
    walletBalance?: number | null;
    settings?: ProviderSettings;
}

export default function Booking({
    provider,
    services,
    teamMembers,
    walletBalance,
    settings,
}: Props) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [notes, setNotes] = useState('');
    const [selectedTeamMemberId, setSelectedTeamMemberId] = useState('');
    const [loading, setLoading] = useState(false);
    const [rescheduleId, setRescheduleId] = useState<string | null>(null);
    const [apiMessage, setApiMessage] = useState<string | null>(null);
    const [recurrencePattern, setRecurrencePattern] = useState<
        'weekly' | 'bi_weekly' | 'monthly' | null
    >(null);
    const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(
        null,
    );
    const [recurrenceCount, setRecurrenceCount] = useState<number | null>(null);
    const [insufficientBalanceDialogOpen, setInsufficientBalanceDialogOpen] = useState(false);
    const [paymentConfirmDialogOpen, setPaymentConfirmDialogOpen] = useState(false);
    const [pendingShortfall, setPendingShortfall] = useState<number>(0);
    const [useCustomTime, setUseCustomTime] = useState(false);
    const [customTime, setCustomTime] = useState('');
    const [paymentOption, setPaymentOption] = useState<'online' | 'offline'>('online');

    // Provider settings with defaults
    const providerSettings: ProviderSettings = settings || {
        advanceBooking: 30,
        minNotice: null,
        allowSameDay: false,
        autoConfirm: false,
        allowOffHoursRequests: false,
        max_bookings_per_week: null,
        max_bookings_per_month: null,
        accept_online_payment: true,
        accept_offline_booking: false,
    };

    const supportsOnlinePayment = providerSettings.accept_online_payment ?? true;
    const supportsOfflineBooking = providerSettings.accept_offline_booking ?? false;

    useEffect(() => {
        if (supportsOnlinePayment) {
            setPaymentOption('online');
            return;
        }

        if (supportsOfflineBooking) {
            setPaymentOption('offline');
        }
    }, [supportsOfflineBooking, supportsOnlinePayment]);

    useEffect(() => {
        // Changing the date invalidates any selected time (slot or custom).
        setSelectedSlot('');
        setCustomTime('');
        setUseCustomTime(false);
    }, [selectedDate]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const serviceId = params.get('service');
        const serviceIds = params.get('service_ids')?.split(',') || [];
        const resId = params.get('reschedule_id');

        if (resId) setRescheduleId(resId);

        if (serviceIds.length > 0) {
            setSelectedServiceIds(
                serviceIds.filter((id) => services.find((s) => s.id === id)),
            );
        } else if (serviceId && services.find((s) => s.id === serviceId)) {
            setSelectedServiceIds([serviceId]);
        } else if (services.length > 0) {
            setSelectedServiceIds([services[0].id]);
        }
    }, [services]);

    useEffect(() => {
        if (selectedDate && selectedServiceIds.length > 0) {
            fetchAvailableSlots();
        }
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
                    reschedule_id: rescheduleId,
                },
            });
            setAvailableSlots(response.data.slots || []);
            setApiMessage(response.data.message || null);
        } catch (error: any) {
            console.error('Failed to fetch slots:', error);
            setAvailableSlots([]);
            const msg = error?.response?.data?.message;
            setApiMessage(
                msg || 'We could not load available slots. Please check your connection and try again, or select a different date.',
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
        setCustomTime('');
        setUseCustomTime(false);
    };

    const selectedServices = services.filter((s) =>
        selectedServiceIds.includes(s.id),
    );
    const originalPrice = selectedServices.reduce(
        (sum, s) => sum + Number(s.price),
        0,
    );

    // Calculate discount for recurring bookings (10% discount)
    const discountPercent = recurrencePattern ? 10 : 0;
    const discountAmount = originalPrice * (discountPercent / 100);
    const totalPrice = originalPrice - discountAmount;

    const categorizedSlots = useMemo(() => {
        const categories = {
            morning: [] as TimeSlot[],
            afternoon: [] as TimeSlot[],
            evening: [] as TimeSlot[],
        };

        availableSlots.forEach((slot) => {
            const hour = parseInt(slot.start.split(':')[0]);
            if (hour < 12) categories.morning.push(slot);
            else if (hour < 17) categories.afternoon.push(slot);
            else categories.evening.push(slot);
        });

        return categories;
    }, [availableSlots]);

    const handleBooking = () => {
        if (!selectedDate || !selectedSlot || selectedServiceIds.length === 0)
            return;

        if (paymentOption === 'online') {
            if (
                walletBalance !== null &&
                walletBalance !== undefined &&
                walletBalance < totalPrice
            ) {
                setPendingShortfall(totalPrice - walletBalance);
                setInsufficientBalanceDialogOpen(true);
                return;
            }

            setPaymentConfirmDialogOpen(true);
            return;
        }

        submitBooking();
    };

    const submitBooking = () => {
        const bookingData: any = {
            provider_id: provider.id,
            service_ids: selectedServiceIds,
            start_time: selectedSlot,
            notes: notes,
            team_member_id: selectedTeamMemberId || null,
            payment_option: paymentOption,
        };

        if (recurrencePattern) {
            bookingData.recurrence_pattern = recurrencePattern;
            if (recurrenceEndDate) {
                bookingData.recurrence_end_date = format(
                    recurrenceEndDate,
                    'yyyy-MM-dd',
                );
            }
            if (recurrenceCount) {
                bookingData.recurrence_count = recurrenceCount;
            }
            bookingData.discount_percent = discountPercent;
        }

        if (rescheduleId) {
            router.put(`/appointments/${rescheduleId}`, bookingData, {
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(
                        typeof firstError === 'string'
                            ? firstError
                            : 'Please check your selection and try again.',
                    );
                },
            });
        } else {
            router.post(appointments.store().url, bookingData, {
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(
                        typeof firstError === 'string'
                            ? firstError
                            : 'Please check your selection and try again.',
                    );
                },
            });
        }
    };

    return (
        <GuestLayout>
            <Head title={`Book with ${provider.businessName}`} />

            {/* Insufficient balance dialog */}
            <CustomAlertDialog
                open={insufficientBalanceDialogOpen}
                onOpenChange={setInsufficientBalanceDialogOpen}
                icon={<Wallet className="size-12 text-amber-500" />}
                title="Insufficient Wallet Balance"
                description={`You need ₦${pendingShortfall.toLocaleString()} more to complete this booking. Payment is required upfront. Would you like to top up your wallet?`}
                acceptLabel="Top Up Wallet"
                rejectLabel="Cancel"
                onAccept={() => router.visit('/wallet')}
            />

            {/* Payment confirmation dialog */}
            <CustomAlertDialog
                open={paymentConfirmDialogOpen}
                onOpenChange={setPaymentConfirmDialogOpen}
                icon={<ShieldExclamationIcon className="size-12 text-primary" />}
                title="Confirm Payment"
                description={`You will be charged ₦${totalPrice.toLocaleString()} which will be held securely. Payment will be released to the provider only after both you and the provider confirm the service is completed. Continue?`}
                acceptLabel="Continue"
                rejectLabel="Cancel"
                onAccept={submitBooking}
            />

            <div className="mx-auto min-h-screen max-w-6xl bg-background pb-20">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    {/* Header */}
                    <div className="mb-4 flex items-center gap-4">
                        <div>
                            <h1 className="text-base font-bold tracking-tight sm:text-2xl">
                                Confirm your appointment
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Choose your preferred services and time
                            </p>
                        </div>
                    </div>

                    {/* Provider Settings Info */}
                        {(providerSettings.minNotice ||
                            !providerSettings.allowSameDay ||
                            providerSettings.allowOffHoursRequests ||
                            providerSettings.max_bookings_per_week ||
                            providerSettings.max_bookings_per_month) && (
                            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:bg-blue-950/20">
                                <p className="mb-2 text-xs font-medium text-blue-900 dark:text-blue-100">
                                    Provider Booking Policies:
                                </p>
                                <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                                {providerSettings.minNotice && (
                                    <li>
                                        • Minimum notice:{' '}
                                        {providerSettings.minNotice} hours
                                    </li>
                                )}
                                    {!providerSettings.allowSameDay && (
                                        <li>• Same-day bookings are not allowed (book tomorrow upward) </li>
                                    )}
                                    {providerSettings.allowOffHoursRequests && (
                                        <li>
                                            • Off-hours requests are allowed (requires provider confirmation)
                                        </li>
                                    )}
                                    {providerSettings.max_bookings_per_week && (
                                        <li>
                                            • Maximum{' '}
                                            {providerSettings.max_bookings_per_week}{' '}
                                            booking
                                        {Number(
                                            providerSettings.max_bookings_per_week,
                                        ) > 1
                                            ? 's'
                                            : ''}{' '}
                                        per week
                                    </li>
                                )}
                                {providerSettings.max_bookings_per_month && (
                                    <li>
                                        • Maximum{' '}
                                        {
                                            providerSettings.max_bookings_per_month
                                        }{' '}
                                        booking
                                        {Number(
                                            providerSettings.max_bookings_per_month,
                                        ) > 1
                                            ? 's'
                                            : ''}{' '}
                                        per month
                                    </li>
                                )}
                                {supportsOfflineBooking && (
                                    <li>
                                        • You can also send a booking request without paying upfront
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
                        {/* Left Content: Calendar & Services */}
                        <div className="space-y-12 lg:col-span-2">
                            {/* Calendar & Slots Card */}
                            <div className="overflow-hidden rounded border bg-card">
                                <div className="grid grid-cols-1 md:grid-cols-2 sm:h-[360px]">
                                    <div className="flex justify-center border-b p-3 md:border-r md:border-b-0">
                                        <Calendar
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
                                                if (selected < today)
                                                    return true;

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
                                                    maxDate.getDate() +
                                                        advanceDays,
                                                );

                                                if (selected > maxDate)
                                                    return true;

                                                return false;
                                            }}
                                            className="rounded-md h-full w-full"
                                        />
                                    </div>

                                    <div className="space-y-3 bg-muted/5 p-4 sm:w-full sm:h-full sm:overflow-hidden sm:overflow-y-auto">
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
                                                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                            </div>
                                        ) : availableSlots.length === 0 ? (
                                            <div className="flex h-64 flex-col items-center justify-center px-8 text-center text-muted-foreground">
                                                <p className="-3 mb-2 py-2 font-medium">
                                                    {apiMessage ||
                                                        'No availability for this date'}
                                                </p>
                                                <p className="text-xs">
                                                    Try selecting fewer services
                                                    or picking another date.
                                                </p>
                                                {providerSettings.allowOffHoursRequests && (
                                                    <div className="mt-4 w-full max-w-xs rounded-lg border bg-background p-3 text-left">
                                                        <p className="text-xs font-bold text-foreground">
                                                            Request an off-hours time
                                                        </p>
                                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                                            The provider will need to confirm. Your booking will be pending.
                                                        </p>
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <Input
                                                                type="time"
                                                                value={customTime}
                                                                onChange={(e) => {
                                                                    const t = e.target.value;
                                                                    setUseCustomTime(true);
                                                                    setCustomTime(t);
                                                                    setSelectedSlot(
                                                                        t
                                                                            ? `${format(selectedDate, 'yyyy-MM-dd')}T${t}:00`
                                                                            : '',
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <ScrollArea className="h-96 pr-4">
                                                <div className="space-y-8">
                                                    {[
                                                        'morning',
                                                        'afternoon',
                                                        'evening',
                                                    ].map((cat) => {
                                                        const slots =
                                                            categorizedSlots[
                                                                cat as keyof typeof categorizedSlots
                                                            ];
                                                        if (slots.length === 0)
                                                            return null;
                                                        return (
                                                            <div
                                                                key={cat}
                                                                className="space-y-4"
                                                            >
                                                                <h4 className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/60 uppercase">
                                                                    {cat}
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                                    {slots.map(
                                                                        (
                                                                            slot,
                                                                        ) => (
                                                                            <Button
                                                                                key={
                                                                                    slot.datetime
                                                                                }
                                                                                size={
                                                                                    'sm'
                                                                                }
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
                                                                                onClick={() => {
                                                                                    setUseCustomTime(false);
                                                                                    setCustomTime('');
                                                                                    setSelectedSlot(
                                                                                        slot.datetime,
                                                                                    );
                                                                                }}
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
                                                    {providerSettings.allowOffHoursRequests && (
                                                        <div className="rounded-lg border bg-background p-3">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="text-xs font-bold text-foreground">
                                                                        Request off-hours time
                                                                    </p>
                                                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                                                        If you can’t find a slot, request a custom time. It will be pending.
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setUseCustomTime((v) => !v);
                                                                        setSelectedSlot('');
                                                                        setCustomTime('');
                                                                    }}
                                                                >
                                                                    {useCustomTime ? 'Cancel' : 'Request'}
                                                                </Button>
                                                            </div>

                                                            {useCustomTime && (
                                                                <div className="mt-3 flex items-center gap-2">
                                                                    <Input
                                                                        type="time"
                                                                        value={customTime}
                                                                        onChange={(e) => {
                                                                            const t = e.target.value;
                                                                            setCustomTime(t);
                                                                            setSelectedSlot(
                                                                                t
                                                                                    ? `${format(selectedDate, 'yyyy-MM-dd')}T${t}:00`
                                                                                    : '',
                                                                            );
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Services Selection */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black tracking-tight">
                                    Select services you'll like to book
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {services.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => toggleService(s.id)}
                                            className={cn(
                                                'flex cursor-pointer items-start gap-2 rounded border p-2',
                                                selectedServiceIds.includes(
                                                    s.id,
                                                )
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
                                                    <Box className="size-5" />
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
                                                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[9px] font-black whitespace-nowrap text-muted-foreground uppercase sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[10px]">
                                                        <Clock className="size-3" />
                                                        {s.duration} mins
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {teamMembers.length > 0 && (
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight">
                                            Choose who attends to you
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Optional. Leave this set to provider
                                            if you do not have a preference.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedTeamMemberId('');
                                                setSelectedSlot('');
                                            }}
                                            className={cn(
                                                'rounded-xl border p-4 text-left transition-all',
                                                !selectedTeamMemberId
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                    : 'border-border hover:border-primary/30',
                                            )}
                                        >
                                            <div className="mb-3 flex items-center gap-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage
                                                        src={provider.logo || undefined}
                                                        alt={provider.name}
                                                    />
                                                    <AvatarFallback>
                                                        {provider.name
                                                            .split(' ')
                                                            .map((part) => part[0])
                                                            .join('')
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">
                                                        {provider.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Business owner
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Book directly with the provider.
                                            </p>
                                        </button>

                                        {teamMembers.map((member) => (
                                            <button
                                                key={member.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedTeamMemberId(
                                                        member.id,
                                                    );
                                                    setSelectedSlot('');
                                                }}
                                                className={cn(
                                                    'rounded-sm border p-4 text-left transition-all',
                                                    selectedTeamMemberId ===
                                                        member.id
                                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                        : 'border-border hover:border-primary/30',
                                                )}
                                            >
                                                <div className="mb-3 flex items-center gap-3">
                                                    <Avatar className={cn("h-12 w-12", selectedTeamMemberId === member.id && "border-grey-300 shadow border-2")}>
                                                        <AvatarImage
                                                            src={member.avatar || undefined}
                                                            alt={member.name}
                                                        />
                                                        <AvatarFallback >
                                                            {member.name
                                                                .split(' ')
                                                                .map((part) => part[0])
                                                                .join('')
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold capitalize">
                                                            {member.name}
                                                        </p>
                                                        <p className="text-xs capitalize text-muted-foreground">
                                                            {member.role}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {member.email}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Booking Notes */}
                            <div className="space-y-2">
                                <h3 className="text-xl font-black tracking-tight">
                                    Additional Notes
                                </h3>
                                <Textarea
                                    placeholder="Add any special requests or information for the provider..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className='text-sm'
                                />
                            </div>

                            {/* Recurring Appointment Options */}
                            <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                                <div className="flex items-center gap-2">
                                    <Repeat className="size-5 text-primary" />
                                    <h3 className="text-xl font-black tracking-tight">
                                        Make This Recurring
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Book this appointment on a regular schedule
                                    and save 10% on each booking.
                                </p>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Repeat Frequency</Label>
                                        <Select
                                            value={recurrencePattern || ''}
                                            onValueChange={(value) => {
                                                setRecurrencePattern(
                                                    value === ''
                                                        ? null
                                                        : (value as
                                                              | 'weekly'
                                                              | 'bi_weekly'
                                                              | 'monthly'),
                                                );

                                                if (!value || value == 'once') {
                                                    setRecurrenceEndDate(null);
                                                    setRecurrenceCount(null);
                                                    setRecurrencePattern(null)
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select frequency (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="once">
                                                    One-time booking
                                                </SelectItem>
                                                <SelectItem value="weekly">
                                                    Weekly
                                                </SelectItem>
                                                <SelectItem value="bi_weekly">
                                                    Bi-weekly (Every 2 weeks)
                                                </SelectItem>
                                                <SelectItem value="monthly">
                                                    Monthly
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {recurrencePattern && (
                                        <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="recurrence-end-date">
                                                    End Date (Optional)
                                                </Label>
                                                <Input
                                                    id="recurrence-end-date"
                                                    type="date"
                                                    min={format(
                                                        selectedDate,
                                                        'yyyy-MM-dd',
                                                    )}
                                                    max={format( //here
                                                        addMonths(
                                                            selectedDate,
                                                            12,
                                                        ),
                                                        'yyyy-MM-dd',
                                                    )}
                                                    value={
                                                        recurrenceEndDate
                                                            ? format(
                                                                  recurrenceEndDate,
                                                                  'yyyy-MM-dd',
                                                              )
                                                            : ''
                                                    }
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            setRecurrenceEndDate(
                                                                new Date(
                                                                    e.target.value,
                                                                ),
                                                            );
                                                        } else {
                                                            setRecurrenceEndDate(
                                                                null,
                                                            );
                                                        }
                                                    }}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Leave empty to continue
                                                    indefinitely
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="recurrence-count">
                                                    Number of Appointments
                                                    (Optional)
                                                </Label>
                                                <Input
                                                    id="recurrence-count"
                                                    type="number"
                                                    min="2"
                                                    max="52"
                                                    placeholder="e.g., 4"
                                                    value={
                                                        recurrenceCount || ''
                                                    }
                                                    onChange={(e) => {
                                                        const value = e.target
                                                            .value
                                                            ? parseInt(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null;
                                                        setRecurrenceCount(
                                                            value && value > 1
                                                                ? value
                                                                : null,
                                                        );
                                                    }}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Total number of appointments
                                                    in the series (minimum 2)
                                                </p>
                                            </div>

                                            {discountAmount > 0 && (
                                                <div className="rounded bg-green-50 p-2 text-sm dark:bg-green-950/20">
                                                    <p className="font-medium text-green-900 dark:text-green-100">
                                                        💰 You'll save ₦
                                                        {discountAmount.toLocaleString()}{' '}
                                                        ({discountPercent}%) on
                                                        each booking!
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Content: Sidebar Summary */}
                        <div className="order-first border lg:sticky lg:top-8 lg:order-last">
                            <div className="flex flex-col overflow-hidden rounded bg-card">
                                <div className="border-b bg-muted/5 p-4">
                                    <h2 className="text-center text-xl font-black tracking-tight sm:text-left sm:text-2xl">
                                        Booking Summary
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
                                                    <span className="text-sm text-muted-foreground/60 capitalize line-clamp-2">
                                                        {s.name}
                                                    </span>
                                                    <p className="mt-1 text-xs font-bold tracking-widest text-muted-foreground/80 uppercase">
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

                                    {/* Details Grid */}
                                    <div className="space-y-3">
	                                        <div className="flex items-center justify-between">
	                                            <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
	                                                <CheckCircle2 className="size-4 text-primary" />{' '}
	                                                Professional
	                                            </span>
	                                            <span className="text-sm font-black">
	                                                <span className="inline-flex items-center gap-2">
	                                                    {provider.businessName}
	                                                    {provider.isVerified && (
	                                                        <VerifiedProviderBadge />
	                                                    )}
	                                                </span>
	                                            </span>
	                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                                <CheckCircle2 className="size-4 text-primary" />{' '}
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
                                            <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                                <CheckCircle2 className="size-4 text-primary" />{' '}
                                                Time
                                            </span>
                                            <span className="text-sm font-black">
                                                {selectedSlot
                                                    ? format(
                                                          new Date(
                                                              selectedSlot,
                                                          ),
                                                          'h:mm a',
                                                      )
                                                    : '--:--'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t-2 border-dashed border-muted" />

                                    {(supportsOnlinePayment || supportsOfflineBooking) && (
                                        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                                    Payment option
                                                </p>
                                                <p className="mt-1 text-sm text-foreground">
                                                    Choose how you want to secure this booking.
                                                </p>
                                            </div>
                                            <div className="grid gap-3">
                                                {supportsOnlinePayment && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentOption('online')}
                                                        className={cn(
                                                            'rounded-lg border p-3 text-left transition',
                                                            paymentOption === 'online'
                                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/15'
                                                                : 'border-border hover:border-primary/30',
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    Pay online now
                                                                </p>
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    Payment is held securely and released only after service completion is confirmed.
                                                                </p>
                                                            </div>
                                                            <CheckCircle2 className={cn('size-4', paymentOption === 'online' ? 'text-primary' : 'text-muted-foreground/40')} />
                                                        </div>
                                                    </button>
                                                )}
                                                {supportsOfflineBooking && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentOption('offline')}
                                                        className={cn(
                                                            'rounded-lg border p-3 text-left transition',
                                                            paymentOption === 'offline'
                                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/15'
                                                                : 'border-border hover:border-primary/30',
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    Book and pay later
                                                                </p>
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    This sends a pending request to the provider without charging your wallet now.
                                                                </p>
                                                            </div>
                                                            <CheckCircle2 className={cn('size-4', paymentOption === 'offline' ? 'text-primary' : 'text-muted-foreground/40')} />
                                                        </div>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Wallet Balance Info */}
                                    {paymentOption === 'online' &&
                                        walletBalance !== null &&
                                        walletBalance !== undefined && (
                                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                                                <div className="mb-1 flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Your Wallet Balance
                                                    </span>
                                                    <span
                                                        className={`font-bold ${walletBalance >= totalPrice ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
                                                    >
                                                        ₦
                                                        {walletBalance.toLocaleString()}
                                                    </span>
                                                </div>
                                                {walletBalance < totalPrice && (
                                                    <p className="mt-1 text-xs text-destructive">
                                                        Insufficient balance.
                                                        Top up ₦
                                                        {(
                                                            totalPrice -
                                                            walletBalance
                                                        ).toLocaleString()}{' '}
                                                        more to complete
                                                        booking.
                                                    </p>
                                                )}
                                                {walletBalance >=
                                                    totalPrice && (
                                                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                                        ✓ Sufficient balance for
                                                        this booking
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                    {/* Discount Display */}
                                    {discountAmount > 0 && (
                                        <>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Subtotal
                                                </span>
                                                <span className="text-muted-foreground line-through">
                                                    ₦
                                                    {originalPrice.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                    Recurring Discount (
                                                    {discountPercent}%)
                                                </span>
                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                    -₦
                                                    {discountAmount.toLocaleString()}
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {/* Final Price */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-base">
                                                Total
                                            </span>
                                            <div className="text-right">
                                                <span className="block text-xl leading-none font-black text-primary">
                                                    ₦
                                                    {totalPrice.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {providerSettings.autoConfirm && paymentOption === 'online' && (
                                            <p className="rounded-lg bg-green-50 dark:bg-green-950/20 px-3 py-2 text-xs text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50">
                                                This provider auto-confirms bookings – no need to wait for approval.
                                            </p>
                                        )}
                                        {paymentOption === 'offline' && (
                                            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                                                This request will stay pending until the provider reviews it, even if auto-confirm is enabled.
                                            </p>
                                        )}
                                        <Button
                                            className="w-full"
                                            disabled={
                                                !selectedSlot ||
                                                selectedServiceIds.length === 0 ||
                                                (paymentOption === 'online' &&
                                                    walletBalance !== null &&
                                                    walletBalance !==
                                                        undefined &&
                                                    walletBalance < totalPrice)
                                            }
                                            onClick={handleBooking}
                                        >
                                            {paymentOption === 'online'
                                                ? walletBalance !== null &&
                                                  walletBalance !== undefined &&
                                                  walletBalance < totalPrice
                                                    ? 'Insufficient Balance'
                                                    : 'Book & Pay Now'
                                                : 'Send Booking Request'}
                                            <CheckCircle2 className="size-6" />
                                        </Button>
                                        {paymentOption === 'online' &&
                                            walletBalance !== null &&
                                            walletBalance !== undefined &&
                                            walletBalance >= totalPrice && (
                                                <p className="text-center text-xs text-muted-foreground">
                                                    ₦
                                                    {totalPrice.toLocaleString()}{' '}
                                                    will be held until both
                                                    parties approve completion
                                                </p>
                                            )}
                                        {paymentOption === 'offline' && (
                                            <p className="text-center text-xs text-muted-foreground">
                                                No wallet charge will happen now. The provider will decide whether to accept this unpaid request.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
