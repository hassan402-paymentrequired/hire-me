import { EmptyCard } from '@/components/ui/empty-card';
import AppLayout from '@/layouts/guest-layout';
// import { PROVIDERS_BEFORE_LOGIN } from '@/lib/constants';
import BusinessCard from '@/pages/guest/components/business-card';
import { HeaderFilter } from '@/pages/guest/components/filter';
import { Provider } from '@/types';
import { Head, InfiniteScroll, router, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import Landing from './components/landing-page';
import { MiniLoginForm } from './mini-login-form';
import { toast } from 'sonner';

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

export default function Welcome({
    providers,
    categories,
    filters,
    canRegister,
}: Props) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };
    const isGuest = !auth?.user;
   

    const requestLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    router.get(
                        '/',
                        {
                            ...filters,
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            sort: 'distance_asc', // Auto-sort by distance
                        },
                        {
                            preserveState: true,
                            replace: true,
                            preserveScroll: true,
                        },
                    );
                },
                (error) => {
                    console.error('Error getting location:', error);
                    let errorMessage = 'Could not determine your location. Please try searching manually.';

                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = 'Location access was denied. Please allow location access in your browser settings.';
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMessage = 'Your location is currently unavailable. This might be a device or network issue.';
                    } else if (error.code === error.TIMEOUT) {
                        errorMessage = 'Location request timed out. Please try again.';
                    }

                    toast.error(errorMessage, { id: 'location-toast' });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            toast.error('Geolocation is not supported by your browser.');
        }
    };

    return (
        <>
            <Head title="Find Services Providers Near You | Clockra">
                <meta
                    name="description"
                    content="Discover local service providers near your location with Clockra. Browse trusted professionals, view service offerings, ratings, and book your next appointment with ease. Find the right expert for your needs quickly and securely."
                />
                <meta
                    name="keywords"
                    content="service providers, local providers, find providers, hire providers, book appointments, find services, hire services, book services, find professionals, hire professionals, book professionals, find experts, hire experts, book experts"
                />
                <meta name="author" content="Clockra" />
                <meta name="robots" content="index, follow" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <meta
                    property="og:title"
                    content="Find Services Providers Near You | Clockra"
                />
                <meta
                    property="og:description"
                    content="Discover local service providers near your location with Clockra. Browse trusted professionals, view service offerings, ratings, and book your next appointment with ease. Find the right expert for your needs quickly and securely."
                />
                <meta property="og:image" content="/logo/site.webmanifest" />
            </Head>
            <link rel="preconnect" href="https://fonts.bunny.net" />
            <link
                href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                rel="stylesheet"
            />
            <AppLayout>
                <div className="m box-border flex w-full flex-col space-y-6 overflow-visible px-5">
                    <Landing />

                    {/* market place */}
                    <div id="marketplace" className="min-h-[calc(98vh-3rem)]">
                        <HeaderFilter
                            categories={categories}
                            filters={filters}
                            onLocationRequest={requestLocation}
                            hasLocation={!!filters.lat}
                        />

                        {/* Main Content Grid */}
                        <div>
                            <div className="px-1 py-4">
                                {providers?.data?.length === 0  ? (
                                    <EmptyCard
                                        title="No providers available at the moment."
                                        // description="No providers available at the moment."
                                        image="assets/gifs/empty.svg"
                                        buttonOnClick={() => router.get('/')}
                                        className="size-74"
                                    />
                                ) : (
                                    <>
                                        <InfiniteScroll
                                            data="providers"
                                            buffer={300}
                                            next={({
                                                loading,
                                                hasNext
                                            }) =>
                                                hasNext && (
                                                    <div
                                                        className="mt-8 flex h-10 items-center justify-center"
                                                    >
                                                        {loading && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                                Loading more...
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            }
                                        >
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                {providers?.data?.map(
                                                    (provider) => (
                                                        <BusinessCard
                                                            provider={provider}
                                                            key={provider.id}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </InfiniteScroll>

                                        {/* Guest gate: login to continue viewing more providers */}
                                        {isGuest && (
                                            <div className="mt-10">
                                                <MiniLoginForm
                                                    gate
                                                    canRegister={canRegister}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
