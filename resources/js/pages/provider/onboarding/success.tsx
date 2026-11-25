import BrandMark from '@/components/brand-mark';
import { home } from '@/routes';
import business from '@/routes/business';
import onboarding from '@/routes/onboarding';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';

interface Props {
    is_verified?: boolean;
}

const confettiColors = ['#C8F169', '#E6F4EC', '#A9C7B8', '#FFFFFF'];

const confettiPieces = Array.from({ length: 36 }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 2.6 + Math.random() * 1.8,
    color: confettiColors[index % confettiColors.length],
    width: 6 + Math.random() * 6,
    rotate: Math.random() * 360,
}));

function Confetti() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
        >
            {confettiPieces.map((piece) => (
                <span
                    key={piece.id}
                    className="absolute -top-6 block rounded-[2px]"
                    style={{
                        left: `${piece.left}%`,
                        width: piece.width,
                        height: piece.width * 0.45,
                        backgroundColor: piece.color,
                        transform: `rotate(${piece.rotate}deg)`,
                        animation: `onboarding-confetti ${piece.duration}s cubic-bezier(.2,.6,.4,1) ${piece.delay}s forwards`,
                    }}
                />
            ))}
            <style>{`
                @keyframes onboarding-confetti {
                    to { transform: translateY(105vh) rotate(540deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

export default function Success({ is_verified }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isVerified = Boolean(is_verified ?? auth?.user?.is_verified);

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-forest font-heading text-white">
            <Head title="You're set up" />

            <img
                src="/brand/banners/proxideck-auth-panel-dark.svg"
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest/70 via-forest/60 to-forest" />
            <Confetti />

            <header className="relative z-10 mx-auto flex w-full max-w-[1240px] items-center px-5 py-6 sm:px-8">
                <Link href={home()} className="flex items-center gap-2.5">
                    <BrandMark className="size-8" onDark />
                    <span className="font-['Sora'] text-xl font-bold tracking-[-0.03em]">
                        proxideck
                    </span>
                </Link>
            </header>

            <main className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-1 flex-col items-center justify-center px-5 pt-6 pb-16 sm:px-8">
                {/* Message */}
                <div className="flex max-w-160 flex-col items-center gap-6 text-center">
                    <span className="grid size-16 place-items-center rounded-full bg-lime text-forest ring-8 ring-lime/20">
                        <Check className="size-8" strokeWidth={3} />
                    </span>
                    <h1 className="font-['Sora'] text-5xl leading-[0.98] font-bold tracking-[-0.035em] sm:text-6xl">
                        {isVerified ? (
                            <>
                                You are <span className="text-lime">live.</span>
                            </>
                        ) : (
                            <>
                                Nicely done.{' '}
                                <span className="text-lime">
                                    One last check.
                                </span>
                            </>
                        )}
                    </h1>
                    <p className="max-w-130 text-lg leading-relaxed text-[#C9E2D3]">
                        {isVerified
                            ? 'Your business is set up and verified. Clients can now find you on the marketplace and book straight into your open slots.'
                            : 'Your business is set up. Verify your identity so your listing shows up for clients and you get the verified badge.'}
                    </p>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        {isVerified ? (
                            <>
                                <Link
                                    href={business.dashboard()}
                                    className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-lime px-7 font-bold text-forest transition hover:brightness-95"
                                >
                                    Go to your dashboard
                                    <ArrowRight className="size-5" />
                                </Link>
                                <Link
                                    href={home()}
                                    className="flex h-14 items-center justify-center rounded-full border border-white/25 px-7 font-semibold text-white transition hover:bg-white/10"
                                >
                                    View marketplace
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={onboarding.verification()}
                                    className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-lime px-7 font-bold text-forest transition hover:brightness-95"
                                >
                                    <ShieldCheck className="size-5" />
                                    Verify my identity
                                    <ArrowRight className="size-5" />
                                </Link>
                                <Link
                                    href={business.dashboard()}
                                    className="flex h-14 items-center justify-center rounded-full border border-white/25 px-7 font-semibold text-white transition hover:bg-white/10"
                                >
                                    Do it later
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
