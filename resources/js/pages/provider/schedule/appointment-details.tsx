import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    ArrowLeft,
    User,
    Mail,
    FileText,
    Banknote,
    MessageSquare,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BreadcrumbItem } from '@/types';
import business from '@/routes/business';

interface Service {
    id: string;
    name: string;
    price: string;
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
    notes: string | null;
    created_at: string;
}



export default function AppointmentDetailsPage({ appointment }: { appointment: AppointmentDetails }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: business.dashboard().url },
        { title: 'Schedule', href: '/provider/appointments' },
        { title: appointment.client_name, href: '' },
    ];
    const handleConfirm = () => {
        router.post(`/provider/appointments/${appointment.id}/confirm`);
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            const reason = prompt('Please provide a reason:');
            if (reason) {
                router.post(`/provider/appointments/${appointment.id}/cancel`, { reason });
            }
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'default';
            case 'completed': return 'outline';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Appointment - ${appointment.client_name}`} />

            <div className="p-4  space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 rounded">
                            <AvatarFallback className="rounded">
                                {appointment.client_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">{appointment.client_name}</h1>
                            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                                <Mail className="h-3 w-3" />
                                {appointment.email}
                            </p>
                        </div>
                    </div>
                    <Badge variant={getStatusVariant(appointment.status)} >
                        {appointment.status}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Details */}
                    <Card className="md:col-span-2 rounded">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold">Appointment Information</CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6 space-y-8">
                            {/* Time and Date */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Schedule</p>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <span className="font-bold text-lg">{appointment.start_time}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Duration</p>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-primary" />
                                        <span className="font-bold text-lg">Estimated Finish: {appointment.end_time.split(' ').slice(-2).join(' ')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Services List */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Booked Services</p>
                                <div className="space-y-3">
                                    {appointment.services.map(service => (
                                        <div key={service.id} className="flex items-center justify-between p-4 rounded bg-muted/30 border-2 border-muted transition-colors hover:border-primary/20">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <span className="font-bold capitalize">{service.name}</span>
                                            </div>
                                            <span className="font-black text-lg">{service.price}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-2 px-4">
                                        <span className="font-bold text-muted-foreground">Total Price</span>
                                        <span className="text-2xl font-black text-primary">{appointment.price}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Client Notes</p>
                                <div className="p-4 rounded-xl bg-muted/50 border-2 border-dashed border-muted italic text-sm text-muted-foreground leading-relaxed">
                                    {appointment.notes || "No additional notes provided for this booking."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions and Sidebar */}
                    <div className="space-y-6">
                        <Card >
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest">Actions</CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-6 space-y-3">
                                {appointment.status === 'pending' && (
                                    <Button className="w-full" onClick={handleConfirm}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Accept Booking
                                    </Button>
                                )}
                                {appointment.status !== 'cancelled' && (
                                    <Button variant="destructive" className="w-full"  onClick={handleCancel}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        {appointment.status === 'pending' ? 'Reject Booking' : 'Cancel Appointment'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <div className="px-4 text-center space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Booking Metadata</p>
                            <p className="text-xs font-medium text-muted-foreground">Reference: <span className="font-mono">{appointment.id}</span></p>
                            <p className="text-xs font-medium text-muted-foreground text-center">Received on {appointment.created_at}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
