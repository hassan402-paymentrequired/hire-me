import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { addMonths, format } from 'date-fns';
import { CheckCircle2, Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

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
    slug: string;
    description?: string;
    logo?: string | null;
}

interface TimeSlot {
    start: string;
    end: string;
    display: string;
    datetime: string;
}

interface WidgetProps {
    slug: string;
    apiBaseUrl?: string;
    primaryColor?: string;
    size?: 'small' | 'medium' | 'large';
    cardBackground?: string;
    textColor?: string;
    borderRadius?: string;
    padding?: string;
    borderColor?: string;
    inputBackground?: string;
    inputBorderColor?: string;
    inputTextColor?: string;
    buttonBorderRadius?: string;
    buttonFontSize?: string;
    labelFontSize?: string;
    labelFontWeight?: string;
    serviceCardHoverColor?: string;
    calendarSelectedColor?: string;
    calendarTodayColor?: string;
    summaryBackground?: string;
    boxShadow?: string;
    fontFamily?: string;
}

export function BookingWidget({
    slug,
    apiBaseUrl = window.location.origin,
    primaryColor = '#3B82F6',
    size = 'medium',
    cardBackground = '#FFFFFF',
    textColor = '#000000',
    borderRadius = '8',
    padding = '24',
    borderColor,
    inputBackground,
    inputBorderColor,
    inputTextColor,
    buttonBorderRadius,
    buttonFontSize,
    labelFontSize,
    labelFontWeight,
    serviceCardHoverColor,
    calendarSelectedColor,
    calendarTodayColor,
    summaryBackground,
    boxShadow,
    fontFamily,
}: WidgetProps) {
    const [provider, setProvider] = useState<Provider | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [notes, setNotes] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [checkingWallet, setCheckingWallet] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [apiMessage, setApiMessage] = useState<string | null>(null);
    const [settings, setSettings] = useState<any>(null);
    const [widgetConfig, setWidgetConfig] = useState<any>(null);

    // Load provider info on mount
    useEffect(() => {
        loadProviderInfo();
    }, [slug]);

    // Load slots when date or services change
    useEffect(() => {
        if (selectedDate && selectedServiceIds.length > 0) {
            fetchAvailableSlots();
        } else {
            setAvailableSlots([]);
        }
    }, [selectedDate, selectedServiceIds]);

    // Check wallet balance when email changes
    useEffect(() => {
        const checkWalletBalance = async () => {
            if (!guestEmail.trim() || !widgetConfig?.requirePayment) {
                setWalletBalance(null);
                return;
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(guestEmail)) {
                setWalletBalance(null);
                return;
            }

            setCheckingWallet(true);
            try {
                const response = await axios.post(
                    `${apiBaseUrl}/api/widget/${slug}/check-wallet`,
                    {
                        email: guestEmail.trim(),
                    },
                );
                setWalletBalance(response.data.balance || 0);
            } catch (err) {
                // If user doesn't exist, balance is 0
                setWalletBalance(0);
            } finally {
                setCheckingWallet(false);
            }
        };

        // Debounce wallet check
        const timeoutId = setTimeout(checkWalletBalance, 500);
        return () => clearTimeout(timeoutId);
    }, [guestEmail, widgetConfig?.requirePayment]);

    const loadProviderInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `${apiBaseUrl}/api/widget/${slug}/info`,
            );
            setProvider(response.data.provider);
            setServices(response.data.services);
            setSettings(response.data.settings);
            setWidgetConfig(response.data.widget);

            // Auto-select first service if available
            if (response.data.services.length > 0) {
                setSelectedServiceIds([response.data.services[0].id]);
            }
        } catch (err: any) {
            setError(
                err.response?.data?.error ||
                    'Failed to load provider information.',
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        if (!selectedDate || selectedServiceIds.length === 0) return;

        setLoadingSlots(true);
        setApiMessage(null);
        try {
            const response = await axios.get(
                `${apiBaseUrl}/api/widget/${slug}/availability`,
                {
                    params: {
                        service_ids: selectedServiceIds,
                        date: format(selectedDate, 'yyyy-MM-dd'),
                    },
                },
            );
            setAvailableSlots(response.data.slots || []);
            setApiMessage(response.data.message || null);
        } catch (err: any) {
            console.error('Failed to fetch slots:', err);
            setAvailableSlots([]);
            setApiMessage(
                err.response?.data?.message ||
                    'Could not load available slots.',
            );
        } finally {
            setLoadingSlots(false);
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
    const totalDuration = selectedServices.reduce(
        (sum, s) => sum + s.duration,
        0,
    );

    const handleBooking = async (paymentMethod: 'wallet' | 'paystack') => {
        if (
            !selectedDate ||
            !selectedSlot ||
            selectedServiceIds.length === 0 ||
            !provider
        ) {
            return;
        }

        // Validate guest info
        if (!guestName.trim() || !guestEmail.trim()) {
            setError('Please provide your name and email to continue.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guestEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        // If wallet payment but insufficient balance, show error
        if (
            paymentMethod === 'wallet' &&
            walletBalance !== null &&
            walletBalance < totalPrice
        ) {
            setError(
                'Insufficient wallet balance. Please use Paystack payment.',
            );
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (paymentMethod === 'paystack') {
                // Initialize Paystack payment
                const bookingData: any = {
                    provider_id: provider.id,
                    service_ids: selectedServiceIds,
                    start_time: selectedSlot,
                    notes: notes,
                    name: guestName.trim(),
                    email: guestEmail.trim(),
                };

                if (guestPhone.trim()) {
                    bookingData.phone = guestPhone.trim();
                }

                const response = await axios.post(
                    `${apiBaseUrl}/api/widget/${slug}/initialize-payment`,
                    bookingData,
                );

                if (response.data.success && response.data.authorization_url) {
                    // Open Paystack in a popup window (not iframe redirect)
                    const paystackWindow = window.open(
                        response.data.authorization_url,
                        'paystack-payment',
                        'width=600,height=700,scrollbars=yes,resizable=yes',
                    );

                    // Listen for payment completion message from callback page
                    const handleMessage = (event: MessageEvent) => {
                        // Verify origin for security (in production, check against your domain)
                        // if (event.origin !== apiBaseUrl) return;

                        if (
                            event.data &&
                            event.data.type === 'proxideck-widget-payment'
                        ) {
                            window.removeEventListener(
                                'message',
                                handleMessage,
                            );

                            if (paystackWindow) {
                                paystackWindow.close();
                            }

                            if (event.data.success) {
                                setSuccess(true);
                                setSuccessMessage(
                                    event.data.message ||
                                        'Payment successful! Appointment booked.',
                                );

                                // Reset form
                                setSelectedSlot('');
                                setNotes('');
                                setGuestName('');
                                setGuestEmail('');
                                setGuestPhone('');
                                setWalletBalance(null);
                            } else {
                                setError(
                                    event.data.error ||
                                        'Payment failed. Please try again.',
                                );
                            }
                            setLoading(false);
                        }
                    };

                    window.addEventListener('message', handleMessage);

                    // Check if popup was blocked
                    if (
                        !paystackWindow ||
                        paystackWindow.closed ||
                        typeof paystackWindow.closed === 'undefined'
                    ) {
                        setError(
                            'Popup blocked. Please allow popups for this site and try again.',
                        );
                        setLoading(false);
                    } else {
                        // Monitor popup closure
                        const checkClosed = setInterval(() => {
                            if (paystackWindow.closed) {
                                clearInterval(checkClosed);
                                window.removeEventListener(
                                    'message',
                                    handleMessage,
                                );
                                if (!success) {
                                    setLoading(false);
                                }
                            }
                        }, 500);
                    }
                } else {
                    setError('Failed to initialize payment. Please try again.');
                    setLoading(false);
                }
            } else {
                // Wallet payment
                const bookingData: any = {
                    provider_id: provider.id,
                    service_ids: selectedServiceIds,
                    start_time: selectedSlot,
                    notes: notes,
                    name: guestName.trim(),
                    email: guestEmail.trim(),
                    payment_method: 'wallet',
                };

                if (guestPhone.trim()) {
                    bookingData.phone = guestPhone.trim();
                }

                const response = await axios.post(
                    `${apiBaseUrl}/api/widget/${slug}/book`,
                    bookingData,
                );

                if (response.data.success) {
                    setSuccess(true);
                    setSuccessMessage(
                        response.data.message ||
                            'Appointment booked successfully!',
                    );

                    // If new user was created, show additional message
                    if (response.data.is_new_user) {
                        setSuccessMessage(
                            response.data.message +
                                ' An account has been created for you. Check your email for login credentials.',
                        );
                    }

                    // Reset form
                    setSelectedSlot('');
                    setNotes('');
                    setGuestName('');
                    setGuestEmail('');
                    setGuestPhone('');
                    setWalletBalance(null);
                }
                setLoading(false);
            }
        } catch (err: any) {
            setError(
                err.response?.data?.error ||
                    'Failed to book appointment. Please try again.',
            );
            setLoading(false);
        }
    };

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

    const sizeClasses = {
        small: 'max-w-md',
        medium: 'max-w-2xl',
        large: 'max-w-4xl',
    };

    if (loading && !provider) {
        return (
            <div className={cn('mx-auto', sizeClasses[size])}>
                <div className="flex items-center justify-center py-12">
                    <Loader2
                        className="h-8 w-8 animate-spin"
                        style={{ color: primaryColor }}
                    />
                </div>
            </div>
        );
    }

    if (error && !provider) {
        return (
            <div className={cn('mx-auto', sizeClasses[size])}>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:bg-red-950/20">
                    <p className="text-sm text-red-800 dark:text-red-200">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className={cn('mx-auto', sizeClasses[size])}>
                <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:bg-green-950/20">
                    <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600 dark:text-green-400" />
                    <h3 className="mb-2 text-lg font-semibold text-green-900 dark:text-green-100">
                        {widgetConfig?.requirePayment !== false
                            ? 'Appointment Booked Successfully!'
                            : 'Booking Request Submitted!'}
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-200">
                        {successMessage ||
                            'Your appointment has been confirmed. You will receive a confirmation email shortly.'}
                    </p>
                </div>
            </div>
        );
    }

    if (!provider) return null;

    const maxDate = settings?.advanceBooking
        ? addMonths(new Date(), settings.advanceBooking)
        : addMonths(new Date(), 30);

    const widgetTextStyle: React.CSSProperties = {
        color: textColor || undefined,
        fontFamily: fontFamily || undefined,
    };

    const labelStyle: React.CSSProperties = {
        ...widgetTextStyle,
        fontSize: labelFontSize || undefined,
        fontWeight: labelFontWeight || undefined,
    };

    const inputStyle: React.CSSProperties = {
        backgroundColor: inputBackground || undefined,
        borderColor: inputBorderColor || borderColor || undefined,
        color: inputTextColor || textColor || undefined,
        fontFamily: fontFamily || undefined,
    };

    const buttonStyle: React.CSSProperties = {
        borderRadius: buttonBorderRadius
            ? `${buttonBorderRadius}px`
            : undefined,
        fontSize: buttonFontSize || undefined,
        fontFamily: fontFamily || undefined,
    };

    const serviceCardStyle: React.CSSProperties = {
        borderColor: borderColor || undefined,
    };

    const summaryStyle: React.CSSProperties = {
        backgroundColor: summaryBackground || undefined,
        borderColor: borderColor || undefined,
    };

    return (
        <div
            className={cn('mx-auto', sizeClasses[size])}
            style={widgetTextStyle}
        >
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                {provider.logo && (
                    <img
                        src={provider.logo}
                        alt={provider.businessName}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                )}
                <div>
                    <h2 className="text-xl font-bold" style={widgetTextStyle}>
                        {provider.businessName}
                    </h2>
                    {provider.description && (
                        <p
                            className="text-sm opacity-70"
                            style={widgetTextStyle}
                        >
                            {provider.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Services Selection */}
            <div className="mb-6">
                <Label
                    className="mb-3 block text-sm font-medium"
                    style={labelStyle}
                >
                    Select Services
                </Label>
                <div className="space-y-3">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="flex items-start space-x-3 rounded-lg border p-3 transition-colors"
                            style={{
                                ...serviceCardStyle,
                                borderRadius: `${borderRadius}px`,
                            }}
                            onMouseEnter={(e) => {
                                if (serviceCardHoverColor) {
                                    e.currentTarget.style.backgroundColor =
                                        serviceCardHoverColor;
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '';
                            }}
                        >
                            <Checkbox
                                id={service.id}
                                checked={selectedServiceIds.includes(
                                    service.id,
                                )}
                                onCheckedChange={() =>
                                    toggleService(service.id)
                                }
                            />
                            <div className="flex-1">
                                <Label
                                    htmlFor={service.id}
                                    className="cursor-pointer font-medium"
                                    style={widgetTextStyle}
                                >
                                    {service.name}
                                </Label>
                                {service.description && (
                                    <p
                                        className="text-xs opacity-70"
                                        style={widgetTextStyle}
                                    >
                                        {service.description}
                                    </p>
                                )}
                                <div
                                    className="mt-1 flex items-center gap-4 text-xs opacity-70"
                                    style={widgetTextStyle}
                                >
                                    <span>{service.duration} min</span>
                                    <span>
                                        ₦
                                        {Number(service.price).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
                <Label
                    className="mb-3 block text-sm font-medium"
                    style={labelStyle}
                >
                    Select Date
                </Label>
                <div
                    style={{ backgroundColor: cardBackground || 'transparent' }}
                >
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (date) {
                                setSelectedDate(date);
                                setSelectedSlot('');
                            }
                        }}
                        disabled={(date) => date < new Date() || date > maxDate}
                        className="rounded-md border bg-transparent"
                        style={{
                            borderColor: borderColor || undefined,
                            borderRadius: `${borderRadius}px`,
                        }}
                    />
                </div>
            </div>

            {/* Time Slots */}
            {selectedServiceIds.length > 0 && (
                <div className="mb-6">
                    <Label
                        className="mb-3 block text-sm font-medium"
                        style={labelStyle}
                    >
                        Select Time
                    </Label>
                    {loadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2
                                className="h-6 w-6 animate-spin"
                                style={{ color: primaryColor }}
                            />
                        </div>
                    ) : apiMessage ? (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-center dark:bg-yellow-950/20">
                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                {apiMessage}
                            </p>
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
                            No available slots for this date. Please select
                            another date.
                        </div>
                    ) : (
                        <ScrollArea
                            className="h-64 rounded-md border p-4"
                            style={{
                                borderColor: borderColor || undefined,
                                borderRadius: `${borderRadius}px`,
                            }}
                        >
                            <div className="space-y-4">
                                {categorizedSlots.morning.length > 0 && (
                                    <div>
                                        <h4
                                            className="mb-2 text-xs font-medium opacity-70"
                                            style={labelStyle}
                                        >
                                            Morning
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {categorizedSlots.morning.map(
                                                (slot) => (
                                                    <Button
                                                        key={slot.datetime}
                                                        variant={
                                                            selectedSlot ===
                                                            slot.datetime
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            setSelectedSlot(
                                                                slot.datetime,
                                                            )
                                                        }
                                                        style={{
                                                            ...buttonStyle,
                                                            ...(selectedSlot ===
                                                            slot.datetime
                                                                ? {
                                                                      backgroundColor:
                                                                          primaryColor,
                                                                      color: '#FFFFFF',
                                                                      borderColor:
                                                                          primaryColor,
                                                                  }
                                                                : {
                                                                      color: textColor,
                                                                      borderColor:
                                                                          borderColor ||
                                                                          'currentColor',
                                                                  }),
                                                        }}
                                                    >
                                                        {slot.display}
                                                    </Button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                                {categorizedSlots.afternoon.length > 0 && (
                                    <div>
                                        <h4
                                            className="mb-2 text-xs font-medium opacity-70"
                                            style={labelStyle}
                                        >
                                            Afternoon
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {categorizedSlots.afternoon.map(
                                                (slot) => (
                                                    <Button
                                                        key={slot.datetime}
                                                        variant={
                                                            selectedSlot ===
                                                            slot.datetime
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            setSelectedSlot(
                                                                slot.datetime,
                                                            )
                                                        }
                                                        style={{
                                                            ...buttonStyle,
                                                            ...(selectedSlot ===
                                                            slot.datetime
                                                                ? {
                                                                      backgroundColor:
                                                                          primaryColor,
                                                                      color: '#FFFFFF',
                                                                      borderColor:
                                                                          primaryColor,
                                                                  }
                                                                : {
                                                                      color: textColor,
                                                                      borderColor:
                                                                          borderColor ||
                                                                          'currentColor',
                                                                  }),
                                                        }}
                                                    >
                                                        {slot.display}
                                                    </Button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                                {categorizedSlots.evening.length > 0 && (
                                    <div>
                                        <h4
                                            className="mb-2 text-xs font-medium opacity-70"
                                            style={labelStyle}
                                        >
                                            Evening
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {categorizedSlots.evening.map(
                                                (slot) => (
                                                    <Button
                                                        key={slot.datetime}
                                                        variant={
                                                            selectedSlot ===
                                                            slot.datetime
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            setSelectedSlot(
                                                                slot.datetime,
                                                            )
                                                        }
                                                        style={{
                                                            ...buttonStyle,
                                                            ...(selectedSlot ===
                                                            slot.datetime
                                                                ? {
                                                                      backgroundColor:
                                                                          primaryColor,
                                                                      color: '#FFFFFF',
                                                                      borderColor:
                                                                          primaryColor,
                                                                  }
                                                                : {
                                                                      color: textColor,
                                                                      borderColor:
                                                                          borderColor ||
                                                                          'currentColor',
                                                                  }),
                                                        }}
                                                    >
                                                        {slot.display}
                                                    </Button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            )}

            {/* Guest Information */}
            <div className="mb-6 space-y-4">
                <div>
                    <Label
                        htmlFor="guest_name"
                        className="mb-2 block text-sm font-medium"
                        style={labelStyle}
                    >
                        Your Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="guest_name"
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        style={inputStyle}
                        className="rounded-md"
                    />
                </div>
                <div>
                    <Label
                        htmlFor="guest_email"
                        className="mb-2 block text-sm font-medium"
                        style={labelStyle}
                    >
                        Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="guest_email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        style={inputStyle}
                        className="rounded-md"
                    />
                </div>
                <div>
                    <Label
                        htmlFor="guest_phone"
                        className="mb-2 block text-sm font-medium"
                        style={labelStyle}
                    >
                        Phone Number (Optional)
                    </Label>
                    <Input
                        id="guest_phone"
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        style={inputStyle}
                        className="rounded-md"
                    />
                </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
                <Label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-medium"
                    style={labelStyle}
                >
                    Additional Notes (Optional)
                </Label>
                <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests or notes..."
                    rows={3}
                    style={inputStyle}
                    className="rounded-md"
                />
            </div>

            {/* Summary */}
            {selectedServiceIds.length > 0 && (
                <div
                    className="mb-6 rounded-lg border p-4"
                    style={{
                        ...summaryStyle,
                        borderRadius: `${borderRadius}px`,
                        borderColor: borderColor || undefined,
                    }}
                >
                    <div className="flex items-center justify-between text-sm">
                        <span className="opacity-70" style={widgetTextStyle}>
                            Total Duration:
                        </span>
                        <span className="font-medium" style={widgetTextStyle}>
                            {totalDuration} minutes
                        </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold" style={widgetTextStyle}>
                            Total Price:
                        </span>
                        <span
                            className="text-lg font-bold"
                            style={widgetTextStyle}
                        >
                            ₦{totalPrice.toLocaleString()}
                        </span>
                    </div>
                    {widgetConfig?.requirePayment !== false && guestEmail && (
                        <div
                            className="mt-3 border-t pt-3"
                            style={{ borderColor: borderColor || undefined }}
                        >
                            {checkingWallet ? (
                                <div
                                    className="flex items-center gap-2 text-xs opacity-70"
                                    style={widgetTextStyle}
                                >
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Checking wallet balance...
                                </div>
                            ) : (
                                walletBalance !== null && (
                                    <div
                                        className="text-xs"
                                        style={widgetTextStyle}
                                    >
                                        <span className="opacity-70">
                                            Wallet Balance:{' '}
                                        </span>
                                        <span
                                            className={
                                                walletBalance >= totalPrice
                                                    ? 'font-semibold text-green-600'
                                                    : 'opacity-70'
                                            }
                                        >
                                            ₦{walletBalance.toLocaleString()}
                                        </span>
                                        {walletBalance >= totalPrice && (
                                            <span className="ml-2 text-green-600">
                                                ✓ Sufficient
                                            </span>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:bg-red-950/20">
                    <p className="text-sm text-red-800 dark:text-red-200">
                        {error}
                    </p>
                </div>
            )}

            {/* Payment Buttons */}
            {widgetConfig?.requirePayment !== false ? (
                <div className="space-y-2">
                    {walletBalance !== null && walletBalance >= totalPrice && (
                        <Button
                            onClick={() => handleBooking('wallet')}
                            disabled={
                                !selectedSlot ||
                                selectedServiceIds.length === 0 ||
                                !guestName.trim() ||
                                !guestEmail.trim() ||
                                loading
                            }
                            className="w-full"
                            style={{
                                ...buttonStyle,
                                backgroundColor: primaryColor,
                                color: '#FFFFFF',
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Pay from Wallet (₦${totalPrice.toLocaleString()})`
                            )}
                        </Button>
                    )}
                    <Button
                        onClick={() => handleBooking('paystack')}
                        disabled={
                            !selectedSlot ||
                            selectedServiceIds.length === 0 ||
                            !guestName.trim() ||
                            !guestEmail.trim() ||
                            loading
                        }
                        className="w-full"
                        variant={
                            walletBalance !== null &&
                            walletBalance >= totalPrice
                                ? 'outline'
                                : 'default'
                        }
                        style={{
                            ...buttonStyle,
                            ...(walletBalance !== null &&
                            walletBalance >= totalPrice
                                ? {
                                      borderColor: borderColor || primaryColor,
                                      color: textColor,
                                  }
                                : {
                                      backgroundColor: primaryColor,
                                      color: '#FFFFFF',
                                  }),
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Pay with Paystack (₦${totalPrice.toLocaleString()})`
                        )}
                    </Button>
                </div>
            ) : (
                <Button
                    onClick={() => handleBooking('wallet')}
                    disabled={
                        !selectedSlot ||
                        selectedServiceIds.length === 0 ||
                        !guestName.trim() ||
                        !guestEmail.trim() ||
                        loading
                    }
                    className="w-full"
                    style={{
                        ...buttonStyle,
                        backgroundColor: primaryColor,
                        color: '#FFFFFF',
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Request Booking'
                    )}
                </Button>
            )}
        </div>
    );
}
