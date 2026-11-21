import KeenIcon from '@/components/keen-icon';
import type { ChangeEvent } from 'react';

const resolveImageUrl = (path: string) =>
    path?.startsWith('http') ||
    path?.startsWith('data:') ||
    path?.startsWith('/')
        ? path
        : `/storage/${path}`;

export default function ProfileHeader({
    businessName,
    slug,
    bannerUrl,
    logoUrl,
    onBannerChange,
    onLogoChange,
}: {
    businessName: string;
    slug?: string | null;
    bannerUrl: string | null;
    logoUrl: string | null;
    onBannerChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onLogoChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
    const displayName = businessName || 'Your business';
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

    return (
        <section className="overflow-hidden rounded-[20px] border border-[#0E3B2E]/10 bg-card shadow-[0_1px_2px_rgba(19,32,27,0.04)] dark:border-white/10">
            <div className="relative h-[155px] bg-[#0E3B2E]">
                <img
                    src={
                        bannerUrl
                            ? resolveImageUrl(bannerUrl)
                            : '/brand/banners/proxideck-banner-general-dark.svg'
                    }
                    alt=""
                    className="h-full w-full object-cover"
                />
                <label className="absolute right-3.5 bottom-3.5 flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-white/95 px-3.5 text-[13px] font-bold text-[#0E3B2E] shadow-sm hover:bg-white">
                    <KeenIcon name="picture" className="text-base" />
                    Change banner
                    <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={onBannerChange}
                    />
                </label>
            </div>

            <div className="-mt-9 flex flex-wrap items-end gap-4 px-[22px] pb-[22px]">
                <label
                    className="relative shrink-0 cursor-pointer"
                    aria-label="Change logo"
                >
                    {logoUrl ? (
                        <img
                            src={resolveImageUrl(logoUrl)}
                            alt="Business logo"
                            className="size-[92px] rounded-full border-4 border-card object-cover"
                        />
                    ) : (
                        <span className="flex size-[92px] items-center justify-center rounded-full border-4 border-card bg-[#0E3B2E] font-[Sora] text-2xl font-bold text-[#C8F169]">
                            {initials}
                        </span>
                    )}
                    <span className="absolute right-0 bottom-0.5 flex size-8 items-center justify-center rounded-full border-2 border-card bg-[#C8F169] text-[#0E3B2E]">
                        <KeenIcon name="pencil" className="text-sm" />
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={onLogoChange}
                    />
                </label>
                <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5 pb-1.5">
                    <span className="truncate font-[Sora] text-lg font-semibold text-foreground">
                        {displayName}
                    </span>
                    {slug && (
                        <a
                            href={`/provider/${slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-[13px] font-bold text-[#0E3B2E] underline underline-offset-2 dark:text-[#C8F169]"
                        >
                            proxideck.com/provider/{slug} ↗
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}
