import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/guest-layout';
import { Head, Link, router } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
import { HeaderFilter } from '@/pages/guest/components/filter';

interface Provider {
    id: string;
    name: string;
    businessName: string;
    slug: string;
    description: string;
    servicesCount: number;
    services: string[];
    distance?: number;
}

interface Props {
    providers: {
        data: Provider[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        next_page_url: string | null;
        current_page: number;
    };
    categories: { name: string; slug: string }[];
    filters: {
        search?: string;
        category?: string;
        lat?: number | string;
        lng?: number | string;
    };
    canRegister: boolean;
}

export default function Welcome({ providers, categories, filters }: Props) {
    const [allProviders, setAllProviders] = useState(providers.data);
    const [loading, setLoading] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (providers.current_page === 1) {
            setAllProviders(providers.data);
        } else {
            setAllProviders(prev => {
                const newProviders = providers.data.filter(
                    p => !prev.some(existing => existing.id === p.id)
                );
                return [...prev, ...newProviders];
            });
        }
    }, [providers.data, providers.current_page]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && providers.next_page_url && !loading) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [providers.next_page_url, loading]);

    const loadMore = () => {
        setLoading(true);
        router.get(
            providers.next_page_url!,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['providers'],
                onFinish: () => setLoading(false),
            }
        );
    };

    const requestLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                router.get('/', {
                    ...filters,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }, { preserveState: true, replace: true, preserveScroll: true });
            }, (error) => {
                console.error("Error getting location:", error);
            });
        }
    };

    return (
        <>
            <Head title="Find Services">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <AppLayout>
                <div className="flex flex-col space-y-6 px-5 box-border overflow-hidden pb-10">
                    {/* Top Filter Bar */}
                    <HeaderFilter categories={categories} filters={filters} />

                    {/* Location Prompt */}
                    {/*{!filters.lat && (*/}
                    {/*    <div className="bg-muted/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-border/50">*/}
                    {/*        <div className="flex items-center gap-3">*/}
                    {/*            <div className="p-2 bg-primary/10 rounded-full">*/}
                    {/*                <MapPin className="h-5 w-5 text-primary" />*/}
                    {/*            </div>*/}
                    {/*            <div>*/}
                    {/*                <h4 className="font-medium text-sm">Find services near you</h4>*/}
                    {/*                <p className="text-xs text-muted-foreground">Enable location access to discover businesses in your area.</p>*/}
                    {/*            </div>*/}
                    {/*        </div>*/}
                    {/*        <Button size="sm" onClick={requestLocation}>*/}
                    {/*            Use current location*/}
                    {/*        </Button>*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    {/* Main Content Grid */}
                    <div className="px-1 py-4">
                        {allProviders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No providers available at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {allProviders.map((provider) => (
                                    <Link
                                        key={provider.id}
                                        href={`/provider/${provider.slug}`}
                                        className="group flex flex-col space-y-3 hover:border p-2 rounded transition-all"
                                    >
                                        {/* Card Image/Placeholder */}
                                        <div className="relative aspect-[4/3] overflow-hidden rounded bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                            <div className="text-center p-6">
                                                <h3 className="text-2xl font-bold text-foreground mb-2">
                                                    {provider.businessName}
                                                </h3>
                                                <div className="flex items-center justify-center gap-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        {provider.servicesCount} {provider.servicesCount === 1 ? 'service' : 'services'}
                                                    </p>
                                                    {provider.distance !== null && (
                                                        <>
                                                            <span className="text-muted-foreground/30">•</span>
                                                            <p className="text-sm font-medium text-primary flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {provider.distance}km
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        </div>

                                        {/* Card Info */}
                                        <div className="flex-1 space-y-2">
                                            <div className="space-y-1">
                                                <h3 className="line-clamp-1 font-semibold text-foreground group-hover:underline">
                                                    {provider.businessName}
                                                </h3>
                                                <p className="line-clamp-1 text-sm text-muted-foreground">
                                                    by {provider.name}
                                                </p>
                                            </div>

                                            {provider.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {provider.description}
                                                </p>
                                            )}

                                            {provider.services.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {provider.services.map((service, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {service}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Infinite Scroll Trigger */}
                        <div ref={loadMoreRef} className="h-10 mt-8 flex items-center justify-center">
                            {loading && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    Loading more...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
