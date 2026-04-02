import { Button } from '@/components/ui/button';
import { ArrowDownIcon } from '@heroicons/react/24/solid';
import { Search, Sparkles, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import Cubes from './cube';

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

    const featuredCategories = categories.slice(0, 4);

    return (
        <>
            {/* ── HERO ── */}
            <div className="relative isolate flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center overflow-hidden">
                {/* Background gradients */}
                <div
                    className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_35%),linear-gradient(to_bottom_right,_var(--background),_color-mix(in_oklab,var(--primary)_5%,var(--background)),_var(--background))]"
                    aria-hidden
                />
                <div
                    className="absolute top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
                    aria-hidden
                />

                <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        {/* Cubes accent */}
                        <div
                            className="animate-fade-in-up relative mx-auto h-[18px] w-20 opacity-80 lg:mx-0"
                            style={{ animationDelay: '0.1s' }}
                        >
                            <Cubes
                                gridSize={1}
                                maxAngle={45}
                                radius={3}
                                faceColor="#1a1a2e"
                                rippleColor="#ff6b6b"
                                rippleSpeed={1.5}
                                autoAnimate
                                rippleOnClick
                            />
                        </div>

                        {/* Two-column grid */}
                        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
                            {/* ── LEFT: headline + search ── */}
                            <div className="text-center lg:text-left">
                                {/* Badge */}
                                <div
                                    className="animate-fade-in-up mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase"
                                    style={{ animationDelay: '0.2s' }}
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Discover providers with clarity
                                </div>

                                {/* Headline */}
                                <h1
                                    className="animate-fade-in-up text-5xl font-semibold tracking-tight text-balance text-gray-900 capitalize sm:text-6xl dark:text-white"
                                    style={{ animationDelay: '0.25s' }}
                                >
                                    Find trusted providers and book with more{' '}
                                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                        confidence
                                    </span>{' '}
                                    from the first click
                                </h1>

                                {/* Subtext */}
                                <p
                                    className="animate-fade-in-up mx-auto mt-5 max-w-xl text-sm font-medium text-pretty text-gray-500 sm:text-base lg:mx-0 dark:text-gray-400"
                                    style={{ animationDelay: '0.35s' }}
                                >
                                    Compare verified providers, transparent
                                    pricing, and real reviews without the usual
                                    guesswork.
                                </p>

                                {/* ── Search bar ── */}
                                <form
                                    onSubmit={handleSearchSubmit}
                                    className="animate-fade-in-up mt-7"
                                    style={{ animationDelay: '0.45s' }}
                                >
                                    <div className="flex max-w-2xl flex-col gap-3 rounded-full border border-border/60 bg-background/85 p-1 backdrop-blur md:flex-row md:items-center">
                                        <div className="relative flex-1">
                                            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                value={query}
                                                onChange={(e) =>
                                                    setQuery(e.target.value)
                                                }
                                                placeholder="What are you looking for..."
                                                className="h-12 w-full rounded-full border-none bg-muted/40 pr-4 pl-11 text-sm shadow-none ring-0 outline-none"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="h-12 rounded-full px-6"
                                        >
                                            Search
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            <div
                                className="animate-fade-in-up flex items-center justify-center"
                                style={{ animationDelay: '0.3s' }}
                            >
                                <img
                                    src="https://cdn.prod.website-files.com/64c73d04a946980a4476537e/64cd4d1949333dd65b97493f_waiting.png"
                                    alt="Browse and book trusted providers"
                                    className="w-full max-w-xs object-contain drop-shadow-xl sm:max-w-sm lg:max-w-lg"
                                />
                            </div>
                        </div>

                        {/* Scroll nudge */}
                        <div
                            className="animate-fade-in-up mt-10 flex flex-col items-center gap-4"
                            style={{ animationDelay: '0.7s' }}
                        >
                            <button
                                type="button"
                                onClick={scrollToMarketplace}
                                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Browse nearby providers
                                <ArrowDownIcon className="h-5 w-5 animate-bounce" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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
