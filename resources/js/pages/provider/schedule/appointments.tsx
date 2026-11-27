import KeenIcon from '@/components/keen-icon';
import {
    EmptyState,
    EmptyStateCompact,
    emptyStateCompactActionClassName,
    emptyStatePrimaryActionClassName,
} from '@/components/site/empty-state';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useDebouncedAppointmentSearch } from '@/hooks/use-debounce-appointment-search';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import business from '@/routes/business';
import schedule from '@/routes/schedule';
import { Appointment, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    format,
    isPast,
    isToday,
    isTomorrow,
    isYesterday,
    parseISO,
} from 'date-fns';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: business.dashboard().url,
    },
    {
        title: 'Schedule',
        href: '/schedule',
    },
    {
        title: 'Appointments',
        href: '/schedule/appointments',
    },
];

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AppointmentListProps {
    appointments: {
        data: Appointment[];
        links: PaginationLink[];
        from?: number | null;
        to?: number | null;
        total?: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
    statusCounts?: Record<StatusTab, number>;
}

type StatusTab = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

const statusTabs: { value: StatusTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const statusStyles: Record<string, string> = {
    pending:
        'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    confirmed:
        'bg-[#E6F4EC] text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]',
    completed: 'bg-muted text-muted-foreground',
    pending_completion: 'bg-[#0E3B2E] text-[#C8F169]',
    cancelled: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

const naira = (value: number | string) =>
    `₦${Math.round(Number(value) || 0).toLocaleString()}`;

const formatStatus = (status: string) =>
    status.replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());

const initials = (name: string) =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

const dayHeading = (date: Date) => {
    if (isToday(date)) {
        return `Today · ${format(date, 'EEE d MMM')}`;
    }

    if (isTomorrow(date)) {
        return `Tomorrow · ${format(date, 'EEE d MMM')}`;
    }

    if (isYesterday(date)) {
        return `Yesterday · ${format(date, 'EEE d MMM')}`;
    }

    return format(date, 'EEE d MMM yyyy');
};

const paymentState = (appointment: Appointment) => {
    if (appointment.payment_method === 'offline') {
        return {
            label: 'Pay on site',
            className: 'bg-muted text-muted-foreground',
        };
    }

    switch (appointment.escrow_status) {
        case 'released':
            return {
                label: 'Paid out',
                className: 'bg-[#0E3B2E] text-[#C8F169]',
            };
        case 'held':
            return {
                label: 'Paid',
                className:
                    'bg-[#E6F4EC] text-[#1F6B43] dark:bg-[#0E3B2E] dark:text-[#C8F169]',
            };
        case 'refunded':
            return {
                label: 'Refunded',
                className: 'bg-muted text-muted-foreground',
            };
        case 'forfeited':
            return {
                label: 'Forfeited',
                className:
                    'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
            };
        default:
            return {
                label: 'Unpaid',
                className:
                    'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
            };
    }
};

const clientName = (appointment: Appointment) =>
    appointment.client?.name || appointment.client_name || 'Guest client';

const canCancel = (appointment: Appointment) =>
    !['cancelled', 'completed'].includes(appointment.status) &&
    !isPast(parseISO(appointment.start_time));

const cardClass =
    'rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10';

function Pill({
    className,
    children,
}: {
    className: string;
    children: React.ReactNode;
}) {
    return (
        <span
            className={cn(
                'rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
                className,
            )}
        >
            {children}
        </span>
    );
}

export default function Appointments({
    appointments,
    filters,
    statusCounts,
}: AppointmentListProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<StatusTab>(
        (filters.status as StatusTab) || 'all',
    );
    const [selectedId, setSelectedId] = useState<string | undefined>(
        appointments.data[0]?.id,
    );
    const [declineTarget, setDeclineTarget] = useState<Appointment | null>(
        null,
    );
    const [declineReason, setDeclineReason] = useState('');
    const searchAppointments = useDebouncedAppointmentSearch(statusFilter);

    const selected =
        appointments.data.find(
            (appointment) => appointment.id === selectedId,
        ) ?? appointments.data[0];

    const groupedByDay = useMemo(() => {
        const groups: { key: string; date: Date; items: Appointment[] }[] = [];

        appointments.data.forEach((appointment) => {
            const date = parseISO(appointment.start_time);
            const key = format(date, 'yyyy-MM-dd');
            const group = groups.find((existing) => existing.key === key);

            if (group) {
                group.items.push(appointment);
            } else {
                groups.push({ key, date, items: [appointment] });
            }
        });

        return groups;
    }, [appointments.data]);

    const hasSearch = Boolean(searchTerm.trim());
    const isFilteredView = statusFilter !== 'all' || hasSearch;
    const totalAppointments = appointments.total ?? 0;
    const listIsEmpty = groupedByDay.length === 0;

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        searchAppointments(value);
    };

    const handleStatusChange = (value: StatusTab) => {
        setStatusFilter(value);
        router.get(
            '/schedule/appointments',
            {
                search: searchTerm || undefined,
                status: value !== 'all' ? value : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const confirmAppointment = (appointment: Appointment) => {
        router.post(
            `/provider/appointments/${appointment.id}/confirm`,
            { return_back: true },
            { preserveScroll: true },
        );
    };

    const submitDecline = () => {
        if (!declineTarget || !declineReason.trim()) {
            return;
        }

        router.post(
            `/provider/appointments/${declineTarget.id}/cancel`,
            { reason: declineReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeclineTarget(null);
                    setDeclineReason('');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointments" />

            <div className="flex flex-col gap-[22px] p-4 md:p-6">
                {/* Header */}
                <header className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-[1_1_300px] flex-col gap-1">
                        <span className="text-[13px] text-muted-foreground">
                            Schedule
                        </span>
                        <h1 className="font-[Sora] text-[28px] font-bold tracking-[-0.02em] text-foreground">
                            Appointments
                        </h1>
                        <span className="text-sm text-muted-foreground">
                            Confirm requests, track payments and keep your day
                            on time.
                        </span>
                    </div>
                    <Link
                        href={schedule.calender.index()}
                        className="flex h-11 items-center gap-2 rounded-xl border border-[#0E3B2E]/15 bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted dark:border-white/15"
                        prefetch
                    >
                        <KeenIcon name="calendar-tick" className="text-lg" />
                        Calendar view
                    </Link>
                </header>

                {/* Filters */}
                <div
                    className={cn(
                        cardClass,
                        'flex flex-wrap items-center gap-3 rounded-2xl p-1.5',
                    )}
                >
                    <div
                        role="tablist"
                        aria-label="Filter by status"
                        className="flex flex-auto flex-wrap gap-1"
                    >
                        {statusTabs.map((tab) => {
                            const isActive = statusFilter === tab.value;
                            const count = statusCounts?.[tab.value];

                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() =>
                                        handleStatusChange(tab.value)
                                    }
                                    className={cn(
                                        'flex h-10 items-center gap-2 rounded-[10px] px-3.5 text-sm font-bold transition-colors',
                                        isActive
                                            ? 'bg-[#0E3B2E] text-white dark:bg-[#C8F169] dark:text-[#0E3B2E]'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    {tab.label}
                                    {count !== undefined && (
                                        <span
                                            className={cn(
                                                'rounded-full px-[7px] py-px text-[11px]',
                                                isActive ||
                                                    (tab.value === 'pending' &&
                                                        count > 0)
                                                    ? 'bg-[#C8F169] text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]'
                                                    : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <label className="flex h-10 flex-[0_1_260px] items-center gap-2.5 rounded-[10px] bg-muted px-3 text-muted-foreground">
                        <KeenIcon name="magnifier" className="text-base" />
                        <input
                            type="search"
                            aria-label="Search clients"
                            placeholder="Search clients…"
                            value={searchTerm}
                            onChange={(event) =>
                                handleSearch(event.target.value)
                            }
                            className="w-full border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        />
                    </label>
                </div>

                <div className="flex flex-wrap items-start gap-6">
                    {/* List */}
                    <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-[22px]">
                        {listIsEmpty && totalAppointments === 0 && !isFilteredView ? (
                            <EmptyState
                                illustration="bookings"
                                title="No appointments yet"
                                description="When clients book with you, requests and confirmed visits show up here."
                                actions={
                                    <Link
                                        href={schedule.calender.index()}
                                        className={emptyStatePrimaryActionClassName()}
                                    >
                                        Open calendar
                                    </Link>
                                }
                                contextLabel="Appointments"
                                className="bg-card"
                            />
                        ) : listIsEmpty ? (
                            <EmptyStateCompact
                                title={
                                    hasSearch
                                        ? 'No clients match that search'
                                        : 'No appointments in this filter'
                                }
                                description={
                                    hasSearch
                                        ? 'Try another name or clear search to see everyone on your list.'
                                        : 'Try another status tab or clear filters to see your full schedule.'
                                }
                                actions={
                                    isFilteredView ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchTerm('');
                                                handleStatusChange('all');
                                            }}
                                            className={emptyStateCompactActionClassName()}
                                        >
                                            Clear filters
                                        </button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            groupedByDay.map((group) => (
                                <section
                                    key={group.key}
                                    className="flex flex-col gap-2.5"
                                >
                                    <div className="flex items-center gap-2.5 px-1">
                                        <h2 className="font-[Sora] text-[15px] font-semibold text-foreground">
                                            {dayHeading(group.date)}
                                        </h2>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                                            {group.items.length}
                                        </span>
                                        <span
                                            className="h-px flex-1 bg-[#0E3B2E]/10 dark:bg-white/10"
                                            aria-hidden="true"
                                        />
                                    </div>

                                    {group.items.map((appointment) => {
                                        const isPending =
                                            appointment.status === 'pending';
                                        const isSelected =
                                            selected?.id === appointment.id;
                                        const payment =
                                            paymentState(appointment);
                                        const name = clientName(appointment);
                                        const start = parseISO(
                                            appointment.start_time,
                                        );
                                        const end = appointment.end_time
                                            ? parseISO(appointment.end_time)
                                            : null;

                                        return (
                                            <div
                                                key={appointment.id}
                                                onClick={() =>
                                                    setSelectedId(
                                                        appointment.id,
                                                    )
                                                }
                                                className={cn(
                                                    'flex cursor-pointer flex-wrap items-center gap-4 rounded-2xl border px-4 py-3.5 transition-shadow md:flex-nowrap',
                                                    isPending
                                                        ? 'bg-[#FBFEF3] dark:bg-[#C8F169]/[0.04]'
                                                        : 'bg-card',
                                                    isSelected
                                                        ? 'border-2 border-[#0E3B2E] shadow-[0_8px_24px_rgba(14,59,46,0.08)] dark:border-[#C8F169]'
                                                        : 'border-[#0E3B2E]/[0.08] dark:border-white/10',
                                                )}
                                            >
                                                <div className="flex w-16 shrink-0 flex-col">
                                                    <span className="font-[Sora] text-base font-bold text-foreground">
                                                        {format(start, 'hh:mm')}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {end
                                                            ? `to ${format(end, 'hh:mm a')}`
                                                            : format(
                                                                  start,
                                                                  'a',
                                                              )}
                                                    </span>
                                                </div>
                                                <span
                                                    className={cn(
                                                        'w-[3px] self-stretch rounded-full',
                                                        isPending
                                                            ? 'bg-[#C8F169]'
                                                            : 'bg-[#A9C7B8]',
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                <div className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-[#E6F4EC] text-[13px] font-bold text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                                    {initials(name)}
                                                </div>
                                                <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedId(
                                                                appointment.id,
                                                            )
                                                        }
                                                        className="truncate text-left text-[15px] font-bold text-foreground"
                                                    >
                                                        {name}
                                                    </button>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="truncate text-[13px] text-muted-foreground capitalize">
                                                            {appointment
                                                                .services[0]
                                                                ?.name ??
                                                                'No linked service'}
                                                            {appointment
                                                                .services
                                                                .length > 1 &&
                                                                ` +${appointment.services.length - 1}`}
                                                        </span>
                                                        {appointment.team_member && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                                                                <KeenIcon
                                                                    name="user"
                                                                    className="text-[11px]"
                                                                />
                                                                {
                                                                    appointment
                                                                        .team_member
                                                                        .user
                                                                        .name
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 flex-col items-end gap-1">
                                                    <span className="font-[Sora] text-[15px] font-bold text-foreground">
                                                        {naira(
                                                            appointment.price,
                                                        )}
                                                    </span>
                                                    <Pill
                                                        className={
                                                            payment.className
                                                        }
                                                    >
                                                        {payment.label}
                                                    </Pill>
                                                </div>
                                                <div className="flex w-[104px] shrink-0 justify-center">
                                                    <Pill
                                                        className={
                                                            statusStyles[
                                                                appointment
                                                                    .status
                                                            ] ??
                                                            'bg-muted text-muted-foreground'
                                                        }
                                                    >
                                                        {formatStatus(
                                                            appointment.status,
                                                        )}
                                                    </Pill>
                                                </div>
                                                {isPending ? (
                                                    <div
                                                        className="flex gap-2"
                                                        onClick={(event) =>
                                                            event.stopPropagation()
                                                        }
                                                    >
                                                        {canCancel(
                                                            appointment,
                                                        ) && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeclineTarget(
                                                                        appointment,
                                                                    )
                                                                }
                                                                className="h-10 rounded-[10px] border border-[#0E3B2E]/15 bg-card px-3.5 text-[13px] font-bold text-foreground hover:bg-muted dark:border-white/15"
                                                            >
                                                                Decline
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                confirmAppointment(
                                                                    appointment,
                                                                )
                                                            }
                                                            className="flex h-10 items-center gap-1.5 rounded-[10px] bg-[#0E3B2E] px-3.5 text-[13px] font-bold text-white hover:bg-[#0E3B2E]/90 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                                                        >
                                                            <KeenIcon
                                                                name="check"
                                                                className="text-sm"
                                                            />
                                                            Confirm
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Link
                                                        href={`/provider/appointments/${appointment.id}`}
                                                        aria-label={`Open booking for ${name}`}
                                                        onClick={(event) =>
                                                            event.stopPropagation()
                                                        }
                                                        className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[#0E3B2E]/12 bg-card text-muted-foreground hover:bg-muted dark:border-white/15"
                                                        prefetch
                                                    >
                                                        <KeenIcon
                                                            name="arrow-right"
                                                            className="text-base"
                                                        />
                                                    </Link>
                                                )}
                                            </div>
                                        );
                                    })}
                                </section>
                            ))
                        )}

                        {appointments.links?.length > 3 && (
                            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                                {appointments.total !== undefined && (
                                    <span className="text-[13px] text-muted-foreground">
                                        Showing {appointments.from ?? 0}–
                                        {appointments.to ?? 0} of{' '}
                                        {appointments.total}
                                    </span>
                                )}
                                <Pagination links={appointments.links} />
                            </div>
                        )}
                    </div>

                    {/* Details panel */}
                    {selected && (
                        <aside
                            className={cn(
                                cardClass,
                                'sticky top-4 hidden max-w-[420px] flex-[1_1_360px] flex-col overflow-hidden xl:flex',
                            )}
                        >
                            <div className="flex items-center justify-between border-b border-[#0E3B2E]/[0.08] px-[22px] py-5 dark:border-white/10">
                                <span className="font-[Sora] text-[17px] font-semibold text-foreground">
                                    Booking details
                                </span>
                                <Pill
                                    className={
                                        statusStyles[selected.status] ??
                                        'bg-muted text-muted-foreground'
                                    }
                                >
                                    {formatStatus(selected.status)}
                                </Pill>
                            </div>

                            <div className="flex flex-col gap-5 px-[22px] py-5">
                                <div className="flex items-center gap-3.5">
                                    <div className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-[#E6F4EC] font-[Sora] text-[17px] font-bold text-[#0E3B2E] dark:bg-[#0E3B2E] dark:text-[#C8F169]">
                                        {initials(clientName(selected))}
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                        <span className="truncate text-base font-bold text-foreground">
                                            {clientName(selected)}
                                        </span>
                                        <span className="truncate text-[13px] text-muted-foreground">
                                            {selected.client?.email ||
                                                selected.client_email}
                                        </span>
                                    </div>
                                    {(selected.client?.email ||
                                        selected.client_email) && (
                                        <a
                                            href={`mailto:${selected.client?.email || selected.client_email}`}
                                            aria-label="Email client"
                                            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#0E3B2E]/12 text-[#0E3B2E] hover:bg-muted dark:border-white/15 dark:text-[#C8F169]"
                                        >
                                            <KeenIcon
                                                name="sms"
                                                className="text-xl"
                                            />
                                        </a>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    {[
                                        {
                                            icon: 'calendar',
                                            label: 'Date',
                                            value: format(
                                                parseISO(selected.start_time),
                                                'EEE, d MMM',
                                            ),
                                        },
                                        {
                                            icon: 'time',
                                            label: 'Time',
                                            value: `${format(parseISO(selected.start_time), 'h:mm a')}${selected.end_time ? ` – ${format(parseISO(selected.end_time), 'h:mm a')}` : ''}`,
                                        },
                                        {
                                            icon: 'people',
                                            label: 'Staff',
                                            value:
                                                selected.team_member?.user
                                                    .name ?? 'You',
                                        },
                                        {
                                            icon: 'credit-cart',
                                            label: 'Payment',
                                            value: `${selected.payment_method === 'offline' ? 'On site' : 'Online'} · ${paymentState(selected).label.toLowerCase()}`,
                                        },
                                    ].map((detail) => (
                                        <div
                                            key={detail.label}
                                            className="flex flex-col gap-1 rounded-[14px] bg-muted/60 px-3.5 py-3"
                                        >
                                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <KeenIcon
                                                    name={detail.icon}
                                                    className="text-sm"
                                                />
                                                {detail.label}
                                            </span>
                                            <span className="text-sm font-bold text-foreground">
                                                {detail.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <span className="text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">
                                        Services
                                    </span>
                                    {selected.services.length === 0 && (
                                        <span className="text-sm text-muted-foreground">
                                            No linked service
                                        </span>
                                    )}
                                    {selected.services.map((service, index) => (
                                        <div
                                            key={`${service.name}-${index}`}
                                            className="flex justify-between gap-3 text-sm"
                                        >
                                            <span className="text-foreground capitalize">
                                                {service.name}
                                            </span>
                                            {service.price !== undefined && (
                                                <span className="font-bold text-foreground">
                                                    {naira(service.price)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    <div className="h-px bg-[#0E3B2E]/[0.08] dark:bg-white/10" />
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-sm font-bold text-foreground">
                                            Total
                                        </span>
                                        <span className="font-[Sora] text-xl font-bold text-[#0E3B2E] dark:text-[#C8F169]">
                                            {naira(selected.price)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 rounded-[14px] border border-dashed border-[#0E3B2E]/20 p-3.5 dark:border-white/15">
                                    <KeenIcon
                                        name="note-2"
                                        className="text-lg text-muted-foreground"
                                    />
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-muted-foreground">
                                            Client note
                                        </span>
                                        <span className="text-sm leading-normal text-foreground">
                                            {selected.notes?.trim() ||
                                                'No note from the client.'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col gap-2.5 border-t border-[#0E3B2E]/[0.08] px-[22px] pt-4 pb-[22px] dark:border-white/10">
                                {selected.status === 'pending' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            confirmAppointment(selected)
                                        }
                                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] text-[15px] font-bold text-white hover:bg-[#0E3B2E]/90 dark:bg-[#C8F169] dark:text-[#0E3B2E]"
                                    >
                                        <KeenIcon
                                            name="check-circle"
                                            className="text-lg"
                                        />
                                        Confirm booking
                                    </button>
                                )}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <Link
                                        href={`/provider/appointments/${selected.id}`}
                                        className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#0E3B2E]/15 text-sm font-bold text-foreground hover:bg-muted dark:border-white/15"
                                        prefetch
                                    >
                                        <KeenIcon
                                            name="calendar-edit"
                                            className="text-base"
                                        />
                                        Full details
                                    </Link>
                                    {canCancel(selected) ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeclineTarget(selected)
                                            }
                                            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-red-200 text-sm font-bold text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
                                        >
                                            <KeenIcon
                                                name="cross-circle"
                                                className="text-base"
                                            />
                                            {selected.status === 'pending'
                                                ? 'Decline'
                                                : 'Cancel'}
                                        </button>
                                    ) : (
                                        <span />
                                    )}
                                </div>
                            </div>
                        </aside>
                    )}
                </div>
            </div>

            {/* Decline / cancel dialog */}
            <Dialog
                open={declineTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeclineTarget(null);
                        setDeclineReason('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {declineTarget?.status === 'pending'
                                ? 'Decline booking'
                                : 'Cancel booking'}
                        </DialogTitle>
                        <DialogDescription>
                            Tell the client why. This reason will be shared with
                            them.
                        </DialogDescription>
                    </DialogHeader>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                        Reason
                        <textarea
                            value={declineReason}
                            onChange={(event) =>
                                setDeclineReason(event.target.value)
                            }
                            rows={4}
                            maxLength={500}
                            placeholder="Explain why…"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                    </label>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeclineTarget(null)}
                        >
                            Back
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={submitDecline}
                            disabled={!declineReason.trim()}
                        >
                            {declineTarget?.status === 'pending'
                                ? 'Decline booking'
                                : 'Cancel booking'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
