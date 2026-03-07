/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppointmentActions } from '@/components/appointments/appointment-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Filter, Search } from 'lucide-react';

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
import { formatPrice, formatTime, formatDate, formatStatus } from '@/lib/utils';


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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointments" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Appointments
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your bookings and view details.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <CardTitle>All Bookings</CardTitle>
                            <div className="flex flex-1 items-center gap-2 md:max-w-md">
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
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-left text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
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
                                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                                >
                                                    <td className="p-4 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
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
                                                                <span className="font-medium">
                                                                    {apt.client.name}
                                                                </span>
                                                                <span className="hidden text-xs text-muted-foreground sm:inline">
                                                                    {/* First time
                                                                    visit */}
                                                                    {apt.client.email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-medium capitalize">
                                                                {
                                                                    apt
                                                                        .services[0]
                                                                        .name
                                                                }
                                                            </span>
                                                            {apt.services
                                                                ?.length >
                                                                1 && (
                                                                <span className="w-fit rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
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
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {formatDate(apt.start_time)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatTime(apt.start_time)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex flex-col">
                                                            <span>
                                                                {formatPrice(apt.price)}
                                                            </span>
                                                            {/*<span className={`text-xs ${apt.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>*/}
                                                            {/*   {apt.paymentStatus}*/}
                                                            {/*</span>*/}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Badge
                                                            variant={
                                                                apt.status ===
                                                                'Confirmed'
                                                                    ? 'default'
                                                                    : apt.status ===
                                                                        'Cancelled'
                                                                      ? 'destructive'
                                                                      : 'secondary'
                                                            }
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
