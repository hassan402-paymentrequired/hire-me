import AppLogoIcon from './app-logo-icon';
import BrandMark from './brand-mark';

export default function AppLogo({
    variant = 'default',
}: {
    variant?: 'default' | 'sidebar';
}) {
    if (variant === 'sidebar') {
        return (
            <div className="flex items-center gap-2.5">
                <BrandMark className="size-8 shrink-0" onDark />
                <span className="font-[Sora] text-lg font-bold tracking-[-0.03em] text-white group-data-[collapsible=icon]:hidden">
                    proxideck
                </span>
            </div>
        );
    }

    return (
        <div>
            <AppLogoIcon />
        </div>
    );
}
