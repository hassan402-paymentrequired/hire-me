import { cn } from '@/lib/utils';
import { Box, Check, Clock } from 'lucide-react';

import type { Service } from '../types';

interface ServicePickerProps {
    services: Service[];
    selectedServiceIds: string[];
    onToggleService: (id: string) => void;
    canBookProvider: boolean;
}

export function ServicePicker({
    services,
    selectedServiceIds,
    onToggleService,
    canBookProvider,
}: ServicePickerProps) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold tracking-tight">
                Select services to book
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {services.map((service) => {
                    const isSelected = selectedServiceIds.includes(service.id);
                    return (
                        <div
                            key={service.id}
                            onClick={() => {
                                if (canBookProvider) {
                                    onToggleService(service.id);
                                }
                            }}
                            className={cn(
                                'flex items-start gap-2 rounded border p-2',
                                canBookProvider
                                    ? 'cursor-pointer'
                                    : 'cursor-not-allowed opacity-60',
                                isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-card hover:border-primary/20',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex size-8 shrink-0 items-center justify-center rounded border-2',
                                    isSelected
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-muted bg-muted/50',
                                )}
                            >
                                {isSelected ? (
                                    <Check className="size-5" />
                                ) : (
                                    <Box className="size-5" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="truncate text-base capitalize">
                                        {service.name}
                                    </h4>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">
                                        ₦{Number(service.price).toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[9px] font-semibold whitespace-nowrap text-muted-foreground uppercase sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[10px]">
                                        <Clock className="size-3" />
                                        {service.duration} mins
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
