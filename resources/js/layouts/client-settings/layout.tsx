import AccountLayout from '@/layouts/account-layout';
import { cn, isSameUrl } from '@/lib/utils';
import clientAddresses from '@/routes/client-addresses';
import { edit as editProfile } from '@/routes/profile';
import { show as showTwoFactor } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const tabs = [
    { title: 'Profile', href: editProfile().url, matches: [editProfile().url] },
    {
        title: 'Addresses',
        href: clientAddresses.index().url,
        matches: [clientAddresses.index().url],
    },
    {
        title: 'Security',
        href: editPassword().url,
        matches: [editPassword().url, showTwoFactor().url],
    },
];

export default function ClientSettingsLayout({
    children,
    bare = false,
}: PropsWithChildren<{ bare?: boolean }>) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    return (
        <AccountLayout
            active="settings"
            title="Account settings"
            description="Manage your details, addresses and security."
        >
            <nav
                aria-label="Settings sections"
                className="flex gap-1 self-start overflow-x-auto rounded-full bg-[#F2F5F2] p-1.5"
            >
                {tabs.map((tab) => {
                    const isActive = tab.matches.some((href) =>
                        isSameUrl(currentPath, href),
                    );

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            prefetch
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'flex h-10 shrink-0 items-center rounded-full px-5 text-sm font-semibold transition',
                                isActive
                                    ? 'bg-white text-ink shadow-sm'
                                    : 'text-moss hover:text-ink',
                            )}
                        >
                            {tab.title}
                        </Link>
                    );
                })}
            </nav>

            {bare ? (
                children
            ) : (
                <div className="rounded-[20px] border border-line bg-white p-6 sm:p-8">
                    <div className="space-y-8">{children}</div>
                </div>
            )}
        </AccountLayout>
    );
}
