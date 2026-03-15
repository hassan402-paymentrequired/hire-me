import { Button } from '@/components/ui/button';
import { ArrowDownIcon } from '@heroicons/react/24/solid';
import {
    CheckCircle2,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import Cubes from './cube';

interface LandingProps {
    categories?: { name: string; slug: string }[];
    initialSearch?: string;
    onLocationRequest?: () => void;
    onSearch?: (value: string) => void;
    onCategorySelect?: (category: string) => void;
}

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
        <div className="relative isolate flex min-h-[calc(100vh-3rem)] items-center overflow-hidden">
            <div
                className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_35%),linear-gradient(to_bottom_right,_var(--background),_color-mix(in_oklab,var(--primary)_5%,var(--background)),_var(--background))]"
                aria-hidden
            />

            <div
                className="absolute top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
                aria-hidden
            />

            <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div
                        className="animate-fade-in-up relative mx-auto h-[18px] w-20 opacity-80"
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

                    <div
                        className="mt-10 grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10"
                        style={{ animationDelay: '0.2s' }}
                    >
                        <div className="text-center lg:text-left">
                            <div
                                className="animate-fade-in-up mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase"
                                style={{ animationDelay: '0.25s' }}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                Discover providers with clarity
                            </div>

                            <h1 className="animate-fade-in-up text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white">
                                Book with more{' '}
                                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                    confidence
                                </span>{' '}
                                from the first click
                            </h1>

                            <p
                                className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-sm font-medium text-pretty text-gray-500 sm:text-base lg:mx-0 dark:text-gray-400"
                                style={{ animationDelay: '0.4s' }}
                            >
                                Discover verified providers, see clear pricing,
                                and move from browsing to booking without the
                                usual guesswork.
                            </p>

                            <div
                                className="animate-fade-in-up mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                                style={{ animationDelay: '0.5s' }}
                            >
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/75 px-4 py-2 text-sm text-foreground">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    Verified providers
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/75 px-4 py-2 text-sm text-foreground">
                                    <Star className="h-4 w-4 text-primary" />
                                    Clear ratings
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/75 px-4 py-2 text-sm text-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    Transparent pricing
                                </div>
                            </div>

                            <form
                                onSubmit={handleSearchSubmit}
                                className="animate-fade-in-up mt-8"
                                style={{ animationDelay: '0.55s' }}
                            >
                                <div className="flex max-w-3xl flex-col gap-3 rounded-full border border-border/60 bg-background/85 p-1 backdrop-blur md:flex-row md:items-center">
                                    <div className="relative flex-1">
                                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            value={query}
                                            onChange={(e) =>
                                                setQuery(e.target.value)
                                            }
                                            placeholder="Search providers, services, or locations"
                                            className="h-12 w-full rounded-full border-none bg-muted/40 pr-4 pl-11 text-sm shadow-none ring-0 outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="h-12 rounded-full px-6"
                                        >
                                            Explore providers
                                        </Button>
                                        {/* <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            onClick={onLocationRequest}
                                            className="h-12 rounded-full px-6"
                                        >
                                            <MapPin className="h-4 w-4" />
                                            Use my location
                                        </Button> */}
                                    </div>
                                </div>
                            </form>

                            <div
                                className="animate-fade-in-up mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
                                style={{ animationDelay: '0.6s' }}
                            >
                                {featuredCategories.map((category) => (
                                    <button
                                        key={category.slug}
                                        type="button"
                                        onClick={() => {
                                            onCategorySelect?.(category.slug);
                                            scrollToMarketplace();
                                        }}
                                        className="rounded-full border border-border/60 bg-background/75 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div
                            className="animate-fade-in-up rounded-[32px] border border-border/60 bg-background/80 p-5 text-left border-2 border-gray-100 backdrop-blur"
                            style={{ animationDelay: '0.45s' }}
                        >
                            <div className="rounded-[24px] bg-primary/6 p-5">
                                <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                                    Why proxideck
                                </p>
                                <div className="mt-5 space-y-4">
                                    <div className="rounded-2xl border border-border/50 bg-background/80 p-4">
                                        <p className="text-sm font-semibold text-foreground">
                                            Know who you are booking
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Business profiles, ratings, and
                                            service details are visible before
                                            you decide.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/50 bg-background/80 p-4">
                                        <p className="text-sm font-semibold text-foreground">
                                            Reduce booking uncertainty
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Compare pricing, availability, and
                                            provider fit without bouncing
                                            between pages.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/50 bg-background/80 p-4">
                                        <p className="text-sm font-semibold text-foreground">
                                            Move straight into discovery
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Use location, search, or featured
                                            categories to reach the marketplace
                                            faster.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold">
                                        Ready to browse?
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Jump into nearby providers now.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="rounded-full"
                                    onClick={scrollToMarketplace}
                                >
                                    Explore
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div
                        className="animate-fade-in-up mt-8 flex flex-col items-center gap-4"
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
    );
}
