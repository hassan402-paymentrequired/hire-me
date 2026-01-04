import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '@/layouts/guest-layout';
import { Head, router } from '@inertiajs/react';
import { HeaderFilter } from '@/pages/guest/components/filter';
import BusinessCard from '@/pages/guest/components/business-card';

interface Provider {
    id: string;
    name: string;
    businessName: string;
    slug: string;
    description: string;
    servicesCount: number;
    services: string[];
    distance?: number;
    logo?: string | null;
    rating: number;
    reviewsCount: number;
    minPrice: number | string;
    address: string;
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
        sort?: string;
        min_rating?: number | string;
    };
    canRegister: boolean;
}

export default function Welcome({ providers, categories, filters }: Props) {
    const [allProviders, setAllProviders] = useState(providers.data);
    const [loading, setLoading] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const isLoadingRef = useRef(false); // Prevent multiple simultaneous requests

    const loadMore = useCallback(() => {
        if (!providers.next_page_url || isLoadingRef.current) return;

        isLoadingRef.current = true;
        setLoading(true);

        router.get(
            providers.next_page_url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['providers'],
                onFinish: () => {
                    setLoading(false);
                    isLoadingRef.current = false;
                },
                onError: () => {
                    setLoading(false);
                    isLoadingRef.current = false;
                }
            }
        );
    }, [providers.next_page_url]);


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
                if (entries[0].isIntersecting && !isLoadingRef.current) {
                    loadMore();
                }
            },
            { threshold: 0.5, rootMargin: '100px' } // Trigger earlier for better UX
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
            observer.disconnect();
        };
    }, [loadMore]);

    const requestLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    router.get('/', {
                        ...filters,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        sort: 'distance_asc' // Auto-sort by distance
                    }, {
                        preserveState: true,
                        replace: true,
                        preserveScroll: true
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    };

    useEffect(() => {
        // Auto-detect location if not already filtered by location
        if (!filters.lat || !filters.lng) {
            requestLocation();
        }
    }, [filters.lat, filters.lng]);

    return (
        <>
            <Head title="Find Services Providers Near You | HireMe">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <AppLayout>
                <div className="flex flex-col space-y-6 px-5 box-border overflow-hidden pb-10">
                    {/* Top Filter Bar */}
                    <HeaderFilter
                        categories={categories}
                        filters={filters}
                        onLocationRequest={requestLocation}
                        hasLocation={!!filters.lat}
                    />

                    {/* Main Content Grid */}
                    <div className="px-1 py-4">
                        {allProviders.length === 0 && !loading ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No providers available at the moment.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {allProviders.map((provider) => (
                                        <BusinessCard provider={provider} key={provider.id} />
                                    ))}
                                </div>

                                {/* Infinite Scroll Trigger */}
                                {providers.next_page_url && (
                                    <div ref={loadMoreRef} className="h-10 mt-8 flex items-center justify-center">
                                        {loading && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                Loading more...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
