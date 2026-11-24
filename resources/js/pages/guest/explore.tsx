import { ProviderCard } from '@/components/site/provider-card';
import { EmptyState } from '@/components/site/empty-state';
import { SiteNav } from '@/components/site/site-nav';
import { cn } from '@/lib/utils';
import GuestLayout from '@/layouts/guest-layout';
import explore from '@/routes/explore';
import { type WelcomeProps } from '@/types';
import { Head, InfiniteScroll, router } from '@inertiajs/react';
import { gooeyToast as toast } from 'goey-toast';
import { LocateFixed, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type Filters = WelcomeProps['filters'] & { location?: string };

const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'rating_desc', label: 'Top rated' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
    { value: 'distance_asc', label: 'Nearest' },
];

const chipClass = (active: boolean) =>
    cn(
        'h-10 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap',
        active ? 'border-forest bg-forest text-white' : 'border-[#DDE3DE] bg-white text-ink hover:border-sage',
    );

export default function Explore({ providers, categories, filters, favoriteBusinessIds }: Omit<WelcomeProps, 'filters'> & { filters: Filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [location, setLocation] = useState(filters.location ?? '');

    const applyFilters = (changes: Partial<Filters>) => {
        const next = { ...filters, ...changes };
        const query = Object.fromEntries(Object.entries(next).filter(([, value]) => value !== null && value !== undefined && value !== ''));

        router.get(explore.index(), query, { preserveState: true, preserveScroll: true, replace: true });
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        applyFilters({ search, location });
    };

    const useMyLocation = () => {
        if (!('geolocation' in navigator)) {
            toast.error('Your browser does not support location.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => applyFilters({ lat: coords.latitude, lng: coords.longitude, sort: 'distance_asc' }),
            () => toast.error('We could not get your location. Please allow location access and try again.'),
            { timeout: 10000 },
        );
    };

    const activeCategory = filters.category ?? '';
    const resultCount = providers?.data?.length ?? 0;

    return (
        <GuestLayout nav="none">
            <Head title="Explore pros near you" />

            <section className="relative overflow-hidden bg-forest-deep">
                <img src="/brand/banners/proxideck-banner-general-dark.jpg" alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-forest-deep/65" />
                <SiteNav variant="dark" />
                <div className="relative mx-auto flex max-w-[1240px] flex-col gap-7 px-4 pt-14 pb-16 sm:px-6">
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <h1 className="max-w-160 text-4xl leading-[1.02] font-bold tracking-[-0.03em] text-white sm:text-[56px]">
                            Good hands, <span className="text-lime">right around the corner.</span>
                        </h1>
                        <p className="max-w-90 text-[17px] leading-relaxed text-[#C9E2D3]">
                            Real prices, real reviews and open slots from pros near you.
                        </p>
                    </div>

                    <form onSubmit={submitSearch} className="flex flex-wrap gap-1 rounded-[22px] bg-white p-2">
                        <label className="flex flex-[1.4_1_220px] flex-col gap-0.5 px-4.5 py-2.5">
                            <span className="text-xs font-bold">What</span>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="All treatments"
                                className="bg-transparent text-base font-semibold outline-none placeholder:font-normal placeholder:text-moss"
                            />
                        </label>
                        <span className="my-3 hidden w-px bg-line sm:block" />
                        <label className="flex flex-[1_1_180px] flex-col gap-0.5 px-4.5 py-2.5">
                            <span className="text-xs font-bold">Where</span>
                            <input
                                value={location}
                                onChange={(event) => setLocation(event.target.value)}
                                placeholder="Area or city"
                                className="bg-transparent text-base outline-none placeholder:text-moss"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={useMyLocation}
                            className={cn('flex h-15.5 items-center gap-2 rounded-2xl px-4 text-sm font-semibold', filters.lat ? 'bg-mint text-forest' : 'text-moss hover:bg-paper')}
                        >
                            <LocateFixed className="size-4" /> {filters.lat ? 'Near me' : 'Use my location'}
                        </button>
                        <button type="submit" className="flex h-15.5 w-full items-center justify-center gap-2.5 rounded-2xl bg-lime px-7.5 font-bold text-forest sm:w-auto">
                            <Search className="size-4.5" /> Search
                        </button>
                    </form>
                </div>
            </section>

            <div className="border-b border-line">
                <div role="tablist" aria-label="Categories" className="mx-auto flex max-w-[1240px] gap-2 overflow-x-auto px-4 py-4.5 sm:px-6">
                    <button role="tab" aria-selected={!activeCategory} onClick={() => applyFilters({ category: undefined })} className={chipClass(!activeCategory)}>
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.slug}
                            role="tab"
                            aria-selected={activeCategory === category.name}
                            onClick={() => applyFilters({ category: category.name })}
                            className={chipClass(activeCategory === category.name)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mx-auto flex max-w-[1240px] flex-col gap-7 px-4 pt-8 pb-26 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-[26px] font-bold tracking-tight">{activeCategory ? `${activeCategory} near you` : 'Top picks near you'}</h2>
                        <p className="mt-1 text-sm text-moss">
                            {filters.search ? `Results for “${filters.search}”` : 'Every pro here has prices and availability listed.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => applyFilters({ min_rating: filters.min_rating ? undefined : 4.5 })} className={chipClass(Boolean(filters.min_rating))}>
                            4.5+ rating
                        </button>
                        <label className="sr-only" htmlFor="sort">
                            Sort by
                        </label>
                        <select
                            id="sort"
                            value={filters.sort ?? 'recommended'}
                            onChange={(event) => applyFilters({ sort: event.target.value })}
                            className="h-10 rounded-full border border-[#DDE3DE] bg-white px-4 text-sm font-semibold"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {resultCount === 0 ? (
                    <EmptyState
                        illustration="search"
                        title="No pros match that yet"
                        description="Try another area or category, or clear your filters to see everyone near you."
                        actions={
                            <>
                                <button onClick={() => router.get(explore.index())} className="h-12 rounded-full bg-forest px-5.5 text-[15px] font-bold text-white">
                                    Clear filters
                                </button>
                                <button onClick={useMyLocation} className="h-12 rounded-full border border-[#DDE3DE] px-5 text-[15px] font-semibold">
                                    Use my location
                                </button>
                            </>
                        }
                    />
                ) : (
                    <InfiniteScroll
                        data="providers"
                        buffer={300}
                        next={({ loading }) =>
                            loading && <div className="mt-8 text-center text-sm text-moss">Loading more pros…</div>
                        }
                    >
                        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                            {providers.data.map((provider) => (
                                <ProviderCard key={provider.id} provider={provider} isFavourite={favoriteBusinessIds.includes(provider.businessId)} />
                            ))}
                        </div>
                    </InfiniteScroll>
                )}
            </div>
        </GuestLayout>
    );
}
