import { formatNaira } from '@/components/site/provider-card';
import { cn } from '@/lib/utils';

interface LocationChoiceProps {
    showStudio: boolean;
    showHome: boolean;
    atHome: boolean;
    businessInitial: string;
    studioDetail: string;
    homeServiceFee: number;
    homeAddressLabel: string | null;
    onChooseStudio: () => void;
    onChooseHome: () => void;
    onChangeHomeAddress: () => void;
}

/** "At the studio" vs "Come to me" cards; only the modes the business offers are shown. */
export function LocationChoice({
    showStudio,
    showHome,
    atHome,
    businessInitial,
    studioDetail,
    homeServiceFee,
    homeAddressLabel,
    onChooseStudio,
    onChooseHome,
    onChangeHomeAddress,
}: LocationChoiceProps) {
    return (
        <section aria-label="Where" className={cn('grid gap-3', showStudio && showHome && 'sm:grid-cols-2')}>
            {showStudio && (
                <LocationCard active={!atHome} onSelect={onChooseStudio} title="At the studio" detail={studioDetail}>
                    <span className="relative block h-23 overflow-hidden bg-[#EAF1EC]">
                        <svg width="100%" height="100%" viewBox="0 0 300 92" preserveAspectRatio="xMidYMid slice" aria-hidden>
                            <path d="M0 60 C 80 40, 150 80, 220 50 S 290 40, 300 45" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                            <path d="M70 0 L 90 92" stroke="#FFFFFF" strokeWidth="6" />
                            <path d="M220 0 L 205 92" stroke="#FFFFFF" strokeWidth="6" />
                        </svg>
                        <span className="absolute top-1/2 left-1/2 grid size-8 -translate-x-1/2 -translate-y-[60%] place-items-center rounded-full border-3 border-white bg-forest text-xs font-bold text-lime">
                            {businessInitial}
                        </span>
                    </span>
                </LocationCard>
            )}
            {showHome && (
                <LocationCard
                    active={atHome}
                    onSelect={onChooseHome}
                    title={
                        <>
                            Come to me {homeServiceFee > 0 && <span className="text-leaf">+{formatNaira(homeServiceFee)}</span>}
                        </>
                    }
                    detail={
                        <>
                            {homeAddressLabel ?? 'Add the address for your visit'} ·{' '}
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onChangeHomeAddress();
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        onChangeHomeAddress();
                                    }
                                }}
                                className="font-bold text-forest hover:underline"
                            >
                                {homeAddressLabel ? 'Change' : 'Add'}
                            </span>
                        </>
                    }
                >
                    <span className="grid h-23 place-items-center bg-[#F3F7F3]">
                        <svg width="56" height="56" viewBox="0 0 48 48" aria-hidden>
                            <path d="M8 22L24 9l16 13v17a2 2 0 01-2 2H10a2 2 0 01-2-2z" fill="#FFFFFF" stroke="#0E3B2E" strokeWidth="2.5" strokeLinejoin="round" />
                            <path d="M19 41V29h10v12" stroke="#0E3B2E" strokeWidth="2.5" fill="none" />
                            <circle cx="36" cy="12" r="5" fill="#C8F169" stroke="#0E3B2E" strokeWidth="2" />
                        </svg>
                    </span>
                </LocationCard>
            )}
        </section>
    );
}

function LocationCard({
    active,
    onSelect,
    title,
    detail,
    children,
}: {
    active: boolean;
    onSelect: () => void;
    title: React.ReactNode;
    detail: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div
            role="radio"
            aria-checked={active}
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect();
                }
            }}
            className={cn(
                'flex cursor-pointer flex-col overflow-hidden rounded-[22px] text-left text-ink outline-none focus-visible:ring-2 focus-visible:ring-forest/40',
                active ? 'border-2 border-forest bg-paper' : 'border border-line bg-white',
            )}
        >
            {children}
            <span className="flex items-start gap-2.5 px-4 py-3.5">
                <RadioDot active={active} />
                <span className="min-w-0">
                    <span className="block text-[15px] font-bold">{title}</span>
                    <span className="mt-0.5 block text-[13px] text-moss">{detail}</span>
                </span>
            </span>
        </div>
    );
}

export function RadioDot({ active }: { active: boolean }) {
    return (
        <span aria-hidden className="mt-px grid size-5 shrink-0 place-items-center rounded-full border-2 border-forest">
            <span className={cn('size-2.5 rounded-full', active ? 'bg-forest' : 'bg-transparent')} />
        </span>
    );
}
