import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Clock, ArrowLeft, MoreHorizontal, MapPinCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import client from '@/routes/client';

interface AppointmentDetail {
    id: string;
    provider_name: string;
    business_name: string;
    service_name: string;
    duration: number;
    start_time: string;
    end_time: string;
    status: string;
    price: string;
    notes?: string;
    created_at: string;
}

export default function BookingDetails({ appointment }: { appointment: AppointmentDetail }) {
    return (
        <GuestLayout>
            <Head title={`Booking - ${appointment.service_name}`} />

            <div className="max-w-3xl mx-auto py-10 px-4">
                <div className="mb-6">
                    <Link href={client.bookings.index()} className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Bookings
                    </Link>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">Booking Details</h1>
                        <Badge variant={appointment.status === 'Confirmed' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                            {appointment.status}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Details Card */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-start">
                                    <span>{appointment.service_name}</span>
                                    <span className="text-xl font-bold">{appointment.price}</span>
                                </CardTitle>
                                <p className="text-muted-foreground text-sm font-medium">Provided by {appointment.provider_name}</p>
                            </CardHeader>
                            <Separator />
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Date</div>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            {appointment.start_time}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Time</div>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Clock className="w-4 h-4 text-primary" />
                                            {appointment.end_time}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Duration</div>
                                    <div className="font-medium">{appointment.duration}</div>
                                </div>

                                {appointment.notes && (
                                    <div className="bg-muted/30 p-4 rounded-md">
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</div>
                                        <p className="text-sm">{appointment.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Actions */}
                    <div className="md:col-span-1 space-y-4">
                        <Card>
                             <CardHeader>
                                <CardTitle className="text-base">Help & Support</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-2">
                                {appointment.status !== 'cancelled' && (
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to cancel this appointment?')) {
                                                router.post(`/appointments/${appointment.id}/cancel`, {}, {
                                                    onSuccess: () => {
                                                        alert('Appointment cancelled successfully');
                                                    }
                                                });
                                            }
                                        }}
                                    >
                                        Cancel Booking
                                    </Button>
                                )}
                             </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
