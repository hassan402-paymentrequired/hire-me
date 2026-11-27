import BrandLogo from './brand-logo';

export default function AppLogo({ variant = 'default' }: { variant?: 'default' | 'sidebar' }) {
    if (variant === 'sidebar') {
        return <BrandLogo onDark className="[&>span:last-child]:text-lg group-data-[collapsible=icon]:[&>span:last-child]:hidden" />;
    }

    return (
        <>
            <BrandLogo className="dark:hidden" />
            <BrandLogo onDark className="hidden dark:inline-flex" />
        </>
    );
}
