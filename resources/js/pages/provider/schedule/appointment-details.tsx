import KeenIcon from '@/components/keen-icon';
import { AppSelect } from '@/components/ui/app-select';
import { Button } from '@/components/ui/button';
import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatStatus } from '@/lib/utils';
import business from '@/routes/business';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface Service {
    id: string;
    name: string;
    price: string;
    duration_minutes?: number;
}

interface AppointmentDetails {
    id: string;
    client_name: string;
    email: string;
    services: Service[];
    start_time: string;
    end_time: string;
    status: string;
    price: string;
    payment_method?: 'online' | 'offline' | null;
    notes: string | null;
    created_at: string;
    escrow_status?: string | null;
    escrow_amount?: string | number | null;
    payment_released_at?: string | null;
    platform_fee_percent?: string | number | null;
    platform_fee_amount?: string | number | null;
    provider_payout_amount?: string | number | null;
    cancelled_by?: string | null;
    cancellation_reason?: string | null;
    location?: string | null;
    service_location_source?: string | null;
    service_location_label?: string | null;
    service_location?: string | null;
    location_phone?: string | null;
    total_duration_minutes?: number;
    team_member?: {
        id: string;
        name: string;
        email: string;
        role: 'admin' | 'staff';
    } | null;
}

function InfoTile({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <div className="flex flex-col gap-1 rounded-[14px] bg-muted/60 p-3.5">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <KeenIcon name={icon} className="text-sm" />
                {label}
            </span>
            <span className="text-[15px] font-bold text-foreground">
                {value}
            </span>
        </div>
    );
}

export default function AppointmentDetailsPage({
    appointment,
    canCancel,
    canComplete,
    canReportClient,
    waitingForClientApproval,
}: {
    appointment: AppointmentDetails;
    canCancel: boolean;
    canComplete: boolean;
    canReportClient: boolean;
    waitingForClientApproval: boolean;
}) {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const [completeDialogOpen, setCompleteDialogOpen] = React.useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
    const [cancelReason, setCancelReason] = React.useState('');
    const [reportDialogOpen, setReportDialogOpen] = React.useState(false);
    const [reportReason, setReportReason] = React.useState('');
    const [reportDescription, setReportDescription] = React.useState('');

    const isEscrowHeld = appointment.escrow_status === 'held';
    const isPaymentReleased = appointment.escrow_status === 'released';
    const paymentStateLabel =
        appointment.payment_method === 'offline'
            ? 'Unpaid'
            : appointment.escrow_status
              ? formatStatus(appointment.escrow_status)
              : 'Pending';

    const feePercent =
        appointment.platform_fee_percent !== undefined &&
        appointment.platform_fee_percent !== null
            ? Number(appointment.platform_fee_percent)
            : null;
    const feeAmount =
        appointment.platform_fee_amount !== undefined &&
        appointment.platform_fee_amount !== null
            ? Number(appointment.platform_fee_amount)
            : null;
    const payoutAmount =
        appointment.provider_payout_amount !== undefined &&
        appointment.provider_payout_amount !== null
            ? Number(appointment.provider_payout_amount)
            : null;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: business.dashboard().url },
        { title: 'Schedule', href: '/schedule/appointments' },
        { title: appointment.client_name, href: '' },
    ];

    const totalDuration =
        appointment.total_duration_minutes ??
        appointment.services?.reduce(
            (sum, s) => sum + (s.duration_minutes || 0),
            0,
        ) ??
        0;
    const showConfirmAction = appointment.status === 'pending';
    const showWaitingForClientState = canComplete && waitingForClientApproval;
    const showCompleteAction = canComplete && !waitingForClientApproval;
    const showCancelAction =
        appointment.status !== 'cancelled' &&
        appointment.status !== 'completed';
    const showReportAction =
        appointment.status !== 'cancelled' &&
        appointment.status !== 'completed' &&
        canReportClient;
    const hasAnyAction =
        showConfirmAction ||
        showWaitingForClientState ||
        showCompleteAction ||
        showCancelAction ||
        showReportAction;

    const handleConfirm = () => {
        setConfirmDialogOpen(true);
    };

    const submitConfirm = () => {
        setIsProcessing(true);
        router.post(
            `/provider/appointments/${appointment.id}/confirm`,
            {},
            { onFinish: () => setIsProcessing(false) },
        );
    };

    const handleComplete = () => {
        setCompleteDialogOpen(true);
    };

    const submitComplete = () => {
        setIsProcessing(true);
        router.post(
            `/provider/appointments/${appointment.id}/complete`,
            {},
            { onFinish: () => setIsProcessing(false) },
        );
    };

    const handleCancel = () => {
        setCancelReason('');
        setCancelDialogOpen(true);
    };

    const submitCancel = () => {
        if (!cancelReason.trim()) return;
        setIsProcessing(true);
        router.post(
            `/provider/appointments/${appointment.id}/cancel`,
            { reason: cancelReason.trim() },
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setCancelDialogOpen(false);
                },
            },
        );
    };

    const handleReport = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !reportReason ||
            !reportDescription.trim() ||
            reportDescription.trim().length < 20
        )
            return;
        setIsProcessing(true);
        router.post(
            `/provider/appointments/${appointment.id}/report`,
            {
                reason: reportReason,
                description: reportDescription.trim(),
            },
            {
                onSuccess: () => {
                    setReportDialogOpen(false);
                    setReportReason('');
                    setReportDescription('');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const statusPill: Record<string, string> = {
        pending:
            'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
        confirmed:
            'bg-[#E6F4EC] text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]',
        pending_completion: 'bg-[#0E3B2E] text-[#C8F169]',
        completed: 'bg-muted text-muted-foreground',
        cancelled:
            'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    };

    const card =
        'rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10';
    const initials = appointment.client_name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
    const isOffline = appointment.payment_method === 'offline';
    const isConfirmedOrLater = [
        'confirmed',
        'pending_completion',
        'completed',
    ].includes(appointment.status);
    const isServiceDone = ['pending_completion', 'completed'].includes(
        appointment.status,
    );

    type StepState = 'done' | 'now' | 'todo';
    const timeline: { title: string; detail: string; state: StepState }[] =
        appointment.status === 'cancelled'
            ? [
                  {
                      title: 'Booked',
                      detail: appointment.created_at,
                      state: 'done',
                  },
                  {
                      title: `Cancelled${appointment.cancelled_by ? ` by ${appointment.cancelled_by}` : ''}`,
                      detail:
                          appointment.cancellation_reason || 'No reason given',
                      state: 'now',
                  },
              ]
            : [
                  {
                      title: isOffline ? 'Booked' : 'Booked & paid',
                      detail: appointment.created_at,
                      state: 'done',
                  },
                  {
                      title:
                          appointment.status === 'pending'
                              ? 'Waiting for you to confirm'
                              : 'Confirmed',
                      detail:
                          appointment.status === 'pending'
                              ? 'Now'
                              : 'You accepted the booking',
                      state: appointment.status === 'pending' ? 'now' : 'done',
                  },
                  {
                      title: 'Service day',
                      detail: appointment.start_time,
                      state: isServiceDone
                          ? 'done'
                          : isConfirmedOrLater
                            ? 'now'
                            : 'todo',
                  },
                  {
                      title: 'Marked complete',
                      detail:
                          appointment.status === 'pending_completion'
                              ? 'Waiting for the client to confirm'
                              : 'You and the client confirm',
                      state:
                          appointment.status === 'completed'
                              ? 'done'
                              : appointment.status === 'pending_completion'
                                ? 'now'
                                : 'todo',
                  },
                  {
                      title: isOffline ? 'Paid on site' : 'Payout released',
                      detail:
                          isPaymentReleased && appointment.payment_released_at
                              ? appointment.payment_released_at
                              : 'To your wallet',
                      state: isPaymentReleased ? 'done' : 'todo',
                  },
              ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Appointment - ${appointment.client_name}`} />

            <div className="flex flex-col gap-[22px] p-4 md:p-6">
                <Link
                    href="/schedule/appointments"
                    className="flex w-fit items-center gap-1.5 text-[13px] font-bold text-[#0E3B2E] dark:text-[#C8F169]"
                    prefetch
                >
                    <KeenIcon name="arrow-left" className="text-sm" />
                    Appointments
                </Link>

                <header className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-[1_1_300px] flex-col gap-1">
                        <span className="text-[13px] text-muted-foreground">
                            Booking #
                            {String(appointment.id).slice(0, 8).toUpperCase()}
                        </span>
                        <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground capitalize">
                            {appointment.services[0]?.name ?? 'Appointment'}
                            {appointment.services.length > 1 &&
                                ` +${appointment.services.length - 1}`}
                        </h1>
                        <span className="text-sm text-muted-foreground">
                            Booked on {appointment.created_at}
                        </span>
                    </div>
                    <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusPill[appointment.status] ?? 'bg-muted text-muted-foreground'}`}
                    >
                        {formatStatus(appointment.status)}
                    </span>
                </header>

                <div className="flex flex-wrap items-start gap-6">
                    <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
                        {/* Client */}
                        <section
                            className={`${card} flex flex-wrap items-center gap-4 p-[22px]`}
                        >
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#E6F4EC] font-[Sora] text-lg font-bold text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                {initials}
                            </div>
                            <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
                                <span className="truncate font-[Sora] text-lg font-semibold text-foreground">
                                    {appointment.client_name}
                                </span>
                                <span className="truncate text-[13px] text-muted-foreground">
                                    {[
                                        appointment.email,
                                        appointment.location_phone,
                                    ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </span>
                            </div>
                            {appointment.email && (
                                <a
                                    href={`mailto:${appointment.email}`}
                                    aria-label="Email client"
                                    className="flex size-11 items-center justify-center rounded-xl border border-[#0E3B2E]/12 text-[#0E3B2E] hover:bg-muted dark:border-white/15 dark:text-[#C8F169]"
                                >
                                    <KeenIcon name="sms" className="text-xl" />
                                </a>
                            )}
                            {appointment.location_phone && (
                                <a
                                    href={`tel:${appointment.location_phone}`}
                                    aria-label="Call client"
                                    className="flex size-11 items-center justify-center rounded-xl border border-[#0E3B2E]/12 text-[#0E3B2E] hover:bg-muted dark:border-white/15 dark:text-[#C8F169]"
                                >
                                    <KeenIcon
                                        name="phone"
                                        className="text-xl"
                                    />
                                </a>
                            )}
                        </section>

                        {/* When & where */}
                        <section
                            className={`${card} flex flex-col gap-3.5 p-[22px]`}
                        >
                            <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                                When &amp; where
                            </h2>
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
                                <InfoTile
                                    icon="calendar"
                                    label="Starts"
                                    value={appointment.start_time}
                                />
                                <InfoTile
                                    icon="time"
                                    label="Ends"
                                    value={appointment.end_time}
                                />
                                {totalDuration > 0 && (
                                    <InfoTile
                                        icon="electronic-clock"
                                        label="Duration"
                                        value={`${totalDuration} minutes`}
                                    />
                                )}
                                <InfoTile
                                    icon="people"
                                    label="Staff"
                                    value={
                                        appointment.team_member?.name ?? 'You'
                                    }
                                />
                            </div>
                            {(appointment.service_location ||
                                appointment.location) && (
                                <div className="flex gap-3 rounded-[14px] border border-[#0E3B2E]/10 p-3.5 dark:border-white/10">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EC] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                        <KeenIcon
                                            name="geolocation"
                                            className="text-xl"
                                        />
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                        <span className="text-xs font-bold tracking-[0.06em] text-[#2F7D4F] uppercase dark:text-[#C8F169]">
                                            {appointment.service_location_label ||
                                                'Location'}
                                        </span>
                                        <span className="text-sm font-bold text-foreground">
                                            {appointment.service_location ||
                                                appointment.location}
                                        </span>
                                        {appointment.location_phone && (
                                            <span className="text-xs text-muted-foreground">
                                                Contact:{' '}
                                                {appointment.location_phone}
                                            </span>
                                        )}
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.service_location || appointment.location || '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="self-center text-[13px] font-bold whitespace-nowrap text-[#0E3B2E] dark:text-[#C8F169]"
                                    >
                                        Directions →
                                    </a>
                                </div>
                            )}
                        </section>

                        {/* Services & payment */}
                        <section
                            className={`${card} flex flex-col gap-3 p-[22px]`}
                        >
                            <h2 className="font-[Sora] text-lg font-semibold text-foreground">
                                Services &amp; payment
                            </h2>
                            {appointment.services.map((service) => (
                                <div
                                    key={service.id}
                                    className="flex justify-between gap-3 text-sm"
                                >
                                    <span className="text-muted-foreground capitalize">
                                        {service.name}
                                        {service.duration_minutes
                                            ? ` · ${service.duration_minutes} min`
                                            : ''}
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {service.price}
                                    </span>
                                </div>
                            ))}
                            <div className="h-px bg-[#0E3B2E]/[0.08] dark:bg-white/10" />
                            <div className="flex justify-between text-sm font-bold text-foreground">
                                <span>
                                    {isOffline
                                        ? 'Total (pay on site)'
                                        : 'Total paid by client'}
                                </span>
                                <span>{appointment.price}</span>
                            </div>
                            {feeAmount !== null && (
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>
                                        Platform fee
                                        {feePercent !== null
                                            ? ` (${feePercent}%)`
                                            : ''}
                                    </span>
                                    <span>– ₦{feeAmount.toLocaleString()}</span>
                                </div>
                            )}
                            {payoutAmount !== null && (
                                <div className="flex items-baseline justify-between rounded-[14px] bg-[#0E3B2E] p-3.5 text-white">
                                    <span className="text-sm font-bold">
                                        Your payout
                                    </span>
                                    <span className="font-[Sora] text-[22px] font-bold text-[#C8F169]">
                                        ₦{payoutAmount.toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-start gap-2.5 text-[13px] leading-normal text-muted-foreground">
                                <KeenIcon
                                    name="shield-tick"
                                    className="mt-0.5 text-lg text-[#1F6B43] dark:text-[#C8F169]"
                                />
                                <span>
                                    {isOffline
                                        ? 'Booked without upfront payment. The client pays you on site.'
                                        : isPaymentReleased
                                          ? `Payment released to your wallet${appointment.payment_released_at ? ` on ${appointment.payment_released_at}` : ''}.`
                                          : isEscrowHeld
                                            ? 'Paid online and held safely. It’s released when the client confirms, or automatically 15 minutes after the end time.'
                                            : `Payment status: ${paymentStateLabel}.`}
                                </span>
                            </div>
                        </section>

                        {/* Note */}
                        <section className={`${card} flex gap-3 p-[22px]`}>
                            <KeenIcon
                                name="note-2"
                                className="text-xl text-muted-foreground"
                            />
                            <div className="flex flex-col gap-1">
                                <span className="text-[13px] font-bold text-muted-foreground">
                                    Client note
                                </span>
                                <span className="text-[15px] leading-relaxed text-foreground">
                                    {appointment.notes ||
                                        'No note from the client.'}
                                </span>
                            </div>
                        </section>
                    </div>

                    {/* Side column */}
                    <div className="flex max-w-[380px] flex-[1_1_320px] flex-col gap-4">
                        {hasAnyAction && (
                            <section
                                className={`${card} flex flex-col gap-2.5 p-5`}
                            >
                                <span className="font-[Sora] text-base font-semibold text-foreground">
                                    Next step
                                </span>
                                {showConfirmAction && (
                                    <>
                                        <span className="text-[13px] leading-normal text-muted-foreground">
                                            Accept the booking so the client
                                            knows you’re coming.
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleConfirm}
                                            disabled={isProcessing}
                                            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] text-[15px] font-bold text-white hover:bg-[#0E3B2E]/90 disabled:opacity-70 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <KeenIcon
                                                    name="check-circle"
                                                    className="text-lg"
                                                />
                                            )}
                                            Accept booking
                                        </button>
                                    </>
                                )}
                                {showWaitingForClientState && (
                                    <div className="flex gap-2.5 rounded-[14px] bg-muted/60 p-3.5 text-[13px] leading-normal text-muted-foreground">
                                        <KeenIcon
                                            name="information-2"
                                            className="mt-0.5 text-lg text-[#0E3B2E] dark:text-[#C8F169]"
                                        />
                                        <span>
                                            <b className="text-foreground">
                                                Waiting for the client.
                                            </b>{' '}
                                            Payment is released when they
                                            confirm, or automatically 15 minutes
                                            after the end time.
                                        </span>
                                    </div>
                                )}
                                {showCompleteAction && (
                                    <button
                                        type="button"
                                        onClick={handleComplete}
                                        disabled={isProcessing}
                                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] text-[15px] font-bold text-white hover:bg-[#0E3B2E]/90 disabled:opacity-70 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <KeenIcon
                                                name="check-circle"
                                                className="text-lg"
                                            />
                                        )}
                                        Mark as completed
                                    </button>
                                )}
                                {(appointment.email || showCancelAction) && (
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {appointment.email ? (
                                            <a
                                                href={`mailto:${appointment.email}`}
                                                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#0E3B2E]/15 text-sm font-bold text-foreground hover:bg-muted dark:border-white/15"
                                            >
                                                <KeenIcon
                                                    name="sms"
                                                    className="text-base"
                                                />
                                                Message
                                            </a>
                                        ) : (
                                            <span />
                                        )}
                                        {showCancelAction && (
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                disabled={
                                                    isProcessing || !canCancel
                                                }
                                                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-red-200 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                                            >
                                                <KeenIcon
                                                    name="cross-circle"
                                                    className="text-base"
                                                />
                                                {appointment.status ===
                                                'pending'
                                                    ? 'Decline'
                                                    : 'Cancel'}
                                            </button>
                                        )}
                                    </div>
                                )}
                                {showReportAction && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setReportDialogOpen(true)
                                        }
                                        disabled={isProcessing}
                                        className="self-center pt-1 text-xs font-bold text-muted-foreground hover:text-foreground"
                                    >
                                        Report this client
                                    </button>
                                )}
                            </section>
                        )}

                        <section className={`${card} flex flex-col gap-3 p-5`}>
                            <span className="font-[Sora] text-base font-semibold text-foreground">
                                Booking timeline
                            </span>
                            <ol>
                                {timeline.map((step, index) => (
                                    <li key={step.title} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <span
                                                className={
                                                    step.state === 'done'
                                                        ? 'size-3.5 rounded-full bg-[#0E3B2E] dark:bg-[#C8F169]'
                                                        : step.state === 'now'
                                                          ? 'size-3.5 rounded-full bg-[#C8F169] ring-4 ring-[#C8F169]/30'
                                                          : 'size-3.5 rounded-full border-2 border-[#A9C7B8] bg-card'
                                                }
                                            />
                                            {index < timeline.length - 1 && (
                                                <span className="min-h-[26px] w-0.5 flex-1 bg-[#E1E8E4] dark:bg-white/10" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-0.5 pb-3.5">
                                            <span
                                                className={
                                                    step.state === 'todo'
                                                        ? 'text-sm font-bold text-muted-foreground'
                                                        : 'text-sm font-bold text-foreground'
                                                }
                                            >
                                                {step.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {step.detail}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    </div>
                </div>
            </div>

            {/* Confirm Appointment Dialog */}
            <CustomAlertDialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
                icon={
                    <KeenIcon
                        name="verify"
                        className="text-5xl text-green-500"
                    />
                }
                title="Accept Booking"
                description="Are you sure you want to confirm this appointment? The client will be notified."
                acceptLabel="Accept"
                rejectLabel="Cancel"
                onAccept={submitConfirm}
                acceptVariant="default"
            />

            {/* Mark Complete Dialog */}
            <CustomAlertDialog
                open={completeDialogOpen}
                onOpenChange={setCompleteDialogOpen}
                icon={
                    <KeenIcon
                        name="verify"
                        className="text-5xl text-green-500"
                    />
                }
                title="Mark as Completed"
                description="Mark this appointment as completed? This records that you have delivered the service. Payment is released when the client marks it as completed or automatically 15 minutes after the appointment end time."
                acceptLabel="Mark Complete"
                rejectLabel="Cancel"
                onAccept={submitComplete}
                acceptVariant="default"
            />

            {/* Report Client Dialog */}
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleReport}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <KeenIcon
                                    name="information"
                                    className="text-base text-amber-500"
                                />
                                Report Client
                            </DialogTitle>
                            <DialogDescription>
                                Report an issue with {appointment.client_name}.
                                Our team will review and take appropriate
                                action.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="report-reason">Reason *</Label>
                                <AppSelect
                                    id="report-reason"
                                    value={reportReason}
                                    onChange={setReportReason}
                                    placeholder="Select a reason"
                                    required
                                    searchable={false}
                                    options={[
                                        {
                                            value: 'no-show',
                                            label: 'Client did not show up',
                                        },
                                        {
                                            value: 'abusive-behavior',
                                            label: 'Abusive or disrespectful behavior',
                                        },
                                        {
                                            value: 'false-claim',
                                            label: 'False claim or dispute',
                                        },
                                        {
                                            value: 'payment-dispute',
                                            label: 'Payment or refund dispute',
                                        },
                                        {
                                            value: 'unprofessional',
                                            label: 'Unprofessional conduct',
                                        },
                                        {
                                            value: 'safety-concern',
                                            label: 'Safety concern',
                                        },
                                        { value: 'other', label: 'Other' },
                                    ]}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="report-description">
                                    Details *
                                </Label>
                                <Textarea
                                    id="report-description"
                                    placeholder="Provide details about the issue (minimum 20 characters)..."
                                    value={reportDescription}
                                    onChange={(e) =>
                                        setReportDescription(e.target.value)
                                    }
                                    required
                                    rows={5}
                                    minLength={20}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Minimum 20 characters
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setReportDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    !reportReason ||
                                    !reportDescription.trim() ||
                                    reportDescription.trim().length < 20 ||
                                    isProcessing
                                }
                            >
                                {isProcessing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Submit Report
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Cancel Appointment Dialog - requires reason */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeenIcon
                                name="trash-square"
                                className="text-base text-destructive"
                            />
                            {appointment.status === 'pending'
                                ? 'Reject Booking'
                                : 'Cancel Appointment'}
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for cancellation. The client
                            will be notified
                            {appointment.payment_method === 'offline'
                                ? '.'
                                : ' and their payment will be refunded.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cancel-reason">Reason *</Label>
                            <Textarea
                                id="cancel-reason"
                                placeholder="e.g. Unavailable at scheduled time, schedule conflict..."
                                value={cancelReason}
                                onChange={(e) =>
                                    setCancelReason(e.target.value)
                                }
                                rows={4}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(false)}
                        >
                            Keep Appointment
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={submitCancel}
                            disabled={!cancelReason.trim() || isProcessing}
                        >
                            {isProcessing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
