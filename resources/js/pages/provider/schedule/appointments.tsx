/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppointmentActions } from '@/components/appointments/appointment-actions';
import KeenIcon from '@/components/keen-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Appointment, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, Filter, Search, Users } from 'lucide-react';

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

import business from '@/routes/business';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { useDebouncedAppointmentSearch } from '@/hooks/use-debounce-appointment-search';
import { formatPrice, formatTime, formatDate, formatStatus, getStatusVariant } from '@/lib/utils';


interface AppointmentListProps {
    appointments: {
        data: Appointment[];
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}


export default function Appointments({
    appointments,
    filters,
}: AppointmentListProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const searchAppointments = useDebouncedAppointmentSearch(statusFilter);


    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        searchAppointments(e.target.value);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        router.get(
            '/schedule/appointments',
            { search: searchTerm, status: value !== 'all' ? value : undefined },
            { preserveState: true, replace: true },
        );
    };

    const pendingCount = appointments.data.filter((apt) => apt.status === 'pending').length;
    const confirmedCount = appointments.data.filter((apt) => apt.status === 'confirmed').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointments" />
            <div className="flex flex-col gap-6 p-4">
                <section className="overflow-hidden rounded-3xl border border-border/70 bg-background">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.06),_transparent_24%),radial-gradient(circle_at_left,_rgba(16,185,129,0.06),_transparent_24%)]" />
                        <div className="relative space-y-5 px-6 py-6 lg:px-8 lg:py-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="border-border bg-muted px-3 py-1 text-[11px] font-medium tracking-[0.18em] uppercase text-foreground/70 hover:bg-muted">
                                    Schedule workspace
                                </Badge>
                                <Badge variant="secondary" className="rounded-full px-3 py-1">
                                    {appointments.data.length} visible bookings
                                </Badge>
                            </div>

                            <div className="max-w-2xl space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                                    Appointments
                                </h1>
                                <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                                    Keep your booking pipeline organized, respond to pending requests quickly, and open any appointment when you need the full timeline.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                    <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                                        <KeenIcon name="electronic-clock" className="text-sm text-sky-600 dark:text-sky-300" />
                                        Total in view
                                    </div>
                                    <p className="mt-3 text-3xl font-semibold text-foreground">
                                        {appointments.data.length}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        bookings on this page
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                    <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                                        <KeenIcon name="status" className="text-sm text-amber-600 dark:text-amber-300" />
                                        Pending review
                                    </div>
                                    <p className="mt-3 text-3xl font-semibold text-foreground">
                                        {pendingCount}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        waiting for your decision
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
                                    <div className="flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                                        <KeenIcon name="verify" className="text-sm text-emerald-600 dark:text-emerald-300" />
                                        Confirmed
                                    </div>
                                    <p className="mt-3 text-3xl font-semibold text-foreground">
                                        {confirmedCount}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        already locked in
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Card className="overflow-hidden rounded-3xl border border-border/70">
                    <CardHeader className="border-b border-border/60 bg-muted/20 pb-5">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background text-sky-600 dark:text-sky-300">
                                        <Calendar className="h-4 w-4" />
                                    </span>
                                    All Bookings
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Search by client, narrow by status, and open any booking to manage it fully.
                                </CardDescription>
                            </div>
                            <div className="flex flex-1 items-center gap-2 xl:max-w-md">
                                <div className="relative flex-1">
                                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search clients..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </div>
                                <div className="w-[140px]">
                                    <Select
                                        value={statusFilter}
                                        onValueChange={handleStatusChange}
                                    >
                                            <SelectTrigger>
                                                <div className="flex items-center gap-2">
                                                    <Filter className="h-4 w-4" />
                                                    <SelectValue placeholder="Status" />
                                                </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Status
                                            </SelectItem>
                                            <SelectItem value="confirmed">
                                                Confirmed
                                            </SelectItem>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                Cancelled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="rounded-2xl border border-border/70">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-left text-sm">
                                    <thead className="bg-muted/20 [&_tr]:border-b">
                                        <tr className="border-b border-border/60 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                                Client
                                            </th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                                Service
                                            </th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                                Date & Time
                                            </th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                                Amount
                                            </th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                                Status
                                            </th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {appointments.data.length > 0 ? (
                                            appointments.data.map((apt) => (
                                                <tr
                                                    key={apt.id}
                                                    className="border-b border-border/60 transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted"
                                                >
                                                    <td className="p-4 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 border border-border/70">
                                                                <AvatarImage
                                                                    src={
                                                                        apt.client.avatar
                                                                    }
                                                                    alt={
                                                                        apt.client.name
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {apt.client.name.charAt(
                                                                        0,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">
                                                                    {apt.client.name}
                                                                </span>
                                                                <span className="hidden text-xs text-muted-foreground sm:inline">
                                                                    {apt.client.email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-semibold capitalize">
                                                                {
                                                                    apt
                                                                        .services[0]
                                                                        .name
                                                                }
                                                            </span>
                                                            {apt.team_member && (
                                                                <span className="inline-flex w-fit items-center gap-1 rounded-full border border-border/70 bg-muted px-2 py-1 text-[10px] font-bold uppercase text-foreground/80">
                                                                    <Users className="h-3 w-3" />
                                                                    {apt.team_member.user.name}
                                                                </span>
                                                            )}
                                                            {apt.services
                                                                ?.length >
                                                                1 && (
                                                                <span className="w-fit rounded-full border border-border/70 bg-background px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                                                                    +
                                                                    {apt
                                                                        .services
                                                                        .length -
                                                                        1}{' '}
                                                                    More
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-semibold">
                                                                {formatDate(apt.start_time)}
                                                            </span>
                                                            <span className="inline-flex w-fit items-center gap-1 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground">
                                                                <KeenIcon name="electronic-clock" className="text-xs" />
                                                                {formatTime(apt.start_time)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">
                                                                {formatPrice(apt.price)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                Booking amount
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Badge
                                                            variant={
                                                                getStatusVariant(apt.status)
                                                            }
                                                            className="rounded-full px-3 py-1"
                                                        >
                                                            {formatStatus(apt.status)}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-right align-middle">
                                                        <AppointmentActions
                                                            appointment={apt}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="p-4 text-center text-muted-foreground"
                                                >
                                                    No appointments found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Pagination controls would go here */}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
