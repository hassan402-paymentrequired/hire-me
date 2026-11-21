import BrandMark from '@/components/brand-mark';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { MapPin, Star } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-screen overflow-hidden bg-background">
            {/* Left Side - Form */}
            <div className="flex min-h-screen flex-1 flex-col overflow-y-auto">
                <div className="flex items-center justify-between p-5 md:px-10 md:pt-8">
                    <Link
                        href={home()}
                        className="flex items-center gap-2.5"
                        prefetch
                    >
                        <BrandMark className="size-8 dark:hidden" />
                        <BrandMark
                            className="hidden size-8 dark:block"
                            onDark
                        />
                        <span className="font-['Sora'] text-xl font-bold tracking-[-0.03em] text-[#0E3B2E] dark:text-white">
                            proxideck
                        </span>
                    </Link>
                </div>

                <main className="flex flex-1 items-center justify-center px-5 py-10 md:px-10">
                    <div className="w-full max-w-[420px]">
                        <div className="mb-8 flex flex-col gap-2">
                            <h1 className="font-['Sora'] text-3xl font-bold tracking-tight">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm leading-relaxed text-balance text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>

                        {children}
                    </div>
                </main>

                <div className="flex items-center justify-between gap-4 p-5 text-xs text-muted-foreground md:px-10 md:pb-8">
                    <span>© {new Date().getFullYear()} Proxideck</span>
                    <span>hello@proxideck.com</span>
                </div>
            </div>

            {/* Right Side - Brand illustration */}
            <aside className="relative hidden w-[46%] max-w-[720px] shrink-0 flex-col justify-between overflow-hidden bg-[#0E3B2E] p-10 lg:flex">
                <img
                    src="/brand/banners/proxideck-auth-panel-dark.svg"
                    alt=""
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />

                <div className="relative flex justify-end">
                    <span className="rounded-full border border-[#C8F169]/35 bg-[#0E3B2E]/70 px-3.5 py-1.5 text-xs font-semibold text-[#C8F169] backdrop-blur-sm">
                        Built for service professionals
                    </span>
                </div>

                {/* Floating cards */}
                <div
                    className="relative flex flex-col items-center"
                    aria-hidden="true"
                >
                    <div className="flex w-[340px] -rotate-3 items-center gap-3.5 rounded-[20px] bg-white p-[18px] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-[#0E3B2E]">
                            <BrandMark className="size-[30px]" onDark />
                        </div>
                        <div className="flex flex-1 flex-col">
                            <span className="font-['Sora'] text-[15px] font-semibold text-[#13201B]">
                                Booking confirmed
                            </span>
                            <span className="text-[13px] text-[#4A5A52]">
                                Tue, 14:30 · Haircut
                            </span>
                        </div>
                        <svg viewBox="0 0 24 24" className="size-[22px]">
                            <circle cx="12" cy="12" r="11" fill="#C8F169" />
                            <path
                                d="M7.5 12.5l3 3 6-6.5"
                                stroke="#0E3B2E"
                                strokeWidth="2.4"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <div className="-mt-2.5 ml-[180px] flex w-[250px] rotate-[4deg] flex-col gap-1 rounded-[18px] bg-[#C8F169] px-4 py-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
                        <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                    key={index}
                                    className="size-4 fill-[#E8A317] text-[#E8A317]"
                                />
                            ))}
                        </div>
                        <span className="text-[13px] font-semibold text-[#0E3B2E]">
                            “Booked in under a minute.”
                        </span>
                    </div>

                    <div className="-mt-1.5 mr-[160px] flex w-[220px] -rotate-2 items-center gap-2.5 rounded-2xl bg-white/95 px-3.5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                        <MapPin className="size-5 text-[#0E3B2E]" />
                        <span className="text-[13px] font-semibold text-[#13201B]">
                            Pros near you
                        </span>
                    </div>
                </div>

                <div className="relative flex max-w-[460px] flex-col gap-3">
                    <h2 className="font-['Sora'] text-4xl leading-[1.15] font-bold tracking-[-0.02em] text-white">
                        Bookings that feel{' '}
                        <span className="text-[#C8F169]">simple and fast.</span>
                    </h2>
                    <p className="text-[15px] leading-relaxed text-white/80">
                        Run your schedule, services, staff, and client bookings
                        from one place.
                    </p>
                </div>
            </aside>
        </div>
    );
}
