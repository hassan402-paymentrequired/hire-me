import AccountLayout from '@/layouts/account-layout';
import { cn, isSameUrl } from '@/lib/utils';
import clientAddresses from '@/routes/client-addresses';
import notificationPreferences from '@/routes/notification-preferences';
import { edit as editProfile } from '@/routes/profile';
import { show as showTwoFactor } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const tabs = [
    { title: 'Profile', href: editProfile().url },
    { title: 'Addresses', href: clientAddresses.index().url },
    { title: 'Password', href: editPassword().url },
    { title: 'Two-factor', href: showTwoFactor().url },
    { title: 'Notifications', href: notificationPreferences.edit().url },
];

export default function ClientSettingsLayout({ children }: PropsWithChildren) {
    const { url } = usePage();

    return (
        <AccountLayout active="settings" title="Account settings" description="Manage your details, addresses and security.">
            <nav aria-label="Settings sections" className="flex gap-1.5 self-start overflow-x-auto rounded-full bg-[#F2F5F2] p-1.5">
                {tabs.map((tab) => {
                    const isActive = isSameUrl(url.split('?')[0], tab.href);

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            prefetch
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'flex h-10 shrink-0 items-center rounded-full px-4.5 text-sm font-semibold',
                                isActive ? 'bg-white text-ink shadow-sm' : 'text-moss hover:text-ink',
                            )}
                        >
                            {tab.title}
                        </Link>
                    );
                })}
            </nav>

            <div className="rounded-3xl border border-line p-6 sm:p-8">
                <div className="max-w-3xl space-y-10">{children}</div>
            </div>
        </AccountLayout>
    );
}
