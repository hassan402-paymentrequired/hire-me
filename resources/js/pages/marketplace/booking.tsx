import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import GuestLayout from '@/layouts/guest-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { Box, Check, CheckCircle2, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
    max_bookings_per_week: string | number | null;
    max_bookings_per_month: string | number | null;
}

interface Props {
    provider: Provider;
    services: Service[];
    walletBalance?: number | null;
    settings?: ProviderSettings;
}

export default function Booking({
    provider,
    services,
    walletBalance,
    settings,
}: Props) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [rescheduleId, setRescheduleId] = useState<string | null>(null);
    const [apiMessage, setApiMessage] = useState<string | null>(null);

    // Provider settings with defaults
    const providerSettings: ProviderSettings = settings || {
        advanceBooking: 30,
        minNotice: null,
        allowSameDay: false,
        max_bookings_per_week: null,
        max_bookings_per_month: null,
    };

    // Provider settings with defaults
    const providerSettings: ProviderSettings = settings || {
        advanceBooking: 30,
        minNotice: null,
        allowSameDay: false,
        max_bookings_per_week: null,
        max_bookings_per_month: null,
    };

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
    }, [selectedDate, selectedServiceIds]);

    const fetchAvailableSlots = async () => {
        setLoading(true);
        setApiMessage(null);
        try {
            const response = await axios.get('/appointments/slots', {
                params: {
                    provider_id: provider.id,
                    service_ids: selectedServiceIds,
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    reschedule_id: rescheduleId,
                },
            });
            setAvailableSlots(response.data.slots || []);
            setApiMessage(response.data.message || null);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            setAvailableSlots([]);
            setApiMessage('An error occurred while fetching available slots.');
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
    const totalPrice = selectedServices.reduce(
        (sum, s) => sum + Number(s.price),
        0,
    );

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

        // Check wallet balance
        if (
            walletBalance !== null &&
            walletBalance !== undefined &&
            walletBalance < totalPrice
        ) {
            const shortfall = totalPrice - walletBalance;
            if (
                confirm(
                    `Insufficient wallet balance. You need ₦${shortfall.toLocaleString()} more. Would you like to top up your wallet?`,
                )
            ) {
                router.visit('/wallet');
            }
            return;
        }

        router.post('/appointments', {
            provider_id: provider.id,
            service_ids: selectedServiceIds,
            start_time: selectedSlot,
            notes: notes,
            reschedule_id: rescheduleId,
        });
    };

    return (
        <GuestLayout>
            <Head title={`Book with ${provider.businessName}`} />

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
                                    <li>• Same-day bookings are not allowed</li>
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
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
                        {/* Left Content: Calendar & Services */}
                        <div className="space-y-12 lg:col-span-2">
                            {/* Calendar & Slots Card */}
                            <div className="overflow-hidden rounded border bg-card">
                                <div className="grid grid-cols-1 md:grid-cols-2">
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
                                            className="rounded-md"
                                        />
                                    </div>

                                    <div className="space-y-3 bg-muted/5 p-4">
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
                                    Services offered by the provider
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
                                                <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                                                    {s.description}
                                                </p>
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

                            {/* Booking Notes */}
                            <div className="space-y-2">
                                <h3 className="text-xl font-black tracking-tight">
                                    Additional Notes
                                </h3>
                                <Textarea
                                    placeholder="Add any special requests or information for the provider..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
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
                                                    <span className="text-sm text-muted-foreground/60 capitalize">
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
                                                {provider.businessName}
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

                                    {/* Wallet Balance Info */}
                                    {walletBalance !== null &&
                                        walletBalance !== undefined && (
                                            <div className="rounded-lg border border-border bg-muted/30 p-3">
                                                <div className="mb-1 flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Wallet Balance
                                                    </span>
                                                    <span
                                                        className={`font-bold ${walletBalance >= totalPrice ? 'text-success' : 'text-destructive'}`}
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
                                                        more.
                                                    </p>
                                                )}
                                            </div>
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

                                        <Button
                                            className="w-full"
                                            disabled={
                                                !selectedSlot ||
                                                selectedServiceIds.length ===
                                                    0 ||
                                                (walletBalance !== null &&
                                                    walletBalance !==
                                                        undefined &&
                                                    walletBalance < totalPrice)
                                            }
                                            onClick={handleBooking}
                                        >
                                            Continue
                                            <CheckCircle2 className="size-6" />
                                        </Button>
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
