import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    Calendar,
    Filter,
    MoreHorizontal,
    Search,
    User,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Schedule',
        href: '/schedule',
    },
    {
        title: 'Appointments',
        href: '/schedule/appointments',
    },
];

const allAppointments = [
    {
        id: 1,
        client: 'Tunde Adebayo',
        service: 'Full Body Massage',
        amount: '₦25,000',
        date: 'Dec 23, 2025',
        time: '10:00 AM',
        status: 'Confirmed',
        avatar: 'https://i.pravatar.cc/150?u=1',
        paymentStatus: 'Paid',
    },
    {
        id: 2,
        client: 'Chioma Onu',
        service: 'Facial Treatment',
        amount: '₦15,000',
        date: 'Dec 23, 2025',
        time: '12:30 PM',
        dateStr: '2025-12-23',
        status: 'Confirmed',
        avatar: 'https://i.pravatar.cc/150?u=2',
        paymentStatus: 'Paid',
    },
    {
        id: 3,
        client: 'Emeka Okafor',
        service: 'Haircut & Shave',
        amount: '₦5,000',
        date: 'Dec 23, 2025',
        time: '02:00 PM',
        status: 'Pending',
        avatar: 'https://i.pravatar.cc/150?u=3',
        paymentStatus: 'Unpaid',
    },
    {
        id: 4,
        client: 'Sarah James',
        service: 'Manicure & Pedicure',
        amount: '₦12,000',
        date: 'Dec 24, 2025',
        time: '09:00 AM',
        status: 'Cancelled',
        avatar: 'https://i.pravatar.cc/150?u=4',
        paymentStatus: 'Refunded',
    },
    {
        id: 5,
        client: 'David West',
        service: 'Deep Tissue Massage',
        amount: '₦30,000',
        date: 'Dec 24, 2025',
        time: '11:00 AM',
        status: 'Confirmed',
        avatar: 'https://i.pravatar.cc/150?u=5',
        paymentStatus: 'Paid',
    },
];

export default function Appointments() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredAppointments = allAppointments.filter((apt) => {
        const matchesSearch = apt.client
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' ||
            apt.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

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
                    <div className="flex gap-2">
                         <Button variant="outline">
                             Export
                         </Button>
                        <Button>
                             New Appointment
                        </Button>
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
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="w-[140px]">
                                     <Select
                                        value={statusFilter}
                                        onValueChange={setStatusFilter}
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
                                        {filteredAppointments.length > 0 ? (
                                            filteredAppointments.map((apt) => (
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
                                                        {apt.service}
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
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
