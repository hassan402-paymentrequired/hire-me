import { SiteNav } from '@/components/site/site-nav';
import GuestLayout from '@/layouts/guest-layout';
import { becomeProvider } from '@/routes';
import explore from '@/routes/explore';
import { Head, Link } from '@inertiajs/react';

const principles = [
    { title: 'Show the real price', text: 'Prices are on the page before you book. What you see is what you pay, unless you add something on the day.' },
    { title: 'Protect both sides', text: 'Payments sit in escrow, so customers are covered if a pro doesn’t show, and pros are covered if a customer doesn’t.' },
    { title: 'Earn every review', text: 'Only completed bookings can be reviewed. No bought stars, no fake praise.' },
    { title: 'Built for here', text: 'Naira pricing, bank-transfer top-ups and home service across the city. Made for how Lagos actually books.' },
];

export default function About({ title }: { title: string }) {
    return (
        <GuestLayout nav="none">
            <Head title={title} />

            <section className="relative overflow-hidden bg-forest-deep">
                <img src="/brand/banners/proxideck-banner-general-dark.jpg" alt="" aria-hidden className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-forest-deep/60" />
                <SiteNav variant="dark" />
                <div className="relative mx-auto flex max-w-[1240px] flex-col gap-6 px-4 pt-24 pb-30 sm:px-6">
                    <span className="font-bold text-lime">About Proxideck</span>
                    <h1 className="max-w-245 text-5xl leading-none font-bold tracking-[-0.035em] text-white sm:text-7xl">
                        Good work deserves to be found. Good customers deserve to be <span className="text-lime">sure.</span>
                    </h1>
                    <p className="max-w-160 text-xl leading-relaxed text-[#C9E2D3]">
                        Proxideck connects people with the stylists, barbers, cleaners and technicians around them, and makes booking them
                        feel as easy as ordering a ride.
                    </p>
                </div>
            </section>

            <section className="mx-auto flex max-w-[1240px] flex-col gap-16 px-4 pt-28 sm:px-6 lg:flex-row">
                <h2 className="text-4xl leading-[1.08] font-bold tracking-tight lg:flex-1 lg:text-[44px]">
                    Booking a pro shouldn’t take ten DMs and a prayer.
                </h2>
                <div className="flex flex-col gap-5 text-lg leading-[1.7] text-[#33392D] lg:flex-[1.2]">
                    <p>
                        Finding someone good usually means asking around, scrolling through Instagram, sending voice notes about prices, then
                        hoping they actually show up. Pros have it just as hard: no-shows, last-minute haggling and payments that never arrive.
                    </p>
                    <p>
                        We built Proxideck to fix both sides. Customers see real prices, real reviews and real availability. Pros get a booking
                        page, a calendar and a wallet that pays them, without chasing anyone.
                    </p>
                </div>
            </section>

            <section className="mx-auto flex max-w-[1240px] flex-col px-4 pt-28 sm:px-6">
                <h2 className="mb-6 text-lg font-bold text-leaf">What we hold ourselves to</h2>
                {principles.map((principle, index) => (
                    <div key={principle.title} className="flex flex-wrap items-baseline gap-x-10 gap-y-3 border-t border-line py-8">
                        <span className="w-30 text-6xl leading-none font-bold tracking-tighter text-lime [-webkit-text-stroke:1.5px_var(--color-forest)]">
                            {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className="min-w-70 flex-1 text-3xl font-bold tracking-tight">{principle.title}</h3>
                        <p className="min-w-80 flex-[1.2] text-[17px] leading-relaxed text-moss">{principle.text}</p>
                    </div>
                ))}
            </section>

            <section className="mx-auto grid max-w-[1240px] gap-4 px-4 py-28 sm:px-6 md:grid-cols-2">
                <div className="flex min-h-90 flex-col gap-4.5 rounded-[32px] bg-mint p-10 sm:p-12">
                    <span className="font-bold text-leaf">For customers</span>
                    <h3 className="text-4xl leading-tight font-bold tracking-tight">Find someone good, near you, today.</h3>
                    <p className="text-[17px] leading-relaxed text-moss">
                        Compare prices and reviews, pick a time that suits you, and pay safely from your wallet.
                    </p>
                    <Link href={explore.index()} className="mt-auto self-start rounded-full bg-forest px-6 py-3.5 font-bold text-white">
                        Explore venues
                    </Link>
                </div>
                <div className="flex min-h-90 flex-col gap-4.5 rounded-[32px] bg-forest p-10 text-white sm:p-12">
                    <span className="font-bold text-lime">For pros</span>
                    <h3 className="text-4xl leading-tight font-bold tracking-tight">Spend your time on the work, not the admin.</h3>
                    <p className="text-[17px] leading-relaxed text-sage">
                        A booking page, team calendar, payments into your wallet, and reviews that build your name.
                    </p>
                    <Link href={becomeProvider()} className="mt-auto self-start rounded-full bg-lime px-6 py-3.5 font-bold text-forest">
                        List your business
                    </Link>
                </div>
            </section>
        </GuestLayout>
    );
}
