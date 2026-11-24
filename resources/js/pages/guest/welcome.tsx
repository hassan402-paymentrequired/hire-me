import KiroChat from '@/components/kiro/kiro-chat';
import { ProviderCard } from '@/components/site/provider-card';
import { SiteNav } from '@/components/site/site-nav';
import GuestLayout from '@/layouts/guest-layout';
import { becomeProvider } from '@/routes';
import explore from '@/routes/explore';
import { type Provider } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Droplet,
    Flower2,
    Lock,
    Palette,
    Scissors,
    Sparkles,
    Star,
    Store,
    type LucideIcon,
} from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';

interface WelcomeProps {
    featuredProviders: Provider[];
}

const perks = [
    { title: 'Verified pros', text: 'ID-checked before they take bookings' },
    { title: 'Prices upfront', text: 'no haggling' },
    { title: 'Pay from your wallet', text: 'deposit held until your appointment' },
    { title: 'Studio or home service', text: 'they can come to you' },
    { title: 'Instant confirmation', text: 'no back-and-forth DMs' },
    { title: 'Real reviews only', text: 'from completed bookings' },
];

interface CategoryTile {
    category: string;
    label: string;
    hint: string;
    icon: LucideIcon;
    className: string;
}

const categoryTiles: CategoryTile[] = [
    { category: 'Salon', label: 'Hair & salons', hint: 'Knotless, silk press, wig installs, locs and treatments.', icon: Store, className: 'col-span-2 row-span-2 bg-forest text-white' },
    { category: 'Nails', label: 'Nails', hint: 'Gel, acrylic, BIAB, pedicures', icon: Droplet, className: 'bg-lime text-forest' },
    { category: 'Barbing', label: 'Barbers', hint: 'Cuts, fades, beard trims, home visits', icon: Scissors, className: 'row-span-2 bg-ink text-white' },
    { category: 'Makeup', label: 'Makeup', hint: 'Soft glam, bridal, gele', icon: Palette, className: 'bg-mint text-ink' },
    { category: 'Spa & Massage', label: 'Spa & massage', hint: 'Massage, facials, wellness', icon: Flower2, className: 'bg-mint text-ink' },
    { category: 'Cleaning', label: 'Home cleaning', hint: 'Deep cleans, move-in', icon: Sparkles, className: 'bg-lime text-forest' },
];

const steps = [
    { title: 'Find your pro', text: 'Search by service and area. Compare prices, photos and verified reviews side by side.' },
    { title: 'Pick a time', text: 'See live availability and book in a few taps — at the studio or at home.' },
    { title: 'Pay safely', text: 'Pay a deposit from your Proxideck wallet. It is released after your appointment.' },
];

function HeroSearch() {
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(explore.index(), { search: search || undefined, location: location || undefined });
    };

    return (
        <form onSubmit={submit} className="mt-2 flex w-full max-w-205 flex-wrap gap-1 rounded-[22px] bg-white p-2 text-left">
            <label className="flex flex-[1.3_1_200px] flex-col gap-0.5 px-4 py-2.5">
                <span className="text-xs font-bold text-ink">What</span>
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Braids, nails, AC repair…"
                    className="bg-transparent text-[15px] text-ink outline-none placeholder:text-moss"
                />
            </label>
            <span className="my-3 hidden w-px bg-line sm:block" />
            <label className="flex flex-[1_1_160px] flex-col gap-0.5 px-4 py-2.5">
                <span className="text-xs font-bold text-ink">Where</span>
                <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Lekki, Lagos"
                    className="bg-transparent text-[15px] text-ink outline-none placeholder:text-moss"
                />
            </label>
            <button type="submit" className="flex h-15 w-full items-center justify-center gap-2.5 rounded-2xl bg-lime px-6.5 font-bold text-forest sm:w-auto">
                Search
            </button>
        </form>
    );
}

function ContourLines() {
    return (
        <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <g fill="none" stroke="#C8F169" strokeWidth="1.2">
                {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                    <path
                        key={index}
                        opacity={0.16 - index * 0.016}
                        d={`M-40 ${760 - index * 60} C ${180 + index * 10} ${640 - index * 60}, ${360 + index * 10} ${820 - index * 60}, ${600 + index * 10} ${700 - index * 60} S ${1000 + index * 10} ${520 - index * 60}, ${1220 + index * 10} ${640 - index * 60} S 1480 ${700 - index * 60}, 1500 ${620 - index * 60}`}
                    />
                ))}
                {[150, 220, 290].map((radius, index) => (
                    <ellipse key={radius} opacity={0.12 - index * 0.02} cx="1180" cy="190" rx={radius} ry={radius * 0.6} />
                ))}
            </g>
        </svg>
    );
}

export default function Welcome({ featuredProviders }: WelcomeProps) {
    return (
        <GuestLayout nav="none">
            <Head title="Book trusted artisans near you">
                <meta
                    name="description"
                    content="Book hair, nails, barbers, cleaners and technicians near you. See real prices and reviews, pick a time and pay safely from your Proxideck wallet."
                />
            </Head>

            {/* Hero */}
            <section className="relative overflow-hidden bg-forest">
                <ContourLines />
                <SiteNav variant="dark" />
                <div className="relative mx-auto flex max-w-[1240px] flex-col items-center px-4 pt-16 text-center sm:px-6 sm:pt-22">
                    <div className="flex w-full max-w-230 flex-col items-center gap-7">
                        <h1 className="text-5xl leading-[0.98] font-bold tracking-[-0.035em] text-white sm:text-7xl lg:text-[84px]">
                            Book trusted artisans near you, <span className="text-lime">in seconds.</span>
                        </h1>
                        <p className="max-w-150 text-lg leading-relaxed text-[#C9E2D3] sm:text-xl">
                            Hair, nails, barbers, cleaners and technicians. See real prices and reviews, pick a time, and pay safely from
                            your wallet.
                        </p>
                        <HeroSearch />
                    </div>
                </div>

                <div className="group relative mt-24 overflow-hidden border-t border-white/10 bg-ink/35 py-6.5">
                    <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
                        {[...perks, ...perks].map((perk, index) => (
                            <span
                                key={index}
                                aria-hidden={index >= perks.length}
                                className="inline-flex items-center gap-3.5 px-9 text-[22px] font-bold whitespace-nowrap text-white"
                            >
                                <Sparkles className="size-5 fill-lime text-lime" />
                                {perk.title}
                                <span className="text-lg font-medium text-sage">{perk.text}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="mx-auto flex max-w-[1240px] flex-col gap-7 px-4 pt-22 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <h2 className="text-4xl font-bold tracking-tight">What are you booking today?</h2>
                    <Link href={explore.index()} className="text-[15px] font-semibold text-forest">
                        All categories
                    </Link>
                </div>
                <div className="grid auto-rows-[200px] grid-cols-2 gap-4 md:auto-rows-[220px] md:grid-cols-5">
                    {categoryTiles.map(({ category, label, hint, icon: Icon, className }, index) => (
                        <Link
                            key={category}
                            href={explore.index({ query: { category } })}
                            className={`relative flex flex-col justify-end overflow-hidden rounded-[28px] p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${className}`}
                        >
                            <Icon
                                aria-hidden
                                strokeWidth={0.7}
                                className={`absolute -top-8 -right-9 opacity-20 ${index === 0 ? 'size-95' : 'size-48'}`}
                            />
                            <span className={`relative font-bold tracking-tight ${index === 0 ? 'text-4xl' : 'text-2xl'}`}>{label}</span>
                            <span className="relative mt-1 text-sm opacity-75">{hint}</span>
                            {index === 0 && (
                                <span className="relative mt-5 flex h-12 items-center gap-2 self-start rounded-full bg-lime px-5.5 text-[15px] font-bold text-forest">
                                    Browse salons <ArrowRight className="size-4" />
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="mx-auto flex max-w-[1240px] flex-col gap-9 px-4 pt-26 sm:px-6">
                <div className="flex max-w-160 flex-col gap-2.5">
                    <span className="text-[15px] font-bold text-leaf">How Proxideck works</span>
                    <h2 className="text-4xl leading-tight font-bold tracking-tight">From “I need my hair done” to booked, in under a minute.</h2>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <div key={step.title} className="flex flex-col gap-4 rounded-3xl border border-line p-7">
                            <span className="grid size-13 place-items-center rounded-2xl bg-forest text-[22px] font-bold text-lime">{index + 1}</span>
                            <div className="text-[22px] font-bold">{step.title}</div>
                            <p className="leading-relaxed text-moss">{step.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured */}
            {featuredProviders.length > 0 && (
                <section className="mx-auto flex max-w-[1240px] flex-col gap-7 px-4 pt-26 sm:px-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[15px] font-bold text-leaf">Loved by customers</span>
                            <h2 className="text-4xl font-bold tracking-tight">Top-rated this week</h2>
                        </div>
                        <Link href={explore.index()} className="rounded-full border border-[#DDE3DE] px-4.5 py-2.5 text-[15px] font-semibold">
                            See all venues
                        </Link>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredProviders.map((provider) => (
                            <ProviderCard key={provider.id} provider={provider} />
                        ))}
                    </div>
                </section>
            )}

            {/* Trust */}
            <section className="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 pt-26 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <h2 className="max-w-140 text-4xl leading-tight font-bold tracking-tight">
                        Built so you never get stood up, overcharged or catfished.
                    </h2>
                    <p className="max-w-95 leading-relaxed text-moss">
                        Every booking runs through the same checks, so the pro you see is the pro who shows up.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <TrustCard title="The badge means something" text="We check ID, address and phone before a pro can take a single booking.">
                        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
                            <span className="grid size-11 place-items-center rounded-full bg-forest font-bold text-lime">AO</span>
                            <div className="flex-1">
                                <div className="text-[15px] font-bold">Amara Okafor</div>
                                <div className="text-[13px] text-moss">Makeup artist</div>
                            </div>
                            <span className="flex items-center gap-1 rounded-full bg-mint px-2 py-1 text-xs font-bold text-forest">
                                <BadgeCheck className="size-3.5" /> Verified
                            </span>
                        </div>
                    </TrustCard>

                    <div className="flex flex-col overflow-hidden rounded-[28px] bg-forest text-white">
                        <div className="flex h-55 flex-col justify-center gap-4 p-7">
                            {['You pay a ₦5,000 deposit', 'Held by Proxideck', 'Released after your appointment'].map((label, index) => (
                                <div key={label} className="flex items-center gap-3.5">
                                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-lime text-forest">
                                        {index === 1 ? <Lock className="size-3.5" /> : <span className="text-xs font-bold">{index + 1}</span>}
                                    </span>
                                    <span className="text-[15px] font-semibold">{label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-1.5 border-t border-white/10 px-7 pt-6 pb-7">
                            <div className="text-xl font-bold">Your money waits with us</div>
                            <p className="leading-relaxed text-sage">No-show or cancelled by the pro? Your deposit goes straight back to your wallet.</p>
                        </div>
                    </div>

                    <TrustCard title="Reviews you can trust" text="Only people who actually completed a booking can leave one.">
                        <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-4">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="size-3.5 fill-forest text-forest" />
                                ))}
                            </div>
                            <p className="text-sm leading-snug">Silky, bouncy and no heat damage. Booked and paid in two minutes.</p>
                            <span className="self-start rounded-full bg-mint px-2 py-1 text-xs font-bold text-leaf">Booked &amp; completed</span>
                        </div>
                    </TrustCard>
                </div>
            </section>

            {/* For business */}
            <section className="mx-auto max-w-[1240px] px-4 py-26 sm:px-6">
                <div className="flex flex-col gap-5 rounded-[32px] bg-ink p-10 sm:p-14">
                    <span className="self-start rounded-full bg-lime px-3 py-1.5 text-[13px] font-bold text-forest">For business</span>
                    <h2 className="max-w-140 text-4xl leading-tight font-bold tracking-tight text-white sm:text-[44px]">
                        Fill your calendar. Get paid upfront.
                    </h2>
                    <p className="max-w-110 text-[17px] leading-relaxed text-sage">
                        Online booking, deposits to your wallet, team schedules and reviews, all from one dashboard.
                    </p>
                    <Link href={becomeProvider()} className="flex h-13 items-center self-start rounded-full bg-lime px-6.5 font-bold text-forest">
                        List your business
                    </Link>
                </div>
            </section>

            <KiroChat />
        </GuestLayout>
    );
}

function TrustCard({ title, text, children }: { title: string; text: string; children: ReactNode }) {
    return (
        <div className="flex flex-col overflow-hidden rounded-[28px] border border-line">
            <div className="flex h-55 flex-col justify-center bg-paper p-7">{children}</div>
            <div className="flex flex-col gap-1.5 px-7 pt-6 pb-7">
                <div className="text-xl font-bold">{title}</div>
                <p className="leading-relaxed text-moss">{text}</p>
            </div>
        </div>
    );
}
