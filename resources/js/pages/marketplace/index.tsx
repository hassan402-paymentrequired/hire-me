import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { Clock, MapPin, List } from 'lucide-react';
import MarketplaceMapView from './components/map-view';

interface Provider {
    id: string;
    name: string;
    businessName: string;
    slug: string;
    description: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    servicesCount: number;
    services: string[];
}

interface Props {
    providers: Provider[];
}

export default function MarketplaceIndex({ providers }: Props) {
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    
    return (
        <AppLayout>
            <Head title="Find a Service Provider" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Find a Service Provider</h1>
                        <p className="text-muted-foreground mt-2">Browse and book appointments with local professionals</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            onClick={() => setViewMode('list')}
                            className="gap-2"
                        >
                            <List className="h-4 w-4" />
                            List View
                        </Button>
                        <Button
                            variant={viewMode === 'map' ? 'default' : 'outline'}
                            onClick={() => setViewMode('map')}
                            className="gap-2"
                        >
                            <MapPin className="h-4 w-4" />
                            Find in Map
                        </Button>
                    </div>
                </div>

                {providers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No providers available at the moment.</p>
                    </div>
                ) : viewMode === 'map' ? (
                    <MarketplaceMapView providers={providers} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {providers.map((provider) => (
                            <div
                                key={provider.id}
                                className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-foreground">{provider.businessName}</h3>
                                        <p className="text-sm text-muted-foreground">{provider.name}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {provider.description || 'No description available.'}
                                </p>

                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="size-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {provider.servicesCount} {provider.servicesCount === 1 ? 'service' : 'services'}
                                    </span>
                                </div>

                                {provider.services.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {provider.services.map((service, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                                >
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Link href={`/provider/${provider.slug}`}>
                                    <Button className="w-full">
                                        View Profile & Book
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
