import { Button } from '@/components/ui/button';
import { ArrowDownIcon } from '@heroicons/react/24/solid';
import { Search, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

interface LandingProps {
    categories?: { name: string; slug: string }[];
    initialSearch?: string;
    onLocationRequest?: () => void;
    onSearch?: (value: string) => void;
    onCategorySelect?: (category: string) => void;
}

const STATS = [
    { icon: Users, label: 'Verified providers', value: '2,000+' },
    { icon: Star, label: 'Reviews collected', value: '18,400+' },
    { icon: TrendingUp, label: 'Bookings this month', value: '3,200+' },
    { icon: Zap, label: 'Avg. response time', value: '< 2 hrs' },
];

export default function Landing({
    categories = [],
    initialSearch = '',
    onLocationRequest,
    onSearch,
    onCategorySelect,
}: LandingProps) {
    const [query, setQuery] = useState(initialSearch);

    useEffect(() => {
        setQuery(initialSearch);
    }, [initialSearch]);

    const scrollToMarketplace = () => {
        document.getElementById('marketplace')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSearch?.(query.trim());
        scrollToMarketplace();
    };

    const featuredCategories = useMemo(() => categories.slice(0, 5), [categories]);

    return (
        <>
            <section className="relative isolate overflow-hidden">
                <div
                    className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#fcfcfb_0%,#f7f7f4_55%,#f5f5f1_100%)]"
                    aria-hidden
                />
                <div
                    className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.10),transparent_22%),radial-gradient(circle_at_84%_22%,rgba(59,130,246,0.08),transparent_24%)]"
                    aria-hidden
                />

                <div className="mx-auto flex flex-col min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center px-6 py-12 lg:px-8">
                    <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center">
                        <div className="w-full max-w-3xl space-y-8">
                            <div className="space-y-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-gray-600 uppercase backdrop-blur">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                                    </span>
                                    trusted local booking
                                </div>

                                <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-balance text-gray-950 sm:text-6xl xl:text-7xl">
                                    Find the right provider and book in minutes
                                </h1>

                                <p className="mx-auto max-w-xl text-base leading-8 text-gray-600">
                                    Search nearby services, compare verified professionals, and move straight into booking without noise.
                                </p>
                            </div>

                            <form
                                onSubmit={handleSearchSubmit}
                                className="rounded-full border border-black/5 bg-white/90 p-2 shadow-[0_24px_60px_-34px_rgba(17,24,39,0.28)] backdrop-blur"
                            >
                                <div className="relative flex flex-col gap-3 rounded-full bg-[#f6f6f2] p-1 sm:flex-row sm:items-center">
                                    <div className="relative flex-1">
                                        <Search className="absolute top-1/2 left-5 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Search for salons, plumbers, makeup artists..."
                                            className="h-14 w-full rounded-full bg-transparent pr-4 pl-12 text-sm text-gray-900 outline-none ring-0 placeholder:text-gray-400 sm:pr-40"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-12 rounded-full bg-black px-6 text-sm text-white hover:bg-black/90 sm:absolute sm:top-1/2 sm:right-3 sm:h-11 sm:-translate-y-1/2"
                                    >
                                        Search now
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center">
                        <button
                            type="button"
                            onClick={scrollToMarketplace}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
                        >
                            Browse nearby providers
                            <ArrowDownIcon className="h-5 w-5 animate-bounce" />
                        </button>
                    </div>
                </div>
            </section>

            <div className="sticky bottom-0 z-20 border-t border-border/60 bg-background/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-2 divide-x divide-border/60 sm:grid-cols-4">
                        {STATS.map(({ icon: Icon, label, value }) => (
                            <div
                                key={label}
                                className="flex items-center justify-center gap-3 px-4 py-4"
                            >
                                <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:flex">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground tabular-nums">
                                        {value}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
