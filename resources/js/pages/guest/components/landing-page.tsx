import { Button } from '@/components/ui/button';
import { ArrowDownIcon } from '@heroicons/react/24/solid';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, Star, TrendingUp, Users, Zap } from 'lucide-react';

const STATS = [
    { icon: Users, label: 'Verified providers', value: '2,000+' },
    { icon: Star, label: 'Reviews collected', value: '18,400+' },
    { icon: TrendingUp, label: 'Bookings this month', value: '3,200+' },
    { icon: Zap, label: 'Avg. response time', value: '< 2 hrs' },
];

export default function Landing() {
    const scrollToMarketplace = () => {
        document.getElementById('marketplace')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <>
            <section className="relative isolate overflow-hidden">
                <div className="absolute inset-0 -z-20" aria-hidden />
                <div
                    className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.10),transparent_22%),radial-gradient(circle_at_84%_22%,rgba(59,130,246,0.08),transparent_24%)]"
                    aria-hidden
                />

                <div className="flex min-h-[calc(100vh-3rem)] w-full flex-col items-center px-6 py-10 lg:px-8 lg:py-12">
                    <div className="flex w-full flex-1 flex-col items-center justify-center text-center">
                        <div className="hidden w-full lg:grid lg:grid-cols-[200px_minmax(0,1fr)_240px] lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-10 lg:gap-y-14 xl:grid-cols-[240px_minmax(0,1fr)_260px]">
                            <div className="self-end justify-self-start">
                                <div className="overflow-hidden rounded-[2rem] shadow-[0_32px_70px_-44px_rgba(6,78,59,0.32)]">
                                    <img
                                        src="/assets/illustrations/hero.jpg"
                                        alt="Service professionals"
                                        className="h-[245px] w-full rounded-[1.5rem] object-cover object-center"
                                    />
                                </div>
                            </div>

                            <div className="row-span-2 mx-auto w-full max-w-3xl space-y-7 self-center">
                                <div className="space-y-5">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-gray-600 uppercase backdrop-blur">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70" />
                                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                                        </span>
                                        trusted local booking
                                    </div>

                                    <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-balance text-gray-950 xl:text-7xl">
                                        Find trusted providers for everyday
                                        services
                                        <span className="text-emerald-950 underline">
                                            {' '}
                                            near you
                                        </span>
                                    </h1>

                                    <p className="mx-auto max-w-xl text-base leading-8 text-gray-600">
                                        Search, compare, and book without
                                        friction. proxideck helps you move from
                                        need to appointment in a few taps.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <Button
                                        type="button"
                                        onClick={scrollToMarketplace}
                                        className="h-12 rounded-full bg-emerald-950 px-7 text-sm text-white hover:bg-emerald-950/90"
                                    >
                                        Explore
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-12 rounded-full border-black/10 bg-white/80 px-7 text-sm text-gray-700 hover:bg-white"
                                    >
                                        <Link href="/login">Try now</Link>
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-center gap-1.5 text-amber-400">
                                        {[...Array(5)].map((_, index) => (
                                            <Star
                                                key={index}
                                                className="h-4 w-4 fill-current"
                                            />
                                        ))}
                                        <span className="ml-2 text-base font-semibold text-gray-900">
                                            4.9
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Trusted by clients booking beauty,
                                        repairs, wellness, and home services.
                                    </p>
                                </div>
                            </div>

                            <div className="self-end justify-self-end">
                                <div className="relative rounded-[2rem] bg-emerald-950 p-7 text-left text-white shadow-[0_32px_70px_-44px_rgba(6,78,59,0.68)]">
                                    <div className="absolute top-1/2 -right-5 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-200 text-emerald-950">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </div>
                                    <p className="max-w-[11rem] text-2xl leading-9 tracking-[-0.04em]">
                                        Book reliable professionals without the
                                        noise.
                                    </p>
                                </div>
                            </div>

                            <div className="self-start justify-self-end xl:translate-x-4">
                                <div className="flex min-h-[220px] w-[200px] flex-col justify-end rounded-[2rem] bg-emerald-950 p-8 text-left text-white shadow-[0_32px_70px_-44px_rgba(6,78,59,0.68)]">
                                    <p className="text-4xl font-semibold tracking-[-0.05em]">
                                        100+
                                    </p>
                                    <p className="mt-3 max-w-[11rem] text-sm leading-7 text-white/75">
                                        service categories clients search every
                                        week
                                    </p>
                                </div>
                            </div>

                            <div className="self-start justify-self-start xl:-translate-x-4">
                                <div className="flex min-h-[220px] w-[235px] flex-col justify-between rounded-[2rem] bg-white p-7 text-left shadow-[0_22px_50px_-34px_rgba(17,24,39,0.18)] ring-1 ring-black/6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100">
                                            <ArrowUpRight className="h-4 w-4 text-emerald-950" />
                                        </div>
                                        <span className="text-xs font-medium text-emerald-700">
                                            live
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Searches this month
                                        </p>
                                        <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-gray-950">
                                            1,951+
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500">
                                            More clients are discovering local
                                            providers on proxideck.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-3xl space-y-7 lg:hidden">
                            <div className="space-y-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-gray-600 uppercase backdrop-blur">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                                    </span>
                                    trusted local booking
                                </div>

                                <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-balance text-gray-950 sm:text-6xl xl:text-7xl">
                                    Find trusted providers for everyday services
                                    <span className="bg-clip-text text-emerald-950 underline">
                                        {' '}
                                        near you
                                    </span>
                                </h1>

                                <p className="mx-auto max-w-xl text-base leading-8 text-gray-600">
                                    Search, compare, and book without friction.
                                    proxideck helps you move from need to
                                    appointment in a few taps.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <Button
                                    type="button"
                                    onClick={scrollToMarketplace}
                                    className="h-12 rounded-full bg-emerald-950 px-7 text-sm text-white hover:bg-emerald-950/90"
                                >
                                    Explore
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-12 rounded-full border-black/10 bg-white/80 px-7 text-sm text-gray-700 hover:bg-white"
                                >
                                    <Link href="/login">Try now</Link>
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-1.5 text-amber-400">
                                    {[...Array(5)].map((_, index) => (
                                        <Star
                                            key={index}
                                            className="h-4 w-4 fill-current"
                                        />
                                    ))}
                                    <span className="ml-2 text-base font-semibold text-gray-900">
                                        4.9
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Trusted by clients booking beauty, repairs,
                                    wellness, and home services.
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 grid w-full max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
                            <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-200 via-sky-100 to-white md:min-h-[280px]">
                                <div className="h-full rounded-[1.5rem] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]">
                                    <img
                                        src="/assets/illustrations/group.svg"
                                        alt="Service professionals"
                                        className="h-full w-full rounded-[1.5rem] object-cover object-center"
                                    />
                                </div>
                            </div>

                            <div className="flex min-h-[220px] flex-col justify-end rounded-[2rem] bg-emerald-950 p-8 text-left text-white">
                                <p className="text-4xl font-semibold tracking-[-0.05em]">
                                    100+
                                </p>
                                <p className="mt-3 max-w-[12rem] text-sm leading-7 text-white/75">
                                    service categories clients search every week
                                </p>
                            </div>

                            <div className="flex min-h-[220px] flex-col justify-between rounded-[2rem] bg-white p-7 text-left shadow-[0_22px_50px_-34px_rgba(17,24,39,0.22)] ring-1 ring-black/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100">
                                        <ArrowUpRight className="h-4 w-4 text-emerald-950" />
                                    </div>
                                    <span className="text-xs font-medium text-emerald-700">
                                        live
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Searches this month
                                    </p>
                                    <p className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-gray-950">
                                        1,951+
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        More clients are discovering local
                                        providers on proxideck.
                                    </p>
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <div className="relative rounded-[2rem] bg-emerald-950 p-7 text-left text-white">
                                    <div className="absolute right-5 bottom-5 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-200 text-emerald-950">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </div>
                                    <p className="max-w-[12rem] text-2xl leading-9 tracking-[-0.04em]">
                                        Book reliable professionals without the
                                        noise.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col items-center gap-4">
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
                </div>
            </section>
        </>
    );
}
