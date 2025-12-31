import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, ArrowLeft, Check, Box } from 'lucide-react';
import axios from 'axios';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import GuestLayout from '@/layouts/guest-layout';

interface Service {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
}

interface Provider {
    id: string;
    name: string;
    businessName: string;
    address: string;
    slug: string;
    logo: string | null;
}

interface TimeSlot {
    start: string;
    end: string;
    display: string;
    datetime: string;
}

interface Props {
    provider: Provider;
    services: Service[];
}

export default function Booking({ provider, services }: Props) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [rescheduleId, setRescheduleId] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const serviceId = params.get('service');
        const serviceIds = params.get('service_ids')?.split(',') || [];
        const resId = params.get('reschedule_id');

        if (resId) setRescheduleId(resId);

        if (serviceIds.length > 0) {
            setSelectedServiceIds(serviceIds.filter(id => services.find(s => s.id === id)));
        } else if (serviceId && services.find(s => s.id === serviceId)) {
            setSelectedServiceIds([serviceId]);
        } else if (services.length > 0) {
            setSelectedServiceIds([services[0].id]);
        }
    }, [services]);

    useEffect(() => {
        if (selectedDate && selectedServiceIds.length > 0) {
            fetchAvailableSlots();
        }
    }, [selectedDate, selectedServiceIds]);

    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/appointments/slots', {
                params: {
                    provider_id: provider.id,
                    service_ids: selectedServiceIds,
                    date: format(selectedDate, 'yyyy-MM-dd'),
                }
            });
            setAvailableSlots(response.data.slots || []);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            setAvailableSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleService = (id: string) => {
        setSelectedServiceIds(prev =>
            prev.includes(id)
                ? prev.filter(serviceId => serviceId !== id)
                : [...prev, id]
        );
        setSelectedSlot('');
    };

    const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));
    const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);

    const categorizedSlots = useMemo(() => {
        const categories = {
            morning: [] as TimeSlot[],
            afternoon: [] as TimeSlot[],
            evening: [] as TimeSlot[]
        };

        availableSlots.forEach(slot => {
            const hour = parseInt(slot.start.split(':')[0]);
            if (hour < 12) categories.morning.push(slot);
            else if (hour < 17) categories.afternoon.push(slot);
            else categories.evening.push(slot);
        });

        return categories;
    }, [availableSlots]);

    const handleBooking = () => {
        if (!selectedDate || !selectedSlot || selectedServiceIds.length === 0) return;

        router.post('/appointments', {
            provider_id: provider.id,
            service_ids: selectedServiceIds,
            start_time: selectedSlot,
            notes: notes,
            reschedule_id: rescheduleId,
        });
    };

    return (
        <GuestLayout>
            <Head title={`Book with ${provider.businessName}`} />

            <div className="min-h-screen bg-background pb-20 max-w-6xl mx-auto">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                        <div>
                            <h1 className="sm:text-2xl text-base font-bold tracking-tight">Confirm your appointment</h1>
                            <p className="text-muted-foreground text-sm">Choose your preferred services and time</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                        {/* Left Content: Calendar & Services */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Calendar & Slots Card */}
                            <div className="bg-card rounded border overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    <div className="p-3 border-b md:border-b-0 md:border-r flex justify-center">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setSelectedDate(date);
                                                    setSelectedSlot('');
                                                }
                                            }}
                                            disabled={{ before: new Date() }}
                                            className="rounded-md"
                                        />
                                    </div>

                                    <div className="p-4 space-y-3 bg-muted/5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-lg md:text-xl uppercase tracking-tighter">
                                                {format(selectedDate, 'EEEE, MMM d')}
                                            </h3>
                                        </div>

                                        {loading ? (
                                            <div className="flex items-center justify-center h-64">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            </div>
                                        ) : availableSlots.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/20 rounded border border-dashed">
                                                <p className="font-medium">No availability for this date</p>
                                            </div>
                                        ) : (
                                            <ScrollArea  className="h-96 pr-4">
                                                <div className="space-y-8">
                                                    {['morning', 'afternoon', 'evening'].map((cat) => {
                                                        const slots = categorizedSlots[cat as keyof typeof categorizedSlots];
                                                        if (slots.length === 0) return null;
                                                        return (
                                                            <div key={cat} className="space-y-4">
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{cat}</h4>
                                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                                    {slots.map((slot) => (
                                                                        <Button
                                                                            key={slot.datetime}
                                                                            size={"sm"}
                                                                            variant={selectedSlot === slot.datetime ? 'default' : 'outline'}
                                                                            className={cn(
                                                                                "rounded text-xs sm:text-sm font-bold transition-all",
                                                                                selectedSlot === slot.datetime
                                                                                    ? "border-primary scale-[1.05]"
                                                                                    : "hover:border-primary/30 hover:bg-primary/5"
                                                                            )}
                                                                            onClick={() => setSelectedSlot(slot.datetime)}
                                                                        >
                                                                            {slot.display}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ScrollArea>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Services Selection */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black tracking-tight">Services offered by the provider</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {services.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => toggleService(s.id)}
                                            className={cn(
                                                "p-2 rounded gap-2 border cursor-pointer flex items-start ",
                                                selectedServiceIds.includes(s.id)
                                                    ? "border-primary bg-primary/5 "
                                                    : "border-border bg-card hover:border-primary/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "size-8  rounded  flex items-center justify-center shrink-0 border-2",
                                                selectedServiceIds.includes(s.id) ? "bg-primary border-primary text-primary-foreground" : "bg-muted/50 border-muted"
                                            )}>
                                                {selectedServiceIds.includes(s.id) ? <Check className="size-5 " /> : <Box className="size-5 "/>}
                                            </div>
                                            <div className="flex-1 min-w-0 ">
                                                <div className="flex items-center justify-between ">
                                                    <h4 className="text-base truncate  capitalize">{s.name}</h4>
                                                </div>
                                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 ">{s.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-black text-sm">₦{Number(s.price).toLocaleString()}</span>
                                                    <span className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-1 sm:gap-1.5 font-black uppercase  bg-muted px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
                                                        <Clock className="size-3" />
                                                        {s.duration} mins
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Booking Notes */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-black tracking-tight">Additional Notes</h3>
                                <div className="bg-card rounded border p-4">
                                    <textarea
                                        placeholder="Add any special requests or information for the provider..."
                                        className="w-full h-32 bg-transparent border-none focus:ring-0 resize-none text-sm"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Content: Sidebar Summary */}
                        <div className="lg:sticky lg:top-8 order-first border lg:order-last">
                            <div className="bg-card rounded overflow-hidden flex flex-col">
                                <div className="p-4 border-b bg-muted/5">
                                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-center sm:text-left">Booking Summary</h2>
                                </div>

                                <div className="p-4 space-y-4">
                                    <div className="space-y-4 divide-y divide-dashed border-dashed border-muted">
                                        {selectedServices.map(s => (
                                            <div key={s.id} className="flex justify-between items-center ">
                                                <div className="flex flex-col items-start ">
                                                <span className="text-muted-foreground/60 text-sm capitalize">{s.name}</span>
                                                    <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest mt-1">{s.duration} mins</p>
                                                </div>
                                                <span className="text-sm">₦{Number(s.price).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t-2 border-dashed border-muted" />

                                    {/* Details Grid */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-primary" /> Professional
                                            </span>
                                            <span className="font-black text-sm">{provider.businessName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-primary" /> Date
                                            </span>
                                            <span className="font-black text-sm">{format(selectedDate, 'MMM d, yyyy')}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-primary" /> Time
                                            </span>
                                            <span className="font-black text-sm">
                                                {selectedSlot ? format(new Date(selectedSlot), 'h:mm a') : '--:--'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t-2 border-dashed border-muted" />

                                    {/* Final Price */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-base">Total</span>
                                            <div className="text-right">
                                                <span className="text-xl font-black text-primary block leading-none">₦{totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full"
                                            disabled={!selectedSlot || selectedServiceIds.length === 0}
                                            onClick={handleBooking}
                                        >
                                            Continue
                                            <CheckCircle2 className="size-6" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
