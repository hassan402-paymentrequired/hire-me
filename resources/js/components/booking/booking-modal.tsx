import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

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
}

interface TimeSlot {
    start: string;
    end: string;
    display: string;
    datetime: string;
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: Provider;
    allServices: Service[];
    initialServiceId?: string;
}

export function BookingModal({ isOpen, onClose, provider, allServices, initialServiceId }: BookingModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Date & Time, 2: Info (if needed, but following image now)

    useEffect(() => {
        if (initialServiceId) {
            setSelectedServiceIds([initialServiceId]);
        } else if (allServices.length > 0) {
            setSelectedServiceIds([allServices[0].id]);
        }
    }, [initialServiceId, allServices, isOpen]);

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
        setSelectedSlot(''); // Reset slot if services change as duration might change
    };

    const selectedServices = allServices.filter(s => selectedServiceIds.includes(s.id));
    const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

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
        }, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden border-none bg-background gap-0 rounded-3xl h-[90vh] flex flex-col md:flex-row">
                {/* Left Section: Selection */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold">Select Date & Time</DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                            <X className="size-5" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-8">
                            {/* Calendar & Time Slots Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-muted/30 rounded-2xl p-4 border shadow-sm">
                                    <Calendar
                                        selected={selectedDate}
                                        onSelect={(date) => {
                                            setSelectedDate(date);
                                            setSelectedSlot('');
                                        }}
                                    />
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-lg">
                                            {format(selectedDate, 'EEEE, MMM d')}
                                        </h3>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Local Timezone</span>
                                    </div>

                                    {loading ? (
                                        <div className="flex items-center justify-center h-48">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                                            <p>No slots available for this day</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {['morning', 'afternoon', 'evening'].map((cat) => {
                                                const slots = categorizedSlots[cat as keyof typeof categorizedSlots];
                                                if (slots.length === 0) return null;
                                                return (
                                                    <div key={cat} className="space-y-3">
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{cat}</h4>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {slots.map((slot) => (
                                                                <Button
                                                                    key={slot.datetime}
                                                                    variant={selectedSlot === slot.datetime ? 'default' : 'outline'}
                                                                    className={cn(
                                                                        "h-10 rounded-xl text-sm font-medium transition-all",
                                                                        selectedSlot === slot.datetime ? "shadow-md scale-[1.02]" : "hover:border-primary/50"
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
                                    )}
                                </div>
                            </div>

                            {/* Services List */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Services offered by the provider</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {allServices.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => toggleService(s.id)}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 hover:shadow-md",
                                                selectedServiceIds.includes(s.id) 
                                                    ? "border-primary bg-primary/5 shadow-sm" 
                                                    : "border-border bg-card"
                                            )}
                                        >
                                            <div className={cn(
                                                "size-12 rounded-xl flex items-center justify-center",
                                                selectedServiceIds.includes(s.id) ? "bg-primary text-primary-foreground" : "bg-muted"
                                            )}>
                                                <CheckCircle2 className={cn("size-6", !selectedServiceIds.includes(s.id) && "opacity-20")} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="font-bold truncate">{s.name}</h4>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{s.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-primary">₦{Number(s.price).toLocaleString()}</span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium bg-muted px-2 py-0.5 rounded-full">
                                                        <Clock className="size-3" />
                                                        {s.duration} mins
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Section: Summary Sidebar */}
                <div className="w-full md:w-[320px] bg-muted/10 border-l flex flex-col shrink-0">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold">Booking Summary</h2>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-8">
                            {/* Selected Services */}
                            <div className="space-y-4">
                                {selectedServices.map(s => (
                                    <div key={s.id} className="flex gap-4">
                                        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="size-8 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold truncate">{s.name}</h4>
                                            <p className="text-sm text-muted-foreground">{s.duration} mins</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-dashed" />

                            {/* Details List */}
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-primary" /> Professional
                                    </span>
                                    <span className="font-bold">{provider.businessName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-primary" /> Date
                                    </span>
                                    <span className="font-bold">{format(selectedDate, 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-primary" /> Time
                                    </span>
                                    <span className="font-bold">
                                        {selectedSlot ? format(new Date(selectedSlot), 'h:mm a') : '--:--'}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-dashed" />

                            {/* Pricing */}
                            <div className="space-y-3">
                                {selectedServices.map(s => (
                                    <div key={s.id} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{s.name}</span>
                                        <span className="font-medium">₦{Number(s.price).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="pt-4 flex justify-between items-center">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-black text-primary">₦{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-6 bg-background/50 backdrop-blur-sm border-t">
                        <Button 
                            className="w-full h-14 rounded-2xl text-lg font-bold gap-2 shadow-lg shadow-primary/20" 
                            disabled={!selectedSlot || selectedServiceIds.length === 0}
                            onClick={handleBooking}
                        >
                            Continue
                            <CheckCircle2 className="size-5" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
