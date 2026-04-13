import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
// import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import {
    LockClosedIcon,
    MapPinIcon,
    ShieldExclamationIcon,
    UserIcon,
} from '@heroicons/react/24/solid';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: Array<{ title: string; href: string; icon: any }> = [
    {
        title: 'Profile',
        href: edit().url,
        icon: UserIcon,
    },
    {
        title: 'Addresses',
        href: '/settings/addresses',
        icon: MapPinIcon,
    },
    {
        title: 'Password',
        href: editPassword().url,
        icon: LockClosedIcon,
    },
    {
        title: 'Two-Factor Auth',
        href: show().url,
        icon: ShieldExclamationIcon,
    },
    // {
    //     title: 'Appearance',
    //     href: editAppearance().url,
    //     icon: null,
    // },
];

export default function ClientSettingsLayout({ children }: PropsWithChildren) {
    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;

    return (
        <div className="mx-auto w-full max-w-7xl p-4">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${resolveUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isSameUrl(
                                        currentPath,
                                        item.href,
                                    ),
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
