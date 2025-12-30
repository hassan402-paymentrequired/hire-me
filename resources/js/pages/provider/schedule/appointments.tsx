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
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Filter,
    Search,
} from 'lucide-react';
import { AppointmentActions } from '@/components/appointments/appointment-actions';

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

import { router } from '@inertiajs/react';
import { debounce } from 'lodash';
import { useCallback,  useState } from 'react';
import business from '@/routes/business';

// ... other imports

interface Appointment {
    id: number;
    client: string;
    email?: string;
    service: string;
    services: { id: string; name: string; price: string }[];
    description?: string;
    amount: string;
    date: string;
    time: string;
    end_time: string;
    status: string;
    notes?: string;
    avatar: string;
    paymentStatus: string;
}

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

export default function Appointments({ appointments, filters }: AppointmentListProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Debounce search to prevent excessive requests
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            router.get(
                '/schedule/appointments',
                { search: query, status: statusFilter !== 'all' ? statusFilter : undefined },
                { preserveState: true, replace: true }
            );
        }, 300),
        [statusFilter]
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        router.get(
            '/schedule/appointments',
            { search: searchTerm, status: value !== 'all' ? value : undefined },
            { preserveState: true, replace: true }
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
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                         </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-left">
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
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
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
                                                                    src={apt.avatar}
                                                                    alt={apt.client}
                                                                />
                                                                <AvatarFallback>
                                                                    {apt.client.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">
                                                                    {apt.client}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground hidden sm:inline">
                                                                    First time visit
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-medium capitalize">{apt.service}</span>
                                                            {apt.services?.length > 1 && (
                                                                <span className="text-[10px] text-muted-foreground bg-muted w-fit px-1.5 py-0.5 rounded font-bold uppercase">
                                                                    +{apt.services.length - 1} More
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {apt.date}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {apt.time}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="flex flex-col">
                                                             <span>{apt.amount}</span>
                                                             <span className={`text-xs ${apt.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>
                                                                {apt.paymentStatus}
                                                             </span>
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
                                                            {apt.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
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
