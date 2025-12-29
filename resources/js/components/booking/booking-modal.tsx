import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/form-select';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
    service: Service;
}

export function BookingModal({ isOpen, onClose, provider, service }: BookingModalProps) {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');

    // Generate next 30 days for date selection
    const dateOptions = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
            value: date.toISOString().split('T')[0],
            label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        };
    });

    // Fetch available slots when date changes
    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSlots();
        }
    }, [selectedDate]);

    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/appointments/slots', {
                params: {
                    provider_id: provider.id,
                    service_id: service.id,
                    date: selectedDate,
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

    const handleBooking = () => {
        if (!selectedDate || !selectedSlot) return;

        router.post('/appointments', {
            provider_id: provider.id,
            service_id: service.id,
            start_time: selectedSlot,
            notes: notes,
        }, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    const slotOptions = availableSlots.map(slot => ({
        value: slot.datetime,
        label: slot.display
    }));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Book {service.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Service Summary */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Provider</span>
                            <span className="font-medium">{provider.businessName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Service</span>
                            <span className="font-medium">{service.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Duration</span>
                            <span className="font-medium flex items-center gap-1">
                                <Clock className="size-3" />
                                {service.duration} min
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Price</span>
                            <span className="font-semibold flex items-center gap-1">
                                <DollarSign className="size-4" />
                                {service.price}
                            </span>
                        </div>
                    </div>

                    {/* Date Selection */}
                    <FormSelect
                        label="Select Date"
                        options={dateOptions}
                        value={selectedDate}
                        onChange={setSelectedDate}
                        placeholder="Choose a date"
                        required
                    />

                    {/* Time Slot Selection */}
                    {selectedDate && (
                        <FormSelect
                            label="Select Time"
                            options={slotOptions}
                            value={selectedSlot}
                            onChange={setSelectedSlot}
                            placeholder={loading ? "Loading..." : slotOptions.length === 0 ? "No slots available" : "Choose a time"}
                            disabled={loading || slotOptions.length === 0}
                            required
                        />
                    )}

                    {/* Notes */}
                    <div>
                        <Label>
                            Notes (Optional)
                        </Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Any special requests or notes..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBooking}
                            disabled={!selectedDate || !selectedSlot}
                            className="flex-1"
                        >
                            Confirm Booking
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
