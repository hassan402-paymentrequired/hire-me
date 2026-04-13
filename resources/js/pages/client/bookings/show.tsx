/* eslint-disable @typescript-eslint/no-explicit-any */
import KeenIcon from '@/components/keen-icon';
import { ReviewSection } from '@/components/reviews/review-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import GuestLayout from '@/layouts/guest-layout';
import {
    formatDate,
    formatPrice,
    formatStatus,
    formatTime,
    getStatusVariant,
} from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Star,
    Timer,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { ContactItem } from '../components/contact-item';

interface BusinessProfile {
    id: string;
    business_name: string;
    description: string;
    category: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    logo_path: string | null;
    slug: string;
}

interface Provider {
    id: string;
    name: string;
    email: string;
    business_profile: BusinessProfile;
}

interface Service {
    id: string;
    name: string;
    description: string;
    duration_minutes: number;
    price: string;
    status: string;
}

interface Booking {
    id: string;
    provider_id: string;
    service_id: string;
    client_id: string;
    client_name: string | null;
    client_email: string | null;
    start_time: string;
    end_time: string;
    status: string;
    price: string;
    payment_method?: 'online' | 'offline' | null;
    notes: string | null;
    cancelled_by: string | null;
    cancellation_reason: string | null;
    service_address_source?: string | null;
    service_address_label?: string | null;
    service_address?: string | null;
    service_address_city?: string | null;
    service_address_state?: string | null;
    provider: Provider;
    service: Service;
    services: Service[];
    escrow_status?: string | null;
    escrow_amount?: number | string | null;
    payment_released_at?: string | null;
    client_approved?: boolean | null;
    provider_approved?: boolean | null;
    created_at: string;
    updated_at: string;
    review?: any[];
    team_member?: {
        id: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        role: 'admin' | 'staff';
    } | null;
}

export default function BookingDetails({
    booking,
    hasFutureRecurrences = false,
}: {
    booking: Booking;
    hasFutureRecurrences?: boolean;
}) {
    const appointmentChangeCutoffHours = 12;
    const lateCancellationPenaltyPercent = 10;
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const startTime = new Date(booking.start_time);
    const now = new Date();
    const cutoffTimeFromNow = new Date(
        now.getTime() + appointmentChangeCutoffHours * 60 * 60 * 1000,
    );
    const isLateCancellation =
        startTime > now && startTime <= cutoffTimeFromNow;
    const canCancel =
        startTime > now &&
        booking.status !== 'cancelled' &&
        booking.status !== 'completed';
    const canReschedule =
        (booking.status === 'confirmed' || booking.status === 'pending') &&
        startTime > cutoffTimeFromNow;

    // Calculate total duration from all services
    const totalDuration =
        booking.services?.reduce((sum, s) => sum + s.duration_minutes, 0) ||
        booking.service?.duration_minutes ||
        0;

    // Check if appointment has passed
    const hasPassed = new Date(booking.end_time) < now;
    const canMarkComplete =
        ['confirmed', 'pending_completion'].includes(booking.status) &&
        hasPassed;

    const isEscrowHeld = booking.escrow_status === 'held';
    const isPaymentReleased = booking.escrow_status === 'released';
    const paymentStateLabel =
        booking.payment_method === 'offline'
            ? 'Unpaid'
            : booking.escrow_status
              ? formatStatus(booking.escrow_status)
              : 'Pending';

    const handleCancelBooking = () => {
        if (!canCancel) return;

        const confirmMsg = isLateCancellation
            ? `Cancelling less than ${appointmentChangeCutoffHours} hours before your appointment will result in a ${lateCancellationPenaltyPercent}% late cancellation fee. The rest will be refunded. Continue?`
            : 'Are you sure you want to cancel this booking? You will receive a full refund.';

        if (confirm(confirmMsg)) {
            setIsProcessing(true);
            router.post(
                `/appointments/${booking.id}/cancel`,
                {},
                {
                    onFinish: () => setIsProcessing(false),
                },
            );
        }
    };

    const handleCancelRemainingRecurrences = () => {
        if (!hasFutureRecurrences) return;

        if (
            confirm(
                'Cancel all future appointments in this series? You will keep completed appointments and receive refunds for any that haven’t happened yet.',
            )
        ) {
            setIsProcessing(true);
            router.post(
                `/appointments/${booking.id}/cancel-remaining-recurrences`,
                {},
                {
                    onFinish: () => setIsProcessing(false),
                },
            );
        }
    };

    const handleRescheduleBooking = () => {
        if (!canReschedule) return;
        router.visit(`/appointments/${booking.id}/edit`);
    };

    const handleComplete = (withReview: boolean) => {
        setIsProcessing(true);
        router.post(
            `/appointments/${booking.id}/complete`,
            {
                rating: withReview ? rating : null,
                comment: withReview ? comment : null,
            },
            {
                onSuccess: () => {
                    setIsCompleteModalOpen(false);
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleReport = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        router.post(
            `/appointments/${booking.id}/report`,
            {
                reason: reportReason,
                description: reportDescription,
            },
            {
                onSuccess: () => {
                    setIsReportModalOpen(false);
                    setReportReason('');
                    setReportDescription('');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return <CheckCircle2 className="h-5 w-5" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5" />;
            case 'pending':
                return <AlertCircle className="h-5 w-5" />;
            case 'completed':
                return <CheckCircle2 className="h-5 w-5" />;
            default:
                return <AlertCircle className="h-5 w-5" />;
        }
    };

    return (
        <GuestLayout>
            <Head
                title={`Booking - ${booking.services?.length > 0 ? booking.services[0].name : booking.service?.name || 'Appointment'}`}
            />

            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-background px-5 py-5 sm:px-7 sm:py-6">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%)]" />
                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                    <KeenIcon
                                        name="book-square"
                                        className="text-sm"
                                    />
                                    Your booking
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                        Booking Details
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">
                                            {
                                                booking.provider
                                                    .business_profile
                                                    .business_name
                                            }
                                        </span>
                                        <span className="hidden sm:inline">
                                            •
                                        </span>
                                        <span className="font-mono text-xs sm:text-sm">
                                            {booking.id}
                                        </span>
                                    </div>
                                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                        Track your appointment, manage changes,
                                        and keep an eye on payment and
                                        completion status from one place.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant={
                                            booking.payment_method === 'offline'
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                    >
                                        {paymentStateLabel}
                                    </Badge>
                                    <Badge
                                        variant={getStatusVariant(
                                            booking.status,
                                        )}
                                        className="flex items-center gap-2 px-4 py-1.5 text-sm"
                                    >
                                        {getStatusIcon(booking.status)}
                                        {formatStatus(booking.status)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
                                <div className="rounded-2xl border border-border/70 bg-background/90 p-4 backdrop-blur-sm">
                                    <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                        Date
                                    </div>
                                    <div className="mt-2 text-base font-semibold text-foreground">
                                        {formatDate(booking.start_time)}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatTime(booking.start_time)}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-background/90 p-4 backdrop-blur-sm">
                                    <div className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                        Total
                                    </div>
                                    <div className="mt-2 text-base font-semibold text-foreground">
                                        {formatPrice(booking.price)}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {totalDuration} minutes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content - Left Side */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Service & Provider Card */}
                        <Card className="overflow-hidden border-border/70">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-1 items-start gap-4">
                                        <div className="min-w-0 flex-1">
                                            <h2 className="truncate text-2xl font-bold tracking-tight">
                                                {booking.provider
                                                    .business_profile
                                                    .business_name ||
                                                    'Business Name'}
                                            </h2>
                                            <p className="mb-3 text-muted-foreground">
                                                by{' '}
                                                <span className="font-semibold text-foreground">
                                                    {booking.provider?.name}
                                                </span>
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs text-muted-foreground">
                                                    <KeenIcon
                                                        name="book-square"
                                                        className="text-sm"
                                                    />
                                                    {booking.services?.length ||
                                                        1}{' '}
                                                    service
                                                    {(booking.services
                                                        ?.length || 1) > 1
                                                        ? 's'
                                                        : ''}
                                                </div>
                                                {booking.team_member?.user && (
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs text-muted-foreground">
                                                        <KeenIcon
                                                            name="people"
                                                            className="text-sm"
                                                        />
                                                        {
                                                            booking.team_member
                                                                .user.name
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex-shrink-0 text-right">
                                        <div className="text-3xl font-bold">
                                            {formatPrice(booking.price)}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Total Price
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            {booking.services &&
                                booking.services.length > 0 && (
                                    <>
                                        <Separator />
                                        <CardContent className="px-6 pt-4">
                                            <h3 className="mb-4 text-sm font-bold tracking-widest text-muted-foreground uppercase">
                                                Booked Services (
                                                {booking.services.length})
                                            </h3>
                                            <div className="space-y-4">
                                                {booking.services.map(
                                                    (service) => (
                                                        <div
                                                            key={service.id}
                                                            className="flex items-start justify-between gap-4 rounded-xl border border-muted/50 bg-muted/30 p-3"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="text-base font-bold capitalize">
                                                                    {
                                                                        service.name
                                                                    }
                                                                </p>
                                                                {service.description && (
                                                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                                        {
                                                                            service.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex-shrink-0 text-right">
                                                                <p className="font-bold">
                                                                    {formatPrice(
                                                                        service.price,
                                                                    )}
                                                                </p>
                                                                <p className="mt-1 text-[10px] font-bold text-muted-foreground uppercase">
                                                                    {
                                                                        service.duration_minutes
                                                                    }{' '}
                                                                    MINS
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </CardContent>
                                    </>
                                )}

                            {(!booking.services ||
                                booking.services.length === 0) &&
                                booking.service?.description && (
                                    <>
                                        <Separator />
                                        <CardContent className="pt-4">
                                            <div className="flex gap-2">
                                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                <div>
                                                    <p className="mb-1 text-sm font-medium">
                                                        Service Description
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            booking.service
                                                                .description
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </>
                                )}
                        </Card>

                        {/* Appointment Details Card */}
                        <Card className="border-border/70">
                            <CardHeader>
                                <CardTitle>Appointment Details</CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {/* Date */}
                                    <div className="space-y-1">
                                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span className="font-medium">
                                                Date
                                            </span>
                                        </div>
                                        <p className="text-lg font-semibold">
                                            {formatDate(booking.start_time)}
                                        </p>
                                    </div>

                                    {/* Time */}
                                    <div className="space-y-1">
                                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span className="font-medium">
                                                Time
                                            </span>
                                        </div>
                                        <p className="text-lg font-semibold">
                                            {formatTime(booking.start_time)} -{' '}
                                            {formatTime(booking.end_time)}
                                        </p>
                                    </div>

                                    {/* Duration */}
                                    <div className="space-y-1">
                                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Timer className="h-4 w-4" />
                                            <span className="font-medium">
                                                Total Duration
                                            </span>
                                        </div>
                                        <p className="text-lg font-semibold">
                                            {totalDuration} minutes
                                        </p>
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-1">
                                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span className="font-medium">
                                                Location
                                            </span>
                                        </div>
                                        {booking.service_address ? (
                                            <p className="text-sm leading-relaxed font-medium">
                                                {booking.service_address}
                                                {(booking.service_address_city ||
                                                    booking.service_address_state) && (
                                                    <>
                                                        <br />
                                                        <span className="text-xs text-muted-foreground">
                                                            {[
                                                                booking.service_address_city,
                                                                booking.service_address_state,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(', ')}
                                                        </span>
                                                    </>
                                                )}
                                            </p>
                                        ) : (
                                            <p className="text-sm leading-relaxed font-medium">
                                                {
                                                    booking.provider
                                                        ?.business_profile
                                                        ?.address
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-1">
                                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            <span className="font-medium">
                                                Contact
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed font-medium">
                                            {
                                                booking.provider
                                                    .business_profile.phone
                                            }
                                        </p>
                                    </div>

                                    {booking.team_member?.user && (
                                        <div className="space-y-1">
                                            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                                <Star className="h-4 w-4" />
                                                <span className="font-medium">
                                                    Team Member
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed font-medium">
                                                {booking.team_member.user.name}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cancellation Details (if cancelled) */}
                        {booking.status === 'cancelled' &&
                            (booking.cancelled_by ||
                                booking.cancellation_reason) && (
                                <Card className="border-destructive/50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base text-destructive">
                                            <XCircle className="h-4 w-4" />
                                            Cancellation Details
                                        </CardTitle>
                                    </CardHeader>
                                    <Separator />
                                    <CardContent className="pt-4">
                                        <div className="space-y-3 text-sm">
                                            {booking.cancelled_by && (
                                                <div>
                                                    <span className="text-muted-foreground">
                                                        Cancelled by:{' '}
                                                    </span>
                                                    <span className="font-medium capitalize">
                                                        {booking.cancelled_by}
                                                    </span>
                                                </div>
                                            )}
                                            {booking.cancellation_reason && (
                                                <div>
                                                    <span className="mb-1 block text-muted-foreground">
                                                        Reason:
                                                    </span>
                                                    <p className="rounded-lg bg-muted/50 p-3 text-foreground">
                                                        {
                                                            booking.cancellation_reason
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Your payment has been refunded
                                                to your wallet if it was held in
                                                escrow.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                        {/* Notes Card (if exists) */}
                        {booking.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Special Notes
                                    </CardTitle>
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-4">
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                                        <p className="text-sm leading-relaxed">
                                            {booking.notes}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Payment Status Card */}
                        {(booking.escrow_status ||
                            booking.payment_method === 'offline') && (
                            <Card className="border-border/70">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Payment & Release
                                    </CardTitle>
                                </CardHeader>
                                <Separator />
                                <CardContent className="space-y-4 pt-4 text-sm">
                                    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                                        <div>
                                            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                                Payment state
                                            </p>
                                            <p className="mt-1 font-medium text-foreground capitalize">
                                                {booking.payment_method ===
                                                'offline'
                                                    ? 'unpaid'
                                                    : booking.escrow_status?.replace(
                                                          '_',
                                                          ' ',
                                                      )}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                booking.payment_method ===
                                                'offline'
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                        >
                                            {paymentStateLabel}
                                        </Badge>
                                    </div>
                                    {booking.payment_method === 'offline' ? (
                                        <p className="text-xs text-muted-foreground">
                                            This booking was sent without
                                            upfront payment. The provider still
                                            needs to review and confirm it.
                                        </p>
                                    ) : (
                                        booking.escrow_amount != null && (
                                            <p className="text-xs text-muted-foreground">
                                                Amount: ₦
                                                {Number(
                                                    booking.escrow_amount,
                                                ).toLocaleString()}
                                            </p>
                                        )
                                    )}
                                    {booking.payment_method !== 'offline' &&
                                        booking.payment_released_at && (
                                            <p className="text-xs text-muted-foreground">
                                                Released at:{' '}
                                                {formatDate(
                                                    booking.payment_released_at,
                                                )}
                                            </p>
                                        )}
                                    {booking.payment_method !== 'offline' &&
                                        !isPaymentReleased &&
                                        isEscrowHeld && (
                                            <p className="text-xs text-muted-foreground">
                                                Your payment is currently held
                                                in escrow. Once you mark the
                                                appointment as completed, it is
                                                released to the provider
                                                immediately. If you do nothing,
                                                it will be released
                                                automatically 15 minutes after
                                                the appointment end time.
                                            </p>
                                        )}
                                    {booking.payment_method !== 'offline' &&
                                        isPaymentReleased && (
                                            <p className="text-xs text-muted-foreground">
                                                Payment has been released to the
                                                provider.
                                            </p>
                                        )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Reviews Section - Only show for completed bookings */}
                        {booking.status === 'completed' && (
                            <Card className="border-border/70">
                                <CardHeader>
                                    <CardTitle>Your Review</CardTitle>
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-4">
                                    <ReviewSection
                                        reviews={booking.review || []}
                                        canReview={
                                            !booking.review ||
                                            booking.review.length === 0
                                        }
                                        pendingAppointmentId={booking.id}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Right Side */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Actions Card */}
                        {booking.status !== 'cancelled' &&
                            booking.status !== 'completed' && (
                                <Card className="border-border/70">
                                    <CardHeader>
                                        <div className="flex flex-col gap-2">
                                            <CardTitle className="text-base">
                                                Manage Booking
                                            </CardTitle>
                                            <div className="flex w-fit items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold tracking-tight text-amber-600 uppercase">
                                                <AlertCircle className="h-3 w-3" />
                                                <span>
                                                    Late cancellation (within{' '}
                                                    {
                                                        appointmentChangeCutoffHours
                                                    }
                                                    h):{' '}
                                                    {
                                                        lateCancellationPenaltyPercent
                                                    }
                                                    % fee applies
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                After the appointment ends, you
                                                can mark it as completed to
                                                release payment immediately to
                                                the provider. If you don&apos;t
                                                take any action, the payment
                                                will be released automatically
                                                15 minutes after the end time.
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <Separator />
                                    <CardContent className="space-y-3 pt-4">
                                        {/* Mark as Completed - Only if confirmed AND has passed */}
                                        {canMarkComplete && (
                                            <Dialog
                                                open={isCompleteModalOpen}
                                                onOpenChange={
                                                    setIsCompleteModalOpen
                                                }
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="default"
                                                        className="w-full justify-start bg-green-600 hover:bg-green-700"
                                                        disabled={isProcessing}
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Mark as Completed
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Complete Appointment
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            How was your
                                                            experience with{' '}
                                                            {
                                                                booking.provider
                                                                    .name
                                                            }
                                                            ? Leaving a review
                                                            helps others!
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="flex flex-col gap-2">
                                                            <Label htmlFor="rating">
                                                                Rating
                                                            </Label>
                                                            <div
                                                                className="flex gap-1"
                                                                role="group"
                                                                aria-label="Rating"
                                                            >
                                                                {[
                                                                    1, 2, 3, 4,
                                                                    5,
                                                                ].map(
                                                                    (star) => (
                                                                        <button
                                                                            key={
                                                                                star
                                                                            }
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setRating(
                                                                                    star,
                                                                                )
                                                                            }
                                                                            onKeyDown={(
                                                                                e,
                                                                            ) => {
                                                                                if (
                                                                                    e.key ===
                                                                                        'Enter' ||
                                                                                    e.key ===
                                                                                        ' '
                                                                                ) {
                                                                                    e.preventDefault();
                                                                                    setRating(
                                                                                        star,
                                                                                    );
                                                                                }
                                                                            }}
                                                                            className="rounded transition-transform focus:ring-2 focus:ring-primary focus:outline-none active:scale-95"
                                                                            aria-label={`Rate ${star} stars`}
                                                                            // aria-pressed={
                                                                            //     star <=
                                                                            //     rating
                                                                            // }
                                                                        >
                                                                            <Star
                                                                                className={`size-8 ${
                                                                                    star <=
                                                                                    rating
                                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                                        : 'text-muted-foreground/30'
                                                                                }`}
                                                                            />
                                                                        </button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Label htmlFor="comment">
                                                                Your Review
                                                                (Optional)
                                                            </Label>
                                                            <Textarea
                                                                id="comment"
                                                                placeholder="Share your experience..."
                                                                value={comment}
                                                                onChange={(e) =>
                                                                    setComment(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                rows={4}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleComplete(
                                                                    false,
                                                                )
                                                            }
                                                            disabled={
                                                                isProcessing
                                                            }
                                                        >
                                                            Skip & Complete
                                                        </Button>
                                                        <Button
                                                            onClick={() =>
                                                                handleComplete(
                                                                    true,
                                                                )
                                                            }
                                                            disabled={
                                                                isProcessing
                                                            }
                                                        >
                                                            {isProcessing && (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            )}
                                                            Submit & Complete
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}

                                        {/* Reschedule - Only for confirmed bookings and at least the cutoff window before start */}
                                        {canReschedule && (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={
                                                    handleRescheduleBooking
                                                }
                                                disabled={isProcessing}
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Reschedule Appointment
                                            </Button>
                                        )}

                                        {/* Cancel Remaining Recurrences - for recurring series with future appointments */}
                                        {hasFutureRecurrences && (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/20"
                                                onClick={
                                                    handleCancelRemainingRecurrences
                                                }
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                )}
                                                Cancel Remaining Recurrences
                                            </Button>
                                        )}

                                        {/* Cancel Booking */}
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                                                onClick={handleCancelBooking}
                                                disabled={
                                                    !canCancel || isProcessing
                                                }
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                )}
                                                Cancel Booking
                                            </Button>
                                            {!canCancel &&
                                                booking.status !==
                                                    'cancelled' &&
                                                booking.status !==
                                                    'completed' && (
                                                    <p className="px-2 text-[10px] font-medium text-destructive">
                                                        This appointment has
                                                        already started or
                                                        passed and cannot be
                                                        cancelled.
                                                    </p>
                                                )}
                                        </div>

                                        {/* Report Issue Button */}
                                        <Dialog
                                            open={isReportModalOpen}
                                            onOpenChange={setIsReportModalOpen}
                                        >
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                                                    disabled={isProcessing}
                                                >
                                                    <AlertCircle className="mr-2 h-4 w-4" />
                                                    Report an Issue
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <form onSubmit={handleReport}>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Report an Issue
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Please describe the
                                                            issue you
                                                            encountered with
                                                            this appointment.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="flex flex-col gap-2">
                                                            <Label htmlFor="reason">
                                                                Reason *
                                                            </Label>
                                                            <select
                                                                title="reason"
                                                                id="reason"
                                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                                value={
                                                                    reportReason
                                                                }
                                                                onChange={(e) =>
                                                                    setReportReason(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                required
                                                            >
                                                                <option value="">
                                                                    Select a
                                                                    reason
                                                                </option>
                                                                <option value="no-show">
                                                                    Provider did
                                                                    not show up
                                                                </option>
                                                                <option value="poor-service">
                                                                    Poor service
                                                                    quality
                                                                </option>
                                                                <option value="incorrect-price">
                                                                    Incorrect
                                                                    pricing
                                                                    charged
                                                                </option>
                                                                <option value="unprofessional">
                                                                    Unprofessional
                                                                    behavior
                                                                </option>
                                                                <option value="safety-concern">
                                                                    Safety
                                                                    concern
                                                                </option>
                                                                <option value="other">
                                                                    Other
                                                                </option>
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Label htmlFor="description">
                                                                Details *
                                                            </Label>
                                                            <Textarea
                                                                id="description"
                                                                placeholder="Provide more details about the issue..."
                                                                value={
                                                                    reportDescription
                                                                }
                                                                onChange={(e) =>
                                                                    setReportDescription(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                required
                                                                rows={5}
                                                                minLength={20}
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                Minimum 20
                                                                characters
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setIsReportModalOpen(
                                                                    false,
                                                                )
                                                            }
                                                            disabled={
                                                                isProcessing
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            disabled={
                                                                isProcessing
                                                            }
                                                        >
                                                            {isProcessing && (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            )}
                                                            Submit Report
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>
                            )}

                        {/* Contact Information Card */}
                        <Card className="border-border/70">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="space-y-4 pt-4">
                                {booking.provider?.business_profile?.phone && (
                                    <ContactItem
                                        icon={Phone}
                                        label="Phone"
                                        value={
                                            booking.provider.business_profile
                                                .phone
                                        }
                                        href={`tel:${booking.provider.business_profile.phone}`}
                                    />
                                )}

                                {booking.provider?.email && (
                                    <ContactItem
                                        icon={Mail}
                                        label="Email"
                                        value={booking.provider.email}
                                        href={`mailto:${booking.provider.email}`}
                                    />
                                )}

                                {(booking.service_address ||
                                    booking.provider?.business_profile
                                        ?.address) && (
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="mb-1 text-xs text-muted-foreground">
                                                {booking.service_address
                                                    ? 'Service address'
                                                    : 'Provider address'}
                                            </p>
                                            {booking.service_address ? (
                                                <>
                                                    <p className="text-sm leading-relaxed font-medium">
                                                        {
                                                            booking.service_address
                                                        }
                                                    </p>
                                                    {(booking.service_address_city ||
                                                        booking.service_address_state) && (
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {[
                                                                booking.service_address_city,
                                                                booking.service_address_state,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(', ')}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm leading-relaxed font-medium">
                                                        {
                                                            booking.provider
                                                                .business_profile
                                                                .address
                                                        }
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {
                                                            booking.provider
                                                                .business_profile
                                                                .city
                                                        }
                                                        ,{' '}
                                                        {
                                                            booking.provider
                                                                .business_profile
                                                                .state
                                                        }{' '}
                                                        {
                                                            booking.provider
                                                                .business_profile
                                                                .zip_code
                                                        }
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Booking Info Card */}
                        <Card className="border-border/70">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Booking Information
                                </CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="space-y-3 pt-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Booked on
                                    </span>
                                    <span className="font-medium">
                                        {formatDate(booking.created_at)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Last updated
                                    </span>
                                    <span className="font-medium">
                                        {formatDate(booking.updated_at)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Category
                                    </span>
                                    <span className="font-medium capitalize">
                                        {
                                            booking.provider?.business_profile
                                                ?.category
                                        }
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
