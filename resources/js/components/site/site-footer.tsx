import BrandLogo from '@/components/brand-logo';
import { about, becomeProvider, contact, faqs, privacyPolicy, terms } from '@/routes';
import explore from '@/routes/explore';
import { Link } from '@inertiajs/react';
import { ArrowRight, Facebook, Instagram, Twitter } from 'lucide-react';

const linkGroups = [
    {
        title: 'Discover',
        links: [
            { label: 'Explore pros', href: explore.index().url },
            { label: 'Salons', href: explore.index({ query: { category: 'Salon' } }).url },
            { label: 'Nails', href: explore.index({ query: { category: 'Nails' } }).url },
            { label: 'Home services', href: explore.index({ query: { category: 'Home Services' } }).url },
        ],
    },
    {
        title: 'Business',
        links: [
            { label: 'List your business', href: becomeProvider().url },
            { label: 'FAQs', href: faqs().url },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: about().url },
            { label: 'Contact', href: contact().url },
            { label: 'Terms', href: terms().url },
            { label: 'Privacy', href: privacyPolicy().url },
        ],
    },
];

const socials = [
    { label: 'Instagram', icon: Instagram, href: '#' },
    { label: 'X', icon: Twitter, href: '#' },
    { label: 'Facebook', icon: Facebook, href: '#' },
];

export function SiteFooter() {
    return (
        <footer className="relative overflow-hidden bg-forest-deep font-heading text-[#E3EFE8]">
            <img
                src="/brand/banners/proxideck-banner-general-dark.jpg"
                alt=""
                aria-hidden
                className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/40 via-forest-deep/70 to-forest-deep/95" />

            <div className="relative mx-auto flex max-w-[1240px] flex-col gap-16 px-4 pt-22 pb-8 sm:px-6">
                <div className="flex flex-wrap items-center gap-10">
                    <div className="flex flex-[1_1_460px] flex-col gap-6">
                        <h2 className="text-4xl leading-[1.02] font-bold tracking-tight text-white sm:text-[52px]">
                            Your next appointment
                            <br />
                            is <span className="text-lime">one tap away.</span>
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={explore.index()}
                                className="flex h-13.5 items-center gap-2.5 rounded-full bg-lime px-7 font-bold text-forest"
                            >
                                Explore venues <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href={becomeProvider()}
                                className="flex h-13.5 items-center rounded-full border border-white/35 bg-forest-deep/50 px-6.5 font-semibold text-white"
                            >
                                List your business
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-[0_1_340px] flex-col gap-2.5 border-white/20 sm:border-l sm:pl-10">
                        <span className="text-sm font-bold text-lime">For business</span>
                        <span className="text-xl leading-snug font-bold text-white">
                            Run a salon, studio or service? Get booked, get paid upfront.
                        </span>
                        <span className="text-[15px] leading-relaxed text-[#C9E2D3]">
                            Calendar, wallet payouts and reviews in one dashboard.
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-10 border-t border-white/10 pt-10">
                    <div className="flex flex-[1.4_1_240px] flex-col gap-3.5">
                        <BrandLogo onDark className="self-start" />
                        <p className="max-w-70 text-[15px] leading-relaxed text-sage">
                            Book trusted artisans, studios and home services near you.
                        </p>
                        <div className="mt-1.5 flex gap-2.5">
                            {socials.map(({ label, icon: Icon, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="grid size-10 place-items-center rounded-full border border-white/20 hover:bg-white/10"
                                >
                                    <Icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                    {linkGroups.map((group) => (
                        <nav key={group.title} aria-label={group.title} className="flex flex-[1_1_150px] flex-col gap-3 text-[15px]">
                            <strong className="text-sm text-white">{group.title}</strong>
                            {group.links.map((link) => (
                                <Link key={link.label} href={link.href} className="text-sage hover:text-white">
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    ))}
                </div>

                <div className="flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-[13px] text-sage">
                    <span>© {new Date().getFullYear()} Proxideck. All rights reserved.</span>
                    <span>Made in Lagos</span>
                </div>
            </div>
        </footer>
    );
}
