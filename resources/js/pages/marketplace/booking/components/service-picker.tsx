import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Box, Check, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { Service } from '../types';

interface ServicePickerProps {
    services: Service[];
    selectedServiceIds: string[];
    onToggleService: (id: string) => void;
    canBookProvider: boolean;
}

interface ServiceCategoryGroup {
    key: string;
    name: string;
    services: Service[];
}

const UNCATEGORIZED_KEY = '__uncategorized__';

function groupServicesByCategory(services: Service[]): ServiceCategoryGroup[] {
    const groups = new Map<string, ServiceCategoryGroup>();

    for (const service of services) {
        const key = service.categoryId ?? UNCATEGORIZED_KEY;
        const name = service.categoryName ?? 'Other';

        const existing = groups.get(key);
        if (existing) {
            existing.services.push(service);
        } else {
            groups.set(key, { key, name, services: [service] });
        }
    }

    const ordered = Array.from(groups.values()).sort((a, b) => {
        if (a.key === UNCATEGORIZED_KEY) return 1;
        if (b.key === UNCATEGORIZED_KEY) return -1;
        return a.name.localeCompare(b.name);
    });

    return ordered;
}

function ServiceCard({
    service,
    isSelected,
    canBookProvider,
    onToggle,
}: {
    service: Service;
    isSelected: boolean;
    canBookProvider: boolean;
    onToggle: (id: string) => void;
}) {
    return (
        <div
            onClick={() => {
                if (canBookProvider) {
                    onToggle(service.id);
                }
            }}
            className={cn(
                'flex items-start gap-2 rounded-xl border p-2',
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
}

function ServiceGrid({
    services,
    selectedServiceIds,
    canBookProvider,
    onToggleService,
}: ServicePickerProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {services.map((service) => (
                <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={selectedServiceIds.includes(service.id)}
                    canBookProvider={canBookProvider}
                    onToggle={onToggleService}
                />
            ))}
        </div>
    );
}

export function ServicePicker({
    services,
    selectedServiceIds,
    onToggleService,
    canBookProvider,
}: ServicePickerProps) {
    const groups = useMemo(() => groupServicesByCategory(services), [services]);
    const meaningfullyGrouped = groups.length >= 2;

    // Default the active tab to the first category that already has a
    // selection so reschedule/URL-seeded selections aren't hidden behind
    // a different tab.
    const initialTab = useMemo(() => {
        if (groups.length === 0) return '';
        const firstWithSelection = groups.find((group) =>
            group.services.some((service) =>
                selectedServiceIds.includes(service.id),
            ),
        );
        return (firstWithSelection ?? groups[0]).key;
        // Only seed once on mount; users can switch tabs freely after.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [activeTab, setActiveTab] = useState(initialTab);

    if (!meaningfullyGrouped) {
        return (
            <ServiceGrid
                services={services}
                selectedServiceIds={selectedServiceIds}
                canBookProvider={canBookProvider}
                onToggleService={onToggleService}
            />
        );
    }

    return (
        <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
        >
            <div className="-mx-1 overflow-x-auto px-1">
                <TabsList className="inline-flex h-auto w-max gap-1 bg-muted/60 p-1">
                    {groups.map((group) => {
                        const selectedCount = group.services.filter((service) =>
                            selectedServiceIds.includes(service.id),
                        ).length;
                        return (
                            <TabsTrigger
                                key={group.key}
                                value={group.key}
                                className="gap-2 text-xs sm:text-sm"
                            >
                                <span className="capitalize">{group.name}</span>
                                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                    {group.services.length}
                                </span>
                                {selectedCount > 0 && (
                                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                        {selectedCount}
                                    </span>
                                )}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </div>

            {groups.map((group) => (
                <TabsContent
                    key={group.key}
                    value={group.key}
                    className="mt-4 focus-visible:ring-0"
                >
                    <ServiceGrid
                        services={group.services}
                        selectedServiceIds={selectedServiceIds}
                        canBookProvider={canBookProvider}
                        onToggleService={onToggleService}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
}
