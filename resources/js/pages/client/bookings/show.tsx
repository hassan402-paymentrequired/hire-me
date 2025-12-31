import GuestLayout from '@/layouts/guest-layout';
import { Head,  router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    MapPin,
    Timer,
    Phone,
    Mail,
    FileText,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Star,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatTime, formatPrice, formatStatus, getStatusVariant } from '@/lib/utils';
import { ReviewSection } from '@/components/reviews/review-section';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, {useState} from 'react';

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
    notes: string | null;
    provider: Provider;
    service: Service; // Keep for fallback or just ignore
    services: Service[];
    created_at: string;
    updated_at: string;
    review?: any[];
}

export default function BookingDetails({ booking }: { booking: Booking }) {
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');

    const startTime = new Date(booking.start_time);
    const now = new Date();
    const fiveHoursFromNow = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    const canCancel = startTime > fiveHoursFromNow;

    const handleCancelBooking = () => {
        if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            router.post(`/appointments/${booking.id}/cancel`);
        }
    };

    const handleRescheduleBooking = () => {
        router.visit(`/appointments/${booking.id}/reschedule`);
    };

    const handleComplete = (withReview: boolean) => {
        router.post(`/appointments/${booking.id}/complete`, {
            rating: withReview ? rating : null,
            comment: withReview ? comment : null,
        }, {
            onSuccess: () => setIsCompleteModalOpen(false),
        });
    };

    const handleReport = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/appointments/${booking.id}/report`, {
            reason: reportReason,
            description: reportDescription,
        }, {
            onSuccess: () => {
                setIsReportModalOpen(false);
                setReportReason('');
                setReportDescription('');
            },
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return <CheckCircle2 className="w-5 h-5" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5" />;
            case 'pending':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <CheckCircle2 className="w-5 h-5" />;
        }
    };

    return (
        <GuestLayout>
            <Head title={`Booking - ${booking.services?.length > 0 ? booking.services[0].name : (booking.service?.name || 'Appointment')}`} />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Booking Details</h1>
                            <p className="text-muted-foreground">
                                Booking ID: <span className="font-mono text-sm">{booking.id}</span>
                            </p>
                        </div>
                        <Badge
                            variant={getStatusVariant(booking.status)}
                            className="text-sm px-4 py-1.5 flex items-center gap-2"
                        >
                            {getStatusIcon(booking.status)}
                            {formatStatus(booking.status)}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Service & Provider Card */}
                        <Card>
                            <CardHeader className="">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">

                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-2xl font-bold  truncate">
                                                {booking.provider.business_profile.business_name || 'Business Name'}
                                            </h2>
                                            <p className="text-muted-foreground mb-2">
                                                by <span className="font-semibold text-foreground">
                                                    {booking.provider?.name}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-3xl font-bold">
                                            {formatPrice(booking.price)}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Total Price</p>
                                    </div>
                                </div>
                            </CardHeader>

                            {booking.services && booking.services.length > 0 && (
                                <>
                                    <Separator />
                                    <CardContent className="pt-4 px-6">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Booked Services</h3>
                                        <div className="space-y-4">
                                            {booking.services.map((service) => (
                                                <div key={service.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-muted/30 border border-muted/50">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-base capitalize">{service.name}</p>
                                                        {service.description && (
                                                            <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold">{formatPrice(service.price)}</p>
                                                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">{service.duration_minutes} MINS</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </>
                            )}

                            {(!booking.services || booking.services.length === 0) && booking.service?.description && (
                                <>
                                    <Separator />
                                    <CardContent className="pt-4">
                                        <div className="flex gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium mb-1">Service Description</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.service.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </>
                            )}
                        </Card>

                        {/* Appointment Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Appointment Details</CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {/* Date */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <Calendar className="w-4 h-4" />
                                            <span className="font-medium">Date</span>
                                        </div>
                                        <p className="text-lg font-semibold">
                                            {formatDate(booking.start_time)}
                                        </p>
                                    </div>

                                    {/* Time */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <Clock className="w-4 h-4" />
                                            <span className="font-medium">Time</span>
                                        </div>
                                        <p className="text-lg font-semibold">
                                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                        </p>
                                    </div>

                                    {/* Duration */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <Timer className="w-4 h-4" />
                                            <span className="font-medium">Duration</span>
                                        </div>
                                        <p className="text-lg font-semibold">
                                            {booking.service?.duration_minutes} minutes
                                        </p>
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <MapPin className="w-4 h-4" />
                                            <span className="font-medium">Location</span>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed">
                                            {booking.provider?.business_profile?.address}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes Card (if exists) */}
                        {booking.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Special Notes</CardTitle>
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-4">
                                    <div className="bg-muted/50 rounded-lg p-4 border border-muted">
                                        <p className="text-sm leading-relaxed">{booking.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Right Side */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Actions Card */}
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">Manage Booking</CardTitle>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                                            <AlertCircle className="w-3 h-3" />
                                            5h Cancellation Policy
                                        </div>
                                    </div>
                                </CardHeader>
                                <Separator />
                                <CardContent className="pt-4 space-y-3">
                                    {booking.status === 'confirmed' && (
                                        <>
                                            <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="default"
                                                        className="w-full justify-start bg-green-600 hover:bg-green-700"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                        Mark as Completed
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Complete Appointment</DialogTitle>
                                                        <DialogDescription>
                                                            How was your experience with {booking.provider.name}? Leaving a review helps others!
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="flex flex-col gap-2">
                                                            <Label>Rating</Label>
                                                            <div className="flex gap-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <button
                                                                        key={star}
                                                                        type="button"
                                                                        onClick={() => setRating(star)}
                                                                        className="focus:outline-none transition-transform active:scale-95"
                                                                    >
                                                                        <Star
                                                                            className={`size-8 ${
                                                                                star <= rating
                                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                                    : 'text-muted-foreground/30'
                                                                            }`}
                                                                        />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Label htmlFor="comment">Your Review (Optional)</Label>
                                                            <Textarea
                                                                id="comment"
                                                                placeholder="Share your experience..."
                                                                value={comment}
                                                                onChange={(e) => setComment(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter className="flex-col sm:flex-row gap-2">
                                                        <Button variant="ghost" onClick={() => handleComplete(false)}>
                                                            Skip & Complete
                                                        </Button>
                                                        <Button onClick={() => handleComplete(true)}>
                                                            Submit & Complete
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={handleRescheduleBooking}
                                            >
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Reschedule Appointment
                                            </Button>
                                        </>
                                    )}

                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={handleCancelBooking}
                                                disabled={!canCancel}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Cancel Booking
                                            </Button>
                                            {!canCancel && (
                                                <p className="text-[10px] text-destructive font-medium px-2">
                                                    Cancellation is only available 5+ hours before start time.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Report Issue Button */}
                                    <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                                                <AlertCircle className="w-4 h-4 mr-2" />
                                                Report an Issue
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <form onSubmit={handleReport}>
                                                <DialogHeader>
                                                    <DialogTitle>Report an Issue</DialogTitle>
                                                    <DialogDescription>
                                                        Please describe the issue you encountered with this appointment.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="reason">Reason</Label>
                                                        <select
                                                            id="reason"
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            value={reportReason}
                                                            onChange={(e) => setReportReason(e.target.value)}
                                                            required
                                                        >
                                                            <option value="">Select a reason</option>
                                                            <option value="no-show">Provider did not show up</option>
                                                            <option value="poor-service">Poor service quality</option>
                                                            <option value="incorrect-price">Incorrect pricing charged</option>
                                                            <option value="unprofessional">Unprofessional behavior</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="description">Details</Label>
                                                        <Textarea
                                                            id="description"
                                                            placeholder="Provide more details..."
                                                            value={reportDescription}
                                                            onChange={(e) => setReportDescription(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit">Submit Report</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    {booking.status === 'completed' && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium mb-4 text-center">How was your experience?</p>
                                            <ReviewSection
                                                reviews={booking.review || []}
                                                canReview={!booking.review || booking.review.length === 0}
                                                pendingAppointmentId={booking.id}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Contact Information</CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-4 space-y-4">
                                {/* Phone */}
                                {booking.provider?.business_profile?.phone && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-1">Phone</p>

                                           <a href={`tel:${booking.provider.business_profile.phone}`}
                                            className="text-sm font-medium hover:text-primary transition-colors"
                                            >
                                            {booking.provider.business_profile.phone}
                                        </a>
                                    </div>
                                    </div>
                                    )}

                                {/* Email */}
                                {booking.provider?.email && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-1">Email</p>

                                          <a href={`mailto:${booking.provider.email}`}
                                            className="text-sm font-medium hover:text-primary transition-colors break-all"
                                            >
                                            {booking.provider.email}
                                        </a>
                                    </div>
                                    </div>
                                    )}

                                {/* Address */}
                                {booking.provider?.business_profile?.address && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-1">Address</p>
                                            <p className="text-sm font-medium leading-relaxed">
                                                {booking.provider.business_profile.address}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {booking.provider.business_profile.city}, {booking.provider.business_profile.state} {booking.provider.business_profile.zip_code}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>



                        {/* Booking Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Booking Information</CardTitle>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-4 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Booked on</span>
                                    <span className="font-medium">{formatDate(booking.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last updated</span>
                                    <span className="font-medium">{formatDate(booking.updated_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Category</span>
                                    <span className="font-medium capitalize">
                                        {booking.provider?.business_profile?.category}
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
