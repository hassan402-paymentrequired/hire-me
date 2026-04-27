import KeenIcon from '@/components/keen-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldLabel,
    FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import VerifiedProviderBadge from '@/components/verified-provider-badge';
import GuestLayout from '@/layouts/guest-layout';
import { cn } from '@/lib/utils';
import appointments from '@/routes/appointments';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { addMonths, format } from 'date-fns';
import { Box, Check, CheckCircle2, Clock, Repeat, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
// import { toast } from 'sonner';
import { gooeyToast as toast } from 'goey-toast';
import AddressDialogs, {
    BusinessAddressOption,
    ClientAddressOption,
} from './components/address-dialogs';

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
    canBook?: boolean;
    bookingBlockedReason?: string | null;
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
    clientAddresses: ClientAddressOption[];
    businessAddressOption?: BusinessAddressOption | null;
    walletBalance?: number | null;
    settings?: ProviderSettings;
}

export default function Booking({
    provider,
    services,
    teamMembers,
    clientAddresses: initialClientAddresses,
    businessAddressOption,
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
    const [insufficientBalanceDialogOpen, setInsufficientBalanceDialogOpen] =
        useState(false);
    const [paymentConfirmDialogOpen, setPaymentConfirmDialogOpen] =
        useState(false);
    const [addressSelectionDialogOpen, setAddressSelectionDialogOpen] =
        useState(false);
    const [createAddressDialogOpen, setCreateAddressDialogOpen] =
        useState(false);
    const [clientAddresses, setClientAddresses] = useState<
        ClientAddressOption[]
    >(initialClientAddresses);
    const [selectedAddressChoice, setSelectedAddressChoice] = useState(
        initialClientAddresses.find((address) => address.is_active)?.id ||
            '__none__',
    );
    const [setAddressAsActive, setSetAddressAsActive] = useState(true);
    const [attachCurrentLocation, setAttachCurrentLocation] = useState(false);
    const [lastCreatedAddressId, setLastCreatedAddressId] = useState<
        string | null
    >(null);
    const [addressForm, setAddressForm] = useState({
        label: '',
        address: '',
        city: '',
        state: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });
    const [creatingAddress, setCreatingAddress] = useState(false);
    const [locatingAddress, setLocatingAddress] = useState(false);
    const [pendingShortfall, setPendingShortfall] = useState<number>(0);
    const [useCustomTime, setUseCustomTime] = useState(false);
    const [customTime, setCustomTime] = useState('');
    const [paymentOption, setPaymentOption] = useState<'online' | 'offline'>(
        'online',
    );

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

    const supportsOnlinePayment =
        providerSettings.accept_online_payment ?? true;
    const supportsOfflineBooking =
        providerSettings.accept_offline_booking ?? false;
    const canBookProvider = provider.canBook ?? true;
    const bookingBlockedReason =
        provider.bookingBlockedReason ||
        'Booking is unavailable for this provider.';
    const hasSavedAddressOptions = clientAddresses.length > 0;
    const hasBusinessAddressOption = Boolean(businessAddressOption?.address);

    const selectedAddressSummary = useMemo(() => {
        if (selectedAddressChoice === '__business__' && businessAddressOption) {
            return {
                label: businessAddressOption.label,
                address: businessAddressOption.address,
                meta: [businessAddressOption.city, businessAddressOption.state]
                    .filter(Boolean)
                    .join(', '),
            };
        }

        const selectedAddress = clientAddresses.find(
            (address) => address.id === selectedAddressChoice,
        );

        if (!selectedAddress) {
            return null;
        }

        return {
            label: selectedAddress.label,
            address: selectedAddress.address,
            meta: [selectedAddress.city, selectedAddress.state]
                .filter(Boolean)
                .join(', '),
        };
    }, [businessAddressOption, clientAddresses, selectedAddressChoice]);

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

    useEffect(() => {
        if (!attachCurrentLocation) {
            setAddressForm((prev) => ({
                ...prev,
                latitude: null,
                longitude: null,
            }));
        }
    }, [attachCurrentLocation]);

    useEffect(() => {
        if (!hasSavedAddressOptions && !hasBusinessAddressOption) {
            setCreateAddressDialogOpen(true);
        }
    }, [hasBusinessAddressOption, hasSavedAddressOptions]);

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
    const bookingPolicyItems = [
        providerSettings.minNotice
            ? `Minimum ${providerSettings.minNotice} hour notice`
            : null,
        !providerSettings.allowSameDay
            ? 'No same-day bookings'
            : 'Same-day bookings available',
        providerSettings.allowOffHoursRequests
            ? 'Off-hours requests allowed'
            : null,
        providerSettings.max_bookings_per_week
            ? `Up to ${providerSettings.max_bookings_per_week} booking${Number(providerSettings.max_bookings_per_week) > 1 ? 's' : ''} weekly`
            : null,
        providerSettings.max_bookings_per_month
            ? `Up to ${providerSettings.max_bookings_per_month} booking${Number(providerSettings.max_bookings_per_month) > 1 ? 's' : ''} monthly`
            : null,
        supportsOfflineBooking ? 'Pay later option available' : null,
    ].filter(Boolean) as string[];

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
        if (!canBookProvider) {
            toast.error(bookingBlockedReason);
            return;
        }

        if (!selectedDate || !selectedSlot || selectedServiceIds.length === 0)
            return;

        setAddressSelectionDialogOpen(true);
    };

    const continueBookingAfterAddressSelection = () => {
        setAddressSelectionDialogOpen(false);

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

        if (selectedAddressChoice !== '__none__') {
            if (selectedAddressChoice === '__business__') {
                bookingData.use_business_address = true;
            } else {
                bookingData.client_address_id = selectedAddressChoice;
                if (selectedAddressChoice === lastCreatedAddressId) {
                    bookingData.set_address_active = setAddressAsActive;
                }
            }
        }

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

    const resetAddressForm = () => {
        setAddressForm({
            label: '',
            address: '',
            city: '',
            state: '',
            latitude: null,
            longitude: null,
        });
    };

    const handleUseCurrentLocationForAddress = () => {
        if (!('geolocation' in navigator)) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }

        setLocatingAddress(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setAddressForm((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }));
                setLocatingAddress(false);
                toast.success('Current location attached to this address.');
            },
            () => {
                setLocatingAddress(false);
                toast.error(
                    'We could not access your current location. You can still save the address manually.',
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
        );
    };

    useEffect(() => {
        if (attachCurrentLocation) {
            handleUseCurrentLocationForAddress();
        }
    }, [attachCurrentLocation]);

    const handleCreateAddress = async () => {
        if (!addressForm.label.trim() || !addressForm.address.trim()) {
            toast.error('Please add a label and address.');
            return;
        }

        setCreatingAddress(true);
        try {
            const response = await axios.post('/client-addresses', {
                label: addressForm.label.trim(),
                address: addressForm.address.trim(),
                city: addressForm.city.trim() || null,
                state: addressForm.state.trim() || null,
                latitude: addressForm.latitude,
                longitude: addressForm.longitude,
                is_active: setAddressAsActive,
            });

            const createdAddress = response.data.address as ClientAddressOption;
            setClientAddresses((prev) => [
                createdAddress,
                ...prev.map((address) => ({
                    ...address,
                    is_active: false,
                })),
            ]);
            setSelectedAddressChoice(createdAddress.id);
            setSetAddressAsActive(true);
            setLastCreatedAddressId(createdAddress.id);
            setCreateAddressDialogOpen(false);
            resetAddressForm();
            toast.success('Address saved successfully.');
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                'We could not save that address right now.';
            toast.error(message);
        } finally {
            setCreatingAddress(false);
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
                icon={
                    <ShieldExclamationIcon className="size-12 text-primary" />
                }
                title="Confirm Payment"
                description={`You will be charged ₦${totalPrice.toLocaleString()} which will be held securely. Payment will be released to the provider only after both you and the provider confirm the service is completed. Continue?`}
                acceptLabel="Continue"
                rejectLabel="Cancel"
                onAccept={submitBooking}
            />

            <AddressDialogs
                createOpen={createAddressDialogOpen}
                onCreateOpenChange={setCreateAddressDialogOpen}
                selectionOpen={addressSelectionDialogOpen}
                onSelectionOpenChange={setAddressSelectionDialogOpen}
                addressForm={addressForm}
                onAddressFormChange={setAddressForm}
                creatingAddress={creatingAddress}
                locatingAddress={locatingAddress}
                onCreateAddress={handleCreateAddress}
                attachCurrentLocation={attachCurrentLocation}
                onAttachCurrentLocationChange={setAttachCurrentLocation}
                clientAddresses={clientAddresses}
                businessAddressOption={businessAddressOption}
                selectedAddressChoice={selectedAddressChoice}
                onSelectedAddressChoiceChange={setSelectedAddressChoice}
                setAsActive={setAddressAsActive}
                onSetAsActiveChange={setSetAddressAsActive}
                onContinue={continueBookingAfterAddressSelection}
            />

            <div className="mx-auto min-h-screen max-w-6xl bg-background pb-20">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    {/* Header */}
                    <div className="relative mb-6 overflow-hidden rounded-3xl border border-border/70 bg-background px-5 py-5 sm:px-7 sm:py-6">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%)]" />
                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                    <KeenIcon
                                        name="book-square"
                                        className="text-sm"
                                    />
                                    Booking flow
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="space-y-1.5">
                                        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                            Confirm your appointment
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {provider.businessName}
                                            </span>
                                            {provider.isVerified && (
                                                <VerifiedProviderBadge />
                                            )}
                                            <span className="hidden sm:inline">
                                                •
                                            </span>
                                            <span>{provider.address}</span>
                                        </div>
                                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                            Choose the service, team member, and
                                            time that fits best. We’ll keep the
                                            next steps clear as you go.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
                                <div className="rounded-2xl border border-border/70 bg-background/90 p-4 backdrop-blur-sm">
                                    <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                        Services
                                    </div>
                                    <div className="mt-2 text-2xl font-semibold text-foreground">
                                        {selectedServiceIds.length}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {selectedServiceIds.length > 0
                                            ? 'Selected for this booking'
                                            : 'Choose at least one service'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-background/90 p-4 backdrop-blur-sm">
                                    <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                        Payment
                                    </div>
                                    <div className="mt-2 text-lg font-semibold text-foreground">
                                        {paymentOption === 'online'
                                            ? 'Online now'
                                            : 'Pay later'}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {paymentOption === 'online'
                                            ? 'Held securely until completion'
                                            : 'Sent as a pending request'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Provider Settings Info */}
                    {bookingPolicyItems.length > 0 && (
                        <div className="mb-8 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <KeenIcon
                                    name="information"
                                    className="text-sm text-muted-foreground"
                                />
                                Booking policies
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {bookingPolicyItems.map((policy) => (
                                    <div
                                        key={policy}
                                        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground"
                                    >
                                        <KeenIcon
                                            name="status"
                                            className="text-[11px]"
                                        />
                                        {policy}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!canBookProvider && (
                        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
                            <div className="flex items-start gap-3">
                                <ShieldExclamationIcon className="mt-0.5 size-5 shrink-0 text-amber-600" />
                                <div>
                                    <p className="font-semibold">
                                        Booking unavailable
                                    </p>
                                    <p className="mt-1 text-sm leading-6">
                                        {bookingBlockedReason}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
                        {/* Left Content: Calendar & Services */}
                        <div className="space-y-12 lg:col-span-2">
                            {/* Calendar & Slots Card */}
                            <div className="overflow-hidden rounded border bg-card">
                                <div className="grid grid-cols-1 sm:h-[360px] md:grid-cols-2">
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
                                                if (!canBookProvider) {
                                                    return true;
                                                }

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
                                                            Request an off-hours
                                                            time
                                                        </p>
                                                        <p className="mt-1 text-[11px] text-muted-foreground">
                                                            The provider will
                                                            need to confirm.
                                                            Your booking will be
                                                            pending.
                                                        </p>
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <Input
                                                                type="time"
                                                                value={
                                                                    customTime
                                                                }
                                                                disabled={
                                                                    !canBookProvider
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const t =
                                                                        e.target
                                                                            .value;
                                                                    setUseCustomTime(
                                                                        true,
                                                                    );
                                                                    setCustomTime(
                                                                        t,
                                                                    );
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
                                                                                disabled={
                                                                                    !canBookProvider
                                                                                }
                                                                                onClick={() => {
                                                                                    setUseCustomTime(
                                                                                        false,
                                                                                    );
                                                                                    setCustomTime(
                                                                                        '',
                                                                                    );
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
                                                                        Request
                                                                        off-hours
                                                                        time
                                                                    </p>
                                                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                                                        If you
                                                                        can’t
                                                                        find a
                                                                        slot,
                                                                        request
                                                                        a custom
                                                                        time. It
                                                                        will be
                                                                        pending.
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={
                                                                        !canBookProvider
                                                                    }
                                                                    onClick={() => {
                                                                        setUseCustomTime(
                                                                            (
                                                                                v,
                                                                            ) =>
                                                                                !v,
                                                                        );
                                                                        setSelectedSlot(
                                                                            '',
                                                                        );
                                                                        setCustomTime(
                                                                            '',
                                                                        );
                                                                    }}
                                                                >
                                                                    {useCustomTime
                                                                        ? 'Cancel'
                                                                        : 'Request'}
                                                                </Button>
                                                            </div>

                                                            {useCustomTime && (
                                                                <div className="mt-3 flex items-center gap-2">
                                                                    <Input
                                                                        type="time"
                                                                        value={
                                                                            customTime
                                                                        }
                                                                        disabled={
                                                                            !canBookProvider
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const t =
                                                                                e
                                                                                    .target
                                                                                    .value;
                                                                            setCustomTime(
                                                                                t,
                                                                            );
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
                                    Select services to book
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {services.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => {
                                                if (canBookProvider) {
                                                    toggleService(s.id);
                                                }
                                            }}
                                            className={cn(
                                                'flex items-start gap-2 rounded border p-2',
                                                canBookProvider
                                                    ? 'cursor-pointer'
                                                    : 'cursor-not-allowed opacity-60',
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
                                    <RadioGroup
                                        value={
                                            selectedTeamMemberId || '__provider__'
                                        }
                                        onValueChange={(value) => {
                                            if (!canBookProvider) return;
                                            setSelectedTeamMemberId(
                                                value === '__provider__'
                                                    ? ''
                                                    : value,
                                            );
                                            setSelectedSlot('');
                                        }}
                                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                                        disabled={!canBookProvider}
                                    >
                                        <FieldLabel htmlFor="provider-owner">
                                            <Field orientation="horizontal">
                                                <FieldContent className="gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage
                                                                src={
                                                                    provider.logo ||
                                                                    undefined
                                                                }
                                                                alt={
                                                                    provider.name
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {provider.name
                                                                    .split(' ')
                                                                    .map(
                                                                        (
                                                                            part,
                                                                        ) =>
                                                                            part[0],
                                                                    )
                                                                    .join('')
                                                                    .slice(0, 2)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <FieldTitle>
                                                                {
                                                                    provider.name
                                                                }
                                                            </FieldTitle>
                                                            <FieldDescription className="mt-0 text-xs">
                                                                Business owner
                                                            </FieldDescription>
                                                        </div>
                                                    </div>
                                                    <FieldDescription>
                                                        Book directly with the
                                                        provider.
                                                    </FieldDescription>
                                                </FieldContent>
                                                <RadioGroupItem
                                                    value="__provider__"
                                                    id="provider-owner"
                                                />
                                            </Field>
                                        </FieldLabel>

                                        {teamMembers.map((member) => (
                                            <FieldLabel
                                                key={member.id}
                                                htmlFor={`team-member-${member.id}`}
                                            >
                                                <Field orientation="horizontal">
                                                    <FieldContent className="gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-12 w-12">
                                                                <AvatarImage
                                                                    src={
                                                                        member.avatar ||
                                                                        undefined
                                                                    }
                                                                    alt={
                                                                        member.name
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {member.name
                                                                        .split(
                                                                            ' ',
                                                                        )
                                                                        .map(
                                                                            (
                                                                                part,
                                                                            ) =>
                                                                                part[0],
                                                                        )
                                                                        .join(
                                                                            '',
                                                                        )
                                                                        .slice(
                                                                            0,
                                                                            2,
                                                                        )
                                                                        .toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <FieldTitle className="capitalize">
                                                                    {
                                                                        member.name
                                                                    }
                                                                </FieldTitle>
                                                                <FieldDescription className="mt-0 text-xs capitalize">
                                                                    {
                                                                        member.role
                                                                    }
                                                                </FieldDescription>
                                                            </div>
                                                        </div>
                                                        <FieldDescription className="truncate">
                                                            {member.email}
                                                        </FieldDescription>
                                                    </FieldContent>
                                                    <RadioGroupItem
                                                        value={member.id}
                                                        id={`team-member-${member.id}`}
                                                    />
                                                </Field>
                                            </FieldLabel>
                                        ))}
                                    </RadioGroup>
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
                                    className="text-sm"
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
                                                    setRecurrencePattern(null);
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
                                                    disabled={!canBookProvider}
                                                    min={format(
                                                        selectedDate,
                                                        'yyyy-MM-dd',
                                                    )}
                                                    max={format(
                                                        //here
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
                                                    disabled={!canBookProvider}
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
                        <div className="order-last lg:sticky lg:top-8 lg:order-last">
                            <div className="flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card">
                                <div className="border-b bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.06),transparent_28%)] p-5">
                                    <h2 className="text-center text-xl font-black tracking-tight sm:text-left sm:text-2xl">
                                        Booking Summary
                                    </h2>
                                    <p className="mt-1 text-center text-sm text-muted-foreground sm:text-left">
                                        Review the essentials before you confirm
                                        this booking.
                                    </p>
                                </div>

                                <div className="space-y-5 p-5">
                                    <div className="space-y-4 divide-y divide-dashed border-dashed border-muted">
                                        {selectedServices.map((s) => (
                                            <div
                                                key={s.id}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex flex-col items-start">
                                                    <span className="line-clamp-2 text-sm text-muted-foreground/60 capitalize">
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
                                    <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                                <KeenIcon
                                                    name="profile-circle"
                                                    className="text-sm text-primary"
                                                />
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
                                                <KeenIcon
                                                    name="book-square"
                                                    className="text-sm text-primary"
                                                />
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
                                                <KeenIcon
                                                    name="status"
                                                    className="text-sm text-primary"
                                                />
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
                                        <div className="flex items-start justify-between gap-4">
                                            <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                                <KeenIcon
                                                    name="geolocation"
                                                    className="text-sm text-primary"
                                                />
                                                Address
                                            </span>
                                            <div className="max-w-[60%] text-right">
                                                <span className="block text-sm font-black text-foreground">
                                                    {selectedAddressSummary
                                                        ? selectedAddressSummary.label
                                                        : 'None selected'}
                                                </span>
                                                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                                    {selectedAddressSummary
                                                        ? selectedAddressSummary.meta
                                                            ? `${selectedAddressSummary.address}, ${selectedAddressSummary.meta}`
                                                            : selectedAddressSummary.address
                                                        : 'You can continue without adding an address.'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t-2 border-dashed border-muted" />

                                    {(supportsOnlinePayment ||
                                        supportsOfflineBooking) && (
                                        <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                                            <div>
                                                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                                    Payment option
                                                </p>
                                                <p className="mt-1 text-sm text-foreground">
                                                    Choose how you want to
                                                    secure this booking.
                                                </p>
                                            </div>
                                            <div className="grid gap-3">
                                                {supportsOnlinePayment && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPaymentOption(
                                                                'online',
                                                            )
                                                        }
                                                        className={cn(
                                                            'rounded-lg border p-3 text-left transition',
                                                            paymentOption ===
                                                                'online'
                                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/15'
                                                                : 'border-border hover:border-primary/30',
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    Pay online
                                                                    now
                                                                </p>
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    Payment is
                                                                    held
                                                                    securely and
                                                                    released
                                                                    only after
                                                                    service
                                                                    completion
                                                                    is
                                                                    confirmed.
                                                                </p>
                                                            </div>
                                                            <KeenIcon
                                                                name="verify"
                                                                className={cn(
                                                                    'text-sm',
                                                                    paymentOption ===
                                                                        'online'
                                                                        ? 'text-primary'
                                                                        : 'text-muted-foreground/40',
                                                                )}
                                                            />
                                                        </div>
                                                    </button>
                                                )}
                                                {supportsOfflineBooking && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPaymentOption(
                                                                'offline',
                                                            )
                                                        }
                                                        className={cn(
                                                            'rounded-lg border p-3 text-left transition',
                                                            paymentOption ===
                                                                'offline'
                                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/15'
                                                                : 'border-border hover:border-primary/30',
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    Book and pay
                                                                    later
                                                                </p>
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    This sends a
                                                                    pending
                                                                    request to
                                                                    the provider
                                                                    without
                                                                    charging
                                                                    your wallet
                                                                    now.
                                                                </p>
                                                            </div>
                                                            <KeenIcon
                                                                name="verify"
                                                                className={cn(
                                                                    'text-sm',
                                                                    paymentOption ===
                                                                        'offline'
                                                                        ? 'text-primary'
                                                                        : 'text-muted-foreground/40',
                                                                )}
                                                            />
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
                                            <div className="rounded-2xl border border-border bg-muted/30 p-4">
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
                                    <div className="space-y-4 rounded-2xl border border-border/70 bg-background p-4">
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

                                        {providerSettings.autoConfirm &&
                                            paymentOption === 'online' && (
                                                <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400">
                                                    This provider auto-confirms
                                                    bookings – no need to wait
                                                    for approval.
                                                </p>
                                            )}
                                        {paymentOption === 'offline' && (
                                            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                                                This request will stay pending
                                                until the provider reviews it,
                                                even if auto-confirm is enabled.
                                            </p>
                                        )}
                                        <Button
                                            className="w-full"
                                            disabled={
                                                !canBookProvider ||
                                                !selectedSlot ||
                                                selectedServiceIds.length ===
                                                    0 ||
                                                (paymentOption === 'online' &&
                                                    walletBalance !== null &&
                                                    walletBalance !==
                                                        undefined &&
                                                    walletBalance < totalPrice)
                                            }
                                            onClick={handleBooking}
                                        >
                                            {!canBookProvider
                                                ? 'Booking unavailable'
                                                : paymentOption === 'online'
                                                  ? walletBalance !== null &&
                                                    walletBalance !==
                                                        undefined &&
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
                                                No wallet charge will happen
                                                now. The provider will decide
                                                whether to accept this unpaid
                                                request.
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
